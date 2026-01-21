from accounts.models import Account


def get_account(business_category, code):
    """
    Safe account fetcher
    """
    try:
        return Account.objects.get(
            business_category=business_category,
            code=code
        )
    except Account.DoesNotExist:
        raise Exception(f"Account {code} not found for business category")
