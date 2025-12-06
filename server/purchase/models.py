from django.db import models
from master.models import CostCategory, BankAccount, BankTransaction
from people.models import Vendor
from stocks.models import Product
from django.utils.timezone import now
from django.utils.text import slugify
from authentication.models import Staffs




class Expense(models.Model):
    cost_category = models.ForeignKey(
        CostCategory,
        on_delete=models.PROTECT,
        related_name="expenses",
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.CharField(max_length=255, blank=True)
    expense_date = models.DateField()
    recorded_by = models.CharField(max_length=100, blank=True, null=True)

    # NEW: how this expense was paid
    PAYMENT_SOURCES = [
        ("CASH", "Cash"),
        ("BANK", "Bank"),
    ]
    payment_source = models.CharField(
        max_length=10,
        choices=PAYMENT_SOURCES,
        default="CASH",
    )

    # NEW: optional bank account (used when payment_source = BANK)
    bank_account = models.ForeignKey(
        BankAccount,
        on_delete=models.PROTECT,
        related_name="expenses",
        blank=True,
        null=True,
    )

    # NEW: link to created bank transaction (so updates don't duplicate)
    bank_transaction = models.OneToOneField(
        BankTransaction,
        on_delete=models.SET_NULL,
        related_name="expense",
        blank=True,
        null=True,
    )

    def __str__(self):
        return f"{self.cost_category} - {self.amount}"
    


class SalaryExpense(models.Model):
    staff = models.ForeignKey(
        Staffs,
        on_delete=models.PROTECT,
        related_name="salary_expenses",
    ) 
    salary_month = models.CharField(max_length=7)  # e.g. "2025-01"

    # renamed 'amount' → 'base_amount'
    base_amount = models.DecimalField(max_digits=12, decimal_places=2)
    allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    bonus = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def total_salary(self):
        """
        Computed salary: base + allowance + bonus
        Not stored in DB, just calculated when needed.
        """
        return (self.base_amount or 0) + (self.allowance or 0) + (self.bonus or 0)

    def __str__(self):
        return f"{self.staff} - {self.salary_month}"




class Purchase(models.Model):
    vendor = models.ForeignKey(Vendor,on_delete=models.CASCADE,related_name="purchases",null=True, blank=True)
    purchase_date = models.DateField()
    invoice_no = models.CharField(max_length=100, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_payable_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    # --- Return summary fields ---
    @property
    def total_returned_quantity(self):
        return sum([p.returned_quantity for p in self.products.all()])

    @property
    def total_returned_value(self):
        return sum([
            p.returned_quantity * p.purchase_price for p in self.products.all()
        ])

    def generate_invoice_no(self):
        last_id = Purchase.objects.all().order_by('-id').first()
        next_number = (last_id.id + 1) if last_id else 1
        return f"PU{next_number:08d}"

    def save(self, *args, **kwargs):
        if not self.invoice_no:
            self.invoice_no = self.generate_invoice_no()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Invoice {self.invoice_no} - {self.vendor.vendor_name}"





class PurchaseProduct(models.Model):
    purchase = models.ForeignKey(
        Purchase,
        related_name='products',
        on_delete=models.CASCADE
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    purchase_quantity = models.PositiveIntegerField()
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    returned_quantity = models.PositiveIntegerField(default=0)

    # 🔹 NEW: manufacture & expiry dates for this batch of product
    manufacture_date = models.DateField(blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.product.product_code} ({self.purchase.invoice_no})"




class PurchasePayment(models.Model):
    purchase = models.ForeignKey(Purchase, related_name='payments', on_delete=models.CASCADE)
    payment_mode = models.CharField(max_length=100)
    bank_name = models.CharField(max_length=255, blank=True, null=True)
    account_no = models.CharField(max_length=100, blank=True, null=True)
    cheque_no = models.CharField(max_length=100, blank=True, null=True)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    def __str__(self):
        return f"Payment for {self.purchase.invoice_no}"
    
    