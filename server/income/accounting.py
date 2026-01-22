from accounts.models import JournalEntry, JournalEntryLine
from accounts.utils import get_account



def create_income_journal_entry(income):
   
    amount = income.amount
    journal_date = income.date or income.created_at

    journal = JournalEntry.objects.create(
        business_category=income.business_category,
        date=journal_date,
        reference=f"INCOME-{income.id}",
        narration=income.note or f"Income received: {income.account.name}"
    )

    income.journal_entry = journal
    income.save()

    # 1️⃣ Debit → Cash / Bank
    if income.payment_mode:
        if income.payment_mode.name.upper() == "CASH":
            debit_acc = get_account(income.business_category, "1000")  # Cash
        else:
            debit_acc = get_account(income.business_category, "1010")  # Bank

        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=debit_acc,
            debit=amount,
            credit=0,
            description=f"Received via {income.payment_mode.name}"
        )

    # 2️⃣ Credit → Income account
    JournalEntryLine.objects.create(
        journal_entry=journal,
        account=income.account,
        debit=0,
        credit=amount,
        description=income.note or "Income recorded"
    )
