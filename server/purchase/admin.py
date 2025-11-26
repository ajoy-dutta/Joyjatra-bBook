from django.contrib import admin
from .models import Expense

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("id", "cost_category", "amount", "expense_date")
    search_fields = ("cost_category__category_name",)
