from django.db import models
from decimal import Decimal
from django.core.exceptions import ValidationError
from master.models import BusinessCategory, BankMaster



class OpeningBalance(models.Model):
    ACCOUNT_TYPES = (
        ("ASSET", "Asset"),
        ("LIABILITY", "Liability"),
        ("EQUITY", "Equity"),
        ("INCOME", "Income"),
        ("EXPENSE", "Expense"),
    )

    business_category = models.ForeignKey(
        BusinessCategory,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    account = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPES
    )

    entry_type = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    as_of_date = models.DateField()
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.entry_type} - {self.amount}"




class CashAccount(models.Model):
    business_category = models.ForeignKey(
        BusinessCategory,
        on_delete=models.PROTECT,
        related_name="cash"
    )

    opening_balance = models.DecimalField(
        max_digits=15, decimal_places=2, default=0
    )
    current_balance = models.DecimalField(
        max_digits=15, decimal_places=2, default=0
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("business_category",)

    def __str__(self):
        return f"Cash - {self.business_category}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # Sync opening → current if no transactions exist
        if is_new:
            self.current_balance = self.opening_balance or Decimal("0")
            type(self).objects.filter(pk=self.pk).update(
                current_balance=self.current_balance
            )




class BankAccount(models.Model):
    business_category = models.ForeignKey(
        BusinessCategory,
        on_delete=models.PROTECT,
        related_name="bank"
    )
    bank = models.ForeignKey(
        BankMaster, on_delete=models.PROTECT, related_name="bank_accounts"
    )

    accountName = models.CharField(max_length=255)
    accountNo = models.CharField(max_length=50)

    opening_balance = models.DecimalField(
        max_digits=15, decimal_places=2, default=0
    )
    current_balance = models.DecimalField(
        max_digits=15, decimal_places=2, default=0
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.bank.name} - {self.accountName}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            self.current_balance = self.opening_balance or Decimal("0")
            type(self).objects.filter(pk=self.pk).update(
                current_balance=self.current_balance
            )
