# # server/purchase/signals.py
# from decimal import Decimal

# from django.db.models.signals import post_save
# from django.dispatch import receiver

# from .models import PurchaseProduct
# from stocks.models import StockProduct


# @receiver(post_save, sender=PurchaseProduct)
# def update_stock_product(sender, instance, created, **kwargs):
#     """
#     Sync PurchaseProduct → StockProduct.

#     - On create: update quantities, prices, and dates.
#     - On update (admin editing): only sync manufacture/expiry dates,
#       so we don't double-count quantities.
#     """
#     product = instance.product
#     business_category = product.business_category

#     # ---- dates from this purchase line ----
#     mfg_date = instance.manufacture_date
#     exp_date = instance.expiry_date

#     # ---------- UPDATE PATH (admin edit) ----------
#     if not created:
#         try:
#             stock = StockProduct.objects.get(
#                 product=product,
#                 business_category=business_category,
#             )
#         except StockProduct.DoesNotExist:
#             # no stock row yet, nothing to sync
#             return

#         changed = False
#         if mfg_date and stock.manufacture_date != mfg_date:
#             stock.manufacture_date = mfg_date
#             changed = True
#         if exp_date and stock.expiry_date != exp_date:
#             stock.expiry_date = exp_date
#             changed = True

#         if changed:
#             stock.save()
#         return

#     # ---------- CREATE PATH (new purchase line) ----------
#     qty = int(instance.purchase_quantity)
#     price = Decimal(instance.purchase_price)

#     stock, created_stock = StockProduct.objects.get_or_create(
#         product=product,
#         business_category=business_category,
#         defaults={
#             "purchase_quantity": qty,
#             "sale_quantity": 0,
#             "damage_quantity": 0,
#             "current_stock_quantity": qty,
#             "purchase_price": price,
#             "sale_price": price,
#             "current_stock_value": price * qty,
#             "manufacture_date": mfg_date,
#             "expiry_date": exp_date,
#         },
#     )

#     if not created_stock:
#         stock.purchase_quantity += qty
#         stock.current_stock_quantity += qty
#         stock.purchase_price = price
#         stock.current_stock_value += price * qty

#         # overwrite dates with latest batch if present
#         if mfg_date:
#             stock.manufacture_date = mfg_date
#         if exp_date:
#             stock.expiry_date = exp_date

#         stock.save()
