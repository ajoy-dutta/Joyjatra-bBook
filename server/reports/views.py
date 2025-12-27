from .serializers import *
from django.utils.dateparse import parse_date
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import CombinedPurchaseSerializer
from decimal import Decimal
from django.db.models import Sum, Q
from sales.models import Sale
from stocks.models import Asset

from sales.serializers import SaleSerializer
from purchase.models import Expense, SalaryExpense, Purchase
from datetime import date
from accounts.models import OpeningBalance
from .utils import percent_change




class CombinedPurchaseView(APIView):
    def get(self, request):
        business_category = request.query_params.get("business_category")
        product_name = request.query_params.get("product_name")
        from_date = request.query_params.get("from_date")
        to_date = request.query_params.get("to_date")
        
        # Start with PurchaseQuerySet
        purchases = Purchase.objects.select_related("vendor", "business_category") \
                                   .prefetch_related("products__product") \
                                   .order_by("-purchase_date")
        
        # Apply filters
        if business_category:
            purchases = purchases.filter(business_category__id=business_category)
        
        if from_date:
            purchases = purchases.filter(purchase_date__gte=parse_date(from_date))
        
        if to_date:
            purchases = purchases.filter(purchase_date__lte=parse_date(to_date))
        
        # Handle product_name filter differently
        if product_name:
            purchases = purchases.filter(
                products__product__product_name__icontains=product_name
            ).distinct()
        
        grouped_data = []
        
        for purchase in purchases:
            # Filter products based on product_name if provided
            purchase_products = purchase.products.all()
            
            if product_name:
                purchase_products = purchase_products.filter(
                    product__product_name__icontains=product_name
                )
            
            # Skip if no products after filtering
            if not purchase_products.exists():
                continue
            
            # Calculate totals for filtered products
            total_qty = 0
            total_amt = 0
            product_names = []
            
            for item in purchase_products:
                total_qty += item.purchase_quantity
                total_amt += float(item.total_price)
                
                if item.product:
                    product_names.append(item.product.product_name)
                else:
                    product_names.append("—")
            
            # Create unique product name string
            product_names_str = ", ".join(sorted(set(product_names)))
            
            grouped_data.append({
                "date": purchase.purchase_date,
                "invoice_no": purchase.invoice_no,
                "product_name": product_names_str,
                "vendor": purchase.vendor.vendor_name if purchase.vendor else "—",
                "quantity": total_qty,
                "purchase_amount": round(total_amt, 2),
                "total_amount": float(purchase.total_amount),
                "discount": float(purchase.discount_amount),
                "payable": float(purchase.total_payable_amount),
                "invoice_id": purchase.id,
            })
        
        # Sort by date descending
        grouped_data.sort(key=lambda x: x["date"], reverse=True)
    
        # Or return directly:
        return Response({"purchases": grouped_data})





class SaleReportView(APIView):
    def get(self, request):
        sales = Sale.objects.all().order_by('-sale_date').prefetch_related('payments')

        # query params
        business_category = request.query_params.get('business_category')
        customer = request.query_params.get('customer')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        # filtering
        if business_category:
            sales = sales.filter(business_category__id=business_category)
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

        # ==========================
        #   GET FILTER PARAMETERS
        # ==========================
        business_category = request.query_params.get("business_category")
        from_date = request.query_params.get("from_date")
        to_date = request.query_params.get("to_date")
        cost_category = request.query_params.get("cost_category")
        account_title = request.query_params.get("account_title")
        receipt_no = request.query_params.get("receipt_no")

        # ==========================
        #   EXPENSES
        # ==========================
        expenses = Expense.objects.all().order_by("-expense_date")
        print(expenses)

        if business_category:
            expenses = expenses.filter(business_category__id=business_category)

        if from_date:
            expenses = expenses.filter(expense_date__gte=parse_date(from_date))

        if to_date:
            expenses = expenses.filter(expense_date__lte=parse_date(to_date))

        if cost_category and cost_category.lower() != "all":
            expenses = expenses.filter(cost_category__id=cost_category)

        if account_title:
            expenses = expenses.filter(recorded_by__icontains=account_title)

        if receipt_no:
            expenses = expenses.filter(id__icontains=receipt_no)

        for ex in expenses:
            grouped_data.append({
                "date": ex.expense_date,
                "voucher_no": f"EXP-{ex.id}",
                "account_title": ex.recorded_by or "",
                "cost_category": ex.cost_category.category_name,
                "description": ex.note,
                "amount": ex.amount
            })

        print("Grouped Data after Expenses:", grouped_data)

        # ==========================
        #   PURCHASE PAYMENTS
        # ==========================
        purchases = Purchase.objects.select_related("vendor").prefetch_related("payments").all()

        if business_category:
            purchases = purchases.filter(business_category__id=business_category)

        if from_date:
            purchases = purchases.filter(purchase_date__gte=parse_date(from_date))

        if to_date:
            purchases = purchases.filter(purchase_date__lte=parse_date(to_date))

        if account_title:
            purchases = purchases.filter(payments__payment_mode__icontains=account_title)

        if receipt_no:
            purchases = purchases.filter(invoice_no__icontains=receipt_no)

        for p in purchases:
            for pay in p.payments.all():

                account_title_value = (
                    "Cash Purchase" if pay.payment_mode == "Cash"
                    else p.vendor.vendor_name if p.vendor else ""
                )

                grouped_data.append({
                    "date": p.purchase_date,
                    "voucher_no": f"Payment for {p.invoice_no}",
                    "account_title": account_title_value,
                    "cost_category": "Purchase Expense",
                    "description": f"Purchase payment ({pay.payment_mode})",
                    "amount": pay.paid_amount,
                    "transaction_type": pay.payment_mode,
                })

        # ==========================
        #   SALARY EXPENSE
        # ==========================
        salaries = SalaryExpense.objects.select_related("staff").all()


        if business_category:            
            salaries = salaries.filter(business_category__id=business_category)

        if from_date:
            salaries = salaries.filter(created_at__date__gte=parse_date(from_date))

        if to_date:
            salaries = salaries.filter(created_at__date__lte=parse_date(to_date))

        if account_title:
            salaries = salaries.filter(staff__name__icontains=account_title)

        for s in salaries:
            grouped_data.append({
                "date": s.created_at.date(),
                "voucher_no": f"SAL-{s.id}",
                "account_title": s.staff.name,
                "cost_category": "Salary Expense",
                "description": s.note or "",
                "amount": s.total_salary,
                "transaction_type": "Salary",
            })

        # ==========================
        #   SORT FINAL DATA
        # ==========================
        grouped_data.sort(key=lambda x: x["date"], reverse=True)

        return Response(grouped_data)









class ProfitLossReportView(APIView):
    def get(self, request):

        # ==========================
        # YEAR HANDLING
        # ==========================
        year = int(request.query_params.get("year", date.today().year))
        prev_year = year - 1

        start = date(year, 1, 1)
        end = date(year, 12, 31)
        prev_start = date(prev_year, 1, 1)
        prev_end = date(prev_year, 12, 31)

        # ==========================
        # INCOME
        # ==========================
        sales_current = Sale.objects.filter(
            sale_date__range=(start, end)
        ).aggregate(total=Sum("total_amount"))["total"] or Decimal("0")

        sales_prev = Sale.objects.filter(
            sale_date__range=(prev_start, prev_end)
        ).aggregate(total=Sum("total_amount"))["total"] or Decimal("0")

        other_income_current = OpeningBalance.objects.filter(
            journal_entry__date__range=(start, end),
            account__account_type="INCOME"
        ).aggregate(total=Sum("credit"))["total"] or Decimal("0")

        other_income_prev = OpeningBalance.objects.filter(
            journal_entry__date__range=(prev_start, prev_end),
            account__account_type="INCOME"
        ).aggregate(total=Sum("credit"))["total"] or Decimal("0")

        total_income_current = sales_current + other_income_current
        total_income_prev = sales_prev + other_income_prev

        # ==========================
        # EXPENSES (CATEGORY WISE)
        # ==========================
        expense_current_qs = (
            Expense.objects.filter(expense_date__range=(start, end))
            .values("cost_category__category_name")
            .annotate(total=Sum("amount"))
        )

        expense_prev_qs = (
            Expense.objects.filter(expense_date__range=(prev_start, prev_end))
            .values("cost_category__category_name")
            .annotate(total=Sum("amount"))
        )

        prev_map = {
            e["cost_category__category_name"]: e["total"]
            for e in expense_prev_qs
        }

        expense_rows = []
        total_expense_current = Decimal("0")
        total_expense_prev = Decimal("0")

        for row in expense_current_qs:
            name = row["cost_category__category_name"]
            current_total = row["total"] or Decimal("0")
            prev_total = prev_map.get(name, Decimal("0"))

            expense_rows.append({
                "item": name,
                "current_year": current_total,
                "previous_year": prev_total,
                "percent_change": percent_change(current_total, prev_total),
            })

            total_expense_current += current_total
            total_expense_prev += prev_total

        # ==========================
        # SALARY EXPENSE
        # ==========================
        salary_current = SalaryExpense.objects.filter(
            created_at__date__range=(start, end)
        ).aggregate(total=Sum("base_amount"))["total"] or Decimal("0")

        salary_prev = SalaryExpense.objects.filter(
            created_at__date__range=(prev_start, prev_end)
        ).aggregate(total=Sum("base_amount"))["total"] or Decimal("0")

        expense_rows.append({
            "item": "Salary Expense",
            "current_year": salary_current,
            "previous_year": salary_prev,
            "percent_change": percent_change(salary_current, salary_prev),
        })

        total_expense_current += salary_current
        total_expense_prev += salary_prev

        # ==========================
        # JOURNAL EXPENSE
        # ==========================
        journal_exp_current = OpeningBalance.objects.filter(
            journal_entry__date__range=(start, end),
            account__account_type="EXPENSE"
        ).aggregate(total=Sum("debit"))["total"] or Decimal("0")

        journal_exp_prev = OpeningBalance.objects.filter(
            journal_entry__date__range=(prev_start, prev_end),
            account__account_type="EXPENSE"
        ).aggregate(total=Sum("debit"))["total"] or Decimal("0")

        expense_rows.append({
            "item": "Journal Expenses",
            "current_year": journal_exp_current,
            "previous_year": journal_exp_prev,
            "percent_change": percent_change(journal_exp_current, journal_exp_prev),
        })

        total_expense_current += journal_exp_current
        total_expense_prev += journal_exp_prev

        # ==========================
        # PROFIT
        # ==========================
        net_profit_current = total_income_current - total_expense_current
        net_profit_prev = total_income_prev - total_expense_prev

        # ==========================
        # RESPONSE
        # ==========================
        data = {
            "year": year,
            "income": [
                {
                    "item": "Sales",
                    "current_year": sales_current,
                    "previous_year": sales_prev,
                    "percent_change": percent_change(sales_current, sales_prev),
                },
                {
                    "item": "Other Income",
                    "current_year": other_income_current,
                    "previous_year": other_income_prev,
                    "percent_change": percent_change(other_income_current, other_income_prev),
                },
            ],
            "expenses": expense_rows,
            "gross_profit": {
                "item": "Gross Profit",
                "current_year": total_income_current,
                "previous_year": total_income_prev,
                "percent_change": percent_change(total_income_current, total_income_prev),
            },
            "total_expenses": {
                "item": "Total Expenses",
                "current_year": total_expense_current,
                "previous_year": total_expense_prev,
                "percent_change": percent_change(total_expense_current, total_expense_prev),
            },
            "net_profit": {
                "item": "Profit / Loss",
                "current_year": net_profit_current,
                "previous_year": net_profit_prev,
                "percent_change": percent_change(net_profit_current, net_profit_prev),
            },
        }

        return Response(data)


#Assets Report View

class AssetsReportView(APIView):
    def get(self, request):
        business_category = request.query_params.get("business_category")

        assets = Asset.objects.select_related(
            "category",
            "business_category"
        )

        if business_category:
            assets = assets.filter(business_category_id=business_category)

        data = [
            {
                "asset_name": a.asset_name,
                "category": a.category.category_name if a.category else "",
                "quantity": a.quantity or 0,
                "value": a.asset_value or 0,
            }
            for a in assets
        ]

        return Response({"assets": data})