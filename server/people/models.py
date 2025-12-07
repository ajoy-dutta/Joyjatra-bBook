from django.db import models
from master.models import SupplierTypeMaster , BusinessCategory


class Customer(models.Model):
    business_category = models.ForeignKey(BusinessCategory, on_delete=models.CASCADE, related_name='customers', blank=True, null=True)
    customer_name = models.CharField(max_length=255)
    division = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    customer_type = models.CharField(max_length=100, blank=True, null=True)
    shop_name = models.CharField(max_length=255, blank=True, null=True)
    phone1 = models.CharField(max_length=20)
    phone2 = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField()
    date_of_birth = models.DateField(blank=True, null=True)
    nid_no = models.CharField(max_length=100, blank=True, null=True)
    courier_name = models.CharField(max_length=255, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    previous_due_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    photo = models.ImageField(upload_to="customers/",blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.customer_name



class Vendor(models.Model):
    business_category = models.ForeignKey(BusinessCategory, on_delete=models.CASCADE, related_name='vendors', blank=True, null=True)
    vendor_name = models.CharField(max_length=200)
    division = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100)
    vendor_type = models.ForeignKey(SupplierTypeMaster, on_delete=models.PROTECT)
    shop_name = models.CharField(max_length=200, blank=True, null=True)
    phone1 = models.CharField(max_length=20)
    phone2 = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField()
    date_of_birth = models.DateField(blank=True, null=True)
    nid_no = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    previous_due_amount = models.DecimalField(
        max_digits=12, decimal_places=2, blank=True, null=True
    )

    # New image upload
    photo = models.ImageField(upload_to="vendors/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.vendor_name
