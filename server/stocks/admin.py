from django.contrib import admin
from .models import *

admin.site.register(Product)
admin.site.register(StockProduct)
admin.site.register(Asset)
@admin.register(Requisition)
class RequisitionAdmin(admin.ModelAdmin):
    list_display = (
        "requisition_no",
        "business_category",
        "requisite_name",
        "product",
        "item_number",
        "status",
        "requisition_date",
        "created_at",
    )

    list_filter = (
        "status",
        "business_category",
        "requisition_date",
    )

    search_fields = (
        "requisition_no",
        "requisite_name",
        "remarks",
    )

    readonly_fields = (
        "requisition_no",
        "created_at",
    )

    ordering = ("-id",)

    # 🔒 Prevent accidental edits on approved requisitions
    def has_change_permission(self, request, obj=None):
        if obj and obj.status:
            return False
        return super().has_change_permission(request, obj)