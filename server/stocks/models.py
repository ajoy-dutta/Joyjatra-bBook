from django.db import models
from django.utils import timezone
from django.utils.timezone import now
from django.utils.text import slugify
from master.models import BusinessCategory, InventoryCategory, PaymentMode, BankMaster
from decimal import Decimal
from django.core.exceptions import ValidationError
from accounts.models import Account, JournalEntry




class Product(models.Model):
    company_name = models.CharField(max_length=250, blank=True, null=True)
    business_category = models.ForeignKey(BusinessCategory, on_delete=models.CASCADE, null=True, blank=True)
    product_name = models.CharField(max_length=250)
    product_code = models.CharField(max_length=250,blank=True, null=True)
    price = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    unit = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    remarks = models.TextField(blank=True,null=True)    
   
    def __str__(self):
        return f"{self.product_name}  - {self.product_code}"
    



class StockProduct(models.Model):
    business_category = models.ForeignKey(BusinessCategory, on_delete=models.CASCADE,blank=True, null=True)
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name="stock"
    )
    journal_entry = models.ForeignKey(
        JournalEntry,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock'
    )
    inventory_category = models.ForeignKey(InventoryCategory,on_delete=models.CASCADE,blank=True,null=True)
    purchase_quantity = models.PositiveIntegerField(default=0,blank=True, null=True)
    sale_quantity = models.PositiveIntegerField(default=0,blank=True, null=True)
    damage_quantity = models.PositiveIntegerField(default=0, blank=True, null=True)
    current_stock_quantity = models.PositiveIntegerField(default=0, blank=True, null=True)

    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    sale_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    current_stock_value = models.DecimalField(max_digits=14, decimal_places=2,blank=True, null=True)

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




class Asset(models.Model):
    business_category = models.ForeignKey(
        BusinessCategory, 
        on_delete=models.CASCADE
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        limit_choices_to={'account_type': 'ASSET'},
        related_name='assets',
        null=True,
        blank=True
    )

    journal_entry = models.ForeignKey(
        JournalEntry,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assets'
    )
    name = models.CharField(max_length=255)
    model = models.CharField(max_length=100, blank=True, null=True)
    brand = models.CharField(max_length=100, blank=True, null=True)

    code = models.CharField(max_length=100, blank=True, null=True, unique=True)

    purchase_date = models.DateField()
    total_qty = models.PositiveIntegerField(default=0)

    unit_price = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        blank=True, 
        null=True
    )

    total_price = models.DecimalField(
        max_digits=14, 
        decimal_places=2, 
        blank=True, 
        null=True
    )

    damaged_qty = models.PositiveIntegerField(default=0)
    usable_qty = models.PositiveIntegerField(default=0, blank=True, null=True)
    payment_mode = models.ForeignKey(
        PaymentMode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assets",
    )
    bank = models.ForeignKey(
        BankMaster,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="assets",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    # ==========================
    # AUTO CODE GENERATOR
    # ==========================
    def generate_asset_code(self):
        month = self.purchase_date.strftime("%m")
        year = self.purchase_date.strftime("%y")
        base_code = f"{self.name}{month}{year}"

        last_asset = (
            Asset.objects
            .filter(
                name=self.name,
                purchase_date__year=self.purchase_date.year,
                purchase_date__month=self.purchase_date.month,
                code__startswith=base_code
            )
            .order_by("-code")
            .first()
        )

        if last_asset and last_asset.code:
            last_seq = int(last_asset.code[-1])
            next_seq = last_seq + 1
        else:
            next_seq = 1

        return f"{base_code}{next_seq}"

    # ==========================
    # SAVE METHOD
    # ==========================
    def save(self, *args, **kwargs):

        if self.damaged_qty > self.total_qty:
            raise ValidationError(
                "Damaged quantity cannot be greater than total quantity."
            )
        self.usable_qty = self.total_qty - self.damaged_qty

        # ✅ Total price
        if self.unit_price is not None:
            self.total_price = Decimal(self.total_qty) * self.unit_price
        else:
            self.total_price = Decimal(0)

        # ✅ Auto-generate code only if not exists
        if not self.code:
            self.code = self.generate_asset_code()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.code})"

    
    