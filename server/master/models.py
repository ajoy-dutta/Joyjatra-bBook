from django.db import models
from django.utils import timezone



class BusinessCategory(models.Model):
    name = models.CharField(max_length=100)


class CostCategory(models.Model):
    category_name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.category_name


class SourceCategory(models.Model):
    category_name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.category_name


class PaymentMode(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class DivisionMaster(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class DistrictMaster(models.Model):
    division = models.ForeignKey(DivisionMaster, on_delete=models.CASCADE, default=None)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class CountryMaster(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class SupplierTypeMaster(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class BankCategoryMaster(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class BankMaster(models.Model):
    name = models.CharField(max_length=100)
    bank_category = models.ForeignKey(BankCategoryMaster, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    


class AccountCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    

class BankAccount(models.Model):
    # link to existing masters
    accountCategory = models.ForeignKey(
        AccountCategory, on_delete=models.PROTECT, related_name="bank_accounts"
    )
    bankName = models.ForeignKey(
        BankMaster, on_delete=models.PROTECT, related_name="bank_accounts"
    )

    accountName = models.CharField(max_length=255)
    accountNo = models.CharField(max_length=50)
    bankAddress = models.TextField()
    bankContact = models.CharField(max_length=20)
    bankMail = models.EmailField()

    # 👉 opening & current balance
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.bankName} - {self.accountName}"
    
    
    
#Bank Transaction Model

class BankTransaction(models.Model):
    TRANSACTION_TYPES = [
        ("DEPOSIT", "Deposit"),
        ("WITHDRAW", "Withdraw"),
        ("TRANSFER_IN", "Transfer In"),
        ("TRANSFER_OUT", "Transfer Out"),
        ("INTEREST", "Interest"),
        ("CHARGE", "Bank Charge"),
    ]

    bank_account = models.ForeignKey(
        BankAccount,
        related_name="transactions",
        on_delete=models.CASCADE,
    )
    date = models.DateField()
    description = models.CharField(max_length=255, blank=True, null=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    running_balance = models.DecimalField(
        max_digits=15, decimal_places=2, default=0
    )

    def __str__(self):
        return f"{self.bank_account} - {self.transaction_type} - {self.amount}"

    def is_inflow(self):
        return self.transaction_type in ["DEPOSIT", "TRANSFER_IN", "INTEREST"]

    def _rebuild_account_balances(self):
        """helper to ask the account to rebuild its balances"""
        self.bank_account.recalculate_balances()

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self._rebuild_account_balances()

    def delete(self, *args, **kwargs):
        account = self.bank_account
        super().delete(*args, **kwargs)
        account.recalculate_balances()