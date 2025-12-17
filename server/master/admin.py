from django.contrib import admin
from .models import*

# Register your models here.
admin.site.register(BusinessCategory)
admin.site.register(CostCategory)
admin.site.register(SourceCategory)
admin.site.register(PaymentMode)
admin.site.register(DivisionMaster)
admin.site.register(DistrictMaster)
admin.site.register(CountryMaster)
admin.site.register(SupplierTypeMaster)
admin.site.register(BankCategoryMaster)
admin.site.register(BankMaster)
admin.site.register(AccountCategory)
admin.site.register(BankAccount)
@admin.register(BankTransaction)
class BankTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "bank_account", "date", "transaction_type", "amount")
    list_filter = ("transaction_type", "date", "bank_account")
    search_fields = ("narration", "reference_no", "bank_account__accountName")

admin.site.register(InventoryCategory)