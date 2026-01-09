from rest_framework import serializers
from .models import Sale, SaleProduct, SalePayment, SaleReturn
from people.models import  Customer
from people.serializers import CustomerSerializer
from stocks.models import Product, StockProduct
from stocks.serializers import ProductSerializer
from master.models import PaymentMode, BankMaster, BusinessCategory
from master.serializers import PaymentModeSerializer, BankMasterSerializer
from django.db import transaction
from accounts.service import update_balance



class SaleProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )

    class Meta:
        model = SaleProduct
        fields = [
            'id',
            'product',
            'product_id',
            'product_code',           # ✅ instead of part_no
            'sale_quantity',
            'sale_price',
            'percentage',
            'sale_price_with_percentage',
            'total_price',
        ]

       



class SalePaymentSerializer(serializers.ModelSerializer):
    bank_name = BankMasterSerializer(read_only=True)
    #  ADD THIS FIELD
    sale_id = serializers.PrimaryKeyRelatedField(
        queryset=Sale.objects.all(),
        source='sale',
        required=False,
        allow_null=True,
        write_only=True,
    )

    class Meta:
        model = SalePayment
        fields = [
            'id',
            'sale_id', 
            'payment_mode',
            'bank_name',
            'bank',
            'account_no',
            'cheque_no',
            'paid_amount',
            'remarks',
            'payment_date',
        ]
        read_only_fields = ['payment_date']

    def validate(self, data):
        payment_mode = data.get('payment_mode')
        bank = data.get('bank')
        account_no = data.get('account_no')
        cheque_no = data.get('cheque_no')
        
        # If payment mode requires bank details, validate them
        if payment_mode and payment_mode.name.lower() in ['bank', 'cheque', 'online']:
            if not bank:
                raise serializers.ValidationError("Bank name is required for this payment mode.")
            if not account_no:
                raise serializers.ValidationError("Account number is required for this payment mode.")
        
        # If cheque payment, validate cheque number
        if payment_mode and payment_mode.name.lower() == 'cheque':
            if not cheque_no:
                raise serializers.ValidationError("Cheque number is required for cheque payments.")
        
        return data



class SaleSerializer(serializers.ModelSerializer):
    products = SaleProductSerializer(many=True)
    payments = SalePaymentSerializer(many=True)
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        source='customer',
        write_only=True
    )

    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(),
        required=True
    )
    

    class Meta:
        model = Sale
        fields = [
            'id',
            "business_category",
            'customer',
            'customer_id',
            'sale_date',
            'invoice_no',
            'total_amount',
            'discount_amount',
            'total_payable_amount',
            'products',
            'payments',
            'created_at',
        ]
        read_only_fields = ['invoice_no', 'created_at']

    @transaction.atomic
    def create(self, validated_data):
        products_data = validated_data.pop('products', [])
        payments_data = validated_data.pop('payments', [])
        sale = Sale.objects.create(**validated_data)

        # Create SaleProduct records
        for product_data in products_data:
            SaleProduct.objects.create(sale=sale, **product_data)
    
        # Create SalePayment records
        for payment_data in payments_data:
            payment_obj = SalePayment.objects.create(sale=sale, **payment_data)
            try:
                update_balance(
                    business_category=sale.business_category,
                    payment_mode=payment_obj.payment_mode.name.upper(),  # "CASH" or "BANK"
                    amount=payment_obj.paid_amount,
                    is_credit=True,   # Sale → money coming in
                    bank=payment_obj.bank,
                )
                print(f"Balance updated for payment {payment_obj.id}")
            except Exception as e:
                print(f"Failed to update balance for payment {payment_obj.id}: {e}")

        return sale




class SaleReturnSerializer(serializers.ModelSerializer):
    sale_product = SaleProductSerializer(read_only=True)
    sale_product_id = serializers.PrimaryKeyRelatedField(
        queryset=SaleProduct.objects.all(),
        source='sale_product',
        write_only=True
    )
    class Meta:
        model = SaleReturn
        fields = ['id', 'sale_product', 'sale_product_id', 'quantity', 'return_date']
        read_only_fields = ['return_date']

    def validate(self, data):
        sale_product = data['sale_product']
        quantity = data['quantity']
        if quantity <= 0:
            raise serializers.ValidationError('Return quantity must be positive.')
        if quantity > (sale_product.sale_quantity - sale_product.returned_quantity):
            raise serializers.ValidationError('Cannot return more than sold minus already returned.')
        return data 