from rest_framework import serializers
from .models import*
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import password_validation
import json
from django.conf import settings


    

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


    
class ExamRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamRecord
        fields = ['exam_name', 'roll_number', 'registration_number','group','board', 'year_of_passing', 'gpa_cgpa', 'institution_name']



class AdmissionRemarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffRemark
        fields = ['remarks', 'step', 'result']



class JobInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobInfo
        fields = '__all__'


class StaffCreateSerializer(serializers.ModelSerializer):
    # Include user-related fields
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, default='staff')
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    mobile_self = serializers.CharField(write_only=True, required=False, allow_blank=True)
    image = serializers.ImageField(write_only=True, required=False)


    exam_records = ExamRecordSerializer(many=True, required=False)
    remarks = AdmissionRemarkSerializer(many=True, required=False)
    job_info = JobInfoSerializer(many=True, required=False)

    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Staffs
        fields = [
            'id',
            'user',  # nested read-only user
            'username', 'password','role','email', # User fields
            # Staff fields
            'exam_records', 'remarks', 'job_info','name', 'name_bn', 'father_name', 'father_name_bn', 'father_occupation', 'father_company',
            'father_email', 'father_facebook', 'father_whatsapp', 'mother_name', 'mother_name_bn',
            'mother_occupation', 'mother_company', 'mother_email', 'mother_facebook', 'mother_whatsapp',
            'date_of_birth', 'gender', 'religion', 'nationality', 'blood_group', 'mobile_self',
            'mobile_father', 'mobile_mother', 'mobile_others', 'facebook_link', 'whatsapp_number',
            'present_house_no', 'present_village', 'present_post_office', 'present_post_code',
            'present_upazila', 'present_district', 'permanent_house_no', 'permanent_village',
            'permanent_post_office', 'permanent_post_code', 'permanent_upazila', 'permanent_district',
            'nid_birth_registration_no', 'reference', 'co_activities', 'image'
        ]


    def create(self, validated_data):
        # Extract user data
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        role = validated_data.pop('role', 'staff')
        email = validated_data.pop('email', None)
        phone = validated_data.pop('mobile_self', None)
        profile_picture = validated_data.pop('image', None)

        exam_data = validated_data.pop('exam_records', [])
        remarks_data = validated_data.pop('remarks', [])
        job_info_data = validated_data.pop('job_info', [])    

       
        # Create User
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            phone=phone  
        )
        user.role = role or 'general'
        if profile_picture:
            user.profile_picture = profile_picture
        user.save()

        staff = Staffs.objects.create(user=user,**validated_data)

        for exam in exam_data:
            ExamRecord.objects.create(staff=staff, **exam)

        for remark_data in remarks_data:
            StaffRemark.objects.create(staff=staff, **remark_data)


        for job_data in job_info_data:
            JobInfo.objects.create(staff=staff, **job_data)

        return staff
    



class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        user = self.context['request'].user  # Get the logged-in user
        print(f"Stored password hash: {user.password}")  # Log the stored password hash

        print(f"User: {user.username}, Current Password: {data['current_password']}")
        if isinstance(data, str):
                data = json.loads(data)  
        # Ensure the user is authenticated before checking password
        if not user.is_authenticated:
                    raise serializers.ValidationError({"detail": "Authentication is required to change the password."})

                # Check if current password is correct
        if not user.check_password(data['current_password']):
                    raise serializers.ValidationError({"current_password": "Current password is incorrect."})

                # Ensure the new password is at least 6 characters long
        if len(data['new_password']) < 6:
                    raise serializers.ValidationError({"new_password": "New password must be at least 6 characters long."})

                # Ensure the new password is not the same as the current password
        if data['current_password'] == data['new_password']:
                    raise serializers.ValidationError({"new_password": "New password cannot be the same as the current password."})

        return data

    def save(self):
                user = self.context['request'].user  # Get the logged-in user
                user.set_password(self.validated_data['new_password'])  # Set the new password
                user.save()  # Save the user with the new password
                
                
        