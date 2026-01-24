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
from income.models import Income
from datetime import date
from .utils import percent_change
from accounts.models import Account, JournalEntryLine




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





class CombinedIncomeView(APIView):
    def get(self, request):
        try:
            grouped_data = []
            
            # ==========================
            #   GET FILTER PARAMETERS
            # ==========================
            business_category = request.query_params.get("business_category")
            from_date = request.query_params.get("from_date")
            to_date = request.query_params.get("to_date")
            category = request.query_params.get("category")
            customer = request.query_params.get("customer")
            invoice_no = request.query_params.get("invoice_no")

            # ==========================
            #   SALES WITH PAYMENTS (Aggregated payments per sale)
            # ==========================
            sales_with_payments = Sale.objects.select_related(
                'customer',
                'business_category'
            ).annotate(
                total_paid=Sum('payments__paid_amount')
            ).filter(total_paid__gt=0).order_by("-sale_date")


            if business_category:
                sales_with_payments = sales_with_payments.filter(business_category__id=business_category)

            if from_date:
                sales_with_payments = sales_with_payments.filter(sale_date__gte=parse_date(from_date))

            if to_date:
                sales_with_payments = sales_with_payments.filter(sale_date__lte=parse_date(to_date))

            if customer:
                sales_with_payments = sales_with_payments.filter(customer__customer_name__icontains=customer)

            if invoice_no:
                sales_with_payments = sales_with_payments.filter(invoice_no__icontains=invoice_no)

            
            for sale in sales_with_payments:
                if sale.total_paid:
                    grouped_data.append({
                        "date": sale.sale_date,
                        "income_source": "Sale Income",
                        "description": f"Invoice {sale.invoice_no} - {sale.customer.customer_name}",
                        "amount": sale.total_paid
                    })

            # ==========================
            #   INCOME (Other Income)
            # ==========================
            incomes = Income.objects.select_related(
                'category',
                'payment_mode',
                'bank'
            ).all().order_by("-date")

            if business_category:
                incomes = incomes.filter(business_category__id=business_category)

            if from_date:
                incomes = incomes.filter(date__gte=parse_date(from_date))

            if to_date:
                incomes = incomes.filter(date__lte=parse_date(to_date))

            if category:
                incomes = incomes.filter(category__name__icontains=category)

            for income in incomes:
                payment_mode_info = f" ({income.payment_mode.name})" if income.payment_mode else ""
                bank_info = f" - {income.bank.name}" if income.bank else ""
                
                grouped_data.append({
                    "date": income.date,
                    "income_source": income.category.name,
                    "description": f"{income.note or f'Received by {income.received_by}'}{payment_mode_info}",
                    "amount": income.amount
                })

            # ==========================
            #   SORT FINAL DATA
            # ==========================
            grouped_data.sort(key=lambda x: x["date"], reverse=True)
            serializer = CombinedIncomeSerializer(grouped_data, many=True)
            return Response(serializer.data)


            
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Error in CombinedIncomeView: {str(e)}")
            print(error_details)
            
            return Response(
                {
                    "error": "Internal server error",
                    "message": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class CombinedExpanseView(APIView):
    def get(self, request):
        try:
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
            # print(expenses)

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

            # print("Grouped Data after Expenses:", grouped_data)

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
                })

            # print("Grouped Data after Expenses:", grouped_data)

            # ==========================
            #   SORT FINAL DATA
            # ==========================
            grouped_data.sort(key=lambda x: x["date"], reverse=True)
            serializer = CombinedExpenseSerializer(grouped_data, many=True)
           
            # print(serializer.data)
            return Response(serializer.data)


        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Error in CombinedExpanseView: {str(e)}")
            print(error_details)
            
            return Response(
                {
                    "error": "Internal server error",
                    "message": str(e),
                    "details": error_details
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        



def percent_change(current, previous):
    if previous == 0:
        return 100 if current > 0 else 0
    return round(((current - previous) / previous) * 100, 2)



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
        # SALES (INCOME)
        # ==========================
        sales_current = (
            Sale.objects.filter(sale_date__range=(start, end))
            .aggregate(total=Sum("total_amount"))["total"]
            or Decimal("0")
        )

        sales_prev = (
            Sale.objects.filter(sale_date__range=(prev_start, prev_end))
            .aggregate(total=Sum("total_amount"))["total"]
            or Decimal("0")
        )

        # ==========================
        # INCOME (CATEGORY WISE)
        # ==========================
        income_current_qs = (
            Income.objects.filter(date__range=(start, end))
            .values("category__name")
            .annotate(total=Sum("amount"))
        )

        income_prev_qs = (
            Income.objects.filter(date__range=(prev_start, prev_end))
            .values("category__name")
            .annotate(total=Sum("amount"))
        )

        prev_income_map = {
            i["category__name"]: i["total"]
            for i in income_prev_qs
        }

        income_rows = []
        other_income_current = Decimal("0")
        other_income_prev = Decimal("0")

        for row in income_current_qs:
            name = row["category__name"]
            current_total = row["total"] or Decimal("0")
            prev_total = prev_income_map.get(name, Decimal("0"))

            income_rows.append({
                "item": name,
                "current_year": current_total,
                "previous_year": prev_total,
                "percent_change": percent_change(current_total, prev_total),
            })

            other_income_current += current_total
            other_income_prev += prev_total

        total_income_current = sales_current + other_income_current
        total_income_prev = sales_prev + other_income_prev

        # ==========================
        # PURCHASE (COGS / EXPENSE)
        # ==========================
        purchase_current = (
            Purchase.objects.filter(purchase_date__range=(start, end))
            .aggregate(total=Sum("total_payable_amount"))["total"]
            or Decimal("0")
        )

        purchase_prev = (
            Purchase.objects.filter(purchase_date__range=(prev_start, prev_end))
            .aggregate(total=Sum("total_payable_amount"))["total"]
            or Decimal("0")
        )

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

        prev_expense_map = {
            e["cost_category__category_name"]: e["total"]
            for e in expense_prev_qs
        }

        expense_rows = []
        total_expense_current = Decimal("0")
        total_expense_prev = Decimal("0")

        # ---- Purchase first (important in P&L) ----
        expense_rows.append({
            "item": "Purchase / Cost of Goods Sold",
            "current_year": purchase_current,
            "previous_year": purchase_prev,
            "percent_change": percent_change(purchase_current, purchase_prev),
        })

        total_expense_current += purchase_current
        total_expense_prev += purchase_prev

        # ---- Other Expenses ----
        for row in expense_current_qs:
            name = row["cost_category__category_name"]
            current_total = row["total"] or Decimal("0")
            prev_total = prev_expense_map.get(name, Decimal("0"))

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
        salary_current = (
            SalaryExpense.objects.filter(created_at__date__range=(start, end))
            .aggregate(total=Sum("base_amount"))["total"]
            or Decimal("0")
        )

        salary_prev = (
            SalaryExpense.objects.filter(created_at__date__range=(prev_start, prev_end))
            .aggregate(total=Sum("base_amount"))["total"]
            or Decimal("0")
        )

        expense_rows.append({
            "item": "Salary Expense",
            "current_year": salary_current,
            "previous_year": salary_prev,
            "percent_change": percent_change(salary_current, salary_prev),
        })

        total_expense_current += salary_current
        total_expense_prev += salary_prev

        # ==========================
        # PROFIT / LOSS
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
                *income_rows,
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




class BalanceSheetReportView(APIView):
    def get(self, request):
        business_category_id = request.query_params.get("business_category")
        as_on = request.query_params.get("as_on")  # optional date filter

        def account_balance(account):
            try:
                qs = JournalEntryLine.objects.filter(account=account)

                if business_category_id:
                    qs = qs.filter(journal_entry__business_category_id=business_category_id)

                if as_on:
                    qs = qs.filter(journal_entry__date__lte=as_on)

                debit = qs.aggregate(d=Sum("debit"))["d"] or Decimal("0")
                credit = qs.aggregate(c=Sum("credit"))["c"] or Decimal("0")

                # Debug info
                print(f"Account Name: {account.name}")
                print(f"Debit: {debit}, Credit: {credit}")

                # Correct sign based on account type
                if account.account_type in ["ASSET", "EXPENSE"]:
                    return debit - credit
                else:  # LIABILITY, EQUITY, INCOME
                    return credit - debit

            except Exception as e:
                print(f"[BALANCE ERROR] {account.name} → {str(e)}")
                return Decimal("0")

        assets = []
        liabilities = []
        equity = []

        total_assets = Decimal("0")
        total_liabilities = Decimal("0")
        total_equity = Decimal("0")

        income_total = Decimal("0")
        expense_total = Decimal("0")

        # Compute balances for all accounts
        for account in Account.objects.all():
            try:
                balance = account_balance(account)
                data = {
                    "code": account.code,
                    "name": account.name,
                    "balance": balance
                }

                if account.account_type == "ASSET":
                    assets.append(data)
                    total_assets += balance
                elif account.account_type == "LIABILITY":
                    liabilities.append(data)
                    total_liabilities += balance
                elif account.account_type == "EQUITY":
                    equity.append(data)
                    total_equity += balance
                elif account.account_type == "INCOME":
                    income_total += balance
                elif account.account_type == "EXPENSE":
                    expense_total += balance

            except Exception as e:
                print(f"[ERROR] Processing account {account.name}: {str(e)}")

        # 🔹 Net Profit / Loss
        net_profit = income_total - expense_total
        print(f"Income Total: {income_total}")
        print(f"Expense Total: {expense_total}")
        print(f"Net Profit: {net_profit}")

        # Add net profit to equity
        equity.append({
            "code": "RE",
            "name": "Retained Earnings",
            "balance": net_profit
        })
        total_equity += net_profit

        # Final balance check
        balanced = (total_assets == (total_liabilities + total_equity))

        return Response({
            "assets": assets,
            "liabilities": liabilities,
            "equity": equity,
            "summary": {
                "total_assets": total_assets,
                "total_liabilities": total_liabilities,
                "total_equity": total_equity,
                "liabilities_plus_equity": total_liabilities + total_equity,
                "net_profit": net_profit,
                "balanced": balanced
            }
        })