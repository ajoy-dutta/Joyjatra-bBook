from django.db import models
from django.utils import timezone
from django.utils.timezone import now
from django.utils.text import slugify
from master.models import BusinessCategory



class Product(models.Model):
    business_category = models.ForeignKey(BusinessCategory, on_delete=models.CASCADE, null=True, blank=True)
    # image = models.ImageField(upload_to='product_images/', blank=True, null=True)
    product_name = models.CharField(max_length=250)
    product_code = models.CharField(max_length=250,blank=True, null=True)
    price = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    unit = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    remarks = models.TextField(blank=True,null=True)    
   
    def __str__(self):
        return f"{self.product_name}  - {self.product_code}"
    



class StockProduct(models.Model):
    # business_category = models.ForeignKey(BusinessCategory, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    purchase_quantity = models.PositiveIntegerField(default=0)
    sale_quantity = models.PositiveIntegerField(default=0)
    damage_quantity = models.PositiveIntegerField(default=0)
    current_stock_quantity = models.PositiveIntegerField(default=0)

    purchase_price = models.DecimalField(max_digits=12, decimal_places=2)
    sale_price = models.DecimalField(max_digits=12, decimal_places=2)
    current_stock_value = models.DecimalField(max_digits=14, decimal_places=2)

    net_weight = models.CharField(max_length=250, blank=True, null=True)
    manufacture_date = models.DateField(blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)

    remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.product_name} - {self.current_stock_quantity}"




#product batch model
class StockBatch(models.Model):
    stock = models.ForeignKey(StockProduct, related_name="batches", on_delete=models.CASCADE)
    batch_no = models.CharField(max_length=50, blank=True, null=True)

    manufacture_date = models.DateField(blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)

    purchase_quantity = models.PositiveIntegerField(default=0)
    sold_quantity = models.PositiveIntegerField(default=0)
    damaged_quantity = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def remaining_quantity(self):
        return max(self.purchase_quantity - self.sold_quantity - self.damaged_quantity, 0)

    @property
    def is_expired(self):
        from django.utils import timezone
        return bool(self.expiry_date and self.expiry_date < timezone.now().date())