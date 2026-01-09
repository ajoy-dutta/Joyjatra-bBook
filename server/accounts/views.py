from rest_framework.viewsets import ModelViewSet
from .models import *
from .serializers import *


class OpeningBalanceViewSet(ModelViewSet):
    queryset = OpeningBalance.objects.all()
    serializer_class = OpeningBalanceSerializer




class CashAccountViewSet(ModelViewSet):
    queryset = CashAccount.objects.all()
    serializer_class = CashAccountSerializer  


    def get_queryset(self):
        qs = super().get_queryset()

        business_category = self.request.query_params.get('business_category')
        if business_category:
            try:
                qs = qs.filter(business_category_id=business_category)
            except ValueError:
                qs = qs.none()

        return qs



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