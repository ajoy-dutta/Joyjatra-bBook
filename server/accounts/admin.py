from django.contrib import admin
from .models import *


admin.site.register(Account)
admin.site.register(JournalEntry)
admin.site.register(JournalEntryLine)
admin.site.register(CashAccount)
admin.site.register(BankAccount)
