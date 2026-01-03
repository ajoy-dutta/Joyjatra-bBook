from django.db import models
from master.models import BusinessCategory, PaymentMode, BankMaster
from accounts.service import update_balance


class IncomeCategory(models.Model):
    business_category = models.ForeignKey(BusinessCategory,on_delete=models.CASCADE, related_name='income_categories', blank=True, null=True)
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name



class Income(models.Model):
    business_category = models.ForeignKey(BusinessCategory,on_delete=models.CASCADE, related_name='incomes', blank=True, null=True)
    category = models.ForeignKey(
        IncomeCategory,
        on_delete=models.PROTECT,
        related_name="incomes"
    )
    date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    received_by = models.CharField(max_length=100)
    payment_mode = models.ForeignKey(
        PaymentMode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="incomes",
    )
    bank = models.ForeignKey(
        BankMaster,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="incomes",
    )
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category.name} - {self.amount}"