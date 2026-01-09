from rest_framework import serializers
from .models import *
from master.models import BusinessCategory


class IncomeCategorySerializer(serializers.ModelSerializer):
    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(),
        required=True
    )
    
    class Meta:
        model = IncomeCategory
        fields = "__all__"



class IncomeSerializer(serializers.ModelSerializer):
    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(),
        required=True
    )
    category_name = serializers.CharField(
        source="category.name", read_only=True
    )
    payment_mode_name = serializers.CharField(
        source="payment_mode.name", read_only=True
    )
    bank_name = serializers.CharField(
        source="bank.name", read_only=True
    )

    class Meta:
        model = Income
        fields = [
            "id",
            "business_category",
            "category",
            "category_name",
            "date",
            "amount",
            "received_by",
            "payment_mode",
            "payment_mode_name",
            "bank",
            "bank_name",
            "note",
            "created_at",
        ]
