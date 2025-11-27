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
        required=True
    )
    business_category = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(),
        required=True
    )
    
    # Add calculated fields for better data representation
    total_purchase_value = serializers.SerializerMethodField(read_only=True)
    total_sale_value = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = StockProduct
        fields = [
            'id',
            'business_category',
            'product',
            'product_id',
            'purchase_quantity',
            'sale_quantity', 
            'damage_quantity',
            'current_stock_quantity',
            'purchase_price',
            'sale_price',
            'current_stock_value',
            'net_weight',
            'created_at',
            'total_purchase_value',
            'total_sale_value'
        ]
        read_only_fields = [
            'id', 
            'current_stock_quantity',  # Should be calculated, not set directly
            'current_stock_value',     # Should be calculated, not set directly
            'created_at'
        ]
    
    def get_total_purchase_value(self, obj):
        """Calculate total purchase value"""
        return obj.purchase_quantity * obj.purchase_price
    
    def get_total_sale_value(self, obj):
        """Calculate total potential sale value"""
        return obj.current_stock_quantity * obj.sale_price
    
    def validate(self, data):
        """Validate stock data consistency"""
        # Validate that sale price is not less than purchase price
        purchase_price = data.get('purchase_price')
        sale_price = data.get('sale_price')
        
        if purchase_price and sale_price and sale_price < purchase_price:
            raise serializers.ValidationError({
                'sale_price': 'Sale price cannot be less than purchase price.'
            })
        
        # Validate quantities are non-negative
        quantities = ['purchase_quantity', 'sale_quantity', 'damage_quantity']
        for quantity_field in quantities:
            if quantity_field in data and data[quantity_field] < 0:
                raise serializers.ValidationError({
                    quantity_field: 'Quantity cannot be negative.'
                })
        
        # Validate net_weight if provided
        net_weight = data.get('net_weight')
        if net_weight and net_weight <= 0:
            raise serializers.ValidationError({
                'net_weight': 'Net weight must be positive.'
            })
        
        return data
    
    def create(self, validated_data):
        """Override create to handle stock calculations"""
        # Calculate current stock quantity
        validated_data['current_stock_quantity'] = (
            validated_data['purchase_quantity'] - 
            validated_data['sale_quantity'] - 
            validated_data['damage_quantity']
        )
        
        # Calculate current stock value
        validated_data['current_stock_value'] = (
            validated_data['current_stock_quantity'] * validated_data['purchase_price']
        )
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Override update to handle stock calculations"""
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Recalculate current stock quantity
        instance.current_stock_quantity = (
            instance.purchase_quantity - 
            instance.sale_quantity - 
            instance.damage_quantity
        )
        
        # Recalculate current stock value
        instance.current_stock_value = (
            instance.current_stock_quantity * instance.purchase_price
        )
        
        instance.save()
        return instance
