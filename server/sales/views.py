from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.db import transaction

from .models import Sale, SaleReturn, SaleProduct, SalePayment
from .serializers import SaleSerializer, SaleReturnSerializer, SalePaymentSerializer
from accounts.utils import get_account
from accounts.models import JournalEntry, JournalEntryLine
from accounts.service import update_balance

# ✅ correct app name
from stocks.models import StockProduct
from django.db.models import Sum



class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().order_by('-sale_date')
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()

        business_category = self.request.query_params.get('business_category')
        if business_category:
            try:
                qs = qs.filter(business_category_id=business_category)
            except ValueError:
                qs = qs.none()

        return qs

    @action(detail=True, methods=['get'])
    def payments(self, request, pk=None):
        sale = self.get_object()
        payments = sale.payments.all()
        serializer = SalePaymentSerializer(payments, many=True)
        return Response(serializer.data)




class SalePaymentViewSet(viewsets.ModelViewSet):
    queryset = SalePayment.objects.all().order_by('-payment_date')
    serializer_class = SalePaymentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        sale_id = self.request.query_params.get('sale_id')
        if sale_id:
            qs = qs.filter(sale_id=sale_id)
        return qs

    @transaction.atomic
    def perform_create(self, serializer):
        # Save the payment
        payment = serializer.save()

        # Fetch the sale
        sale = payment.sale
        bc = sale.business_category

        # Calculate remaining receivable
        total_paid = sum(p.paid_amount for p in sale.payments.all())
        total_due = sale.total_payable_amount
        remaining_due = total_due - total_paid

        # Determine debit account (Cash or Bank)
        if payment.payment_mode.name.upper() == "CASH":
            debit_acc = get_account(bc, "1000")  # Cash account
        else:
            debit_acc = get_account(bc, "1010")  # Bank account

        # Credit account: if this is partial payment, credit AR, else credit Sale revenue?
        # Normally: when receiving payment after sale, credit AR
        credit_acc = get_account(bc, "1200")  # Accounts Receivable

        # Create Journal Entry
        journal = JournalEntry.objects.create(
            business_category=bc,
            date=payment.payment_date,
            reference=sale.invoice_no,
            narration=f"Payment received for Sale {sale.invoice_no}"
        )

        # Debit Cash/Bank
        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=debit_acc,
            debit=payment.paid_amount
        )

        # Credit Accounts Receivable
        JournalEntryLine.objects.create(
            journal_entry=journal,
            account=credit_acc,
            credit=payment.paid_amount
        )

        update_balance(
            business_category=sale.business_category,
            payment_mode=payment.payment_mode.name.upper(),  # "CASH" or "BANK"
            amount=payment.paid_amount,
            is_credit=True,   # Sale → money coming in
            bank=payment.bank
            )




class SaleReturnViewSet(viewsets.ModelViewSet):
    queryset = SaleReturn.objects.all().order_by('-return_date')
    serializer_class = SaleReturnSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        invoice_no = self.request.query_params.get('invoice_no')
        if invoice_no:
            qs = qs.filter(sale_product__sale__invoice_no=invoice_no)
        return qs

    def perform_create(self, serializer):
        """
        When a sale return is created:
        - increment returned_quantity on the SaleProduct
        - add the returned qty back to stock.current_stock_quantity
        - (optionally) reduce stock.sale_quantity
        """
        instance: SaleReturn = serializer.save()

        sp: SaleProduct = instance.sale_product
        sp.returned_quantity = (sp.returned_quantity or 0) + instance.quantity
        sp.save(update_fields=['returned_quantity'])

        # ✅ StockProduct tracks by product FK
        stock = StockProduct.objects.filter(product=sp.product).first()
        if stock:
            stock.current_stock_quantity = (stock.current_stock_quantity or 0) + instance.quantity
            # optional: reflect that some sold units were returned
            if hasattr(stock, 'sale_quantity') and stock.sale_quantity is not None:
                stock.sale_quantity = max(0, stock.sale_quantity - instance.quantity)
            # keep value in sync if you store it
            if hasattr(stock, 'current_stock_value'):
                purchase_price = float(stock.purchase_price or 0)
                stock.current_stock_value = (stock.current_stock_quantity or 0) * purchase_price
            stock.save()
