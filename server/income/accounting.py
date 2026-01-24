from decimal import Decimal
from django.db import transaction
from accounts.models import JournalEntry, JournalEntryLine
from accounts.utils import get_account
import logging

logger = logging.getLogger(__name__)


def create_income_journal_entry(income):
    try:
        # 🔹 Basic validation
        if not income:
            raise ValueError("Income object is None")

        amount = Decimal(income.amount)
        journal_date = income.date or income.created_at.date()

    except Exception as e:
        logger.error(f"[INCOME INIT ERROR] Income ID {getattr(income, 'id', None)} → {e}")
        raise

    try:
        with transaction.atomic():

            # 🔹 Create Journal Entry
            journal = JournalEntry.objects.create(
                business_category=income.business_category,
                date=journal_date,
                reference=f"INCOME-{income.id}",
                narration=income.note or f"Income received: {income.account.name}"
            )

            # =========================
            # 1️⃣ DEBIT → CASH / BANK / ACCOUNTS RECEIVABLE
            # =========================
            try:
                if income.payment_mode:
                    if income.payment_mode.name.upper() == "CASH":
                        debit_acc = get_account("1000")  # Cash
                    else:
                        debit_acc = get_account("1010")  # Bank
                    description = f"Received via {income.payment_mode.name}"
                else:
                    debit_acc = get_account("1020")  # Accounts Receivable
                    description = "Income recorded on credit"

                if not debit_acc:
                    raise ValueError("Debit account not found")

                JournalEntryLine.objects.create(
                    journal_entry=journal,
                    account=debit_acc,
                    debit=amount,
                    credit=Decimal("0.00"),
                    description=description
                )

            except Exception as e:
                logger.error(f"[DEBIT ERROR] Income ID {income.id} → {e}")
                raise
           
            # =========================
            # 2️⃣ CREDIT → INCOME
            # =========================
            try:
                JournalEntryLine.objects.create(
                    journal_entry=journal,
                    account=income.account,
                    debit=Decimal("0.00"),
                    credit=amount,
                    description=income.note or "Income recorded"
                )
            except Exception as e:
                logger.error(f"[CREDIT ERROR] Income ID {income.id} → {e}")
                raise

            # =========================
            # 3️⃣ VALIDATE BALANCE
            # =========================
            try:
                journal.validate_balanced()
            except Exception as e:
                logger.error(f"[BALANCE ERROR] Journal ID {journal.id} → {e}")
                raise

            # =========================
            # 4️⃣ LINK JOURNAL
            # =========================
            income.journal_entry = journal
            income.save(update_fields=["journal_entry"])

            return journal

    except Exception as e:
        logger.critical(f"[INCOME JOURNAL FAILED] Income ID {income.id} → {e}")
        raise
