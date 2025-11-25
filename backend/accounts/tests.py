from django.urls import reverse
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status


class AccountsViewsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register') if self._has_url('register') else '/accounts/register/'
        self.login_url = reverse('login') if self._has_url('login') else '/accounts/login/'
        self.profile_url = reverse('profile') if self._has_url('profile') else '/accounts/profile/'

    def _has_url(self, name: str) -> bool:
        try:
            reverse(name)
            return True
        except Exception:
            return False

    def test_register_success_returns_tokens_and_user(self):
        payload = {
            'username': 'alice',
            'email': 'alice@example.com',
            'password': 'StrongPass123',
        }
        res = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertIn('user', res.data)
        self.assertEqual(res.data['user']['username'], 'alice')

    def test_register_invalid_payload_returns_400(self):
        # Missing password
        payload = {
            'username': 'bob',
            'email': 'bob@example.com',
        }
        res = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success_returns_tokens_and_user(self):
        User.objects.create_user(username='charlie', email='charlie@example.com', password='StrongPass123')
        payload = {'username': 'charlie', 'password': 'StrongPass123'}
        res = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['username'], 'charlie')

    def test_login_invalid_returns_400(self):
        payload = {'username': 'nobody', 'password': 'badpass'}
        res = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_profile_requires_authentication(self):
        res = self.client.get(self.profile_url)
        self.assertIn(res.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_profile_returns_user_info_when_authenticated(self):
        user = User.objects.create_user(username='dana', email='dana@example.com', password='StrongPass123')
        # Obtain token via login endpoint to mirror real flow
        login_res = self.client.post(self.login_url, {'username': 'dana', 'password': 'StrongPass123'}, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.get(self.profile_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['username'], 'dana')
        # Defaults when optional fields absent
        self.assertIn('role', res.data)
        self.assertIn('phone', res.data)

    def test_custom_token_obtain_pair_view_invalid_credentials(self):
        # Using same login route since CustomTokenObtainPairView likely wired at /api/token/ or similar; fall back to known login to assert 401 behavior
        # If JWT view is separately mapped, this test may need route adjustment.
        # Create a user then attempt wrong password through token view if available
        User.objects.create_user(username='erin', email='erin@example.com', password='StrongPass123')
        # Try invalid password against JWT pair endpoint if present
        jwt_url_candidates = [
            name for name in (
                self._reverse_or_none('token_obtain_pair'),
                '/api/token/',
                '/accounts/token/',
            ) if name
        ]
        if jwt_url_candidates:
            url = jwt_url_candidates[0]
            res = self.client.post(url, {'username': 'erin', 'password': 'wrong'}, format='json')
            # Depending on DRF SimpleJWT, invalid creds usually return 401
            self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        else:
            # As a fallback, assert login with wrong password yields 400 from our login view
            res = self.client.post(self.login_url, {'username': 'erin', 'password': 'wrong'}, format='json')
            self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def _reverse_or_none(self, name: str):
        try:
            return reverse(name)
        except Exception:
            return None
