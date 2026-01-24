from django.db import models
from django.core.exceptions import ValidationError
from master.models import BusinessCategory, BankMaster
from decimal import Decimal




class Account(models.Model):
    ACCOUNT_TYPES = (
        ("ASSET", "Asset"),
        ("LIABILITY", "Liability"),
        ("EQUITY", "Equity"),
        ("INCOME", "Income"),
        ("EXPENSE", "Expense"),
    )
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150)
    account_type = models.CharField(max_length=50, choices=ACCOUNT_TYPES)


    def __str__(self):
        return f"{self.code} - {self.name}"





class JournalEntry(models.Model):
    business_category = models.ForeignKey(
        BusinessCategory,
        on_delete=models.PROTECT,
        related_name="journalentry"
    )
    date = models.DateField()
    reference = models.CharField(max_length=100, blank=True, null=True)
    narration = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def total_debit(self):
        return sum(line.debit for line in self.lines.all())

    def total_credit(self):
        return sum(line.credit for line in self.lines.all())

    def validate_balanced(self):
        if self.total_debit() != self.total_credit():
            raise ValidationError("Total Debit must equal Total Credit")

    def __str__(self):
        return f"Journal {self.reference} - {self.date}"





class JournalEntryLine(models.Model):
    journal_entry = models.ForeignKey(
        JournalEntry,
        on_delete=models.CASCADE,
        related_name="lines"
    )
    account = models.ForeignKey(Account, on_delete=models.PROTECT)
    debit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    description = models.TextField(blank=True, null=True)

    def clean(self):
        if self.debit > 0 and self.credit > 0:
            raise ValidationError("A line cannot have both debit and credit")

        if self.debit < 0 or self.credit < 0:
            raise ValidationError("Debit or credit cannot be negative")

        if self.debit == 0 and self.credit == 0:
            raise ValidationError("Either debit or credit must be greater than zero")

    def __str__(self):
        return f"{self.account.name}"







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
           
           