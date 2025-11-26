from django.db import models
from master.models import CostCategory

class Expense(models.Model):
    cost_category = models.ForeignKey(CostCategory, on_delete=models.PROTECT, related_name="expenses")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.CharField(max_length=255, blank=True)
    expense_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.cost_category} - {self.amount}"
