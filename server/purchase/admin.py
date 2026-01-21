from django.contrib import admin
from .models import *


admin.site.register(Expense)
admin.site.register(SalaryExpense)
admin.site.register(Purchase)
admin.site.register(PurchaseProduct)
admin.site.register(PurchasePayment)
admin.site.register(Order)
admin.site.register(OrderItem)
