from rest_framework.pagination import PageNumberPagination


class CustomPageNumberPagination(PageNumberPagination):
    """
    Custom pagination class that allows clients to control page size
    """
    page_size = 10  # Default page size
    page_size_query_param = 'page_size'  # Allow client to set page size via query param
    max_page_size = 100  # Maximum allowed page size
    page_query_param = 'page'  # Page number parameter name
