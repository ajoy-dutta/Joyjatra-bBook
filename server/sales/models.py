from django.db import models
from people.models import Customer
from stocks.models import Product,StockProduct
from master.models import  PaymentMode, BankMaster, BusinessCategory
from django.utils import timezone



class Sale(models.Model):
    business_category = models.ForeignKey(BusinessCategory, on_delete=models.CASCADE, null=True, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    sale_date = models.DateField(default=timezone.now)
    invoice_no = models.CharField(max_length=100, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_payable_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_invoice_no(self):
        last_id = Sale.objects.all().order_by('-id').first()
        next_number = (last_id.id + 1) if last_id else 1
        return f'SA{next_number:08d}'

    def save(self, *args, **kwargs):
        if not self.invoice_no:
            self.invoice_no = self.generate_invoice_no()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Invoice {self.invoice_no} - {self.customer.customer_name}"



class SaleProduct(models.Model):
    sale = models.ForeignKey(Sale, related_name='products', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_code = models.CharField(max_length=100)

    sale_quantity = models.PositiveIntegerField()
    sale_price = models.DecimalField(max_digits=12, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2,blank=True,null=True)
    sale_price_with_percentage = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    returned_quantity = models.PositiveIntegerField(default=0,blank=True,null=True)

    def __str__(self):
        # Assuming Product has product_code
        return f"{self.product.product_name} ({self.sale.invoice_no})"


class SaleReturn(models.Model):
    sale_product = models.ForeignKey(SaleProduct, related_name='returns', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    return_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Return {self.quantity} of {self.sale_product} on {self.return_date}"



class SalePayment(models.Model):
    sale = models.ForeignKey(Sale, related_name='payments', on_delete=models.CASCADE)
    payment_mode = models.ForeignKey(
        PaymentMode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales_payment_mode",
    )
    bank = models.ForeignKey(BankMaster, on_delete=models.CASCADE, blank=True, null=True)
    account_no = models.CharField(max_length=100, blank=True, null=True)
    cheque_no = models.CharField(max_length=100, blank=True, null=True)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2)
    remarks = models.TextField(blank=True, null=True)
    payment_date = models.DateTimeField(auto_now_add=True,blank=True,null=True)

    def __str__(self):
        return f"Payment for {self.sale.invoice_no} - {self.payment_mode.name}"