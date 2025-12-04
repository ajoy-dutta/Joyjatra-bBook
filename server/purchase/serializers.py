from rest_framework import serializers
from .models import *
from stocks.serializers import ProductSerializer
from people.serializers import VendorSerializer
from people.models import Vendor
from master.serializers import *


class ExpenseSerializer(serializers.ModelSerializer):
    cost_category_name = serializers.CharField(source="cost_category.category_name", read_only=True)

    class Meta:
        model = Expense
        fields = ["id", "cost_category", "cost_category_name", "amount", "note", "expense_date", "recorded_by"]



class SalaryExpenseSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source="staff.name", read_only=True)
    # uses the @property on the model
    total_salary = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = SalaryExpense
        fields = [
            "id",
            "staff",
            "staff_name",
            "salary_month",
            "base_amount",
            "allowance",
            "bonus",
            "total_salary",
            "note",
            "created_at",
        ]
        read_only_fields = ["total_salary", "created_at"]



class PurchaseProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )

    product_no = serializers.CharField(
        source='product.product_code',
        read_only=True
    )

    class Meta:
        model = PurchaseProduct
        fields = [
            'id',
            'product',
            'product_id',
            'product_no',
            'purchase_quantity',
            'purchase_price',
            'total_price',
            'returned_quantity',
            'manufacture_date',
            'expiry_date',
        ]

    def validate(self, attrs):
        """
        Make sure expiry is not before manufacture.
        Works for both create & update.
        """
        mfg = attrs.get('manufacture_date')
        exp = attrs.get('expiry_date')

        if mfg and exp and exp < mfg:
            raise serializers.ValidationError({
                'expiry_date': 'Expiry date cannot be earlier than manufacture date.'
            })

        return attrs

# ----------------------------
# Purchase Payment Serializer
# ----------------------------
class PurchasePaymentSerializer(serializers.ModelSerializer):
    # write-only helper so frontend can send `purchase_id`
    purchase_id = serializers.PrimaryKeyRelatedField(
        queryset=Purchase.objects.all(),
        source="purchase",      # maps to the FK field on the model
        write_only=True,
        required=False,      
        allow_null=True,     
    )

    class Meta:
        model = PurchasePayment
        fields = [
            "id",
            "purchase_id",   # use this in the frontend payload
            "payment_mode",
            "bank_name",
            "account_no",
            "cheque_no",
            "paid_amount",
            "payment_date",
        ]
        read_only_fields = ["payment_date"]

# ----------------------------
# Supplier Purchase Serializer
# ----------------------------
class PurchaseSerializer(serializers.ModelSerializer):
    # nested line-items & payments
    products = PurchaseProductSerializer(many=True)
    payments = PurchasePaymentSerializer(many=True, required=False)

    # vendor fields
    vendor = VendorSerializer(read_only=True)
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all(),
        source='vendor',          # maps to Purchase.vendor
        write_only=True
    )

    # computed fields from model @property
    total_returned_quantity = serializers.IntegerField(read_only=True)
    total_returned_value = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Purchase
        fields = [
            'id',
            'vendor',                  # read-only nested vendor
            'vendor_id',               # write-only FK id
            'purchase_date',
            'invoice_no',
            'total_amount',
            'discount_amount',
            'total_payable_amount',
            'products',
            'payments',
            'created_at',
            'total_returned_quantity',
            'total_returned_value',
        ]
        read_only_fields = ['created_at']

    def create(self, validated_data):
        products_data = validated_data.pop('products', [])
        payments_data = validated_data.pop('payments', [])

        # creates Purchase with vendor, purchase_date, totals, etc.
        purchase = Purchase.objects.create(**validated_data)

        # create line items (now also with mfg/expiry if provided)
        for product in products_data:
            PurchaseProduct.objects.create(purchase=purchase, **product)

        # create payments (if any)
        for payment in payments_data:
            PurchasePayment.objects.create(purchase=purchase, **payment)

        return purchase

    def update(self, instance, validated_data):
        # update simple fields; not touching nested products/payments here
        instance.vendor = validated_data.get('vendor', instance.vendor)
        instance.purchase_date = validated_data.get('purchase_date', instance.purchase_date)
        instance.invoice_no = validated_data.get('invoice_no', instance.invoice_no)
        instance.total_amount = validated_data.get('total_amount', instance.total_amount)
        instance.discount_amount = validated_data.get('discount_amount', instance.discount_amount)
        instance.total_payable_amount = validated_data.get(
            'total_payable_amount',
            instance.total_payable_amount
        )
        instance.save()
        return instance
    
