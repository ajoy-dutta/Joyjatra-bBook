from decimal import Decimal
from django.db import transaction as db_transaction
from rest_framework.viewsets import ModelViewSet
from .models import *
from .serializers import *
from accounts.service import update_balance  
from .accounting import create_income_journal_entry




class IncomeViewSet(ModelViewSet):
    queryset = Income.objects.select_related(
        "account",           
        "payment_mode",       
        "bank",                 
    ).order_by("-date")
    serializer_class = IncomeSerializer

    def get_queryset(self):
        qs = Income.objects.select_related(
            "account",           
            "payment_mode",       
            "bank",                 
        ).order_by("-date")

        business_category = self.request.query_params.get("business_category")
        account = self.request.query_params.get("account")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if business_category:
            qs = qs.filter(business_category_id=business_category)
        if account:
            qs = qs.filter(account_id=account)
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
        
        create_income_journal_entry(income)

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
        
        # 2️⃣ Delete old journal entry
        if old_income.journal_entry:
            old_income.journal_entry.delete()

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
        
        create_income_journal_entry(income)

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
        
        # Delete linked journal entry
        if instance.journal_entry:
            instance.journal_entry.delete()

        super().perform_destroy(instance)
