from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

class ChangePasswordTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='admin', password='adminpass', is_staff=True)
        self.user = User.objects.create_user(username='user', password='userpass')
        self.client = APIClient()

    def test_admin_can_change_other_password_without_old(self):
        self.client.force_authenticate(user=self.admin)
        url = f'/api/users/{self.user.id}/change_password/'
        response = self.client.post(url, {'new_password': 'newpass123', 'confirm_password': 'newpass123'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpass123'))

    def test_user_cannot_change_other_user_password(self):
        self.client.force_authenticate(user=self.user)
        url = f'/api/users/{self.admin.id}/change_password/'
        response = self.client.post(url, {'old_password': 'userpass', 'new_password': 'abc12345', 'confirm_password': 'abc12345'}, format='json')
        self.assertEqual(response.status_code, 403)

    def test_user_must_provide_old_password_when_changing_own(self):
        self.client.force_authenticate(user=self.user)
        url = f'/api/users/{self.user.id}/change_password/'
        response = self.client.post(url, {'new_password': 'mypassword', 'confirm_password': 'mypassword'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_user_can_change_own_password_with_old(self):
        self.client.force_authenticate(user=self.user)
        url = f'/api/users/{self.user.id}/change_password/'
        response = self.client.post(url, {'old_password': 'userpass', 'new_password': 'mypassword', 'confirm_password': 'mypassword'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('mypassword'))
