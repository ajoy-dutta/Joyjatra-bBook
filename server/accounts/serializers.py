from rest_framework import serializers
from .models import *
from master.serializers import BankMasterSerializer




class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = "__all__"




class JournalEntryLineSerializer(serializers.ModelSerializer):
    account = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all()
    )
    account_name = serializers.CharField(source="account.name", read_only=True)
    account_code = serializers.CharField(source="account.code", read_only=True)


    class Meta:
        model = JournalEntryLine
        fields = [
            "id",
            "account",
            "account_name",
            "account_code",
            "debit",
            "credit",
            "description"
        ]





class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalEntryLineSerializer(many=True)
    total_debit = serializers.SerializerMethodField(read_only=True)
    total_credit = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = JournalEntry
        fields = [
            "id",
            "business_category",
            "date",
            "reference",
            "narration",
            "lines",
            "total_debit",
            "total_credit",
        ]


    def get_total_debit(self, obj):
        return obj.total_debit()


    def get_total_credit(self, obj):
        return obj.total_credit()


    def validate(self, data):
        debit = sum(line.get("debit", 0) for line in data["lines"])
        credit = sum(line.get("credit", 0) for line in data["lines"])


        if debit != credit:
            raise serializers.ValidationError(
                "Total Debit must equal Total Credit"
            )
        return data


    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        journal = JournalEntry.objects.create(**validated_data)


        for line in lines_data:
            JournalEntryLine.objects.create(
                journal_entry=journal, **line
            )


        return journal










class CashAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = CashAccount
        fields = "__all__"


    def validate(self, data):
        opening_balance = data.get('opening_balance', None)
        if opening_balance is not None and opening_balance < 0:
            raise serializers.ValidationError("Opening balance must be non-negative.")
        return data






class BankAccountSerializer(serializers.ModelSerializer):
    bank_details = BankMasterSerializer(source="bank", read_only=True)


    class Meta:
        model = BankAccount
        fields = "__all__"


    def validate(self, data):
        opening_balance = data.get('opening_balance', None)
        if opening_balance is not None and opening_balance < 0:
            raise serializers.ValidationError("Opening balance must be non-negative.")
        return data
