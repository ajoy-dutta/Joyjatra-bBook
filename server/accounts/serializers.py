from rest_framework import serializers
from .models import OpeningBalance


class OpeningBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningBalance
        fields = "__all__"  
