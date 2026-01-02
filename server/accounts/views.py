from rest_framework.viewsets import ModelViewSet
from .models import OpeningBalance
from .serializers import OpeningBalanceSerializer


class OpeningBalanceViewSet(ModelViewSet):
    queryset = OpeningBalance.objects.all()
    serializer_class = OpeningBalanceSerializer
