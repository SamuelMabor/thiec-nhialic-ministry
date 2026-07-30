// Main Application Logic
let currentPage = 'home';
let isAdminLoggedIn = false;
let chartInstances = {};
let swiperInstances = [];
let appData = { members: [], news: [], events: [], gallery: [], chapters: [], leaders: [], testimonials: [] };

// ===== ROUTER =====
function navigate(page) {
  if (event) event.preventDefault();
  
  console.log('📍 Navigating to:', page);
  
  // Check if trying to access dashboard without login
  // In the navigate function, update the dashboard section
if (page === 'dashboard' && window.isAdminLoggedIn) {
  console.log('📊 Loading dashboard...');
  // ✅ Prevent multiple chart initializations
  window._chartsInitialized = false;
  
  // Load admin data
  if (typeof loadAdminData === 'function') {
    loadAdminData();
  }
  
  // Update stats and charts after a small delay
  setTimeout(() => {
    updateDashboardStats();
    // ✅ Only initialize charts once
    if (!window._chartsInitialized) {
      initDashboardCharts();
    }
  }, 300);
}

  // Close mobile menu
  document.getElementById('admin-sidebar')?.classList.remove('open');
  
  // Hide all pages
  document.querySelectorAll('[data-page]').forEach(p => p.classList.remove('active'));
  
  // Show target page
  const target = document.querySelector(`[data-page="${page}"]`);
  if (target) {
    target.classList.add('active');
    target.style.animation = 'none';
    target.offsetHeight;
    target.style.animation = '';
    console.log('✅ Showing page:', page);
  } else {
    console.error('❌ Page not found:', page);
  }

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const nl = document.querySelector(`.nav-link[data-nav="${page}"]`);
  if (nl) nl.classList.add('active');

  // Show/hide footer and navbar
  const footer = document.getElementById('site-footer');
  const navbar = document.getElementById('navbar');
  const show = page !== 'admin' && page !== 'dashboard';
  footer.style.display = show ? 'block' : 'none';
  navbar.style.display = show ? 'block' : 'none';

  currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Page-specific initialization
  setTimeout(() => {
    initScrollReveal();
    if (page === 'home') {
      initCounters();
      initHomeSliders();
    }
    if (page === 'dashboard' && window.isAdminLoggedIn) {
      console.log('📊 Loading dashboard...');
      updateDashboardStats();
      initDashboardCharts();
      // Load admin data
      if (typeof loadAdminData === 'function') {
        loadAdminData();
      }
    }
    if (page === 'members') {
      loadMembersPage();
    }
    if (page === 'news') {
      loadNewsPage();
    }
    if (page === 'events') {
      loadEventsPage();
    }
    if (page === 'gallery') {
      loadGalleryPage();
    }
    if (page === 'leadership') {
      loadLeadershipPage();
    }
  }, 100);
}

// ===== THEME =====
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  if (currentPage === 'dashboard' && isAdminLoggedIn) {
    setTimeout(initDashboardCharts, 300);
  }
}

// Initialize theme from localStorage
(function() {
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
});

// ===== SCROLL REVEAL =====
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale:not(.revealed)')
    .forEach(el => observer.observe(el));
}

// ===== COUNTERS =====
function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        let current = 0;
        const increment = target / 80;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = Math.floor(current).toLocaleString() + (target > 100 ? '+' : '');
        }, 20);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

// ===== TOAST =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-check-circle' : 
               type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  const color = type === 'success' ? 'text-green-500' : 
                type === 'error' ? 'text-red-500' : 'text-blue-500';
  toast.innerHTML = `<div class="flex items-center gap-3"><i class="fas ${icon} ${color}"></i><span>${message}</span></div>`;
  container.appendChild(toast);
  
  requestAnimationFrame(() => toast.classList.add('show'));
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ===== LIGHTBOX =====
function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

// ===== MODAL SYSTEM =====
function openModal(title, bodyHtml) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('crud-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  console.log('🔵 Closing modal, resetting state');
  
  // Reset modal state
  modalState = { entity: null, editId: null };
  window.modalState = modalState;
  
  // Clear form data
  const form = document.getElementById('crud-form');
  if (form) {
    form.reset();
  }
  
  // Clear image previews
  document.querySelectorAll('.img-upload img').forEach(img => {
    img.src = '';
    img.style.display = 'none';
  });
  document.querySelectorAll('.upload-placeholder').forEach(el => {
    el.style.display = 'flex';
  });
  
  // Close the modal
  document.getElementById('crud-modal').classList.remove('open');
  document.body.style.overflow = '';
  
  // Reset save button
  const saveBtn = document.getElementById('modal-save-btn');
  if (saveBtn) {
    saveBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Save';
    saveBtn.disabled = false;
    saveBtn.style.display = 'inline-flex';
  }
}

function handleModalSave() {
  // Overridden by admin.js
}

// ===== CONFIRM DIALOG =====
function showConfirm(title, message, callback) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  window.confirmCallback = callback;
  document.getElementById('confirm-dialog').classList.add('open');
}

function closeConfirm() {
  document.getElementById('confirm-dialog').classList.remove('open');
  window.confirmCallback = null;
}

function executeConfirm() {
  if (window.confirmCallback) {
    window.confirmCallback();
  }
  closeConfirm();
}

// ===== IMAGE UPLOAD =====
function handleImageUpload(input, previewId) {
  const file = input.files[0];
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image must be under 5MB.', 'error');
    input.value = '';
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
    const placeholder = preview?.parentElement?.querySelector('.upload-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    input.dataset.base64 = e.target.result;
  };
  reader.readAsDataURL(file);
}

function getUploadedImage(id) {
  const input = document.getElementById(id);
  return input?.dataset?.base64 || '';
}

function imageUploadHtml(id, currentSrc, label) {
  const hasImage = currentSrc && currentSrc.length > 0;
  return `<div class="img-upload" onclick="document.getElementById('${id}').click()" id="${id}-wrap">
    <img id="${id}-preview" src="${hasImage ? currentSrc : ''}" style="display:${hasImage ? 'block' : 'none'}" alt="Preview">
    <div class="upload-placeholder" style="display:${hasImage ? 'none' : 'flex'}">
      <i class="fas fa-cloud-upload-alt text-2xl" style="color:var(--muted)"></i>
      <p class="text-sm" style="color:var(--muted)">${label || 'Click to upload image'}</p>
      <p class="text-xs" style="color:var(--border)">Max 5MB</p>
    </div>
    <input type="file" id="${id}" accept="image/*" style="display:none" onchange="handleImageUpload(this,'${id}-preview')" ${hasImage ? `data-base64="${currentSrc}"` : ''}>
  </div>`;
}

// ===== FORM HELPERS =====
function formField(label, name, value, type = 'text', options = {}) {
  const required = options.required ? 'required' : '';
  
  if (type === 'textarea') {
    return `<div class="${options.half ? '' : 'col-span-full'}">
      <label class="block text-sm font-medium mb-1.5">${label}</label>
      <textarea name="${name}" rows="${options.rows || 3}" class="form-input resize-none" ${required} placeholder="${options.placeholder || ''}">${value || ''}</textarea>
    </div>`;
  }
  
  if (type === 'select') {
    // ✅ Handle both string arrays and object arrays with value/label
    let opts = '';
    if (options.options && options.options.length > 0) {
      if (typeof options.options[0] === 'object' && options.options[0].value !== undefined) {
        // Object format: { value: id, label: name }
        opts = options.options.map(o => 
          `<option value="${o.value}" ${o.value == value ? 'selected' : ''}>${o.label}</option>`
        ).join('');
      } else {
        // String format
        opts = options.options.map(o => 
          `<option value="${o}" ${o === value ? 'selected' : ''}>${o}</option>`
        ).join('');
      }
    }
    return `<div>
      <label class="block text-sm font-medium mb-1.5">${label}</label>
      <select name="${name}" class="form-input" ${required}>
        <option value="">Select...</option>
        ${opts}
      </select>
    </div>`;
  }
  
  if (type === 'date') {
    return `<div>
      <label class="block text-sm font-medium mb-1.5">${label}</label>
      <input type="date" name="${name}" value="${value || ''}" class="form-input" ${required}>
    </div>`;
  }
  
  return `<div>
    <label class="block text-sm font-medium mb-1.5">${label}</label>
    <input type="${type}" name="${name}" value="${value || ''}" class="form-input" ${required} placeholder="${options.placeholder || ''}">
  </div>`;
}

function sectionTitle(text) {
  return `<div class="col-span-full mt-4 mb-1">
    <h4 class="font-display font-bold text-sm uppercase tracking-wider" style="color:var(--accent)">${text}</h4>
    <div class="h-px mt-1" style="background:var(--border)"></div>
  </div>`;
}

function getFormData(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = value;
  });
  return data;
}

// ===== INIT HOME SLIDERS =====
function initHomeSliders() {
  // Destroy existing swipers
  swiperInstances.forEach(s => s.destroy());
  swiperInstances = [];

  // Hero slider
  const heroSwiper = new Swiper('.hero-swiper', {
    loop: true,
    autoplay: { delay: 6000, disableOnInteraction: false },
    effect: 'fade',
    fadeEffect: { crossFade: true },
    speed: 1500,
    pagination: { el: '.hero-dots', clickable: true },
    navigation: { nextEl: '.hero-next', prevEl: '.hero-prev' }
  });
  swiperInstances.push(heroSwiper);

  // Gallery preview slider
  const gallerySwiper = new Swiper('.gallery-preview-swiper', {
    loop: true,
    autoplay: { delay: 3000, disableOnInteraction: false },
    spaceBetween: 16,
    slidesPerView: 'auto',
    centeredSlides: true,
    speed: 600,
    pagination: { el: '.gallery-preview-swiper .swiper-pagination', clickable: true }
  });
  swiperInstances.push(gallerySwiper);

  // Testimonial slider
  const testimonialSwiper = new Swiper('.testimonial-swiper', {
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    spaceBetween: 24,
    speed: 600,
    pagination: { el: '.testimonial-swiper .swiper-pagination', clickable: true },
    breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
  });
  swiperInstances.push(testimonialSwiper);
}

// ===== LOAD PUBLIC DATA =====
async function loadPublicData() {
  try {
    const [members, news, events, gallery, chapters, leaders, testimonials] = await Promise.all([
      API.getMembers().catch(() => []),
      API.getNews().catch(() => []),
      API.getEvents().catch(() => []),
      API.getGallery().catch(() => []),
      API.getChapters().catch(() => []),
      API.getLeaders().catch(() => []),
      API.getTestimonials().catch(() => [])
    ]);

    appData = { members, news, events, gallery, chapters, leaders, testimonials };
    
    renderHomePage();
    renderFooterChapters();
    initScrollReveal();
    initCounters();
    
  } catch (error) {
    console.error('Failed to load public data:', error);
    showToast('Failed to load data. Please refresh.', 'error');
  }
}

// ===== RENDER PAGES =====
function renderHomePage() {
  const data = appData;
  if (!data) return;

  const container = document.getElementById('page-container');
  if (!container) return;

  container.innerHTML = `
    <!-- HOME PAGE -->
    <section data-page="home" class="active">
      <!-- Hero Slider -->
      <div class="swiper hero-swiper">
        <div class="swiper-wrapper">
          <div class="swiper-slide hero-slide">
            <img src="https://picsum.photos/seed/thiec-hero1/1920/1080" alt="Worship gathering">
            <div class="hero-overlay"></div>
            <div class="absolute inset-0 flex items-center">
              <div class="max-w-7xl mx-auto px-4 lg:px-8 w-full">
                <div class="max-w-2xl hero-content" style="animation:fadeInUp 1s ease .3s both">
                  <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.2);color:#E8D48B;border:1px solid rgba(201,168,76,.3)">Welcome to Our Ministry</span>
                  <h1 class="font-display text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">Spreading the Light of God Across Nations</h1>
                  <p class="text-white/70 text-lg mb-8 max-w-lg">Thiec Nhialic Ministry is a Spirit-filled movement called to raise a generation of worshippers, intercessors, and kingdom ambassadors.</p>
                  <div class="flex flex-wrap gap-4">
                    <a href="#" onclick="navigate('about')" class="btn-accent"><i class="fas fa-arrow-right text-sm"></i> Discover More</a>
                    <a href="#" onclick="navigate('contact')" class="btn-outline"><i class="fas fa-hands-praying text-sm"></i> Join Us</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-slide hero-slide">
            <img src="https://picsum.photos/seed/thiec-hero2/1920/1080" alt="Prayer conference">
            <div class="hero-overlay"></div>
            <div class="absolute inset-0 flex items-center">
              <div class="max-w-7xl mx-auto px-4 lg:px-8 w-full">
                <div class="max-w-2xl hero-content" style="animation:fadeInUp 1s ease .3s both">
                  <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.2);color:#E8D48B;border:1px solid rgba(201,168,76,.3)">Upcoming Event</span>
                  <h1 class="font-display text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">Annual Prayer Conference 2025</h1>
                  <p class="text-white/70 text-lg mb-8 max-w-lg">Three days of intensive prayer, worship, and divine encounters. March 15-17, 2025 in Juba.</p>
                  <div class="flex flex-wrap gap-4">
                    <a href="#" onclick="navigate('events')" class="btn-accent"><i class="fas fa-calendar text-sm"></i> Register Now</a>
                    <a href="#" onclick="navigate('events')" class="btn-outline"><i class="fas fa-play text-sm"></i> Watch Highlights</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-slide hero-slide">
            <img src="https://picsum.photos/seed/thiec-hero3/1920/1080" alt="Community outreach">
            <div class="hero-overlay"></div>
            <div class="absolute inset-0 flex items-center">
              <div class="max-w-7xl mx-auto px-4 lg:px-8 w-full">
                <div class="max-w-2xl hero-content" style="animation:fadeInUp 1s ease .3s both">
                  <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.2);color:#E8D48B;border:1px solid rgba(201,168,76,.3)">Get Involved</span>
                  <h1 class="font-display text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">Become a Part of God's Purpose</h1>
                  <p class="text-white/70 text-lg mb-8 max-w-lg">Whether through prayer, giving, or serving, there is a place for you in the Thiec Nhialic family.</p>
                  <div class="flex flex-wrap gap-4">
                    <a href="#" onclick="navigate('members')" class="btn-accent"><i class="fas fa-users text-sm"></i> Verify Membership</a>
                    <a href="#" onclick="navigate('contact')" class="btn-outline"><i class="fas fa-heart text-sm"></i> Partner With Us</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-slide hero-slide">
            <img src="https://picsum.photos/seed/thiec-hero4/1920/1080" alt="Youth ministry">
            <div class="hero-overlay"></div>
            <div class="absolute inset-0 flex items-center">
              <div class="max-w-7xl mx-auto px-4 lg:px-8 w-full">
                <div class="max-w-2xl hero-content" style="animation:fadeInUp 1s ease .3s both">
                  <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.2);color:#E8D48B;border:1px solid rgba(201,168,76,.3)">Youth &amp; Women</span>
                  <h1 class="font-display text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">Empowering the Next Generation</h1>
                  <p class="text-white/70 text-lg mb-8 max-w-lg">Our youth and women's fellowships are transforming lives through mentorship, discipleship, and community building.</p>
                  <div class="flex flex-wrap gap-4">
                    <a href="#" onclick="navigate('news')" class="btn-accent"><i class="fas fa-newspaper text-sm"></i> Latest News</a>
                    <a href="#" onclick="navigate('gallery')" class="btn-outline"><i class="fas fa-images text-sm"></i> View Gallery</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-dots swiper-pagination" style="bottom:40px"></div>
        <div class="hero-prev absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all border border-white/10"><i class="fas fa-chevron-left"></i></div>
        <div class="hero-next absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all border border-white/10"><i class="fas fa-chevron-right"></i></div>
      </div>

      <!-- Welcome Section -->
      <section class="py-24 px-4 lg:px-8 relative overflow-hidden">
        <div class="deco-cross font-display -top-10 -right-10 hidden lg:block"></div>
        <div class="max-w-4xl mx-auto text-center reveal">
          <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.1);color:var(--accent)">A Word of Welcome</span>
          <h2 class="font-display text-4xl lg:text-5xl font-bold mb-6">Grace and Peace to You</h2>
          <div class="section-divider mb-8"></div>
          <p class="text-lg leading-relaxed mb-6" style="color:var(--muted)">On behalf of the entire Thiec Nhialic Ministry family, we warmly welcome you. Whether you are visiting for the first time or a long-standing member, this is your home.</p>
          <p class="text-lg leading-relaxed" style="color:var(--muted)">"Thiec Nhialic" means "God is Great" in Dinka — the foundation of everything we do. We exist to proclaim the greatness of God and to be a beacon of hope in South Sudan and beyond.</p>
        </div>
      </section>

      <!-- Mission & Vision -->
      <section class="py-24 px-4 lg:px-8" style="background:var(--card)">
        <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div class="reveal-left">
            <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.1);color:var(--accent)">Our Purpose</span>
            <h2 class="font-display text-4xl lg:text-5xl font-bold mb-6">Mission &amp; Vision</h2>
            <div class="section-divider !mx-0 mb-8"></div>
            <div class="mb-8">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:var(--primary)"><i class="fas fa-bullseye text-accent-light text-sm"></i></div>
                <h3 class="font-display text-xl font-bold">Our Mission</h3>
              </div>
              <p style="color:var(--muted)" class="leading-relaxed pl-[52px]">To preach the Gospel of Jesus Christ with power and conviction, make disciples of all nations, and transform communities through the love and power of the Holy Spirit.</p>
            </div>
            <div>
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:var(--primary)"><i class="fas fa-eye text-accent-light text-sm"></i></div>
                <h3 class="font-display text-xl font-bold">Our Vision</h3>
              </div>
              <p style="color:var(--muted)" class="leading-relaxed pl-[52px]">To see a generation of Spirit-filled believers united across borders, worshipping God in spirit and in truth, impacting nations until the return of our Lord Jesus Christ.</p>
            </div>
          </div>
          <div class="reveal-right relative">
            <div class="rounded-2xl overflow-hidden shadow-2xl"><img src="https://picsum.photos/seed/thiec-mission/600/500" alt="Ministry mission" class="w-full h-[400px] lg:h-[500px] object-cover"></div>
            <div class="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl flex items-center justify-center" style="background:var(--accent);box-shadow:0 10px 40px rgba(201,168,76,.3)">
              <div class="text-center text-white"><span class="font-display text-3xl font-bold block">Est.</span><span class="text-sm font-semibold opacity-80">2015</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Core Values -->
      <section class="py-24 px-4 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16 reveal">
            <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.1);color:var(--accent)">What We Stand For</span>
            <h2 class="font-display text-4xl lg:text-5xl font-bold mb-4">Our Core Values</h2>
            <div class="section-divider mb-6"></div>
          </div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="card-hover rounded-2xl p-8 text-center reveal" style="background:var(--card);border:1px solid var(--border);transition-delay:.1s">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style="background:linear-gradient(135deg,var(--primary),#1A6B55)"><i class="fas fa-pray text-accent-light text-xl"></i></div>
              <h3 class="font-display text-lg font-bold mb-3">Prayer</h3>
              <p class="text-sm leading-relaxed" style="color:var(--muted)">Prayer is the foundation of every ministry activity. We believe in the power of persistent, fervent prayer.</p>
            </div>
            <div class="card-hover rounded-2xl p-8 text-center reveal" style="background:var(--card);border:1px solid var(--border);transition-delay:.2s">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style="background:linear-gradient(135deg,var(--primary),#1A6B55)"><i class="fas fa-book-bible text-accent-light text-xl"></i></div>
              <h3 class="font-display text-lg font-bold mb-3">Word of God</h3>
              <p class="text-sm leading-relaxed" style="color:var(--muted)">The Bible is our supreme authority. We teach, preach, and live by every word that proceeds from God.</p>
            </div>
            <div class="card-hover rounded-2xl p-8 text-center reveal" style="background:var(--card);border:1px solid var(--border);transition-delay:.3s">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style="background:linear-gradient(135deg,var(--primary),#1A6B55)"><i class="fas fa-people-group text-accent-light text-xl"></i></div>
              <h3 class="font-display text-lg font-bold mb-3">Unity</h3>
              <p class="text-sm leading-relaxed" style="color:var(--muted)">We are one body in Christ, transcending tribal, ethnic, and national boundaries with the bond of peace.</p>
            </div>
            <div class="card-hover rounded-2xl p-8 text-center reveal" style="background:var(--card);border:1px solid var(--border);transition-delay:.4s">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style="background:linear-gradient(135deg,var(--primary),#1A6B55)"><i class="fas fa-hand-holding-heart text-accent-light text-xl"></i></div>
              <h3 class="font-display text-lg font-bold mb-3">Service</h3>
              <p class="text-sm leading-relaxed" style="color:var(--muted)">We serve God by serving people. Every member is called to minister with love, humility, and excellence.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Latest News -->
      <section class="py-24 px-4 lg:px-8" style="background:var(--card)">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4 reveal">
            <div>
              <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4" style="background:rgba(201,168,76,.1);color:var(--accent)">Stay Informed</span>
              <h2 class="font-display text-4xl lg:text-5xl font-bold">Latest News</h2>
            </div>
            <a href="#" onclick="navigate('news')" class="btn-primary text-sm py-2.5 px-5">View All News <i class="fas fa-arrow-right text-xs"></i></a>
          </div>
          <div id="home-news-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
        </div>
      </section>

      <!-- Upcoming Events -->
      <section class="py-24 px-4 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4 reveal">
            <div>
              <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4" style="background:rgba(201,168,76,.1);color:var(--accent)">Mark Your Calendar</span>
              <h2 class="font-display text-4xl lg:text-5xl font-bold">Upcoming Programmes</h2>
            </div>
            <a href="#" onclick="navigate('events')" class="btn-primary text-sm py-2.5 px-5">All Events <i class="fas fa-arrow-right text-xs"></i></a>
          </div>
          <div id="home-events-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
        </div>
      </section>

      <!-- Stats -->
      <section class="py-24 px-4 lg:px-8 relative overflow-hidden" style="background:linear-gradient(135deg,#072A1F 0%,#0B3D2E 40%,#1A6B55 100%)">
        <div class="absolute inset-0 opacity-10" style="background-image:url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23C9A84C%22 fill-opacity=%220.4%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"></div>
        <div class="max-w-7xl mx-auto relative z-10">
          <div class="text-center mb-16 reveal">
            <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.2);color:#E8D48B;border:1px solid rgba(201,168,76,.3)">By the Numbers</span>
            <h2 class="font-display text-4xl lg:text-5xl font-bold text-white">God's Faithfulness in Numbers</h2>
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="stat-card text-center p-8 rounded-2xl border border-white/10 backdrop-blur-sm reveal" style="background:rgba(255,255,255,.05);transition-delay:.1s">
              <i class="fas fa-users text-3xl mb-4" style="color:#E8D48B"></i>
              <div class="font-display text-5xl font-bold text-white mb-2" data-count="20500">0</div>
              <p class="text-white/60 text-sm">Total Members</p>
            </div>
            <div class="stat-card text-center p-8 rounded-2xl border border-white/10 backdrop-blur-sm reveal" style="background:rgba(255,255,255,.05);transition-delay:.2s">
              <i class="fas fa-map-marker-alt text-3xl mb-4" style="color:#E8D48B"></i>
              <div class="font-display text-5xl font-bold text-white mb-2" data-count="12">0</div>
              <p class="text-white/60 text-sm">Chapters</p>
            </div>
            <div class="stat-card text-center p-8 rounded-2xl border border-white/10 backdrop-blur-sm reveal" style="background:rgba(255,255,255,.05);transition-delay:.3s">
              <i class="fas fa-globe-africa text-3xl mb-4" style="color:#E8D48B"></i>
              <div class="font-display text-5xl font-bold text-white mb-2" data-count="4">0</div>
              <p class="text-white/60 text-sm">Countries</p>
            </div>
            <div class="stat-card text-center p-8 rounded-2xl border border-white/10 backdrop-blur-sm reveal" style="background:rgba(255,255,255,.05);transition-delay:.4s">
              <i class="fas fa-calendar-check text-3xl mb-4" style="color:#E8D48B"></i>
              <div class="font-display text-5xl font-bold text-white mb-2" data-count="85">0</div>
              <p class="text-white/60 text-sm">Events This Year</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Gallery Preview -->
      <section class="py-24 px-4 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-12 reveal">
            <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.1);color:var(--accent)">Captured Moments</span>
            <h2 class="font-display text-4xl lg:text-5xl font-bold mb-4">Ministry Gallery</h2>
          </div>
          <div class="swiper gallery-preview-swiper reveal-scale">
            <div class="swiper-wrapper" id="home-gallery-swiper"></div>
            <div class="swiper-pagination mt-8" style="position:relative"></div>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="py-24 px-4 lg:px-8" style="background:var(--card)">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-12 reveal">
            <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.1);color:var(--accent)">Testimonies</span>
            <h2 class="font-display text-4xl lg:text-5xl font-bold mb-4">What Our Members Say</h2>
            <div class="section-divider"></div>
          </div>
          <div class="swiper testimonial-swiper reveal-scale">
            <div class="swiper-wrapper" id="testimonial-swiper-wrapper"></div>
            <div class="swiper-pagination mt-8" style="position:relative"></div>
          </div>
        </div>
      </section>

      <!-- Chapters -->
      <section class="py-24 px-4 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-12 reveal">
            <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.1);color:var(--accent)">Our Reach</span>
            <h2 class="font-display text-4xl lg:text-5xl font-bold mb-4">Ministry Chapters</h2>
          </div>
          <div id="home-chapters-grid" class="grid md:grid-cols-3 gap-8"></div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="py-24 px-4 lg:px-8 relative overflow-hidden" style="background:linear-gradient(135deg,#072A1F,#0B3D2E)">
        <div class="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style="background:var(--accent);filter:blur(100px)"></div>
        <div class="max-w-4xl mx-auto text-center relative z-10 reveal">
          <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.2);color:#E8D48B;border:1px solid rgba(201,168,76,.3)">Support the Work</span>
          <h2 class="font-display text-4xl lg:text-5xl font-bold text-white mb-6">Partner With Us</h2>
          <p class="text-white/70 text-lg mb-10 max-w-2xl mx-auto">Your generous giving enables us to spread the Gospel, support our chapters, and transform communities.</p>
          <div class="flex flex-wrap justify-center gap-4 mb-8">
            <button onclick="showToast('Thank you! Banking details will be provided.','success')" class="btn-accent text-lg py-4 px-10"><i class="fas fa-hand-holding-dollar"></i> Give Now</button>
            <button onclick="navigate('contact')" class="btn-outline text-lg py-4 px-10"><i class="fas fa-envelope"></i> Contact Us</button>
          </div>
          <p class="text-white/40 text-sm">"God loves a cheerful giver." — 2 Corinthians 9:7</p>
        </div>
      </section>

      <!-- Newsletter -->
      <section class="py-20 px-4 lg:px-8">
        <div class="max-w-3xl mx-auto text-center reveal">
          <h2 class="font-display text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p class="mb-8" style="color:var(--muted)">Stay updated with the latest news, events, and devotionals.</p>
          <form onsubmit="event.preventDefault();showToast('Subscribed successfully!','success');this.reset()" class="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input type="email" placeholder="Enter your email" required class="form-input flex-1">
            <button type="submit" class="btn-primary whitespace-nowrap">Subscribe <i class="fas fa-paper-plane text-xs"></i></button>
          </form>
        </div>
      </section>
    </section>

    <!-- ABOUT PAGE -->
    <section data-page="about">
      <div class="pt-28 pb-24 px-4 lg:px-8" style="background:linear-gradient(135deg,#072A1F,#0B3D2E)">
        <div class="max-w-7xl mx-auto text-center">
          <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.2);color:#E8D48B;border:1px solid rgba(201,168,76,.3)">Our Story</span>
          <h1 class="font-display text-5xl lg:text-6xl font-bold text-white mb-4">About Thiec Nhialic Ministry</h1>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div class="breadcrumb"><a href="#" onclick="navigate('home')">Home</a><span class="sep">/</span><span>About Us</span></div>
        <div class="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div class="reveal-left">
            <h2 class="font-display text-3xl font-bold mb-6">Our History</h2>
            <div class="section-divider !mx-0 mb-6"></div>
            <p class="mb-4 leading-relaxed" style="color:var(--muted)">Thiec Nhialic Ministry was founded in 2015 by Bishop John Deng Machar. What began as a small prayer group of seven believers in Bor has grown into a multinational movement touching thousands of lives.</p>
            <p class="leading-relaxed" style="color:var(--muted)">The name "Thiec Nhialic" — "God is Great" in Dinka — was given prophetically during a night of intense prayer. Through civil war, displacement, and refugee crises, the ministry has remained steadfast.</p>
          </div>
          <div class="reveal-right"><img src="https://picsum.photos/seed/thiec-history/600/450" alt="History" class="rounded-2xl shadow-xl w-full h-[400px] object-cover"></div>
        </div>
        <div class="mb-24 reveal">
          <div class="rounded-2xl p-8 lg:p-12" style="background:var(--card);border:1px solid var(--border)">
            <h2 class="font-display text-3xl font-bold mb-6 text-center">Statement of Faith</h2>
            <div class="section-divider mb-8"></div>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="flex gap-3"><i class="fas fa-check-circle mt-1" style="color:var(--accent)"></i><p style="color:var(--muted)"><strong>We believe</strong> in one God, eternally existing in three Persons — Father, Son, and Holy Spirit.</p></div>
              <div class="flex gap-3"><i class="fas fa-check-circle mt-1" style="color:var(--accent)"></i><p style="color:var(--muted)"><strong>We believe</strong> in the deity of the Lord Jesus Christ, His virgin birth, sinless life, and atoning death.</p></div>
              <div class="flex gap-3"><i class="fas fa-check-circle mt-1" style="color:var(--accent)"></i><p style="color:var(--muted)"><strong>We believe</strong> in the resurrection of the dead and eternal life for believers.</p></div>
              <div class="flex gap-3"><i class="fas fa-check-circle mt-1" style="color:var(--accent)"></i><p style="color:var(--muted)"><strong>We believe</strong> in the baptism of the Holy Spirit as described in Acts 2.</p></div>
              <div class="flex gap-3"><i class="fas fa-check-circle mt-1" style="color:var(--accent)"></i><p style="color:var(--muted)"><strong>We believe</strong> the Bible is the inspired, infallible, and authoritative Word of God.</p></div>
              <div class="flex gap-3"><i class="fas fa-check-circle mt-1" style="color:var(--accent)"></i><p style="color:var(--muted)"><strong>We believe</strong> in divine healing, deliverance, and the miraculous power of God active today.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MEMBERS PAGE -->
    <section data-page="members">
      <div class="pt-28 pb-24 px-4 lg:px-8" style="background:linear-gradient(135deg,#072A1F,#0B3D2E)">
        <div class="max-w-7xl mx-auto text-center">
          <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.2);color:#E8D48B;border:1px solid rgba(201,168,76,.3)">Verify Membership</span>
          <h1 class="font-display text-5xl lg:text-6xl font-bold text-white mb-4">Member Verification</h1>
        </div>
      </div>
      <div class="max-w-3xl mx-auto px-4 lg:px-8 py-20">
        <div class="breadcrumb"><a href="#" onclick="navigate('home')">Home</a><span class="sep">/</span><span>Members</span></div>
        <div class="rounded-2xl p-8 lg:p-10 reveal" style="background:var(--card);border:1px solid var(--border);box-shadow:var(--shadow)">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background:var(--primary)"><i class="fas fa-search text-accent-light"></i></div>
            <div><h2 class="font-display text-xl font-bold">Search Members</h2><p class="text-sm" style="color:var(--muted)">Enter a member number or name</p></div>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" id="member-search-input" placeholder="e.g. TN00000001 or John Deng" class="form-input flex-1" oninput="handleMemberSearch(this.value)">
            <button onclick="handleMemberSearch(document.getElementById('member-search-input').value)" class="btn-primary whitespace-nowrap"><i class="fas fa-search text-sm"></i> Search</button>
          </div>
        </div>
        <div id="member-search-results" class="mt-8"></div>
      </div>
    </section>

    <!-- NEWS PAGE -->
    <section data-page="news">
      <div class="pt-28 pb-24 px-4 lg:px-8" style="background:linear-gradient(135deg,#072A1F,#0B3D2E)">
        <div class="max-w-7xl mx-auto text-center">
          <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.2);color:#E8D48B;border:1px solid rgba(201,168,76,.3)">Ministry Updates</span>
          <h1 class="font-display text-5xl lg:text-6xl font-bold text-white mb-4">News &amp; Announcements</h1>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div class="breadcrumb"><a href="#" onclick="navigate('home')">Home</a><span class="sep">/</span><span>News</span></div>
        <div class="flex flex-wrap gap-2 mb-10" id="news-filter-buttons"></div>
        <div id="news-full-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
      </div>
    </section>

    <!-- EVENTS PAGE -->
    <section data-page="events">
      <div class="pt-28 pb-24 px-4 lg:px-8" style="background:linear-gradient(135deg,#072A1F,#0B3D2E)">
        <div class="max-w-7xl mx-auto text-center">
          <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.2);color:#E8D48B;border:1px solid rgba(201,168,76,.3)">Programmes &amp; Crusades</span>
          <h1 class="font-display text-5xl lg:text-6xl font-bold text-white mb-4">Events</h1>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div class="breadcrumb"><a href="#" onclick="navigate('home')">Home</a><span class="sep">/</span><span>Events</span></div>
        <div id="events-full-grid" class="grid md:grid-cols-2 gap-8"></div>
      </div>
    </section>

    <!-- GALLERY PAGE -->
    <section data-page="gallery">
      <div class="pt-28 pb-24 px-4 lg:px-8" style="background:linear-gradient(135deg,#072A1F,#0B3D2E)">
        <div class="max-w-7xl mx-auto text-center">
          <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.2);color:#E8D48B;border:1px solid rgba(201,168,76,.3)">Captured Moments</span>
          <h1 class="font-display text-5xl lg:text-6xl font-bold text-white mb-4">Gallery</h1>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div class="breadcrumb"><a href="#" onclick="navigate('home')">Home</a><span class="sep">/</span><span>Gallery</span></div>
        <div class="flex flex-wrap gap-2 mb-10" id="gallery-filter-buttons"></div>
        <div id="gallery-full-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
      </div>
    </section>

    <!-- LEADERSHIP PAGE -->
    <section data-page="leadership">
      <div class="pt-28 pb-24 px-4 lg:px-8" style="background:linear-gradient(135deg,#072A1F,#0B3D2E)">
        <div class="max-w-7xl mx-auto text-center">
          <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.2);color:#E8D48B;border:1px solid rgba(201,168,76,.3)">Servant Leaders</span>
          <h1 class="font-display text-5xl lg:text-6xl font-bold text-white mb-4">Our Leadership</h1>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div class="breadcrumb"><a href="#" onclick="navigate('home')">Home</a><span class="sep">/</span><span>Leadership</span></div>
        <div id="leadership-grid" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"></div>
      </div>
    </section>

    <!-- CONTACT PAGE -->
    <section data-page="contact">
      <div class="pt-28 pb-24 px-4 lg:px-8" style="background:linear-gradient(135deg,#072A1F,#0B3D2E)">
        <div class="max-w-7xl mx-auto text-center">
          <span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style="background:rgba(201,168,76,.2);color:#E8D48B;border:1px solid rgba(201,168,76,.3)">Get In Touch</span>
          <h1 class="font-display text-5xl lg:text-6xl font-bold text-white mb-4">Contact Us</h1>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div class="breadcrumb"><a href="#" onclick="navigate('home')">Home</a><span class="sep">/</span><span>Contact</span></div>
        <div class="grid lg:grid-cols-5 gap-12">
          <div class="lg:col-span-2 reveal-left">
            <h2 class="font-display text-2xl font-bold mb-6">Contact Information</h2>
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background:var(--primary)"><i class="fas fa-map-marker-alt text-accent-light"></i></div>
                <div><h4 class="font-semibold mb-1">Headquarters</h4><p class="text-sm" style="color:var(--muted)">Juba, Central Equatoria, South Sudan</p></div>
              </div>
              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background:var(--primary)"><i class="fas fa-phone text-accent-light"></i></div>
                <div><h4 class="font-semibold mb-1">Phone</h4><p class="text-sm" style="color:var(--muted)">+211 9XX XXX XXX</p></div>
              </div>
              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background:var(--primary)"><i class="fas fa-envelope text-accent-light"></i></div>
                <div><h4 class="font-semibold mb-1">Email</h4><p class="text-sm" style="color:var(--muted)">info@thiecnhialic.org</p></div>
              </div>
            </div>
          </div>
          <div class="lg:col-span-3 reveal-right">
            <div class="rounded-2xl p-8 lg:p-10" style="background:var(--card);border:1px solid var(--border);box-shadow:var(--shadow)">
              <h2 class="font-display text-2xl font-bold mb-6">Send Us a Message</h2>
              <form onsubmit="event.preventDefault();showToast('Message sent successfully!','success');this.reset()" class="space-y-5">
                <div class="grid sm:grid-cols-2 gap-5">
                  <div><label class="block text-sm font-medium mb-2">Full Name</label><input type="text" required placeholder="Your name" class="form-input"></div>
                  <div><label class="block text-sm font-medium mb-2">Email</label><input type="email" required placeholder="your@email.com" class="form-input"></div>
                </div>
                <div><label class="block text-sm font-medium mb-2">Subject</label>
                  <select class="form-input"><option value="">Select a subject</option><option>General Inquiry</option><option>Prayer Request</option><option>Partnership</option><option>Membership</option></select>
                </div>
                <div><label class="block text-sm font-medium mb-2">Message</label><textarea rows="5" required placeholder="Write your message..." class="form-input resize-none"></textarea></div>
                <button type="submit" class="btn-primary w-full justify-center text-lg py-4"><i class="fas fa-paper-plane"></i> Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ADMIN LOGIN -->
    <section data-page="admin">
      <div class="min-h-screen flex items-center justify-center px-4 py-20" style="background:linear-gradient(135deg,#072A1F 0%,#0B3D2E 50%,#1A6B55 100%)">
        <div class="w-full max-w-md reveal-scale">
          <div class="text-center mb-8">
            <svg class="mx-auto mb-4" width="48" height="48" viewBox="0 0 60 60" fill="none"><rect x="26" y="4" width="8" height="52" rx="2" fill="#C9A84C"/><rect x="4" y="22" width="52" height="8" rx="2" fill="#C9A84C"/></svg>
            <h1 class="font-display text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p class="text-white/50">Sign in to manage the ministry platform</p>
          </div>
          <div class="rounded-2xl p-8" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(20px)">
            <form onsubmit="event.preventDefault();handleAdminLogin()" class="space-y-5">
              <div><label class="block text-sm font-medium text-white/70 mb-2">Username</label>
                <div class="relative"><i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-white/30"></i>
                <input type="text" id="admin-username" required placeholder="Enter username" class="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#C9A84C] transition-colors font-body"></div>
              </div>
              <div><label class="block text-sm font-medium text-white/70 mb-2">Password</label>
                <div class="relative"><i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-white/30"></i>
                <input type="password" id="admin-password" required placeholder="Enter password" class="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#C9A84C] transition-colors font-body"></div>
              </div>
              <button type="submit" class="w-full py-3.5 rounded-xl font-semibold transition-all hover:brightness-110 hover:-translate-y-0.5" style="background:linear-gradient(135deg,#C9A84C,#E8D48B);color:#072A1F"><i class="fas fa-sign-in-alt mr-2"></i> Sign In</button>
            </form>
            <p class="text-center text-white/30 text-xs mt-6">Demo: admin / admin123</p>
          </div>
          <div class="text-center mt-6"><a href="#" onclick="navigate('home')" class="text-white/40 text-sm hover:text-[#E8D48B] transition-colors"><i class="fas fa-arrow-left mr-1"></i> Back to Website</a></div>
        </div>
      </div>
    </section>

    <!-- ADMIN DASHBOARD -->
    <section data-page="dashboard">
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="p-6 border-b border-white/10">
          <div class="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 60 60" fill="none"><rect x="26" y="4" width="8" height="52" rx="2" fill="#C9A84C"/><rect x="4" y="22" width="52" height="8" rx="2" fill="#C9A84C"/></svg>
            <div><span class="font-display font-bold text-sm block text-white">Thiec Nhialic</span><span class="text-xs text-white/40">Admin Panel</span></div>
          </div>
        </div>
        <div class="py-4">
          <div class="px-6 py-2 text-xs text-white/30 uppercase tracking-wider">Main</div>
          <a href="#" class="sidebar-link active" onclick="switchDashTab('overview',this)"><i class="fas fa-th-large w-5 text-center"></i> Dashboard</a>
          <a href="#" class="sidebar-link" onclick="switchDashTab('members-mgmt',this)"><i class="fas fa-users w-5 text-center"></i> Members</a>
          <a href="#" class="sidebar-link" onclick="switchDashTab('news-mgmt',this)"><i class="fas fa-newspaper w-5 text-center"></i> News</a>
          <a href="#" class="sidebar-link" onclick="switchDashTab('events-mgmt',this)"><i class="fas fa-calendar w-5 text-center"></i> Events</a>
          <div class="px-6 py-2 mt-4 text-xs text-white/30 uppercase tracking-wider">Content</div>
          <a href="#" class="sidebar-link" onclick="switchDashTab('gallery-mgmt',this)"><i class="fas fa-images w-5 text-center"></i> Gallery</a>
          <a href="#" class="sidebar-link" onclick="switchDashTab('chapters-mgmt',this)"><i class="fas fa-map w-5 text-center"></i> Chapters</a>
          <a href="#" class="sidebar-link" onclick="switchDashTab('leadership-mgmt',this)"><i class="fas fa-user-tie w-5 text-center"></i> Leadership</a>
          <a href="#" class="sidebar-link" onclick="switchDashTab('testimonials-mgmt',this)"><i class="fas fa-quote-left w-5 text-center"></i> Testimonials</a>
          <div class="px-6 py-2 mt-4 text-xs text-white/30 uppercase tracking-wider">System</div>
          <a href="#" class="sidebar-link" onclick="handleAdminLogout()" style="color:rgba(255,100,100,.7)"><i class="fas fa-sign-out-alt w-5 text-center"></i> Logout</a>
        </div>
      </aside>
      <div class="admin-main" id="admin-main">
        <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <button class="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center" style="background:var(--card);border:1px solid var(--border)" onclick="document.getElementById('admin-sidebar').classList.toggle('open')"><i class="fas fa-bars"></i></button>
            <div><h1 class="font-display text-2xl font-bold" id="dash-title">Dashboard Overview</h1><p class="text-sm" style="color:var(--muted)">Welcome back, Administrator</p></div>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 pl-3" style="border-left:1px solid var(--border)">
              <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style="background:var(--primary);color:#E8D48B">AD</div>
              <span class="text-sm font-medium hidden sm:block">Admin</span>
            </div>
          </div>
        </div>

        <!-- Overview -->
        <div id="dash-overview">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="rounded-xl p-5" style="background:var(--card);border:1px solid var(--border)">
              <div class="flex items-center justify-between mb-3"><div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:#0B3D2E"><i class="fas fa-users text-sm" style="color:#E8D48B"></i></div></div>
              <div class="font-display text-2xl font-bold" id="stat-members">0</div>
              <div class="text-xs" style="color:var(--muted)">Total Members</div>
            </div>
            <div class="rounded-xl p-5" style="background:var(--card);border:1px solid var(--border)">
              <div class="flex items-center justify-between mb-3"><div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:#C9A84C"><i class="fas fa-newspaper text-sm" style="color:#072A1F"></i></div></div>
              <div class="font-display text-2xl font-bold" id="stat-news">0</div>
              <div class="text-xs" style="color:var(--muted)">News Articles</div>
            </div>
            <div class="rounded-xl p-5" style="background:var(--card);border:1px solid var(--border)">
              <div class="flex items-center justify-between mb-3"><div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:#7C3AED"><i class="fas fa-calendar text-sm text-white"></i></div></div>
              <div class="font-display text-2xl font-bold" id="stat-events">0</div>
              <div class="text-xs" style="color:var(--muted)">Events</div>
            </div>
            <div class="rounded-xl p-5" style="background:var(--card);border:1px solid var(--border)">
              <div class="flex items-center justify-between mb-3"><div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:#DC2626"><i class="fas fa-images text-sm text-white"></i></div></div>
              <div class="font-display text-2xl font-bold" id="stat-gallery">0</div>
              <div class="text-xs" style="color:var(--muted)">Gallery Photos</div>
            </div>
          </div>
          <div class="grid lg:grid-cols-3 gap-6 mb-8">
            <div class="lg:col-span-2 rounded-xl p-6" style="background:var(--card);border:1px solid var(--border)">
              <h3 class="font-display font-bold mb-6">Membership Growth</h3>
              <canvas id="growthChart" height="200"></canvas>
            </div>
            <div class="rounded-xl p-6" style="background:var(--card);border:1px solid var(--border)">
              <h3 class="font-display font-bold mb-6">Members by Country</h3>
              <canvas id="countryChart" height="220"></canvas>
            </div>
          </div>
        </div>

        <!-- Members Mgmt -->
        <div id="dash-members-mgmt" style="display:none">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <input type="text" placeholder="Search members..." class="form-input max-w-md text-sm" oninput="filterAdminMembers(this.value)">
            <button onclick="openMemberModal()" class="btn-primary text-sm py-2.5 px-5"><i class="fas fa-user-plus text-xs"></i> Add Member</button>
          </div>
          <div class="rounded-xl overflow-hidden" style="background:var(--card);border:1px solid var(--border)">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead><tr style="background:var(--bg)">
                  <th class="text-left p-4 font-semibold">Member</th>
                  <th class="text-left p-4 font-semibold hidden md:table-cell">Member No.</th>
                  <th class="text-left p-4 font-semibold hidden lg:table-cell">Chapter</th>
                  <th class="text-left p-4 font-semibold hidden lg:table-cell">Status</th>
                  <th class="text-left p-4 font-semibold">Actions</th>
                </tr></thead>
                <tbody id="admin-members-tbody"></tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- News Mgmt -->
        <div id="dash-news-mgmt" style="display:none">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <input type="text" placeholder="Search news..." class="form-input max-w-md text-sm" oninput="filterMgmtList('news',this.value)">
            <button onclick="openNewsModal()" class="btn-primary text-sm py-2.5 px-5"><i class="fas fa-plus text-xs"></i> Add News</button>
          </div>
          <div id="news-mgmt-list" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </div>

        <!-- Events Mgmt -->
        <div id="dash-events-mgmt" style="display:none">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <input type="text" placeholder="Search events..." class="form-input max-w-md text-sm" oninput="filterMgmtList('events',this.value)">
            <button onclick="openEventModal()" class="btn-primary text-sm py-2.5 px-5"><i class="fas fa-plus text-xs"></i> Add Event</button>
          </div>
          <div id="events-mgmt-list" class="grid md:grid-cols-2 gap-6"></div>
        </div>

        <!-- Gallery Mgmt -->
        <div id="dash-gallery-mgmt" style="display:none">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div class="flex flex-wrap gap-2" id="gallery-mgmt-filters"></div>
            <button onclick="openGalleryModal()" class="btn-primary text-sm py-2.5 px-5"><i class="fas fa-cloud-upload-alt text-xs"></i> Upload Photo</button>
          </div>
          <div id="gallery-mgmt-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
        </div>

        <!-- Chapters Mgmt -->
        <div id="dash-chapters-mgmt" style="display:none">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <input type="text" placeholder="Search chapters..." class="form-input max-w-md text-sm" oninput="filterMgmtList('chapters',this.value)">
            <button onclick="openChapterModal()" class="btn-primary text-sm py-2.5 px-5"><i class="fas fa-plus text-xs"></i> Add Chapter</button>
          </div>
          <div class="rounded-xl overflow-hidden" style="background:var(--card);border:1px solid var(--border)">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead><tr style="background:var(--bg)">
                  <th class="text-left p-4 font-semibold">Chapter</th>
                  <th class="text-left p-4 font-semibold hidden md:table-cell">Country</th>
                  <th class="text-left p-4 font-semibold hidden lg:table-cell">Coordinator</th>
                  <th class="text-left p-4 font-semibold hidden lg:table-cell">Members</th>
                  <th class="text-left p-4 font-semibold">Actions</th>
                </tr></thead>
                <tbody id="chapters-mgmt-tbody"></tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Leadership Mgmt -->
        <div id="dash-leadership-mgmt" style="display:none">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <p class="text-sm" style="color:var(--muted)"><span id="leaders-count">0</span> leaders registered</p>
            <button onclick="openLeaderModal()" class="btn-primary text-sm py-2.5 px-5"><i class="fas fa-plus text-xs"></i> Add Leader</button>
          </div>
          <div id="leadership-mgmt-list" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>
        </div>

        <!-- Testimonials Mgmt -->
        <div id="dash-testimonials-mgmt" style="display:none">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <p class="text-sm" style="color:var(--muted)"><span id="testimonials-count">0</span> testimonials</p>
            <button onclick="openTestimonialModal()" class="btn-primary text-sm py-2.5 px-5"><i class="fas fa-plus text-xs"></i> Add Testimonial</button>
          </div>
          <div id="testimonials-mgmt-list" class="grid md:grid-cols-2 gap-6"></div>
        </div>
      </div>
    </section>
  `;

  // After rendering, load data into the grids
  renderHomeNews(data.news);
  renderHomeEvents(data.events);
  renderHomeGallery(data.gallery);
  renderHomeTestimonials(data.testimonials);
  renderHomeChapters(data.chapters);
  renderFooterChapters();
  
  // Initialize sliders after DOM update
  setTimeout(() => {
    initHomeSliders();
    initScrollReveal();
    initCounters();
  }, 100);
}

function renderHomeNews(news) {
  const grid = document.getElementById('home-news-grid');
  if (!grid) return;
  
  const items = news.slice(0, 3);
  grid.innerHTML = items.map((n, i) => `
    <article class="card-hover rounded-2xl overflow-hidden" style="background:var(--card);border:1px solid var(--border)">
      <div class="relative h-52 overflow-hidden">
        <img src="${n.image || 'https://picsum.photos/seed/news' + (i+1) + '/800/500'}" alt="${n.title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy">
        <span class="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold" style="background:var(--accent);color:#072A1F">${n.category || 'General'}</span>
      </div>
      <div class="p-6">
        <div class="flex items-center gap-3 text-xs mb-3" style="color:var(--muted)">
          <i class="fas fa-calendar"></i>
          <span>${new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>·</span>
          <span>${n.author || 'Admin'}</span>
        </div>
        <h3 class="font-display text-lg font-bold mb-2 line-clamp-2">${n.title}</h3>
        <p class="text-sm line-clamp-2 mb-4" style="color:var(--muted)">${n.description}</p>
        <a href="#" onclick="navigate('news')" class="text-sm font-semibold inline-flex items-center gap-1" style="color:var(--primary)">Read More <i class="fas fa-arrow-right text-xs"></i></a>
      </div>
    </article>
  `).join('');
}

function renderHomeEvents(events) {
  const grid = document.getElementById('home-events-grid');
  if (!grid) return;
  
  const items = events.slice(0, 3);
  grid.innerHTML = items.map(e => {
    const d = new Date(e.date);
    return `<div class="card-hover rounded-2xl overflow-hidden" style="background:var(--card);border:1px solid var(--border)">
      <div class="relative h-48 overflow-hidden">
        <img src="${e.poster || 'https://picsum.photos/seed/evt' + e.id + '/800/500'}" alt="${e.title}" class="w-full h-full object-cover" loading="lazy">
      </div>
      <div class="p-6">
        <div class="flex items-center gap-4 mb-3">
          <div class="text-center flex-shrink-0">
            <div class="font-display text-2xl font-bold" style="color:var(--accent)">${d.getDate()}</div>
            <div class="text-xs uppercase font-semibold" style="color:var(--muted)">${d.toLocaleDateString('en-GB', { month: 'short' })}</div>
          </div>
          <div class="flex-1">
            <h3 class="font-display font-bold mb-1">${e.title}</h3>
            <p class="text-xs flex items-center gap-1" style="color:var(--muted)"><i class="fas fa-map-marker-alt"></i> ${e.venue}</p>
          </div>
        </div>
        <p class="text-sm line-clamp-2 mb-4" style="color:var(--muted)">${e.description}</p>
        <a href="#" onclick="navigate('events')" class="text-sm font-semibold inline-flex items-center gap-1" style="color:var(--primary)">Details <i class="fas fa-arrow-right text-xs"></i></a>
      </div>
    </div>`;
  }).join('');
}

function renderHomeGallery(gallery) {
  const container = document.getElementById('home-gallery-swiper');
  if (!container) return;
  
  const items = gallery.slice(0, 8);
  container.innerHTML = items.map(g => `
    <div class="swiper-slide" style="width:auto;height:280px">
      <div class="gallery-item w-64 h-full" onclick="openLightbox('${g.src.replace('/600/', '/1200/')}')">
        <img src="${g.src}" alt="${g.caption || 'Gallery image'}" loading="lazy">
        <div class="gallery-overlay"><i class="fas fa-expand text-white text-xl"></i></div>
      </div>
    </div>
  `).join('');
}

function renderHomeTestimonials(testimonials) {
  const container = document.getElementById('testimonial-swiper-wrapper');
  if (!container) return;
  
  container.innerHTML = testimonials.map(t => `
    <div class="swiper-slide">
      <div class="testimonial-card rounded-2xl" style="background:var(--card);border:1px solid var(--border)">
        <p class="text-sm leading-relaxed mb-6 relative z-10" style="color:var(--muted)">${t.text}</p>
        <div class="flex items-center gap-3 relative z-10">
          <img src="${t.image || 'https://picsum.photos/seed/t' + t.id + '/100/100'}" class="w-12 h-12 rounded-full object-cover" alt="${t.name}">
          <div>
            <p class="font-semibold text-sm">${t.name}</p>
            <p class="text-xs" style="color:var(--muted)">${t.role || ''}</p>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderHomeChapters(chapters) {
  const grid = document.getElementById('home-chapters-grid');
  if (!grid) return;
  
  const items = chapters.slice(0, 3);
  grid.innerHTML = items.map(c => `
    <div class="card-hover rounded-2xl p-8" style="background:var(--card);border:1px solid var(--border)">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background:var(--primary)">
          <i class="fas fa-church text-accent-light"></i>
        </div>
        <div>
          <h3 class="font-display font-bold">${c.name}</h3>
          <p class="text-xs" style="color:var(--muted)">${c.country}</p>
        </div>
      </div>
      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span style="color:var(--muted)">Coordinator</span>
          <span class="font-medium">${c.coordinator || ''}</span>
        </div>
        <div class="flex justify-between">
          <span style="color:var(--muted)">Members</span>
          <span class="font-bold" style="color:var(--accent)">${(c.memberCount || c.members || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderFooterChapters() {
  const container = document.getElementById('footer-chapters');
  if (!container) return;
  
  const data = appData;
  if (!data) return;
  
  container.innerHTML = data.chapters.slice(0, 6).map(c => `
    <li class="text-sm"><i class="fas fa-map-pin text-[#C9A84C] mr-2 text-xs"></i>${c.name}</li>
  `).join('');
}

// ===== PAGE LOADERS =====
async function loadMembersPage() {
  try {
    const members = await API.getMembers();
    appData.members = members;
  } catch (error) {
    console.error('Failed to load members:', error);
  }
}

async function loadNewsPage() {
  try {
    const news = await API.getNews();
    appData.news = news;
    
    const cats = ['All', ...new Set(news.map(n => n.category).filter(Boolean))];
    const filterContainer = document.getElementById('news-filter-buttons');
    if (filterContainer) {
      filterContainer.innerHTML = cats.map((c, i) => `
        <button class="gallery-filter-btn ${i === 0 ? 'active' : ''}" onclick="filterNews('${c}', this)">${c}</button>
      `).join('');
    }
    renderNewsGrid(news);
  } catch (error) {
    console.error('Failed to load news:', error);
  }
}

function renderNewsGrid(news) {
  const grid = document.getElementById('news-full-grid');
  if (!grid) return;
  
  grid.innerHTML = news.map(n => `
    <article class="card-hover rounded-2xl overflow-hidden" style="background:var(--card);border:1px solid var(--border)">
      <div class="relative h-56 overflow-hidden">
        <img src="${n.image || 'https://picsum.photos/seed/news' + n.id + '/800/500'}" alt="${n.title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy">
        <span class="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold" style="background:var(--accent);color:#072A1F">${n.category || 'General'}</span>
      </div>
      <div class="p-6">
        <div class="flex items-center gap-3 text-xs mb-3" style="color:var(--muted)">
          <i class="fas fa-calendar"></i>
          <span>${new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>·</span>
          <span>${n.author || 'Admin'}</span>
        </div>
        <h3 class="font-display text-lg font-bold mb-3">${n.title}</h3>
        <p class="text-sm leading-relaxed mb-4" style="color:var(--muted)">${n.description}</p>
        <button onclick="showToast('Full article view coming soon.', 'success')" class="text-sm font-semibold inline-flex items-center gap-1" style="color:var(--primary)">Read Full Article <i class="fas fa-arrow-right text-xs"></i></button>
      </div>
    </article>
  `).join('');
}

function filterNews(category, button) {
  const data = appData;
  if (!data) return;
  
  document.querySelectorAll('#news-filter-buttons .gallery-filter-btn').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  
  const filtered = category === 'All' 
    ? data.news 
    : data.news.filter(n => n.category === category);
  renderNewsGrid(filtered);
}

async function loadEventsPage() {
  try {
    const events = await API.getEvents();
    appData.events = events;
    
    const grid = document.getElementById('events-full-grid');
    if (!grid) return;
    
    grid.innerHTML = events.map(e => {
      const d = new Date(e.date);
      const ed = e.endDate ? new Date(e.endDate) : null;
      return `<div class="card-hover rounded-2xl overflow-hidden" style="background:var(--card);border:1px solid var(--border)">
        <div class="relative h-56 overflow-hidden">
          <img src="${e.poster || 'https://picsum.photos/seed/evt' + e.id + '/800/500'}" alt="${e.title}" class="w-full h-full object-cover" loading="lazy">
          <div class="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold" style="background:var(--primary);color:#E8D48B">${e.category || 'General'}</div>
        </div>
        <div class="p-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="text-center flex-shrink-0 w-14 py-2 rounded-xl" style="background:rgba(201,168,76,.1)">
              <div class="font-display text-xl font-bold" style="color:var(--accent)">${d.getDate()}</div>
              <div class="text-xs uppercase font-bold" style="color:var(--accent)">${d.toLocaleDateString('en-GB', { month: 'short' })}</div>
            </div>
            <div>
              <h3 class="font-display text-lg font-bold">${e.title}</h3>
              <p class="text-xs" style="color:var(--muted)">${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}${ed && ed !== d ? ' — ' + ed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
            </div>
          </div>
          <div class="space-y-2 text-sm mb-4">
            <p class="flex items-center gap-2" style="color:var(--muted)"><i class="fas fa-map-marker-alt w-4 text-center" style="color:var(--accent)"></i>${e.venue}</p>
            <p class="flex items-center gap-2" style="color:var(--muted)"><i class="fas fa-user-tie w-4 text-center" style="color:var(--accent)"></i>${e.organizer || ''}</p>
          </div>
          <p class="text-sm leading-relaxed mb-5" style="color:var(--muted)">${e.description}</p>
          <button onclick="showToast('Event registration coming soon.', 'success')" class="btn-primary text-sm py-2.5 px-5 w-full justify-center"><i class="fas fa-ticket text-xs"></i> Register</button>
        </div>
      </div>`;
    }).join('');
  } catch (error) {
    console.error('Failed to load events:', error);
  }
}

async function loadGalleryPage() {
  try {
    const gallery = await API.getGallery();
    appData.gallery = gallery;
    
    const cats = ['All', ...new Set(gallery.map(g => g.category).filter(Boolean))];
    const filterContainer = document.getElementById('gallery-filter-buttons');
    if (filterContainer) {
      filterContainer.innerHTML = cats.map((c, i) => `
        <button class="gallery-filter-btn ${i === 0 ? 'active' : ''}" onclick="filterGallery('${c}', this)">${c}</button>
      `).join('');
    }
    renderGalleryGrid(gallery);
  } catch (error) {
    console.error('Failed to load gallery:', error);
  }
}

function renderGalleryGrid(gallery) {
  const grid = document.getElementById('gallery-full-grid');
  if (!grid) return;
  
  grid.innerHTML = gallery.map((g, i) => `
    <div class="gallery-item ${i % 3 === 1 ? 'row-span-2' : ''}" style="height:${i % 3 === 1 ? '100%' : '240px'}" onclick="openLightbox('${g.src.replace('/600/', '/1200/')}')">
      <img src="${g.src}" alt="${g.caption || 'Gallery image'}" loading="lazy">
      <div class="gallery-overlay flex-col gap-2">
        <i class="fas fa-expand text-white text-xl"></i>
        <span class="text-white text-sm font-medium">${g.caption || ''}</span>
      </div>
    </div>
  `).join('');
}

function filterGallery(category, button) {
  const data = appData;
  if (!data) return;
  
  document.querySelectorAll('#gallery-filter-buttons .gallery-filter-btn').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  
  const filtered = category === 'All' 
    ? data.gallery 
    : data.gallery.filter(g => g.category === category);
  renderGalleryGrid(filtered);
}

async function loadLeadershipPage() {
  try {
    const leaders = await API.getLeaders();
    appData.leaders = leaders;
    
    const grid = document.getElementById('leadership-grid');
    if (!grid) return;
    
    grid.innerHTML = leaders.map(l => `
      <div class="card-hover rounded-2xl overflow-hidden" style="background:var(--card);border:1px solid var(--border)">
        <div class="relative h-72 overflow-hidden">
          <img src="${l.image || 'https://picsum.photos/seed/l' + l.id + '/400/500'}" alt="${l.name}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy">
          <div class="absolute bottom-0 left-0 right-0 p-4" style="background:linear-gradient(transparent,rgba(0,0,0,.8))">
            <h3 class="font-display font-bold text-white">${l.name}</h3>
            <p class="text-accent-light text-sm font-medium">${l.position}</p>
          </div>
        </div>
        <div class="p-5">
          <p class="text-sm leading-relaxed mb-4" style="color:var(--muted)">${l.bio || ''}</p>
          <div class="flex items-center gap-2 text-sm" style="color:var(--muted)">
            <i class="fas fa-phone text-xs" style="color:var(--accent)"></i>${l.contact || ''}
          </div>
        </div>
      </div>
    `).join('');
    
    setTimeout(initScrollReveal, 50);
  } catch (error) {
    console.error('Failed to load leaders:', error);
  }
}

function loadAboutPage() {
  // About page is static content in the HTML
}

function loadContactPage() {
  // Contact page is static content in the HTML
}

// ===== MEMBER SEARCH =====
async function handleMemberSearch(query) {
  const results = document.getElementById('member-search-results');
  if (!query || query.trim().length < 1) { 
    results.innerHTML = ''; 
    return; 
  }
  
  try {
    const found = await API.searchMembers(query.trim());
    
    if (!found || found.length === 0) {
      results.innerHTML = `<div class="text-center py-12">
        <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style="background:var(--card);border:1px solid var(--border)">
          <i class="fas fa-user-slash text-2xl" style="color:var(--muted)"></i>
        </div>
        <h3 class="font-display text-xl font-bold mb-2">No Member Found</h3>
        <p style="color:var(--muted)">No member matches "${query}".</p>
      </div>`;
      return;
    }
    
    results.innerHTML = found.map(m => `
      <div class="member-verification-card p-6 lg:p-8 mb-6" style="animation:fadeInUp .5s ease">
        <div class="flex flex-col sm:flex-row gap-6">
          <div class="flex-shrink-0">
            <img src="${m.profilePicture || 'https://picsum.photos/seed/m' + m.id + '/200/200'}" alt="${m.fullName}" class="w-28 h-28 rounded-xl object-cover mx-auto sm:mx-0" style="border:3px solid var(--accent)">
          </div>
          <div class="flex-1 text-white">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 class="font-display text-xl font-bold">${m.fullName}</h3>
                <p class="text-white/60 text-sm">${m.title || 'Member'}</p>
              </div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit" style="background:rgba(34,197,94,.2);color:#86EFAC;border:1px solid rgba(34,197,94,.3)">
                <i class="fas fa-check-circle"></i> ${m.membershipStatus || 'Active'}
              </span>
            </div>
            <div class="gold-line"></div>
            <div class="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
              <div><span class="text-white/40 block text-xs mb-0.5">Member Number</span><span class="font-mono font-semibold" style="color:#E8D48B">${m.memberNumber}</span></div>
              <div><span class="text-white/40 block text-xs mb-0.5">Chapter</span><span>${m.chapter?.name || m.chapter || ''}</span></div>
              <div><span class="text-white/40 block text-xs mb-0.5">Country</span><span>${m.country || ''}</span></div>
              <div><span class="text-white/40 block text-xs mb-0.5">Date Joined</span><span>${m.dateJoined ? new Date(m.dateJoined).toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'}) : ''}</span></div>
              <div><span class="text-white/40 block text-xs mb-0.5">Position</span><span>${m.position || ''}</span></div>
              <div><span class="text-white/40 block text-xs mb-0.5">Baptism</span><span>${m.baptismStatus || 'Not Baptized'}</span></div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    results.innerHTML = `<div class="text-center py-12"><p style="color:var(--muted)">Error searching members. Please try again.</p></div>`;
    console.error('Search error:', error);
  }
}

// ===== DASHBOARD FUNCTIONS =====
// ===== DASHBOARD STATS =====
function updateDashboardStats() {
  const data = appData || window.appData || currentData;
  if (!data) {
    console.log('📊 No data available for stats');
    return;
  }
  
  const sm = document.getElementById('stat-members');
  const sn = document.getElementById('stat-news');
  const se = document.getElementById('stat-events');
  const sg = document.getElementById('stat-gallery');
  
  if (sm) sm.textContent = (data.members?.length || 0).toLocaleString();
  if (sn) sn.textContent = data.news?.length || 0;
  if (se) se.textContent = data.events?.length || 0;
  if (sg) sg.textContent = data.gallery?.length || 0;
  
  console.log('📊 Stats updated:', {
    members: data.members?.length || 0,
    news: data.news?.length || 0,
    events: data.events?.length || 0,
    gallery: data.gallery?.length || 0
  });
}

// ===== DASHBOARD CHARTS =====
function initDashboardCharts() {
  // ✅ Prevent multiple chart instances
  if (window._chartsInitialized) {
    console.log('📊 Charts already initialized, skipping...');
    return;
  }
  
  // Check if chart containers exist
  const growthEl = document.getElementById('growthChart');
  const countryEl = document.getElementById('countryChart');
  
  if (!growthEl || !countryEl) {
    console.log('📊 Chart containers not ready yet');
    return;
  }
  
  console.log('📊 Initializing dashboard charts...');
  
  // Destroy existing charts
  if (chartInstances.growth) {
    chartInstances.growth.destroy();
    delete chartInstances.growth;
  }
  if (chartInstances.country) {
    chartInstances.country.destroy();
    delete chartInstances.country;
  }
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#8A9490' : '#7A7468';
  
  // Growth Chart
  chartInstances.growth = new Chart(growthEl, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Members',
        data: [18200, 18400, 18700, 19000, 19100, 19200, 19400, 19600, 19800, 20000, 20200, 20500],
        borderColor: '#1A6B55',
        backgroundColor: 'rgba(26,107,85,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#C9A84C',
        pointBorderWidth: 2,
        pointBorderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false } 
      },
      scales: {
        x: { 
          grid: { color: gridColor }, 
          ticks: { color: textColor, font: { size: 11 } } 
        },
        y: { 
          grid: { color: gridColor }, 
          ticks: { 
            color: textColor, 
            font: { size: 11 }, 
            callback: v => v >= 1000 ? (v/1000) + 'k' : v 
          } 
        }
      },
      animation: {
        duration: 500
      }
    }
  });
  
  // Country Chart
  chartInstances.country = new Chart(countryEl, {
    type: 'doughnut',
    data: {
      labels: ['South Sudan', 'Uganda', 'Kenya', 'Ethiopia'],
      datasets: [{
        data: [15500, 2950, 2350, 850],
        backgroundColor: ['#0B3D2E', '#1A6B55', '#C9A84C', '#E8D48B'],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { 
            color: textColor, 
            padding: 12, 
            usePointStyle: true, 
            pointStyleWidth: 10, 
            font: { size: 11 } 
          }
        }
      },
      animation: {
        duration: 500
      }
    }
  });
  
  // ✅ Mark as initialized
  window._chartsInitialized = true;
  console.log('✅ Dashboard charts initialized successfully');
}
// ===== RESET DASHBOARD CHARTS =====
function resetDashboardCharts() {
  console.log('🔄 Resetting dashboard charts...');
  
  // Destroy existing chart instances
  if (chartInstances.growth) {
    chartInstances.growth.destroy();
    delete chartInstances.growth;
  }
  if (chartInstances.country) {
    chartInstances.country.destroy();
    delete chartInstances.country;
  }
  
  // Reset initialization flag
  window._chartsInitialized = false;
  chartInstances = {};
  
  console.log('✅ Charts reset successfully');
}
// ===== EXPOSE GLOBAL FUNCTIONS =====
window.navigate = navigate;
window.toggleTheme = toggleTheme;
window.toggleMobileMenu = toggleMobileMenu;
window.showToast = showToast;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.openModal = openModal;
window.closeModal = closeModal;
window.handleModalSave = handleModalSave;
window.showConfirm = showConfirm;
window.closeConfirm = closeConfirm;
window.executeConfirm = executeConfirm;
window.handleImageUpload = handleImageUpload;
window.getUploadedImage = getUploadedImage;
window.imageUploadHtml = imageUploadHtml;
window.formField = formField;
window.sectionTitle = sectionTitle;
window.getFormData = getFormData;
window.initScrollReveal = initScrollReveal;
window.initCounters = initCounters;
window.filterNews = filterNews;
window.filterGallery = filterGallery;
window.handleMemberSearch = handleMemberSearch;
window.loadPublicData = loadPublicData;
window.loadNewsPage = loadNewsPage;
window.loadEventsPage = loadEventsPage;
window.loadGalleryPage = loadGalleryPage;
window.loadLeadershipPage = loadLeadershipPage;
window.loadMembersPage = loadMembersPage;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function() {
  await loadPublicData();
  
  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
    document.body.style.overflow = '';
  }, 800);
  document.body.style.overflow = 'hidden';
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeLightbox();
      if (document.getElementById('mobile-menu').classList.contains('open')) toggleMobileMenu();
      if (document.getElementById('crud-modal').classList.contains('open')) closeModal();
      if (document.getElementById('confirm-dialog').classList.contains('open')) closeConfirm();
    }
  });
  
  document.getElementById('mobile-menu')?.addEventListener('click', function(e) {
    if (e.target === this) toggleMobileMenu();
  });
});