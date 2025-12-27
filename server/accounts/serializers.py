from rest_framework import serializers
from .models import Account, OpeningBalance




class AccountSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source="parent.name", read_only=True)
    class Meta:
        model = Account
        fields = "__all__"



class OpeningBalanceSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = OpeningBalance
        fields = "__all__"  
