from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Q

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        credentials = {
            self.username_field: attrs.get(self.username_field),
            'password': attrs.get('password')
        }

        # Try to authenticate with username/email
        username_or_email = credentials[self.username_field]
        password = credentials['password']

        # First try with the provided value as username
        user = authenticate(username=username_or_email, password=password)
        
        # If that fails, try to find user by email and authenticate
        if not user:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if not user:
            # Try one more time treating input as username
            try:
                user_obj = User.objects.get(username=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if user:
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            self.user = user
            
            # Generate tokens manually
            refresh = self.get_token(self.user)
            data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': self.user.id,
                'email': self.user.email,
                'username': self.user.username,
            }
            return data
        else:
            raise serializers.ValidationError('No active account found with the given credentials')

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
