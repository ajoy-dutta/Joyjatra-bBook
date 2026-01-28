from accounts.models import JournalEntry, JournalEntryLine
from accounts.utils import get_account
from decimal import Decimal



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
            credit_acc = get_account("1000")  # Cash
        else:
            credit_acc = get_account("1010")  # Bank

        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=credit_acc,
            debit=0,
            credit=asset.total_price,
            description=f"Paid via {asset.payment_mode.name}"
        )
    else:
        acc_payable = get_account("2000")
        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=acc_payable,
            debit=0,
            credit=asset.total_price,
            description="Purchased on credit"
        )




def create_or_update_stock_journal(stock, old_stock_value: Decimal = 0):
    updated_value = stock.current_stock_value or 0
    diff_value = updated_value - (old_stock_value or 0)
    
    print("updated_value", updated_value)
    print("diff", diff_value)

    if diff_value == 0:
        return  # no change, no journal needed

    # create journal if not exists
    if not stock.journal_entry:
        journal = JournalEntry.objects.create(
            business_category=stock.business_category,
            date=stock.created_at,
            reference=f"Stock Entry: {stock.product.product_name}",
            narration=f"Stock update for {stock.product.product_name}"
        )
        stock.journal_entry = journal
        stock.save(update_fields=["journal_entry"])
    else:
        journal = stock.journal_entry

    # Accounts
    inventory_acc = get_account("1100")  # Inventory - Asset
    raw_materials_acc = get_account("1110")    # Raw Materials - Asset

    if diff_value > 0:
        # Stock increased
        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=inventory_acc,
            debit=diff_value,
            credit=0,
            description="Stock increase"
        )
        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=raw_materials_acc,
            debit=0,
            credit=diff_value,
            description="Raw material decrease"
        )
    else:
        # Stock decreased
        diff_value = abs(diff_value)
        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=inventory_acc,
            debit=0,
            credit=diff_value,
            description="Stock decrease"
        )
        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=raw_materials_acc,
            debit=diff_value,
            credit=0,
            description="Raw material reversal"
        )
