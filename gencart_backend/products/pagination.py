from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination with dynamic max page size.

    - Default page size is 12 (frontend expects 12 per page)
    - Supports both 'page_size' and 'limit' query parameters
    - Returns extra metadata useful for rendering page buttons (with ellipses)
    """
    page_size = 12
    page_size_query_param = 'limit'  # Changed from 'page_size' to 'limit'
    max_page_size = 100  # Set reasonable max limit
    
    def get_page_size(self, request):
        """Override to support both 'limit' and 'page_size' parameters"""
        # Check for 'limit' parameter first (primary)
        page_size = request.query_params.get('limit') or request.query_params.get('page_size')
        
        if page_size:
            try:
                return int(page_size)
            except (ValueError, TypeError):
                pass
            
        # Otherwise use default
        return self.page_size

    def get_page_buttons(self, page_number, total_pages, window=1):
        """Return a compact list of page buttons similar to the frontend image.

        Example: for total_pages=10 and page_number=5 -> [1, '...', 4,5,6, '...', 10]
        window controls how many pages to show around current page.
        """
        if total_pages <= 1:
            return []

        buttons = []

        def add(n):
            if not buttons or buttons[-1] != n:
                buttons.append(n)

        # Always show first page
        add(1)

        left = max(page_number - window, 2)
        right = min(page_number + window, total_pages - 1)

        if left > 2:
            buttons.append('...')

        for p in range(left, right + 1):
            add(p)

        if right < total_pages - 1:
            buttons.append('...')

        if total_pages > 1:
            add(total_pages)

        return buttons

    def paginate_queryset(self, queryset, request, view=None):
        """Standard pagination"""
        return super().paginate_queryset(queryset, request, view)
    
    def get_paginated_response(self, data):
        request = self.request
        page_number = self.page.number if hasattr(self, 'page') and self.page else 1
        total_pages = self.page.paginator.num_pages if hasattr(self, 'page') and self.page else 1

        page_buttons = self.get_page_buttons(page_number, total_pages, window=1)

        return Response({
            'count': self.page.paginator.count if hasattr(self, 'page') and self.page else len(data),
            'page_size': self.get_page_size(request) or len(data),
            'current_page': page_number,
            'total_pages': total_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'page_buttons': page_buttons,
            'results': data,
        })
