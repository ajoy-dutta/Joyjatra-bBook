from .models import *
from rest_framework import serializers
from master.serializers import BusinessCategorySerializer, InventoryCategorySerializer
from master.models import BusinessCategory
from .accounting import create_or_update_stock_journal

# ----------------------------
# Product Serializer
# ----------------------------
class ProductSerializer(serializers.ModelSerializer):
    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(),
        required=True
    )
    
    # Add read-only fields for calculated data if needed
    current_stock = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id',
            'business_category',
            'company_name',
            'product_name', 
            'product_code',
            'price',
            'unit',
            'remarks',
            'created_at',
            'current_stock'  # Optional: if you want to include stock info
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_current_stock(self, obj):
        """Get current stock quantity for this product"""
        try:
            stock = StockProduct.objects.filter(product=obj).first()
            return stock.current_stock_quantity if stock else 0
        except:
            return 0
    
    def validate_product_code(self, value):
        """Validate product code uniqueness within business category"""
        if value:  # Only validate if product_code is provided
            business_category = self.initial_data.get('business_category')
            if business_category:
                existing = Product.objects.filter(
                    business_category=business_category,
                    product_code=value
                )
                if self.instance:  # For updates, exclude current instance
                    existing = existing.exclude(pk=self.instance.pk)
                if existing.exists():
                    raise serializers.ValidationError(
                        "Product code must be unique within this business category."
                    )
        return value
    
    def validate_price(self, value):
        """Validate price is non-negative"""
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value




# ----------------------------
# Stock Serializer
# ----------------------------
class StockSerializer(serializers.ModelSerializer):
    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(),
        required=True
    )
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True
    )
    inventory_category = serializers.PrimaryKeyRelatedField(
        queryset=InventoryCategory.objects.all(),
        required=False,
        allow_null=True
    )
    category_details = InventoryCategorySerializer(read_only=True)

    class Meta:
        model = StockProduct
        fields = [
            "id",
            "business_category",
            'inventory_category',
            'journal_entry',
            'category_details',
            "product",
            "product_id",
            "purchase_quantity",
            "sale_quantity",
            "damage_quantity",
            "current_stock_quantity",
            "purchase_price",
            "current_stock_value",
            "manufacture_date",
            "expiry_date",
            "remarks",
            "created_at",
        ]
        read_only_fields = (
            "current_stock_value",
            "product",
            "created_at",
            "category_details",
        )

    def validate(self, data):
        purchase_qty = data.get("purchase_quantity") or 0
        sale_qty = data.get("sale_quantity") or 0
        damage_qty = data.get("damage_quantity") or 0

        if purchase_qty < 0 or sale_qty < 0 or damage_qty < 0:
            raise serializers.ValidationError(
                "Quantities cannot be negative."
            )

        if sale_qty + damage_qty > purchase_qty:
            raise serializers.ValidationError(
                "Sale + Damage cannot exceed Purchase quantity."
            )

        return data

    def create(self, validated_data):
        current_stock = validated_data.get("current_stock_quantity") or 0
        
        price = validated_data.get("purchase_price") or 0
        validated_data["current_stock_value"] = current_stock * price

        instance = super().create(validated_data)

        create_or_update_stock_journal(instance, old_stock_value=0)

        return instance



    def update(self, instance, validated_data):
        old_stock_value = instance.current_stock_value or 0
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Recalculate current stock quantity
        # instance.current_stock_quantity = (
        #     (instance.purchase_quantity or 0) -
        #     (instance.sale_quantity or 0) -
        #     (instance.damage_quantity or 0)
        # )

        # Recalculate current stock value
        price = instance.purchase_price or 0
        instance.current_stock_value = (
            instance.current_stock_quantity * price
        )
        
        instance.save()
        
        create_or_update_stock_journal(instance, old_stock_value)
        
        return instance



# ----------------------------
# Stock Batch Serializer
# ----------------------------
class StockBatchSerializer(serializers.ModelSerializer):
    remaining_quantity = serializers.IntegerField(read_only=True)
    is_expired = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = StockBatch
        fields = [
            "id",
            "batch_no",
            "manufacture_date",
            "expiry_date",
            "purchase_quantity",
            "sold_quantity",
            "damaged_quantity",
            "remaining_quantity",
            "is_expired",
            "created_at",
        ]

    def get_is_expired(self, obj):
        return obj.is_expired




class AssetSerializer(serializers.ModelSerializer):
    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all()
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
        model = Asset
        fields = [
            "id",
            "business_category",
            "account",
            "account_name",
            "journal_entry",
            "payment_mode",
            "payment_mode_name",
            "bank",
            "bank_name",
            "name",
            "code",
            "model",
            "brand",
            "purchase_date",
            "total_qty",
            "unit_price",
            "total_price",
            "usable_qty",
            "damaged_qty",
            "created_at",
        ]
        
        
