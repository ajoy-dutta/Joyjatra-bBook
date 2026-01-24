from decimal import Decimal

def percent_change(current, previous):
    if previous == 0:
        return Decimal("100.00") if current > 0 else Decimal("0.00")
    return ((current - previous) / previous * 100).quantize(Decimal("0.01"))
