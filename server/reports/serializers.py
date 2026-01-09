from rest_framework import serializers



class CombinedPurchaseSerializer(serializers.Serializer):
    date = serializers.DateField()
    invoice_no = serializers.CharField()
    part_no = serializers.CharField()
    product_name = serializers.CharField()
    supplier_or_exporter = serializers.CharField()
    quantity = serializers.IntegerField()
    purchase_amount = serializers.DecimalField(max_digits=12, decimal_places=2)




class CombinedIncomeSerializer(serializers.Serializer):
    date = serializers.DateField()
    income_source = serializers.CharField()
    description = serializers.CharField(allow_blank=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    class Meta:
        fields = ['date', 'income_source', 'description', 'amount']




class CombinedExpenseSerializer(serializers.Serializer):
    date = serializers.DateField()
    voucher_no = serializers.CharField()
    account_title = serializers.CharField()
    cost_category = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    description = serializers.CharField()



class ProfitLossItemSerializer(serializers.Serializer):
    item = serializers.CharField()
    current_year = serializers.DecimalField(max_digits=14, decimal_places=2)
    previous_year = serializers.DecimalField(max_digits=14, decimal_places=2)
    percent_change = serializers.DecimalField(max_digits=6, decimal_places=2)



class ProfitLossSerializer(serializers.Serializer):
    year = serializers.IntegerField()
    income = ProfitLossItemSerializer(many=True)
    expenses = ProfitLossItemSerializer(many=True)
    gross_profit = ProfitLossItemSerializer()
    total_expenses = ProfitLossItemSerializer()
    net_profit = ProfitLossItemSerializer()
