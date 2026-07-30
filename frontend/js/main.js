// Main entry point - combines all modules

// Override handleModalSave from app.js with the admin version
const originalHandleModalSave = window.handleModalSave;
window.handleModalSave = function() {
  if (currentPage === 'dashboard' && window.isAdminLoggedIn) {
    if (typeof window.saveMember === 'function') {
      const handlers = {
        members: window.saveMember,
        news: window.saveNews,
        events: window.saveEvent,
        gallery: window.saveGallery,
        chapters: window.saveChapter,
        leaders: window.saveLeader,
        testimonials: window.saveTestimonial
      };
      const entity = window.modalState?.entity;
      if (handlers[entity]) {
        handlers[entity]();
        return;
      }
    }
  }
  if (originalHandleModalSave) originalHandleModalSave();
};

// Initialize admin state
window.isAdminLoggedIn = !!API.getToken();

// Reload data when navigating to dashboard
const originalNavigate = window.navigate;
window.navigate = function(page) {
  if (page === 'dashboard' && window.isAdminLoggedIn) {
    originalNavigate(page);
    setTimeout(() => {
      if (typeof loadAdminData === 'function') {
        loadAdminData();
      }
    }, 100);
    return;
  }
  originalNavigate(page);
};

// Show toast for network errors
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  return originalFetch(url, options).catch(error => {
    if (error.message.includes('Failed to fetch')) {
      showToast('Network error. Please check your connection.', 'error');
    }
    throw error;
  });
};
// Main entry point - combines all modules

// ✅ Prevent multiple initializations
if (!window._mainInitialized) {
  
  // Override handleModalSave from app.js with the admin version
  const originalHandleModalSave = window.handleModalSave;
  window.handleModalSave = function() {
    if (currentPage === 'dashboard' && window.isAdminLoggedIn) {
      if (typeof window.saveMember === 'function') {
        const handlers = {
          members: window.saveMember,
          news: window.saveNews,
          events: window.saveEvent,
          gallery: window.saveGallery,
          chapters: window.saveChapter,
          leaders: window.saveLeader,
          testimonials: window.saveTestimonial
        };
        const entity = window.modalState?.entity;
        if (handlers[entity]) {
          handlers[entity]();
          return;
        }
      }
    }
    if (originalHandleModalSave) originalHandleModalSave();
  };

  // Initialize admin state
  window.isAdminLoggedIn = !!API.getToken();

  // Reload data when navigating to dashboard
  const originalNavigate = window.navigate;
  window.navigate = function(page) {
    if (page === 'dashboard' && window.isAdminLoggedIn) {
      // ✅ Reset chart flag before navigating
      window._chartsInitialized = false;
      originalNavigate(page);
      setTimeout(() => {
        if (typeof loadAdminData === 'function') {
          loadAdminData();
        }
      }, 100);
      return;
    }
    originalNavigate(page);
  };

  // Show toast for network errors
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    return originalFetch(url, options).catch(error => {
      if (error.message.includes('Failed to fetch')) {
        showToast('Network error. Please check your connection.', 'error');
      }
      throw error;
    });
  };

  // ✅ Mark as initialized
  window._mainInitialized = true;
  
  console.log('✅ Thiec Nhialic Ministry app initialized');
  console.log('🔐 Admin logged in:', window.isAdminLoggedIn);
}
