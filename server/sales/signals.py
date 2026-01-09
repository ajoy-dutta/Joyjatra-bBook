from decimal import Decimal

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import SaleProduct
from stocks.models import StockProduct


@receiver(post_save, sender=SaleProduct)
def update_stock_on_sale(sender, instance, created, **kwargs):
    """
    When a SaleProduct is created, deduct stock quantities.
    """
    if not created:
        return

    product = instance.product
    qty = int(instance.sale_quantity)

    stock = StockProduct.objects.filter(product=product).first()

    if not stock:
        raise ValueError(f"No stock found for product {product.product_name}")

    if stock.current_stock_quantity < qty:
        raise ValueError("Not enough stock available for sale")
    
    stock.sale_quantity = (stock.sale_quantity or 0) + qty
    stock.current_stock_quantity -= qty

    # update stock valuation (optional)
    stock.current_stock_value = stock.current_stock_quantity * stock.purchase_price

    stock.save()
