from .models import *
from rest_framework import serializers
from master.serializers import BusinessCategorySerializer

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
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True,
        required=False
    )
    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(),
        required=True
    )

    class Meta:
        model = StockProduct
        fields = [
            'id',
            'business_category',
            'product',
            'product_id',
            'purchase_quantity',
            'sale_quantity',
            "current_stock_quantity",
            'damage_quantity',
            'purchase_price',
            'sale_price',
            'current_stock_value',
            'net_weight',
            'manufacture_date',  
            'expiry_date',  
            'remarks',     
            'created_at',
        ]

        read_only_fields = (
            "current_stock_value",
            "current_stock_quantity",
        )

    def validate(self, data):
        # ---- price validation ----
        purchase_price = data.get('purchase_price')
        sale_price = data.get('sale_price')

        # Prices must be non-negative
        if purchase_price is not None and purchase_price < 0:
            raise serializers.ValidationError({
                'purchase_price': 'Purchase price cannot be negative.'
            })

        if sale_price is not None and sale_price < 0:
            raise serializers.ValidationError({
                'sale_price': 'Sale price cannot be negative.'
            })

        # ---- quantity validation ----
        quantities = ['purchase_quantity', 'sale_quantity', 'damage_quantity']
        for quantity_field in quantities:
            if quantity_field in data and data[quantity_field] < 0:
                raise serializers.ValidationError({
                    quantity_field: 'Quantity cannot be negative.'
                })

        return data

    def create(self, validated_data):
        # Calculate current stock quantity
        validated_data['current_stock_quantity'] = (
            validated_data.get('purchase_quantity', 0) -
            validated_data.get('sale_quantity', 0) -
            validated_data.get('damage_quantity', 0)
        )

        # Protect against missing purchase_price on create
        purchase_price = validated_data.get('purchase_price') or 0
        validated_data['current_stock_value'] = (
            validated_data['current_stock_quantity'] * purchase_price
        )

        return super().create(validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Recalculate current stock quantity
        instance.current_stock_quantity = (
            (instance.purchase_quantity or 0) -
            (instance.sale_quantity or 0) -
            (instance.damage_quantity or 0)
        )

        # Recalculate current stock value
        purchase_price = instance.purchase_price or 0
        instance.current_stock_value = (
            instance.current_stock_quantity * purchase_price
        )

        instance.save()
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