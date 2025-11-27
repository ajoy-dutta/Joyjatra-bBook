from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Customer, Vendor
from .serializers import CustomerSerializer, VendorSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("-created_at")
    serializer_class = CustomerSerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["customer_name", "phone1", "phone2", "shop_name", "district", "division"]
    ordering_fields = ["created_at", "customer_name"]

    # IMPORTANT: support image upload
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    
class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all().order_by("-created_at")
    serializer_class = VendorSerializer

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "vendor_name",
        "phone1",
        "phone2",
        "shop_name",
        "district",
        "division",
        "country"
    ]
    ordering_fields = ["created_at", "vendor_name"]
