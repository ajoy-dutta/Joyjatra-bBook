from rest_framework import serializers
from .models import *
from stocks.serializers import ProductSerializer
from people.serializers import VendorSerializer
from people.models import Vendor
from master.serializers import *
from django.db import transaction
from accounts.service import update_balance


class ExpenseSerializer(serializers.ModelSerializer):
    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(),
        required=True
    )
    account_name = serializers.CharField(source='account.name', read_only=True)
    payment_mode_name = serializers.CharField(
        source="payment_mode.name", read_only=True
    )
    bank_name = serializers.CharField(
        source="bank.name", read_only=True
    )

    class Meta:
        model = Expense
        fields = [
            "id",
            "business_category",
            "account",
            "account_name",
            "journal_entry",
            "amount",
            "note",
            "expense_date",
            "recorded_by",
            "payment_mode",
            "payment_mode_name",
            "bank",
            "bank_name",
        ]
        extra_kwargs = {
            "payment_mode": {"required": False, "allow_null": True},
            "bank": {"required": False, "allow_null": True},
        }




class SalaryExpenseSerializer(serializers.ModelSerializer):
    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(),
        required=True
    )
    staff_name = serializers.CharField(source="staff.name", read_only=True)
    total_salary = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        read_only=True,
        coerce_to_string=True  
    )
    payment_mode_name = serializers.CharField(
        source="payment_mode.name", read_only=True
    )
    bank_name = serializers.CharField(
        source="bank.name", read_only=True
    )
    

    class Meta:
        model = SalaryExpense
        fields = [
            "id",
            "business_category",
            "journal_entry",
            "staff",
            "staff_name",
            "salary_month",
            "base_amount",
            "allowance",
            "bonus",
            "payment_mode",
            "payment_mode_name",
            "bank",
            "bank_name",
            "note",
            "created_at",
            "total_salary",
        ]



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
            "bank",
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

    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(),
        required=True
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
            "business_category",
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
        products_data = validated_data.pop("products", [])
        payments_data = validated_data.pop("payments", [])

        with transaction.atomic():
            purchase = Purchase.objects.create(**validated_data)

            # 2️⃣ Create products
            for product in products_data:
                PurchaseProduct.objects.create(
                    purchase=purchase,
                    **product
                )

            # 3️⃣ Create payments + update balance
            for payment in payments_data:
                payment_obj = PurchasePayment.objects.create(
                    purchase=purchase,
                    **payment
                )

                print("Business Category", purchase.business_category)
                print("Payment mode", payment_obj.payment_mode.name.upper())
                print("Amount", payment_obj.paid_amount)
                print("bank", payment_obj.bank)


                update_balance(
                    business_category=purchase.business_category,
                    payment_mode=payment_obj.payment_mode.name.upper(),
                    amount=payment_obj.paid_amount,
                    is_credit=False, 
                    bank=payment_obj.bank,
                )

        return purchase



    def update(self, instance, validated_data):
        products_data = validated_data.pop("products", [])
        payments_data = validated_data.pop("payments", [])

        with transaction.atomic():
            # 1️⃣ Update main purchase fields
            instance.vendor = validated_data.get('vendor', instance.vendor)
            instance.purchase_date = validated_data.get('purchase_date', instance.purchase_date)
            instance.invoice_no = validated_data.get('invoice_no', instance.invoice_no)
            instance.total_amount = validated_data.get('total_amount', instance.total_amount)
            instance.discount_amount = validated_data.get('discount_amount', instance.discount_amount)
            instance.total_payable_amount = validated_data.get('total_payable_amount', instance.total_payable_amount)
            instance.save()

            # 2️⃣ Update or create products
            # We'll clear old products and recreate for simplicity
            if products_data:
                instance.products.all().delete()
                for product in products_data:
                    PurchaseProduct.objects.create(
                        purchase=instance,
                        **product
                    )

            # 3️⃣ Update payments
            if payments_data:
                # refund old payments first (increase balance back)
                for old_payment in instance.payments.all():
                    update_balance(
                        business_category=instance.business_category,
                        payment_mode=old_payment.payment_mode.name.upper(),
                        amount=Decimal(old_payment.paid_amount),
                        is_credit=True,  # refund
                        bank=old_payment.bank,
                    )
                # remove old payment records
                instance.payments.all().delete()

                # create new payments and update balance
                for payment in payments_data:
                    payment_obj = PurchasePayment.objects.create(
                        purchase=instance,
                        **payment
                    )
                    update_balance(
                        business_category=instance.business_category,
                        payment_mode=payment_obj.payment_mode.name.upper(),
                        amount=Decimal(payment_obj.paid_amount),
                        is_credit=False,
                        bank=payment_obj.bank,
                    )

        return instance
    




# ----------------------------
# Order Item Serializer
# ----------------------------
class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product')

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product_id',
            'quantity',
            'product_details',
        ]


# ----------------------------
# Order Serializer
# ----------------------------
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_no', 'order_date','company_name', 'items']


    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order


    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        instance.order_no = validated_data.get('order_no', instance.order_no)
        instance.order_date = validated_data.get('order_date', instance.order_date)
        instance.save()

        existing_item_ids = [item.id for item in instance.items.all()]
        new_item_ids = []

        for item_data in items_data:
            item_id = item_data.get('id', None)
            if item_id and item_id in existing_item_ids:
                item = OrderItem.objects.get(id=item_id, order=instance)
                for attr, value in item_data.items():
                    setattr(item, attr, value)
                item.save()
                new_item_ids.append(item_id)
            else:
                item = OrderItem.objects.create(order=instance, **item_data)
                new_item_ids.append(item.id)

        for item in instance.items.all():
            if item.id not in new_item_ids:
                item.delete()

        return instance

