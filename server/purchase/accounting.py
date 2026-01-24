from accounts.models import JournalEntry, JournalEntryLine
from accounts.utils import get_account
from decimal import Decimal



def create_expense_journal_entry(expense):
   
    # Determine the value to debit/credit
    amount = getattr(expense, "total_salary", None) or getattr(expense, "amount", 0)
    print("amount", amount)

    # Determine the date
    journal_date = getattr(expense, "expense_date", None) or getattr(expense, "created_at", None)

    # Create the journal entry
    journal = JournalEntry.objects.create(
        business_category=expense.business_category,
        date=journal_date,
        reference=f"Expense: {expense.account.name}",
        narration=f"{getattr(expense, 'note', '')}"
    )

    # Link journal entry to expense
    expense.journal_entry = journal
    expense.save()

    # 1️⃣ Debit → Expense account
    JournalEntryLine.objects.create(
        journal_entry=journal,
        account=expense.account,
        debit=amount,
        credit=0,
        description=f"Expense recorded: {getattr(expense, 'note', '')}"
    )

    # 2️⃣ Credit → Cash or Bank
    if expense.payment_mode:
        if expense.payment_mode.name.upper() == "CASH":
            credit_acc = get_account("1000")
        else:
            credit_acc = get_account("1010")

        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=credit_acc,
            debit=0,
            credit=amount,
            description=f"Paid via {expense.payment_mode.name}"
        )
    else:
        acc_payable = get_account("2000")
        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=acc_payable,
            debit=0,
            credit=amount,
            description=f""
        )
        





def create_purchase_journal(purchase):
    
    journal = JournalEntry.objects.create(
        business_category=purchase.business_category,
        date=purchase.purchase_date,
        reference=f"PUR-{purchase.invoice_no}",
        narration="Inventory purchase"
    )

    purchase.journal_entry = journal
    purchase.save(update_fields=["journal_entry"])
    
    
    total_payable = purchase.total_payable_amount
    total_paid = sum([p.paid_amount for p in purchase.payments.all()])
    total_due = total_payable - total_paid

    # 1️⃣ Debit → Inventory (Stock)
    inventory_acc = get_account("1100")  # Inventory
    JournalEntryLine.objects.create(
        journal_entry=journal,
        account=inventory_acc,
        debit=total_payable,
        credit=Decimal("0"),
        description="Inventory purchased"
    )

    # 2️⃣ Credit → Cash / Bank / Payable
    for payment in purchase.payments.all():
        if payment.payment_mode.name.upper() == "CASH":
            credit_acc = get_account("1000")  # Cash
        else:
            credit_acc = get_account("1010")  # Bank
        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=credit_acc,
            debit=Decimal(0),
            credit=payment.paid_amount,
            description=f"Paid via {payment.payment_mode.name}"
        )
    
    if total_due > 0:
        accounts_payable_acc = get_account("2000")
        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=accounts_payable_acc,
            debit=Decimal(0),
            credit=total_due,
            description=f"Due to vendor {purchase.vendor.vendor_name if purchase.vendor else ''}"
        )
       
        
