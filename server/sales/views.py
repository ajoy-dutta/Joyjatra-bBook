from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import Sale, SaleReturn, SaleProduct, SalePayment
from .serializers import SaleSerializer, SaleReturnSerializer, SalePaymentSerializer

# ✅ correct app name
from stocks.models import StockProduct
from django.db.models import Sum


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().order_by('-sale_date')
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

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

    def perform_create(self, serializer):
        serializer.save()


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
