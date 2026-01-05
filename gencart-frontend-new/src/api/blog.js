/**
 * Blog API Service
 * Handles all blog-related API calls to the Django backend
 */

import api from '../utils/api';

const BLOG_API_BASE = '/blog';

/**
 * ============================================
 * BLOG CATEGORIES API
 * ============================================
 */
export const blogCategoryApi = {
  /**
   * Get all categories
   * @returns {Promise} List of categories
   */
  getAll: async () => {
    const response = await api.get(`${BLOG_API_BASE}/categories/`);
    return response.data;
  },

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise} Category detail
   */
  getById: async (id) => {
    const response = await api.get(`${BLOG_API_BASE}/categories/${id}/`);
    return response.data;
  },

  /**
   * Create a new category
   * @param {Object} data - Category data { name, description, is_active }
   * @returns {Promise} Created category
   */
  create: async (data) => {
    const response = await api.post(`${BLOG_API_BASE}/categories/`, data);
    return response.data;
  },

  /**
   * Update a category
   * @param {number} id - Category ID
   * @param {Object} data - Category data to update
   * @returns {Promise} Updated category
   */
  update: async (id, data) => {
    const response = await api.put(`${BLOG_API_BASE}/categories/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a category
   * @param {number} id - Category ID
   * @returns {Promise} Deletion result
   */
  delete: async (id) => {
    const response = await api.delete(`${BLOG_API_BASE}/categories/${id}/`);
    return response.data;
  },
};

/**
 * ============================================
 * BLOG POSTS API
 * ============================================
 */
export const blogPostApi = {
  /**
   * Get all published posts (for users)
   * @param {Object} params - Query parameters { category_name, search, ordering, page }
   * @returns {Promise} List of posts
   */
  getAll: async (params = {}) => {
    const response = await api.get(`${BLOG_API_BASE}/posts/`, { params });
    return response.data;
  },

  /**
   * Get all posts for admin management
   * @param {Object} params - Query parameters { category, search }
   * @returns {Promise} List of all posts
   */
  getAdminList: async (params = {}) => {
    const response = await api.get(`${BLOG_API_BASE}/posts/admin/`, { params });
    return response.data;
  },

  /**
   * Get all posts including drafts (admin mode)
   * @param {Object} params - Query parameters
   * @returns {Promise} List of all posts
   */
  getAllAdmin: async (params = {}) => {
    const response = await api.get(`${BLOG_API_BASE}/posts/`, { 
      params: { ...params, admin: 'true' } 
    });
    return response.data;
  },

  /**
   * Get post by ID (auto increments view count)
   * @param {number} id - Post ID
   * @returns {Promise} Post detail with comments
   */
  getById: async (id) => {
    const response = await api.get(`${BLOG_API_BASE}/posts/${id}/`);
    return response.data;
  },

  /**
   * Create a new blog post
   * @param {Object} data - Post data
   * @returns {Promise} Created post
   */
  create: async (data) => {
    const response = await api.post(`${BLOG_API_BASE}/posts/`, data);
    return response.data;
  },

  /**
   * Update a blog post
   * @param {number} id - Post ID
   * @param {Object} data - Post data to update
   * @returns {Promise} Updated post
   */
  update: async (id, data) => {
    const response = await api.put(`${BLOG_API_BASE}/posts/${id}/`, data);
    return response.data;
  },

  /**
   * Partial update a blog post
   * @param {number} id - Post ID
   * @param {Object} data - Partial post data to update
   * @returns {Promise} Updated post
   */
  patch: async (id, data) => {
    const response = await api.patch(`${BLOG_API_BASE}/posts/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a blog post
   * @param {number} id - Post ID
   * @returns {Promise} Deletion result
   */
  delete: async (id) => {
    const response = await api.delete(`${BLOG_API_BASE}/posts/${id}/`);
    return response.data;
  },

  /**
   * Like or unlike a post
   * @param {number} id - Post ID
   * @param {string} action - 'like' or 'unlike'
   * @returns {Promise} Updated likes count
   */
  like: async (id, action = 'like') => {
    const response = await api.post(`${BLOG_API_BASE}/posts/${id}/like/`, { action });
    return response.data;
  },

  /**
   * Increment view count
   * @param {number} id - Post ID
   * @returns {Promise} Updated views count
   */
  view: async (id) => {
    const response = await api.post(`${BLOG_API_BASE}/posts/${id}/view/`);
    return response.data;
  },
};

/**
 * ============================================
 * BLOG COMMENTS API
 * ============================================
 */
export const blogCommentApi = {
  /**
   * Get all comments
   * @param {Object} params - Query parameters { post }
   * @returns {Promise} List of comments
   */
  getAll: async (params = {}) => {
    const response = await api.get(`${BLOG_API_BASE}/comments/`, { params });
    return response.data;
  },

  /**
   * Get comments by post ID
   * @param {number} postId - Post ID
   * @returns {Promise} List of comments for the post
   */
  getByPost: async (postId) => {
    const response = await api.get(`${BLOG_API_BASE}/comments/post/${postId}/`);
    return response.data;
  },

  /**
   * Get comment by ID
   * @param {number} id - Comment ID
   * @returns {Promise} Comment detail
   */
  getById: async (id) => {
    const response = await api.get(`${BLOG_API_BASE}/comments/${id}/`);
    return response.data;
  },

  /**
   * Create a new comment
   * @param {Object} data - Comment data { post, author_name, avatar, content }
   * @returns {Promise} Created comment
   */
  create: async (data) => {
    const response = await api.post(`${BLOG_API_BASE}/comments/`, data);
    return response.data;
  },

  /**
   * Update a comment
   * @param {number} id - Comment ID
   * @param {Object} data - Comment data to update
   * @returns {Promise} Updated comment
   */
  update: async (id, data) => {
    const response = await api.put(`${BLOG_API_BASE}/comments/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a comment
   * @param {number} id - Comment ID
   * @returns {Promise} Deletion result
   */
  delete: async (id) => {
    const response = await api.delete(`${BLOG_API_BASE}/comments/${id}/`);
    return response.data;
  },
};

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

/**
 * Transform API post data to match frontend format
 * @param {Object} apiPost - Post data from API
 * @returns {Object} Transformed post for frontend
 */
export const transformPostFromApi = (apiPost) => {
  return {
    id: apiPost.id,
    title: apiPost.title,
    slug: apiPost.slug,
    description: apiPost.description,
    content: apiPost.content,
    image: apiPost.image,
    category: apiPost.category_name || apiPost.category,
    categoryId: typeof apiPost.category === 'number' ? apiPost.category : null,
    tags: apiPost.tags || [],
    author: apiPost.author_name || apiPost.author,
    avatar: apiPost.avatar || 'https://i.pravatar.cc/150?img=1',
    date: apiPost.date,
    views: apiPost.views || 0,
    likes: apiPost.likes || 0,
    comments: apiPost.comments || 0,
    commentsData: (apiPost.commentsData || []).map(transformCommentFromApi),
    readTime: apiPost.read_time || '5 phút đọc',
    status: apiPost.status,
    isVisible: apiPost.is_visible,
    isPinned: apiPost.is_pinned,
    publishedAt: apiPost.published_at,
    createdAt: apiPost.created_at,
  };
};

/**
 * Transform frontend post data to API format
 * @param {Object} frontendPost - Post data from frontend
 * @returns {Object} Transformed post for API
 */
export const transformPostToApi = (frontendPost) => {
  // Category should be an integer ID
  let categoryValue = frontendPost.categoryId || frontendPost.category;
  if (typeof categoryValue === 'string' && !isNaN(parseInt(categoryValue))) {
    categoryValue = parseInt(categoryValue);
  } else if (typeof categoryValue === 'string') {
    categoryValue = null; // Invalid category, let backend handle
  }
  
  return {
    title: frontendPost.title,
    description: frontendPost.description || '',
    content: frontendPost.content || '',
    image: frontendPost.image || '',
    category: categoryValue,
    avatar: frontendPost.avatar || '',
    tags: Array.isArray(frontendPost.tags) ? frontendPost.tags : 
          (frontendPost.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    status: frontendPost.status || 'published',
    is_pinned: frontendPost.isPinned || frontendPost.is_pinned || false,
    read_time: frontendPost.readTime || frontendPost.read_time || '5 phút đọc',
  };
};

/**
 * Transform API comment data to match frontend format
 * @param {Object} apiComment - Comment data from API
 * @returns {Object} Transformed comment for frontend
 */
export const transformCommentFromApi = (comment) => {
  return {
    id: comment.id,
    author: comment.author_name,
    avatar: comment.avatar || 'https://i.pravatar.cc/150?img=10',
    content: comment.content,
    date: comment.date || comment.created_at,
    postId: comment.post,
  };
};

/**
 * Transform frontend comment data to API format
 * @param {Object} frontendComment - Comment data from frontend
 * @returns {Object} Transformed comment for API
 */
export const transformCommentToApi = (frontendComment) => {
  return {
    post: frontendComment.postId || frontendComment.post,
    author_name: frontendComment.author || frontendComment.author_name,
    avatar: frontendComment.avatar,
    content: frontendComment.content,
  };
};

// Default export with all APIs
export default {
  categories: blogCategoryApi,
  posts: blogPostApi,
  comments: blogCommentApi,
  transformPostFromApi,
  transformPostToApi,
  transformCommentFromApi,
  transformCommentToApi,
};
