from django.db import models
from decimal import Decimal
from django.core.exceptions import ValidationError
from master.models import BusinessCategory




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
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.name}"




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
