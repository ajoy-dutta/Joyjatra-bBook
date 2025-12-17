from rest_framework import viewsets, filters
from .models import *
from .serializers import *
from rest_framework.permissions import AllowAny , IsAuthenticated # no need for IsAuthenticated here



class BusinessCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = BusinessCategory.objects.all()
    serializer_class = BusinessCategorySerializer

    
class CostCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = CostCategory.objects.all()
    serializer_class = CostCategorySerializer


class SourceCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = SourceCategory.objects.all()
    serializer_class = SourceCategorySerializer


class PaymentModeViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = PaymentMode.objects.all()
    serializer_class = PaymentModeSerializer


class DivisionMasterViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = DivisionMaster.objects.all()
    serializer_class = DivisionMasterSerializer


class DistrictMasterViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = DistrictMaster.objects.all()
    serializer_class = DistrictMasterSerializer


class CountryMasterViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = CountryMaster.objects.all()
    serializer_class = CountryMasterSerializer


class SupplierTypeMasterViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = SupplierTypeMaster.objects.all()
    serializer_class = SupplierTypeMasterSerializer


class BankCategoryMasterViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = BankCategoryMaster.objects.all()
    serializer_class = BankCategoryMasterSerializer


class BankMasterViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = BankMaster.objects.all()
    serializer_class = BankMasterSerializer


class AccountCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = AccountCategory.objects.all()
    serializer_class = AccountCategorySerializer


class BankAccountViewSet(viewsets.ModelViewSet):
    queryset = BankAccount.objects.all().order_by("accountName")
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]


class BankTransactionViewSet(viewsets.ModelViewSet):
    queryset = BankTransaction.objects.all().order_by("-date", "-id")
    serializer_class = BankTransactionSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["narration", "reference_no", "bank_account__accountName"]
    ordering_fields = ["date", "created_at", "amount"]





class InventoryCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = InventoryCategory.objects.all()
    serializer_class = InventoryCategorySerializer