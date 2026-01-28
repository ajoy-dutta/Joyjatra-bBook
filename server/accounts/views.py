from rest_framework.viewsets import ModelViewSet
from .models import *
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from accounts.models import Account, JournalEntryLine



class AccountViewSet(ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    
    # def get_queryset(self):
    #     qs = super().get_queryset()

    #     business_category = self.request.query_params.get('business_category')
    #     if business_category:
    #         try:
    #             qs = qs.filter(business_category_id=business_category)
    #         except ValueError:
    #             qs = qs.none()

    #     return qs




class JournalEntryViewSet(ModelViewSet):
    queryset = JournalEntry.objects.all().order_by("-date")
    serializer_class = JournalEntrySerializer
    
    
    def get_queryset(self):
        qs = super().get_queryset()

        business_category = self.request.query_params.get('business_category')
        if business_category:
            try:
                qs = qs.filter(business_category_id=business_category)
            except ValueError:
                qs = qs.none()

        return qs



class CashBalanceView(APIView):
    def get(self, request):
        business_category = request.query_params.get("business_category")

        try:
            cash_account = Account.objects.get(code="1000")
        except Account.DoesNotExist:
            return Response({"error": "Cash account not found"}, status=404)

        lines = JournalEntryLine.objects.filter(account=cash_account)

        if business_category:
            lines = lines.filter(journal_entry__business_category_id=business_category)

        total_debit = lines.aggregate(total=Sum("debit"))["total"] or 0
        total_credit = lines.aggregate(total=Sum("credit"))["total"] or 0
        balance = total_debit - total_credit

        return Response({
            "account_code": cash_account.code,
            "account_name": cash_account.name,
            "business_category": business_category,
            "balance": balance,
        })



class BankAccountViewSet(ModelViewSet):
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer  

    def get_queryset(self):
        qs = super().get_queryset()

        business_category = self.request.query_params.get('business_category')
        if business_category:
            try:
                qs = qs.filter(business_category_id=business_category)
            except ValueError:
                qs = qs.none()

        return qs
