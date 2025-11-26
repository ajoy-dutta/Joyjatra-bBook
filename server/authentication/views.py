from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import*
from .serializers import*
from rest_framework.decorators import api_view,action
from rest_framework.views import APIView
from rest_framework.permissions import BasePermission
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.generics import ListCreateAPIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404


User=get_user_model()

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'superuser'



class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        if request.user.is_authenticated:
            serializer = UserProfileSerializer(request.user, context={'request': request})
            return Response(serializer.data)
        return Response({"error": "User not authenticated"}, status=401)




class UpdateUserByIdView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        # Only allow user to update their own profile
        if request.user.id != int(pk):
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(User, pk=pk)
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    



class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this view

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication is required."}, status=401)  # Unauthorized

        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        # Check if the data is valid
        if serializer.is_valid():
            serializer.save()  # Save the new password
            return Response({"detail": "Password updated successfully."})

        # If the serializer is invalid, print the errors for debugging
        print("Validation errors:", serializer.errors)

        return Response(serializer.errors, status=400)  # Return 400 with error
    




class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staffs.objects.all()
    serializer_class = StaffCreateSerializer
    permission_classes = [IsAdmin]


    def get_queryset(self):
        return Staffs.objects.filter(user__role__in=['staff', 'admin'])

    def destroy(self, request, *args, **kwargs):
        """Soft delete: deactivate the user"""
        staff = self.get_object()
        staff.user.is_active = False
        staff.user.save()
        return Response({"detail": "Staff deactivated"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a staff user"""
        staff = self.get_object()
        staff.user.is_active = True
        staff.user.save()
        return Response({"detail": "Staff activated"}, status=status.HTTP_200_OK)