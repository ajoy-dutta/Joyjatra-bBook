from rest_framework.viewsets import ModelViewSet
from .models import *
from .serializers import *



class IncomeCategoryViewSet(ModelViewSet):
    # Required for DRF router
    queryset = IncomeCategory.objects.all()
    serializer_class = IncomeCategorySerializer

    def get_queryset(self):
        qs = IncomeCategory.objects.all()

        # Optional filtering by business_category
        business_category = self.request.query_params.get("business_category")
        if business_category:
            qs = qs.filter(business_category_id=business_category)

        return qs



class IncomeViewSet(ModelViewSet):
    queryset = Income.objects.select_related("category").order_by("-date")
    serializer_class = IncomeSerializer

    def get_queryset(self):
        qs = Income.objects.select_related("category").order_by("-date")

        # Get query params
        business_category = self.request.query_params.get("business_category")
        category = self.request.query_params.get("category")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        # Filter by business category
        if business_category:
            qs = qs.filter(business_category_id=business_category)

        # Filter by category
        if category:
            qs = qs.filter(category_id=category)

        # Filter by date range
        if from_date:
            qs = qs.filter(date__gte=from_date)
        if to_date:
            qs = qs.filter(date__lte=to_date)

        return qs
