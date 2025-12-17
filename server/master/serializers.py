from rest_framework import serializers
from .models import*



class BusinessCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessCategory
        fields = '__all__'


class CostCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CostCategory
        fields = '__all__'


class SourceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceCategory
        fields = '__all__'


class PaymentModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMode
        fields = '__all__'



class DivisionMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = DivisionMaster
        fields = '__all__'


class DistrictMasterSerializer(serializers.ModelSerializer):
    division_name = serializers.CharField(source='division.name', read_only=True)
    class Meta:
        model = DistrictMaster
        fields = '__all__'


class CountryMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CountryMaster
        fields = '__all__'


class SupplierTypeMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierTypeMaster
        fields = '__all__'


class BankCategoryMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = BankCategoryMaster
        fields = '__all__'
        

class BankMasterSerializer(serializers.ModelSerializer):
    bank_category_detail = BankCategoryMasterSerializer(source='bank_category', read_only=True)

    class Meta:
        model = BankMaster
        fields = '__all__'


class AccountCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountCategory
        fields = '__all__'


class BankAccountSerializer(serializers.ModelSerializer):
    bankName_name = serializers.CharField(source="bankName.name", read_only=True)
    accountCategory_name = serializers.CharField(source="accountCategory.name", read_only=True)

    class Meta:
        model = BankAccount
        fields = [
            "id",
            "accountCategory",
            "accountCategory_name",
            "bankName",
            "bankName_name",
            "accountName",
            "accountNo",
            "bankAddress",
            "bankContact",
            "bankMail",
            "opening_balance",
            "current_balance",
        ]


class BankTransactionSerializer(serializers.ModelSerializer):
    bank_account_detail = BankAccountSerializer(
        source="bank_account", read_only=True
    )

    class Meta:
        model = BankTransaction
        fields = [
            "id",
            "bank_account",
            "bank_account_detail",
            "date",
            "transaction_type",
            "amount",
            "narration",
            "reference_no",
            "running_balance",
            "created_at",
        ]
        read_only_fields = ["running_balance", "created_at"]



class InventoryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryCategory
        fields = '__all__'