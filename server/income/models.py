from django.db import models
from master.models import BusinessCategory, PaymentMode, BankMaster
from accounts.service import update_balance
from accounts.models import Account, JournalEntry



class Income(models.Model):
    business_category = models.ForeignKey(BusinessCategory,on_delete=models.CASCADE, related_name='incomes', blank=True, null=True)
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        limit_choices_to={'account_type': 'INCOME'},
        related_name='incomes',
        null=True,           
        blank=True
    )
    journal_entry = models.ForeignKey(
        JournalEntry,
        on_delete=models.SET_NULL,
        null=True,           
        blank=True, 
        related_name="incomes"
    )
    date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    received_by = models.CharField(max_length=100,blank=True, null=True)
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
        return f"{self.account.name} - {self.amount}"