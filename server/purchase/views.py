from rest_framework import viewsets, permissions
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related("cost_category").order_by("-id")
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
