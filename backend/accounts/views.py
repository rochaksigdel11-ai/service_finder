from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from Home.models import UserProfile



@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {'id': user.id, 'username': user.username, 'email': user.email}
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {'id': user.id, 'username': user.username, 'email': user.email}
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


 
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)    
    
    
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    try:
        profile = UserProfile.objects.get(user=user)
        role = profile.role
    except UserProfile.DoesNotExist:
        # Auto create profile if missing
        profile = UserProfile.objects.create(user=user, role='customer')
        role = 'customer'

    # FORCE CORRECT ROLE NAMES THAT FRONTEND EXPECTS
    if user.username == 'admin' or user.is_superuser:
        role = 'admin'
    elif user.username == 'raju':
        role = 'seller'

    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email or '',
        'role': role,                    # ← THIS MUST BE 'admin', 'seller', or 'customer'
        'fullName': getattr(user, 'full_name', user.username),
        'isAuthenticated': True
    })