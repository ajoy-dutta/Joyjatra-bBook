from django.db import models
from .models import*
from django.db.models import Sum
from decimal import Decimal
from django.contrib.auth.models import AbstractUser



class User(AbstractUser):
    role = models.CharField(max_length=40, default='general', blank=True, null=True)
    profile_picture = models.ImageField(upload_to='image/', blank=True, null=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.pk: 
            if self.is_superuser:
                self.role = 'superuser'
            elif not self.role:
                self.role = 'general'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
    


class Staffs(models.Model):
    RELIGION_CHOICES = [
        ('Islam', 'Islam'),
        ('Hinduism', 'Hinduism'),
        ('Christianity', 'Christianity'),
        ('Buddhism', 'Buddhism'),
        ('Other', 'Other'),
    ]

    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
    ]

    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    ID_TYPE_CHOICES = (
        ('NID', 'NID'),
        ('Birth Certificate', 'Birth Certificate'),
    )
    user = models.OneToOneField('User', on_delete=models.CASCADE, related_name='staff_profile')
    name = models.CharField(max_length=100)
    name_bn = models.CharField(max_length=100, blank=True, null=True)
    father_name = models.CharField(max_length=100, blank=True, null=True)
    father_name_bn = models.CharField(max_length=100, blank=True, null=True)    
    father_occupation = models.CharField(max_length=100, blank=True, null=True)
    father_company = models.CharField(max_length=100, blank=True, null=True)
    father_facebook = models.CharField(max_length=100, blank=True, null=True)
    father_email = models.CharField(max_length=100, blank=True, null=True)
    father_whatsapp = models.CharField(max_length=100, blank=True, null=True)
    
    date_of_birth = models.DateField(blank=True, null=True)
    mother_name = models.CharField(max_length=100, blank=True, null=True)
    mother_name_bn = models.CharField(max_length=100, blank=True, null=True)
    mother_occupation = models.CharField(max_length=100, blank=True, null=True)
    mother_company = models.CharField(max_length=100, blank=True, null=True)
    mother_facebook = models.CharField(max_length=100, blank=True, null=True)
    mother_email = models.CharField(max_length=100, blank=True, null=True)
    mother_whatsapp = models.CharField(max_length=100, blank=True, null=True)
    # Present Address
    present_house_no = models.CharField(max_length=100, blank=True, null=True)
    present_village = models.CharField(max_length=100, blank=True, null=True)
    present_post_office = models.CharField(max_length=100, blank=True, null=True)
    present_post_code = models.CharField(max_length=100, blank=True, null=True)
    present_upazila = models.CharField(max_length=100, blank=True, null=True)
    present_district = models.CharField(max_length=100, blank=True, null=True)

    # Permanent Address
    permanent_house_no = models.CharField(max_length=100, blank=True, null=True)
    permanent_village = models.CharField(max_length=100, blank=True, null=True)
    permanent_post_office = models.CharField(max_length=100, blank=True, null=True)
    permanent_post_code = models.CharField(max_length=100, blank=True, null=True)

    permanent_upazila = models.CharField(max_length=100, blank=True, null=True)
    permanent_district = models.CharField(max_length=100, blank=True, null=True)
    
    religion = models.CharField(max_length=20, choices=RELIGION_CHOICES, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    nationality = models.CharField(max_length=50, blank=True, null=True)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES, blank=True, null=True)

    current_class_or_dept = models.CharField(max_length=100, blank=True, null=True)
    academic_year = models.CharField(max_length=20, blank=True, null=True)
    current_institution_name = models.CharField(max_length=200, blank=True, null=True)
    
    id_type = models.CharField(max_length=50, choices=ID_TYPE_CHOICES, blank=True, null=True)
    nid_birth_registration_no = models.CharField(max_length=100, blank=True, null=True)
    mobile_self = models.CharField(max_length=15, blank=True, null=True)
    mobile_father = models.CharField(max_length=15, blank=True, null=True)
    mobile_mother = models.CharField(max_length=15, blank=True, null=True)
    mobile_others = models.CharField(max_length=15, blank=True, null=True)

    email = models.EmailField(blank=True, null=True)
    facebook_link = models.URLField(blank=True, null=True)
    whatsapp_number = models.CharField(max_length=15, blank=True, null=True)
    image = models.ImageField(upload_to='img/', blank=True, null=True) 

    reference = models.CharField(max_length=255, blank=True, null = True)
    co_activities = models.CharField(max_length=255, blank=True, null = True)

    def __str__(self):
        return self.name




class ExamRecord(models.Model):
    EXAM_CHOICES = [
        ('PSC', "PSC"),
        ('JSC', "JSC"),
        ('SSC', "SSC"),
        ('HSC', "HSC"),
        ("Hon's", "Hon's"),
        ('Masters', "Masters"),
    ]

    staff = models.ForeignKey(Staffs, on_delete=models.CASCADE, related_name='exam_records')
    exam_name = models.CharField(max_length=20, choices=EXAM_CHOICES)
    roll_number = models.CharField(max_length=50)
    registration_number = models.CharField(max_length=50)
    year_of_passing = models.CharField(max_length=10)
    group = models.CharField(max_length=100,null=True,blank=True)
    board = models.CharField(max_length=255,null=True,blank=True)
    gpa_cgpa = models.CharField(max_length=10)
    institution_name = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.exam_name}"



class StaffRemark(models.Model):
    staff = models.ForeignKey(Staffs, on_delete=models.CASCADE, related_name="remarks")
    remarks = models.TextField()
    step = models.CharField(max_length=100)
    result = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.step} - {self.result}"
    


class JobInfo(models.Model):
    staff = models.ForeignKey(Staffs, on_delete=models.CASCADE, related_name='job_info', blank=True, null=True)
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200, blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    duration = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)   

    def __str__(self):
        return self.title
    
    