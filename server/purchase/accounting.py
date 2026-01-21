from accounts.models import JournalEntry, JournalEntryLine
from accounts.utils import get_account

def create_journal_entry(expense):
    """
    Create a journal entry for Expense or SalaryExpense.
    Uses `amount` for Expense and `total_salary` for SalaryExpense.
    """
    # Determine the value to debit/credit
    amount = getattr(expense, "total_salary", None) or getattr(expense, "amount", 0)

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
            credit_acc = get_account(expense.business_category, "1000")
        else:
            credit_acc = get_account(expense.business_category, "1010")

        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=credit_acc,
            debit=0,
            credit=amount,
            description=f"Paid via {expense.payment_mode.name}"
        )
