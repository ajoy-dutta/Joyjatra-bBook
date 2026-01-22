from accounts.models import JournalEntry, JournalEntryLine
from accounts.utils import get_account

def create_asset_journal(asset):

    journal = JournalEntry.objects.create(
        business_category=asset.business_category,
        date=asset.purchase_date,
        reference=f"Asset Purchase: {asset.name} ({asset.code})",
        narration=f"{asset.brand or ''} {asset.model or ''}".strip()
    )

    asset.journal_entry = journal
    asset.save(update_fields=["journal_entry"])

    # 1️⃣ Debit → Asset account
    fixed_asset_account = get_account(asset.business_category, "1200")
    JournalEntryLine.objects.create(
        journal_entry=journal,
        account=asset.account,
        debit=asset.total_price,
        credit=0,
        description="Asset acquired"
    )

    # 2️⃣ Credit → Cash / Bank
    if asset.payment_mode:
        if asset.payment_mode.name.upper() == "CASH":
            credit_acc = get_account(asset.business_category, "1000")  # Cash
        else:
            credit_acc = get_account(asset.business_category, "1010")  # Bank

        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=credit_acc,
            debit=0,
            credit=asset.total_price,
            description=f"Paid via {asset.payment_mode.name}"
        )
