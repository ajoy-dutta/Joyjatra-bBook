from django.contrib import admin
from .models import *

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("id", "cost_category", "amount", "expense_date")
    search_fields = ("cost_category__category_name",)


admin.site.register(Purchase)
admin.site.register(PurchaseProduct)
admin.site.register(PurchasePayment)
admin.site.register(Order)
admin.site.register(OrderItem)
