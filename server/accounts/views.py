from rest_framework.viewsets import ModelViewSet
from .models import Account, OpeningBalance
from .serializers import AccountSerializer, OpeningBalanceSerializer



class AccountViewSet(ModelViewSet):
    queryset = Account.objects.filter(is_active=True)
    serializer_class = AccountSerializer


class OpeningBalanceViewSet(ModelViewSet):
    queryset = OpeningBalance.objects.all()
    serializer_class = OpeningBalanceSerializer
