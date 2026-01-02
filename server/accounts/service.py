from decimal import Decimal
from django.db import transaction
from .models import CashAccount, BankAccount


@transaction.atomic
def update_balance(*, business_category, payment_mode, amount, is_credit, bank=None):
    amount = Decimal(amount)

    print("Business Category",business_category)
    print("Payment mode", payment_mode)
    print("Amount",amount)
    print("bank",bank)

    if payment_mode == "CASH":
        cash = CashAccount.objects.select_for_update().get(
            business_category=business_category
        )
        cash.current_balance += amount if is_credit else -amount
        cash.save(update_fields=["current_balance"])

    elif payment_mode == "BANK":
        if not bank:
            raise ValueError("BankMaster is required for BANK payment")

        bank_account = BankAccount.objects.select_for_update().get(
            bankName=bank,
            business_category=business_category
        )

        bank_account.current_balance += amount if is_credit else -amount
        bank_account.save(update_fields=["current_balance"])

    else:
        raise ValueError("Invalid payment mode")
