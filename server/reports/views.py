from .serializers import *
from django.utils.dateparse import parse_date
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import CombinedPurchaseSerializer
from decimal import Decimal
from django.db.models import Sum
from sales.models import Sale
from sales.serializers import SaleSerializer
from purchase.models import Expense,Purchase




class CombinedPurchaseView(APIView):
    def get(self, request):

        product_name = request.query_params.get("product_name")
        from_date = request.query_params.get("from_date")
        to_date = request.query_params.get("to_date")
        grouped_data = []


        purchases = (
            Purchase.objects
            .select_related("supplier")         
            .prefetch_related("products__product") 
        )

        if product_name:
            purchases = purchases.filter(product_name__iexact=product_name)
        if from_date:
            purchases = purchases.filter(purchase_date__gte=parse_date(from_date))
        if to_date:
            purchases = purchases.filter(purchase_date__lte=parse_date(to_date))

        for purchase in purchases:

            # All product names and part numbers
            product_names = []
            total_qty = 0
            total_amt = 0

            for item in purchase.products.all():
                # for Part Wise Filtering
                if product_name:
                    if item.product and item.product.product_name != product_name:
                        continue
                
                print("Item Product:", item.product)
                if item.product:
                    name_part = f"{item.product.product_name}"
                    product_names.append(name_part)
                else:
                    product_names.append("—")

                total_qty += item.purchase_quantity
                total_amt += float(item.total_price)

            if total_qty == 0:
                continue

            grouped_data.append({
                "date": purchase.purchase_date,
                "invoice_no": purchase.invoice_no,
                "product_name": "|".join(product_names),
                "vendor":  purchase.vendor.vendor_name,
                "quantity": total_qty,
                "purchase_amount": round(total_amt, 2),
            })

            print("Grouped Data", grouped_data)


        # --- Sort by Date Descending ---
        grouped_data.sort(key=lambda x: x["date"], reverse=True)

        serializer = CombinedPurchaseSerializer(grouped_data, many=True)
        return Response(serializer.data)





class SaleReportView(APIView):
    def get(self, request):
        sales = Sale.objects.all().order_by('-sale_date').prefetch_related('payments')

        # query params
        customer = request.query_params.get('customer')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        # filtering
        if customer:
            sales = sales.filter(customer_id=customer)
        if from_date:
            sales = sales.filter(sale_date__gte=parse_date(from_date))
        if to_date:
            sales = sales.filter(sale_date__lte=parse_date(to_date))

        serializer = SaleSerializer(sales, many=True)

        # totals
        total_sales_amount = sales.aggregate(total=Sum('total_amount'))['total'] or 0

        total_paid_amount = sum(
            sum(payment.paid_amount for payment in sale.payments.all())
            for sale in sales
        )

        total_due_amount = total_sales_amount - total_paid_amount

        return Response({
            "sales": serializer.data,
            "summary": {
                "total_sales_amount": total_sales_amount,
                "total_paid_amount": total_paid_amount,
                "total_due_amount": total_due_amount,
            }
        })




class CombinedExpanseView(APIView):
    def get(self, request):
        
        grouped_data = []
        expenses = Expense.objects.all().order_by('-date')

        # query params
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')
        account_title = request.query_params.get('account_title')
        cost_category = request.query_params.get('cost_category')
        receipt_no = request.query_params.get('receipt_no')

        # filtering
        if from_date:
            expenses = expenses.filter(date__gte=parse_date(from_date))
        if to_date:
            expenses = expenses.filter(date__lte=parse_date(to_date))
        if account_title:
            expenses = expenses.filter(accountTitle__icontains=account_title)
        if cost_category and cost_category.lower() != 'all':
            expenses = expenses.filter(costCategory=cost_category)
        if receipt_no:
            expenses = expenses.filter(voucherNo__icontains=receipt_no)

        for expense in expenses:
            grouped_data.append({
                "date": expense.date,
                "voucher_no": expense.voucherNo,
                "account_title": expense.accountTitle,
                "cost_category": expense.costCategory,
                "description": expense.remarks,
                "amount": expense.amount,
                "transaction_type": expense.transactionType,
            })  

            purchases = (
                Purchase.objects
                .prefetch_related("payments", "supplier")  # prefetch supplier + related payments
            )

            if from_date:
                purchases = purchases.filter(purchase_date__gte=parse_date(from_date))

            if to_date:
                purchases = purchases.filter(purchase_date__lte=parse_date(to_date))

            if account_title:
                purchases = purchases.filter(payments__payment_mode__icontains=account_title)

            if receipt_no:
                purchases = purchases.filter(invoice_no__icontains=receipt_no)

            for purchase in purchases:
                for payment in purchase.payments.all():

                    account_title_value = (
                        "Cash Buy" if payment.payment_mode == "Cash" 
                        else purchase.supplier.supplier_name
                    )

                    grouped_data.append({
                        "date": purchase.purchase_date,
                        "voucher_no": f"Payment for {purchase.invoice_no}",
                        "account_title": account_title_value,
                        "cost_category": "Supplier Purchase",
                        "amount": payment.paid_amount,
                        "transaction_type": payment.payment_mode,
                    })



        grouped_data.sort(key=lambda x: x["date"], reverse=True)

        serializer = CombinedExpenseSerializer(grouped_data, many=True)
        return Response(serializer.data)