from rest_framework import serializers
from .models import Customer, Vendor
from master.models import BusinessCategory



class CustomerSerializer(serializers.ModelSerializer):
    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(),
        required=True
    )
    class Meta:
        model = Customer
        fields = "__all__"
        
        


class VendorSerializer(serializers.ModelSerializer):

    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(),
        required=True
    )
    
    class Meta:
        model = Vendor
        fields = "__all__"
