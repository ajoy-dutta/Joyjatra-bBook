from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    cost_category_name = serializers.CharField(source="cost_category.category_name", read_only=True)

    class Meta:
        model = Expense
        fields = ["id", "cost_category", "cost_category_name", "amount", "note", "expense_date"]
