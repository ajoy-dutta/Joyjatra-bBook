from decimal import Decimal
from django.db import transaction as db_transaction
from rest_framework.viewsets import ModelViewSet
from .models import *
from .serializers import *
from accounts.service import update_balance  



class IncomeCategoryViewSet(ModelViewSet):
    # Required for DRF router
    queryset = IncomeCategory.objects.all()
    serializer_class = IncomeCategorySerializer

    def get_queryset(self):
        qs = IncomeCategory.objects.all()

        # Optional filtering by business_category
        business_category = self.request.query_params.get("business_category")
        if business_category:
            qs = qs.filter(business_category_id=business_category)

        return qs





class IncomeViewSet(ModelViewSet):
    queryset = Income.objects.select_related(
        "category",           
        "payment_mode",       
        "bank",                 
    ).order_by("-date")
    serializer_class = IncomeSerializer

    def get_queryset(self):
        qs = Income.objects.select_related(
            "category",           
            "payment_mode",       
            "bank",                 
        ).order_by("-date")

        business_category = self.request.query_params.get("business_category")
        category = self.request.query_params.get("category")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if business_category:
            qs = qs.filter(business_category_id=business_category)
        if category:
            qs = qs.filter(category_id=category)
        if from_date:
            qs = qs.filter(date__gte=from_date)
        if to_date:
            qs = qs.filter(date__lte=to_date)

        return qs

    @db_transaction.atomic
    def perform_create(self, serializer):
        income = serializer.save()

        # Update balance (income → money in)
        update_balance(
            business_category=income.business_category,
            payment_mode=income.payment_mode.name.upper() if income.payment_mode else "CASH",
            amount=Decimal(income.amount),
            is_credit=True,  # income → increase balance
            bank=income.bank,
        )

    @db_transaction.atomic
    def perform_update(self, serializer):
        # Get old instance to reverse old balance
        old_income = self.get_object()

        # Reverse old balance first
        update_balance(
            business_category=old_income.business_category,
            payment_mode=old_income.payment_mode.name.upper() if old_income.payment_mode else "CASH",
            amount=Decimal(old_income.amount),
            is_credit=False,  # remove old income
            bank=old_income.bank,
        )

        # Save new data
        income = serializer.save()

        # Apply new balance
        update_balance(
            business_category=income.business_category,
            payment_mode=income.payment_mode.name.upper() if income.payment_mode else "CASH",
            amount=Decimal(income.amount),
            is_credit=True,  # new income → increase
            bank=income.bank,
        )

    @db_transaction.atomic
    def perform_destroy(self, instance):
        # Reverse balance on deletion
        update_balance(
            business_category=instance.business_category,
            payment_mode=instance.payment_mode.name.upper() if instance.payment_mode else "CASH",
            amount=Decimal(instance.amount),
            is_credit=False,  # deletion → remove money
            bank=instance.bank,
        )
        instance.delete()
