// API Configuration
// ✅ Use the full URL with the correct port
// ✅ This should be your Render backend URL
const API_BASE = 'https://thiec-nhialic-backend.onrender.com/api';
// ✅ Alternative: Use relative URL if frontend is served from same origin
// const API_BASE = '/api';

// Get stored token
function getToken() {
  return localStorage.getItem('adminToken');
}

// Set token
function setToken(token) {
  if (token) {
    localStorage.setItem('adminToken', token);
  } else {
    localStorage.removeItem('adminToken');
  }
}

// Get admin info
function getAdmin() {
  const data = localStorage.getItem('adminData');
  return data ? JSON.parse(data) : null;
}

// Set admin info
function setAdmin(admin) {
  localStorage.setItem('adminData', JSON.stringify(admin));
}

// API request helper with better error handling
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    console.log('📤 API Request:', {
      method: options.method || 'GET',
      url: url,
      headers: headers
    });

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Error Response:', data);
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    console.log('✅ API Success:', data);
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

// ===== AUTH =====
async function adminLogin(username, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  setToken(data.token);
  setAdmin(data.admin);
  return data;
}

function adminLogout() {
  setToken(null);
  setAdmin(null);
}

// ===== MEMBERS =====
async function getMembers() {
  return await apiRequest('/members');
}

async function getMember(id) {
  return await apiRequest(`/members/${id}`);
}

async function searchMembers(query) {
  return await apiRequest(`/members/search?q=${encodeURIComponent(query)}`);
}

async function createMember(data) {
  return await apiRequest('/members', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function updateMember(id, data) {
  return await apiRequest(`/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

async function deleteMember(id) {
  return await apiRequest(`/members/${id}`, {
    method: 'DELETE'
  });
}

// ===== NEWS =====
async function getNews() {
  return await apiRequest('/news');
}

async function getNewsItem(id) {
  return await apiRequest(`/news/${id}`);
}

async function createNews(data) {
  return await apiRequest('/news', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function updateNews(id, data) {
  return await apiRequest(`/news/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

async function deleteNews(id) {
  return await apiRequest(`/news/${id}`, {
    method: 'DELETE'
  });
}

// ===== EVENTS =====
async function getEvents() {
  return await apiRequest('/events');
}

async function getEvent(id) {
  return await apiRequest(`/events/${id}`);
}

async function createEvent(data) {
  return await apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function updateEvent(id, data) {
  return await apiRequest(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

async function deleteEvent(id) {
  return await apiRequest(`/events/${id}`, {
    method: 'DELETE'
  });
}

// ===== GALLERY =====
async function getGallery() {
  return await apiRequest('/gallery');
}

async function getGalleryItem(id) {
  return await apiRequest(`/gallery/${id}`);
}

async function createGallery(data) {
  return await apiRequest('/gallery', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function updateGallery(id, data) {
  return await apiRequest(`/gallery/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

async function deleteGallery(id) {
  return await apiRequest(`/gallery/${id}`, {
    method: 'DELETE'
  });
}

// ===== CHAPTERS =====
async function getChapters() {
  return await apiRequest('/chapters');
}

async function getChapter(id) {
  return await apiRequest(`/chapters/${id}`);
}

async function createChapter(data) {
  return await apiRequest('/chapters', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function updateChapter(id, data) {
  return await apiRequest(`/chapters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

async function deleteChapter(id) {
  return await apiRequest(`/chapters/${id}`, {
    method: 'DELETE'
  });
}

// ===== LEADERS =====
async function getLeaders() {
  return await apiRequest('/leaders');
}

async function getLeader(id) {
  return await apiRequest(`/leaders/${id}`);
}

async function createLeader(data) {
  return await apiRequest('/leaders', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function updateLeader(id, data) {
  return await apiRequest(`/leaders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

async function deleteLeader(id) {
  return await apiRequest(`/leaders/${id}`, {
    method: 'DELETE'
  });
}

// ===== TESTIMONIALS =====
async function getTestimonials() {
  return await apiRequest('/testimonials');
}

async function getTestimonial(id) {
  return await apiRequest(`/testimonials/${id}`);
}

async function createTestimonial(data) {
  return await apiRequest('/testimonials', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function updateTestimonial(id, data) {
  return await apiRequest(`/testimonials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

async function deleteTestimonial(id) {
  return await apiRequest(`/testimonials/${id}`, {
    method: 'DELETE'
  });
}

// Export all functions
window.API = {
  // Auth
  adminLogin,
  adminLogout,
  getToken,
  getAdmin,
  
  // Members
  getMembers,
  getMember,
  searchMembers,
  createMember,
  updateMember,
  deleteMember,
  
  // News
  getNews,
  getNewsItem,
  createNews,
  updateNews,
  deleteNews,
  
  // Events
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  
  // Gallery
  getGallery,
  getGalleryItem,
  createGallery,
  updateGallery,
  deleteGallery,
  
  // Chapters
  getChapters,
  getChapter,
  createChapter,
  updateChapter,
  deleteChapter,
  
  // Leaders
  getLeaders,
  getLeader,
  createLeader,
  updateLeader,
  deleteLeader,
  
  // Testimonials
  getTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
};

console.log('✅ API configured with base URL:', API_BASE);
