from rest_framework import serializers
from .models import Account, OpeningBalance



class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = "__all__"



class OpeningBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningBalance
        fields = "__all__"  
