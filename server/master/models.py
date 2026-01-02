from django.db import models
from django.utils import timezone
from decimal import Decimal



class BusinessCategory(models.Model):
    name = models.CharField(max_length=100)

    # ✅ Dynamic banner fields (per business)
    # banner_top_tag = models.CharField(max_length=100, blank=True, default="")     # e.g. "ক্যাশ মেমো"
    banner_title = models.CharField(max_length=255, blank=True, default="")      # e.g. "জয়যাত্রা ফুড কর্ণার"
    banner_address1 = models.CharField(max_length=255, blank=True, default="")
    banner_address2 = models.CharField(max_length=255, blank=True, default="")
    banner_phone = models.CharField(max_length=50, blank=True, default="")

    # optional (recommended later): logo per business
    # banner_logo = models.ImageField(upload_to="business_logos/", blank=True, null=True)

    def __str__(self):
        return self.name


class CostCategory(models.Model):
    category_name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.category_name


class SourceCategory(models.Model):
    category_name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.category_name


class PaymentMode(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class DivisionMaster(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class DistrictMaster(models.Model):
    division = models.ForeignKey(DivisionMaster, on_delete=models.CASCADE, default=None)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class CountryMaster(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class SupplierTypeMaster(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class BankCategoryMaster(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class BankMaster(models.Model):
    name = models.CharField(max_length=100)
    bank_category = models.ForeignKey(BankCategoryMaster, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    


class AccountCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    



class InventoryCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    