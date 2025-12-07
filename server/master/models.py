from django.db import models
from django.utils import timezone
from decimal import Decimal



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

    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.bankName} - {self.accountName}"

    def save(self, *args, **kwargs):
        """
        When a new account is created, set current_balance = opening_balance.
        If you later change opening_balance and there are NO transactions,
        also sync current_balance.
        """
        is_new = self.pk is None
        # We can safely call super() first, then possibly update
        super().save(*args, **kwargs)

        # Reload from DB to avoid weird states
        if is_new or not self.transactions.exists():
            new_balance = self.opening_balance or Decimal("0")
            if self.current_balance != new_balance:
                type(self).objects.filter(pk=self.pk).update(
                    current_balance=new_balance
                )
                self.current_balance = new_balance

    def recalculate_balances(self):
        """
        Rebuild running_balance for all related transactions and
        update current_balance based on opening_balance.
        """
        from .models import BankTransaction  # local import to avoid circular

        balance = self.opening_balance or Decimal("0")

        # Order by date & id so history is consistent
        qs = self.transactions.order_by("date", "id")

        for tx in qs:
            if tx.transaction_type in ["DEPOSIT", "TRANSFER_IN", "INTEREST"]:
                balance += tx.amount
            elif tx.transaction_type in ["WITHDRAW", "TRANSFER_OUT", "CHARGE"]:
                balance -= tx.amount

            # Update running_balance using update() to avoid recursion
            if tx.running_balance != balance:
                BankTransaction.objects.filter(pk=tx.pk).update(
                    running_balance=balance
                )

        # Finally store on account
        if self.current_balance != balance:
            type(self).objects.filter(pk=self.pk).update(current_balance=balance)
            self.current_balance = balance




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
    narration = models.CharField(max_length=255, blank=True, null=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)

    reference_no = models.CharField(max_length=100, blank=True, null=True)

    running_balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_inflow(self):
        return self.transaction_type in ["DEPOSIT", "TRANSFER_IN", "INTEREST"]

    def is_outflow(self):
        return self.transaction_type in ["WITHDRAW", "TRANSFER_OUT", "CHARGE"]

    def _rebuild_account_balances(self):
        self.bank_account.recalculate_balances()

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # After saving this transaction, rebuild balances
        self._rebuild_account_balances()

    def delete(self, *args, **kwargs):
        account = self.bank_account
        super().delete(*args, **kwargs)
        # After deletion, rebuild again
        account.recalculate_balances()