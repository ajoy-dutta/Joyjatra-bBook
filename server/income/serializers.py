from rest_framework import serializers
from .models import *
from master.models import BusinessCategory



class IncomeSerializer(serializers.ModelSerializer):
    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(),
        required=True
    )
    account_name = serializers.CharField(
        source="account.name", read_only=True
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
            "account",
            "account_name",
            "journal_entry",
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
