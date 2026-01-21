from decimal import Decimal
from accounts.models import JournalEntry, JournalEntryLine
from accounts.utils import get_account


def create_sale_journal(sale, payments):
    bc = sale.business_category

    cash_acc = get_account(bc, "1000")
    bank_acc = get_account(bc, "1010")
    ar_acc = get_account(bc, "1200")
    sales_acc = get_account(bc, "4000")

    journal = JournalEntry.objects.create(
        business_category=bc,
        date=sale.sale_date,
        reference=sale.invoice_no,
        narration="Sale Invoice"
    )

    total_paid = Decimal("0")

    # 1️⃣ Debit payments
    for payment in payments:
        total_paid += payment.paid_amount

        if payment.payment_mode.name.upper() == "CASH":
            JournalEntryLine.objects.create(
                journal_entry=journal,
                account=cash_acc,
                debit=payment.paid_amount
            )
        else:
            JournalEntryLine.objects.create(
                journal_entry=journal,
                account=bank_acc,
                debit=payment.paid_amount
            )

    # 2️⃣ Debit Accounts Receivable (if unpaid)
    due_amount = sale.total_payable_amount - total_paid
    if due_amount > 0:
        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=ar_acc,
            debit=due_amount
        )

    # 3️⃣ Credit Sales Revenue (FULL AMOUNT)
    JournalEntryLine.objects.create(
        journal_entry=journal,
        account=sales_acc,
        credit=sale.total_payable_amount
    )

    return journal
