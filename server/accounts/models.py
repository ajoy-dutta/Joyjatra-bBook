from django.db import models
from decimal import Decimal
from django.core.exceptions import ValidationError




class Account(models.Model):
    ACCOUNT_TYPES = (
        ("ASSET", "Asset"),
        ("LIABILITY", "Liability"),
        ("EQUITY", "Equity"),
        ("INCOME", "Income"),
        ("EXPENSE", "Expense"),
    )

    name = models.CharField(max_length=150)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children"
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.name}"





class OpeningBalance(models.Model):
    account = models.ForeignKey(
            Account,
            on_delete=models.PROTECT,
            related_name="opening_balances"
        )

    amount = models.DecimalField(max_digits=15, decimal_places=2)
    as_of_date = models.DateField()
    remarks = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("account", "as_of_date")

    def __str__(self):
        return f"{self.account.name}: {self.amount}"



