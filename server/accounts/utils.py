from accounts.models import Account


def get_account(code):
    """
    Safe account fetcher
    """
    try:
        return Account.objects.get(
            code=code
        )
    except Account.DoesNotExist:
        raise Exception(f"Account {code} not found for business category")
