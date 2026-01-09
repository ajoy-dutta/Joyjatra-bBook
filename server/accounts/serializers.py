from rest_framework import serializers
from .models import *
from master.serializers import BankMasterSerializer


class OpeningBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningBalance
        fields = "__all__"  



class CashAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = CashAccount
        fields = "__all__"

    def validate(self, data):
        opening_balance = data.get('opening_balance', None)
        if opening_balance is not None and opening_balance < 0:
            raise serializers.ValidationError("Opening balance must be non-negative.")
        return data



class BankAccountSerializer(serializers.ModelSerializer):
    bank_details = BankMasterSerializer(source="bank", read_only=True)

    class Meta:
        model = BankAccount
        fields = "__all__"

    def validate(self, data):
        opening_balance = data.get('opening_balance', None)
        if opening_balance is not None and opening_balance < 0:
            raise serializers.ValidationError("Opening balance must be non-negative.")
        return data

    
