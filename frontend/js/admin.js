// Admin Panel Logic
let modalState = { entity: null, editId: null };
let currentData = { members: [], news: [], events: [], gallery: [], chapters: [], leaders: [], testimonials: [] };
let galleryMgmtFilter = 'All';

// Make modalState globally available
window.modalState = modalState;

// ============================================
// ===== HELPER: Reset Modal State =====
// ============================================

function resetModalState() {
  console.log('🔄 Resetting modal state');
  modalState = { entity: null, editId: null };
  window.modalState = modalState;
  
  // Re-enable save button
  const saveBtn = document.getElementById('modal-save-btn');
  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Save';
  }
}

// ============================================
// ===== ADMIN LOGIN =====
// ============================================

async function handleAdminLogin() {
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;
  
  if (!username || !password) {
    showToast('Please enter username and password.', 'error');
    return;
  }
  
  try {
    console.log('🔐 Attempting login...');
    const data = await API.adminLogin(username, password);
    console.log('✅ Login successful:', data);
    
    window.isAdminLoggedIn = true;
    showToast('Welcome back, Administrator!', 'success');
    
    // Navigate to dashboard
    navigate('dashboard');
    
  } catch (error) {
    console.error('❌ Login error:', error);
    showToast('Invalid username or password.', 'error');
  }
}

function handleAdminLogout() {
  API.adminLogout();
  window.isAdminLoggedIn = false;
  showToast('Logged out.', 'success');
  navigate('home');
}

// ============================================
// ===== LOAD ADMIN DATA =====
// ============================================

async function loadAdminData() {
  try {
    console.log('📊 Loading admin data...');
    
    const [members, news, events, gallery, chapters, leaders, testimonials] = await Promise.all([
      API.getMembers().catch(err => { console.error('Members error:', err); return []; }),
      API.getNews().catch(err => { console.error('News error:', err); return []; }),
      API.getEvents().catch(err => { console.error('Events error:', err); return []; }),
      API.getGallery().catch(err => { console.error('Gallery error:', err); return []; }),
      API.getChapters().catch(err => { console.error('Chapters error:', err); return []; }),
      API.getLeaders().catch(err => { console.error('Leaders error:', err); return []; }),
      API.getTestimonials().catch(err => { console.error('Testimonials error:', err); return []; })
    ]);
    
    currentData = { members, news, events, gallery, chapters, leaders, testimonials };
    window.appData = currentData;
    
    console.log('✅ Admin data loaded:', {
      members: members.length,
      news: news.length,
      events: events.length,
      gallery: gallery.length,
      chapters: chapters.length,
      leaders: leaders.length,
      testimonials: testimonials.length
    });
    
    // ✅ Update stats only once
    updateDashboardStats();
    
    // ✅ Initialize charts only once
    if (!window._chartsInitialized) {
      initDashboardCharts();
    }
    
    // Add PDF buttons after data loads
    setTimeout(addPDFButtons, 200);
    
  } catch (error) {
    console.error('❌ Failed to load admin data:', error);
    showToast('Failed to load data. Please refresh.', 'error');
  }
}
// ============================================
// ===== DASHBOARD TABS =====
// ============================================

function switchDashTab(tab, element) {
  if (event) event.preventDefault();
  
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  if (element) element.classList.add('active');
  
  ['overview', 'members-mgmt', 'news-mgmt', 'events-mgmt', 'gallery-mgmt', 'chapters-mgmt', 'leadership-mgmt', 'testimonials-mgmt', 'placeholder'].forEach(t => {
    const el = document.getElementById(`dash-${t}`);
    if (el) el.style.display = 'none';
  });
  
  const target = document.getElementById(`dash-${tab}`);
  if (target) target.style.display = 'block';
  
  const titleMap = {
    overview: 'Dashboard Overview',
    'members-mgmt': 'Members Management',
    'news-mgmt': 'News Management',
    'events-mgmt': 'Events Management',
    'gallery-mgmt': 'Gallery Management',
    'chapters-mgmt': 'Chapters Management',
    'leadership-mgmt': 'Leadership Management',
    'testimonials-mgmt': 'Testimonials Management'
  };
  
  const titleEl = document.getElementById('dash-title');
  if (titleEl) titleEl.textContent = titleMap[tab] || 'Management';
  
  switch(tab) {
    case 'overview':
      // ✅ Reset charts flag when switching to overview
      window._chartsInitialized = false;
      setTimeout(() => {
        updateDashboardStats();
        if (!window._chartsInitialized) {
          initDashboardCharts();
        }
      }, 100);
      break;
    case 'members-mgmt':
      renderAdminMembersTable(currentData.members);
      setTimeout(addPDFButtons, 100);
      break;
    case 'news-mgmt':
      renderAdminNewsList(currentData.news);
      break;
    case 'events-mgmt':
      renderAdminEventsList(currentData.events);
      break;
    case 'gallery-mgmt':
      renderAdminGalleryList(currentData.gallery);
      break;
    case 'chapters-mgmt':
      renderAdminChaptersTable(currentData.chapters);
      break;
    case 'leadership-mgmt':
      renderAdminLeadersList(currentData.leaders);
      break;
    case 'testimonials-mgmt':
      renderAdminTestimonialsList(currentData.testimonials);
      break;
  }
  
  document.getElementById('admin-sidebar')?.classList.remove('open');
}

function updateDashboardStats() {
  const sm = document.getElementById('stat-members');
  const sn = document.getElementById('stat-news');
  const se = document.getElementById('stat-events');
  const sg = document.getElementById('stat-gallery');
  
  if (sm) sm.textContent = currentData.members.length.toLocaleString();
  if (sn) sn.textContent = currentData.news.length;
  if (se) se.textContent = currentData.events.length;
  if (sg) sg.textContent = currentData.gallery.length;
}

function initDashboardCharts() {
  Object.values(window.chartInstances || {}).forEach(c => c.destroy());
  window.chartInstances = {};
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#8A9490' : '#7A7468';
  
  const growthEl = document.getElementById('growthChart');
  if (growthEl) {
    window.chartInstances.growth = new Chart(growthEl, {
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
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 }, callback: v => v >= 1000 ? (v/1000) + 'k' : v } }
        }
      }
    });
  }
  
  const countryEl = document.getElementById('countryChart');
  if (countryEl) {
    window.chartInstances.country = new Chart(countryEl, {
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
            labels: { color: textColor, padding: 12, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } }
          }
        }
      }
    });
  }
}

// ============================================
// ===== ADMIN MEMBERS CRUD =====
// ============================================

function renderAdminMembersTable(members) {
  const tbody = document.getElementById('admin-members-tbody');
  if (!tbody) return;
  
  if (!members || members.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center" style="color:var(--muted)">No members found. Add your first member!</td></tr>`;
    return;
  }
  
  tbody.innerHTML = members.map(m => `
    <tr style="border-top:1px solid var(--border)">
      <td class="p-4">
        <div class="flex items-center gap-3">
          <img src="${m.profilePicture || 'https://picsum.photos/seed/m' + m.id + '/200/200'}" class="w-9 h-9 rounded-full object-cover" alt="">
          <div>
            <p class="font-medium text-sm">${m.fullName || 'Unknown'}</p>
            <p class="text-xs" style="color:var(--muted)">${m.email || ''}</p>
          </div>
        </div>
      </td>
      <td class="p-4 hidden md:table-cell font-mono text-sm" style="color:var(--accent)">${m.memberNumber || 'N/A'}</td>
      <td class="p-4 hidden lg:table-cell text-sm">${m.chapter?.name || m.chapter || ''}</td>
      <td class="p-4 hidden lg:table-cell">
        <span class="px-2 py-1 rounded-full text-xs font-medium" style="background:${m.membershipStatus === 'Active' ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)'};color:${m.membershipStatus === 'Active' ? '#16A34A' : '#EF4444'}">${m.membershipStatus || 'Active'}</span>
      </td>
      <td class="p-4">
        <div class="flex gap-2">
          <button class="action-btn view" onclick="viewMember(${m.id})" title="View"><i class="fas fa-eye"></i></button>
          <button class="action-btn edit" onclick="openMemberModal(${m.id})" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" onclick="deleteMember(${m.id})" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterAdminMembers(query) {
  const filtered = currentData.members.filter(m => 
    m.fullName.toLowerCase().includes(query.toLowerCase()) || 
    m.memberNumber.toLowerCase().includes(query.toLowerCase())
  );
  renderAdminMembersTable(filtered);
}

async function viewMember(id) {
  try {
    const member = await API.getMember(id);
    if (!member) return;
    
    const html = `
      <div class="member-verification-card p-6">
        <div class="flex flex-col sm:flex-row gap-6">
          <div class="flex-shrink-0">
            <img src="${member.profilePicture || 'https://picsum.photos/seed/m' + member.id + '/200/200'}" class="w-24 h-24 rounded-xl object-cover mx-auto sm:mx-0" style="border:3px solid var(--accent)" alt="">
          </div>
          <div class="flex-1 text-white">
            <h3 class="font-display text-xl font-bold">${member.fullName}</h3>
            <p class="text-white/60 text-sm mb-3">${member.title || 'Member'} — ${member.memberNumber}</p>
            <div class="gold-line"></div>
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 text-sm">
              <div><span class="text-white/40 block text-xs">Chapter</span>${member.chapter?.name || member.chapter || ''}</div>
              <div><span class="text-white/40 block text-xs">Phone</span>${member.phone || ''}</div>
              <div><span class="text-white/40 block text-xs">Position</span>${member.position || ''}</div>
              <div><span class="text-white/40 block text-xs">Status</span>${member.membershipStatus || 'Active'}</div>
              <div><span class="text-white/40 block text-xs">Joined</span>${member.dateJoined || ''}</div>
              <div><span class="text-white/40 block text-xs">Baptism</span>${member.baptismStatus || 'Not Baptized'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    openModal('Member Details', html);
    document.getElementById('modal-save-btn').style.display = 'none';
    setTimeout(() => {
      const btn = document.getElementById('modal-save-btn');
      if (btn) btn.style.display = '';
    }, 0);
  } catch (error) {
    showToast('Failed to load member details.', 'error');
  }
}

function openMemberModal(id) {
  const member = id ? currentData.members.find(m => m.id === id) : null;
  const isEdit = !!member;
  
  // ✅ CRITICAL: Set modal state
  modalState.entity = 'members';
  modalState.editId = id || null;
  
  console.log('🔵 Opening member modal:', { entity: modalState.entity, editId: modalState.editId });
  
  const chapterOptions = currentData.chapters.map(c => c.name);
  
  const html = `
    <form id="crud-form" onsubmit="event.preventDefault()">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${sectionTitle('Personal Information')}
        ${formField('Full Name *', 'fullName', member?.fullName || '', 'text', { required: true, placeholder: 'Full name' })}
        ${formField('Title', 'title', member?.title || 'Member', 'select', { options: ['Bishop', 'Pastor', 'Elder', 'Deacon', 'Deaconess', 'Evangelist', 'Minister', 'Youth Leader', 'Member', 'Brother', 'Sister', 'Coordinator'] })}
        ${formField('Gender *', 'gender', member?.gender || 'Male', 'select', { options: ['Male', 'Female'] })}
        ${formField('Date of Birth', 'dateOfBirth', member?.dateOfBirth || '', 'date')}
        ${formField('Phone *', 'phone', member?.phone || '', 'tel', { required: true, placeholder: '+211 ...' })}
        ${formField('Email', 'email', member?.email || '', 'email', { placeholder: 'email@example.com' })}
        ${formField('Nationality', 'nationality', member?.nationality || 'South Sudanese')}
        ${formField('Occupation', 'occupation', member?.occupation || '')}
        ${sectionTitle('Location')}
        ${formField('Country *', 'country', member?.country || 'South Sudan', 'select', { options: ['South Sudan', 'Uganda', 'Kenya', 'Ethiopia', 'Sudan', 'Other'] })}
        ${formField('State/Region', 'state', member?.state || '')}
        ${formField('City', 'city', member?.city || '')}
        ${formField('Refugee Camp', 'refugeeCamp', member?.refugeeCamp || '', 'text', { placeholder: 'Leave empty if N/A' })}
        ${formField('Local Church', 'localChurch', member?.localChurch || '')}
        ${formField('Chapter', 'chapterId', member?.chapterId || '', 'select', { options: currentData.chapters.map(c => ({ value: c.id, label: c.name })) })}
        ${sectionTitle('Ministry Details')}
        ${formField('Position', 'position', member?.position || '')}
        ${formField('Date Joined', 'dateJoined', member?.dateJoined || new Date().toISOString().split('T')[0], 'date')}
        ${formField('Membership Status', 'membershipStatus', member?.membershipStatus || 'Active', 'select', { options: ['Active', 'Inactive', 'Suspended'] })}
        ${formField('Baptism Status', 'baptismStatus', member?.baptismStatus || 'Not Baptized', 'select', { options: ['Baptized', 'Not Baptized', 'In Progress'] })}
        ${formField('Biography', 'biography', member?.biography || '', 'textarea', { rows: 3 })}
        ${sectionTitle('Profile Picture')}
        <div class="col-span-full">${imageUploadHtml('member-img', member?.profilePicture || '', 'Upload profile photo')}</div>
        ${sectionTitle('Emergency Contact')}
        ${formField('Contact Name', 'emergencyContactName', member?.emergencyContactName || '')}
        ${formField('Contact Phone', 'emergencyContactPhone', member?.emergencyContactPhone || '', 'tel')}
        ${formField('Relationship', 'emergencyContactRelation', member?.emergencyContactRelation || '', 'select', { options: ['Spouse', 'Father', 'Mother', 'Brother', 'Sister', 'Other'] })}
      </div>
    </form>
  `;
  
  openModal(isEdit ? 'Edit Member' : 'Add New Member', html);
}

async function saveMember() {
  console.log('🔵 saveMember() called');
  console.log('📋 modalState:', modalState);
  
  const form = document.getElementById('crud-form');
  if (!form) {
    console.error('❌ Form not found!');
    showToast('Form not found.', 'error');
    return;
  }
  
  const data = getFormData(form);
  console.log('📋 Form data:', data);
  
  const image = getUploadedImage('member-img');
  
  // Validate required fields
  if (!data.fullName || !data.phone || !data.gender || !data.country) {
    showToast('Please fill in all required fields (Full Name, Phone, Gender, Country).', 'error');
    return;
  }
  
  const memberData = {
    fullName: data.fullName.trim(),
    title: data.title || 'Member',
    gender: data.gender,
    dateOfBirth: data.dateOfBirth || null,
    phone: data.phone.trim(),
    email: data.email || null,
    nationality: data.nationality || 'South Sudanese',
    country: data.country,
    state: data.state || null,
    city: data.city || null,
    refugeeCamp: data.refugeeCamp || null,
    localChurch: data.localChurch || null,
    chapterId: data.chapterId || null,
    position: data.position || null,
    dateJoined: data.dateJoined || new Date().toISOString().split('T')[0],
    membershipStatus: data.membershipStatus || 'Active',
    baptismStatus: data.baptismStatus || 'Not Baptized',
    occupation: data.occupation || null,
    biography: data.biography || null,
    emergencyContactName: data.emergencyContactName || null,
    emergencyContactPhone: data.emergencyContactPhone || null,
    emergencyContactRelation: data.emergencyContactRelation || null
  };
  
  if (image) {
    memberData.profilePicture = image;
  }
  
  console.log('📤 Sending member data:', memberData);
  
  // Disable save button to prevent double clicks
  const saveBtn = document.getElementById('modal-save-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  }
  
  try {
    let result;
    if (modalState.editId) {
      console.log('🔄 Updating member ID:', modalState.editId);
      result = await API.updateMember(modalState.editId, memberData);
      const index = currentData.members.findIndex(m => m.id === modalState.editId);
      if (index !== -1) currentData.members[index] = result;
      showToast('Member updated successfully!', 'success');
    } else {
      console.log('➕ Creating new member...');
      result = await API.createMember(memberData);
      currentData.members.unshift(result);
      showToast('Member added successfully!', 'success');
    }
    
    console.log('✅ API Response:', result);
    
    // ✅ Reset modal state before closing
    resetModalState();
    
    // ✅ Close modal and refresh the list
    closeModal();
    renderAdminMembersTable(currentData.members);
    updateDashboardStats();
    
  } catch (error) {
    console.error('❌ Save error:', error);
    showToast('Error: ' + error.message, 'error');
    
    // Re-enable save button on error
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Save';
    }
  }
}

async function deleteMember(id) {
  const member = currentData.members.find(m => m.id === id);
  showConfirm('Delete Member', `Are you sure you want to delete "${member?.fullName}"?`, async () => {
    try {
      await API.deleteMember(id);
      currentData.members = currentData.members.filter(m => m.id !== id);
      renderAdminMembersTable(currentData.members);
      updateDashboardStats();
      showToast('Member deleted successfully.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete member.', 'error');
    }
  });
}

// ============================================
// ===== ADMIN NEWS CRUD =====
// ============================================

function renderAdminNewsList(news) {
  const container = document.getElementById('news-mgmt-list');
  if (!container) return;
  
  if (!news || news.length === 0) {
    container.innerHTML = `<p class="text-center py-12 col-span-full" style="color:var(--muted)">No news articles found.</p>`;
    return;
  }
  
  container.innerHTML = news.map(n => `
    <div class="mgmt-card">
      <div class="relative h-40 overflow-hidden">
        <img src="${n.image || 'https://picsum.photos/seed/news' + n.id + '/800/500'}" class="w-full h-full object-cover" alt="">
        <span class="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-semibold" style="background:var(--accent);color:#072A1F">${n.category || 'General'}</span>
      </div>
      <div class="p-4">
        <h4 class="font-semibold text-sm mb-1 line-clamp-2">${n.title}</h4>
        <p class="text-xs mb-3" style="color:var(--muted)">${n.date} · ${n.author || 'Admin'}</p>
        <div class="flex gap-2">
          <button class="action-btn edit" onclick="openNewsModal(${n.id})"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" onclick="deleteNewsItem(${n.id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterAdminNews(query) {
  const filtered = currentData.news.filter(n => 
    n.title.toLowerCase().includes(query.toLowerCase())
  );
  renderAdminNewsList(filtered);
}

function openNewsModal(id) {
  const news = id ? currentData.news.find(n => n.id === id) : null;
  
  // ✅ Set modal state
  modalState.entity = 'news';
  modalState.editId = id || null;
  
  console.log('🔵 Opening news modal:', { entity: modalState.entity, editId: modalState.editId });
  
  const html = `
    <form id="crud-form" onsubmit="event.preventDefault()">
      <div class="space-y-4">
        ${formField('Title *', 'title', news?.title || '', 'text', { required: true, placeholder: 'Article title' })}
        ${formField('Description *', 'description', news?.description || '', 'textarea', { required: true, rows: 4, placeholder: 'Article content' })}
        <div class="grid grid-cols-2 gap-4">
          ${formField('Date *', 'date', news?.date || new Date().toISOString().split('T')[0], 'date', { required: true })}
          ${formField('Author', 'author', news?.author || '', 'text', { placeholder: 'Author name' })}
        </div>
        ${formField('Category', 'category', news?.category || 'General', 'select', { options: ['Conference', 'Youth', 'Women', 'Chapters', 'Evangelism', 'Worship', 'General'] })}
        <div>${imageUploadHtml('news-img', news?.image || '', 'Upload news image')}</div>
      </div>
    </form>
  `;
  
  openModal(id ? 'Edit News Article' : 'Add News Article', html);
}

async function saveNews() {
  console.log('🔵 saveNews() called');
  
  const form = document.getElementById('crud-form');
  if (!form) {
    showToast('Form not found.', 'error');
    return;
  }
  
  const data = getFormData(form);
  const image = getUploadedImage('news-img');
  
  if (!data.title || !data.description) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }
  
  // Disable save button
  const saveBtn = document.getElementById('modal-save-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  }
  
  try {
    let result;
    if (modalState.editId) {
      result = await API.updateNews(modalState.editId, { ...data, image: image || undefined });
      const index = currentData.news.findIndex(n => n.id === modalState.editId);
      if (index !== -1) currentData.news[index] = result;
      showToast('News updated successfully.', 'success');
    } else {
      result = await API.createNews({ ...data, image: image || undefined });
      currentData.news.unshift(result);
      showToast('News created successfully.', 'success');
    }
    
    // ✅ Reset modal state
    resetModalState();
    closeModal();
    renderAdminNewsList(currentData.news);
    updateDashboardStats();
    
  } catch (error) {
    showToast(error.message || 'Failed to save news.', 'error');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Save';
    }
  }
}

async function deleteNewsItem(id) {
  const news = currentData.news.find(n => n.id === id);
  showConfirm('Delete News', `Delete "${news?.title}"?`, async () => {
    try {
      await API.deleteNews(id);
      currentData.news = currentData.news.filter(n => n.id !== id);
      renderAdminNewsList(currentData.news);
      updateDashboardStats();
      showToast('News deleted successfully.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete news.', 'error');
    }
  });
}

// ============================================
// ===== ADMIN EVENTS CRUD =====
// ============================================

function renderAdminEventsList(events) {
  const container = document.getElementById('events-mgmt-list');
  if (!container) return;
  
  if (!events || events.length === 0) {
    container.innerHTML = `<p class="text-center py-12 col-span-full" style="color:var(--muted)">No events found.</p>`;
    return;
  }
  
  container.innerHTML = events.map(e => `
    <div class="mgmt-card flex flex-col sm:flex-row">
      <div class="sm:w-48 h-40 sm:h-auto flex-shrink-0 overflow-hidden">
        <img src="${e.poster || 'https://picsum.photos/seed/evt' + e.id + '/800/500'}" class="w-full h-full object-cover" alt="">
      </div>
      <div class="p-4 flex-1">
        <span class="px-2 py-0.5 rounded text-xs font-semibold" style="background:var(--primary);color:#E8D48B">${e.category || 'General'}</span>
        <h4 class="font-semibold mt-2 mb-1">${e.title}</h4>
        <p class="text-xs mb-1" style="color:var(--muted)"><i class="fas fa-calendar mr-1"></i>${e.date}${e.endDate && e.endDate !== e.date ? ' — ' + e.endDate : ''}</p>
        <p class="text-xs mb-3" style="color:var(--muted)"><i class="fas fa-map-marker-alt mr-1"></i>${e.venue}</p>
        <div class="flex gap-2">
          <button class="action-btn edit" onclick="openEventModal(${e.id})"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" onclick="deleteEventItem(${e.id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterAdminEvents(query) {
  const filtered = currentData.events.filter(e => 
    e.title.toLowerCase().includes(query.toLowerCase())
  );
  renderAdminEventsList(filtered);
}

function openEventModal(id) {
  const event = id ? currentData.events.find(e => e.id === id) : null;
  
  // ✅ Set modal state
  modalState.entity = 'events';
  modalState.editId = id || null;
  
  console.log('🔵 Opening event modal:', { entity: modalState.entity, editId: modalState.editId });
  
  const html = `
    <form id="crud-form" onsubmit="event.preventDefault()">
      <div class="space-y-4">
        ${formField('Event Title *', 'title', event?.title || '', 'text', { required: true, placeholder: 'Event title' })}
        ${formField('Description *', 'description', event?.description || '', 'textarea', { required: true, rows: 3 })}
        <div class="grid grid-cols-2 gap-4">
          ${formField('Start Date *', 'date', event?.date || '', 'date', { required: true })}
          ${formField('End Date', 'endDate', event?.endDate || '', 'date')}
        </div>
        ${formField('Venue *', 'venue', event?.venue || '', 'text', { required: true, placeholder: 'Event venue' })}
        ${formField('Organizer', 'organizer', event?.organizer || '')}
        ${formField('Category', 'category', event?.category || 'General', 'select', { options: ['Conference', 'Youth', 'Women', 'Worship', 'Crusade', 'Training', 'General'] })}
        <div>${imageUploadHtml('event-img', event?.poster || '', 'Upload event poster')}</div>
      </div>
    </form>
  `;
  
  openModal(id ? 'Edit Event' : 'Add Event', html);
}

async function saveEvent() {
  console.log('🔵 saveEvent() called');
  
  const form = document.getElementById('crud-form');
  if (!form) {
    showToast('Form not found.', 'error');
    return;
  }
  
  const data = getFormData(form);
  const image = getUploadedImage('event-img');
  
  if (!data.title || !data.description || !data.date || !data.venue) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }
  
  // Disable save button
  const saveBtn = document.getElementById('modal-save-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  }
  
  try {
    let result;
    if (modalState.editId) {
      result = await API.updateEvent(modalState.editId, { ...data, poster: image || undefined });
      const index = currentData.events.findIndex(e => e.id === modalState.editId);
      if (index !== -1) currentData.events[index] = result;
      showToast('Event updated successfully.', 'success');
    } else {
      result = await API.createEvent({ ...data, poster: image || undefined });
      currentData.events.unshift(result);
      showToast('Event created successfully.', 'success');
    }
    
    // ✅ Reset modal state
    resetModalState();
    closeModal();
    renderAdminEventsList(currentData.events);
    updateDashboardStats();
    
  } catch (error) {
    showToast(error.message || 'Failed to save event.', 'error');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Save';
    }
  }
}

async function deleteEventItem(id) {
  const event = currentData.events.find(e => e.id === id);
  showConfirm('Delete Event', `Delete "${event?.title}"?`, async () => {
    try {
      await API.deleteEvent(id);
      currentData.events = currentData.events.filter(e => e.id !== id);
      renderAdminEventsList(currentData.events);
      updateDashboardStats();
      showToast('Event deleted successfully.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete event.', 'error');
    }
  });
}

// ============================================
// ===== ADMIN GALLERY CRUD =====
// ============================================

function renderAdminGalleryList(gallery) {
  const container = document.getElementById('gallery-mgmt-list');
  if (!container) return;
  
  const filtered = galleryMgmtFilter === 'All' ? gallery : gallery.filter(g => g.category === galleryMgmtFilter);
  
  if (!filtered || filtered.length === 0) {
    container.innerHTML = `<p class="text-center py-12 col-span-full" style="color:var(--muted)">No photos found.</p>`;
    return;
  }
  
  container.innerHTML = filtered.map(g => `
    <div class="relative group rounded-xl overflow-hidden" style="border:1px solid var(--border)">
      <img src="${g.src}" class="w-full h-48 object-cover" alt="${g.caption || 'Gallery image'}">
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button class="action-btn" style="background:rgba(255,255,255,.9);border:none" onclick="openGalleryModal(${g.id})"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete" style="background:rgba(255,255,255,.9);border:none" onclick="deleteGalleryItem(${g.id})"><i class="fas fa-trash"></i></button>
      </div>
      <div class="absolute bottom-0 left-0 right-0 p-2" style="background:linear-gradient(transparent,rgba(0,0,0,.7))">
        <p class="text-white text-xs truncate">${g.caption || 'Untitled'}</p>
        <span class="text-white/60 text-[10px]">${g.category || 'General'}</span>
      </div>
    </div>
  `).join('');
  
  const filterContainer = document.getElementById('gallery-mgmt-filters');
  if (filterContainer) {
    const cats = ['All', ...new Set(gallery.map(g => g.category))];
    filterContainer.innerHTML = cats.map(c => `
      <button class="gallery-filter-btn ${c === galleryMgmtFilter ? 'active' : ''}" onclick="galleryMgmtFilter='${c}';renderAdminGalleryList(currentData.gallery);document.querySelectorAll('#gallery-mgmt-filters .gallery-filter-btn').forEach(b=>b.classList.toggle('active',b.textContent==='${c}'))">${c}</button>
    `).join('');
  }
}

function openGalleryModal(id) {
  const image = id ? currentData.gallery.find(g => g.id === id) : null;
  
  // ✅ Set modal state
  modalState.entity = 'gallery';
  modalState.editId = id || null;
  
  console.log('🔵 Opening gallery modal:', { entity: modalState.entity, editId: modalState.editId });
  
  const cats = [...new Set(currentData.gallery.map(g => g.category))];
  const html = `
    <form id="crud-form" onsubmit="event.preventDefault()">
      <div class="space-y-4">
        <div>${imageUploadHtml('gallery-img', image?.src || '', 'Upload photo (required)')}</div>
        ${formField('Caption', 'caption', image?.caption || '', 'text', { placeholder: 'Photo caption' })}
        ${formField('Category', 'category', image?.category || '', 'select', { options: cats.length ? cats : ['Conference', 'Worship', 'Youth', 'Crusade', 'Women', 'General'] })}
      </div>
    </form>
  `;
  
  openModal(id ? 'Edit Photo' : 'Upload Photo', html);
}

async function saveGallery() {
  console.log('🔵 saveGallery() called');
  
  const form = document.getElementById('crud-form');
  if (!form) {
    showToast('Form not found.', 'error');
    return;
  }
  
  const data = getFormData(form);
  const image = getUploadedImage('gallery-img');
  
  if (!image && !modalState.editId) {
    showToast('Please upload a photo.', 'error');
    return;
  }
  
  // Disable save button
  const saveBtn = document.getElementById('modal-save-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  }
  
  try {
    let result;
    if (modalState.editId) {
      result = await API.updateGallery(modalState.editId, { ...data, src: image || undefined });
      const index = currentData.gallery.findIndex(g => g.id === modalState.editId);
      if (index !== -1) currentData.gallery[index] = result;
      showToast('Photo updated successfully.', 'success');
    } else {
      result = await API.createGallery({ ...data, src: image });
      currentData.gallery.unshift(result);
      showToast('Photo uploaded successfully.', 'success');
    }
    
    // ✅ Reset modal state
    resetModalState();
    closeModal();
    renderAdminGalleryList(currentData.gallery);
    updateDashboardStats();
    
  } catch (error) {
    showToast(error.message || 'Failed to save photo.', 'error');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Save';
    }
  }
}

async function deleteGalleryItem(id) {
  showConfirm('Delete Photo', 'Are you sure you want to delete this photo?', async () => {
    try {
      await API.deleteGallery(id);
      currentData.gallery = currentData.gallery.filter(g => g.id !== id);
      renderAdminGalleryList(currentData.gallery);
      updateDashboardStats();
      showToast('Photo deleted successfully.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete photo.', 'error');
    }
  });
}

// ============================================
// ===== ADMIN CHAPTERS CRUD =====
// ============================================

function renderAdminChaptersTable(chapters) {
  const tbody = document.getElementById('chapters-mgmt-tbody');
  if (!tbody) return;
  
  if (!chapters || chapters.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center" style="color:var(--muted)">No chapters found.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = chapters.map(c => `
    <tr style="border-top:1px solid var(--border)">
      <td class="p-4 font-medium text-sm">${c.name}</td>
      <td class="p-4 hidden md:table-cell text-sm">${c.country}</td>
      <td class="p-4 hidden lg:table-cell text-sm">${c.coordinator || ''}</td>
      <td class="p-4 hidden lg:table-cell text-sm font-bold" style="color:var(--accent)">${(c.memberCount || c.members || 0).toLocaleString()}</td>
      <td class="p-4">
        <div class="flex gap-2">
          <button class="action-btn edit" onclick="openChapterModal(${c.id})"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" onclick="deleteChapterItem(${c.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterAdminChapters(query) {
  const filtered = currentData.chapters.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  );
  renderAdminChaptersTable(filtered);
}

function openChapterModal(id) {
  const chapter = id ? currentData.chapters.find(c => c.id === id) : null;
  
  // ✅ Set modal state
  modalState.entity = 'chapters';
  modalState.editId = id || null;
  
  console.log('🔵 Opening chapter modal:', { entity: modalState.entity, editId: modalState.editId });
  
  const html = `
    <form id="crud-form" onsubmit="event.preventDefault()">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${formField('Chapter Name *', 'name', chapter?.name || '', 'text', { required: true, placeholder: 'e.g. South Sudan — Juba' })}
        ${formField('Country *', 'country', chapter?.country || '', 'select', { required: true, options: ['South Sudan', 'Uganda', 'Kenya', 'Ethiopia', 'Sudan', 'Other'] })}
        ${formField('Coordinator', 'coordinator', chapter?.coordinator || '')}
        ${formField('Members Count', 'members', chapter?.members || 0, 'number', { placeholder: '0' })}
        ${formField('Address', 'address', chapter?.address || '')}
        ${formField('Phone', 'phone', chapter?.phone || '', 'tel')}
        <div class="col-span-full">${formField('Activities', 'activities', chapter?.activities || '', 'textarea', { rows: 2, placeholder: 'List main activities' })}</div>
      </div>
    </form>
  `;
  
  openModal(id ? 'Edit Chapter' : 'Add Chapter', html);
}

async function saveChapter() {
  console.log('🔵 saveChapter() called');
  
  const form = document.getElementById('crud-form');
  if (!form) {
    showToast('Form not found.', 'error');
    return;
  }
  
  const data = getFormData(form);
  
  if (!data.name || !data.country) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }
  
  data.members = parseInt(data.members) || 0;
  
  // Disable save button
  const saveBtn = document.getElementById('modal-save-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  }
  
  try {
    let result;
    if (modalState.editId) {
      result = await API.updateChapter(modalState.editId, data);
      const index = currentData.chapters.findIndex(c => c.id === modalState.editId);
      if (index !== -1) currentData.chapters[index] = result;
      showToast('Chapter updated successfully.', 'success');
    } else {
      result = await API.createChapter(data);
      currentData.chapters.push(result);
      showToast('Chapter added successfully.', 'success');
    }
    
    // ✅ Reset modal state
    resetModalState();
    closeModal();
    renderAdminChaptersTable(currentData.chapters);
    
  } catch (error) {
    showToast(error.message || 'Failed to save chapter.', 'error');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Save';
    }
  }
}

async function deleteChapterItem(id) {
  const chapter = currentData.chapters.find(c => c.id === id);
  showConfirm('Delete Chapter', `Delete "${chapter?.name}"?`, async () => {
    try {
      await API.deleteChapter(id);
      currentData.chapters = currentData.chapters.filter(c => c.id !== id);
      renderAdminChaptersTable(currentData.chapters);
      showToast('Chapter deleted successfully.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete chapter.', 'error');
    }
  });
}

// ============================================
// ===== ADMIN LEADERS CRUD =====
// ============================================

function renderAdminLeadersList(leaders) {
  const container = document.getElementById('leadership-mgmt-list');
  const count = document.getElementById('leaders-count');
  if (count) count.textContent = leaders.length;
  if (!container) return;
  
  if (!leaders || leaders.length === 0) {
    container.innerHTML = `<p class="text-center py-12 col-span-full" style="color:var(--muted)">No leaders found.</p>`;
    return;
  }
  
  container.innerHTML = leaders.map(l => `
    <div class="mgmt-card text-center">
      <div class="relative h-48 overflow-hidden">
        <img src="${l.image || 'https://picsum.photos/seed/l' + l.id + '/400/500'}" class="w-full h-full object-cover" alt="">
      </div>
      <div class="p-4">
        <h4 class="font-semibold text-sm">${l.name}</h4>
        <p class="text-xs mb-3" style="color:var(--accent)">${l.position}</p>
        <div class="flex gap-2 justify-center">
          <button class="action-btn edit" onclick="openLeaderModal(${l.id})"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" onclick="deleteLeaderItem(${l.id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}

function openLeaderModal(id) {
  const leader = id ? currentData.leaders.find(l => l.id === id) : null;
  
  // ✅ Set modal state
  modalState.entity = 'leaders';
  modalState.editId = id || null;
  
  console.log('🔵 Opening leader modal:', { entity: modalState.entity, editId: modalState.editId });
  
  const html = `
    <form id="crud-form" onsubmit="event.preventDefault()">
      <div class="space-y-4">
        ${formField('Full Name *', 'name', leader?.name || '', 'text', { required: true, placeholder: 'Leader name' })}
        ${formField('Position *', 'position', leader?.position || '', 'text', { required: true, placeholder: 'e.g. Senior Pastor' })}
        ${formField('Contact', 'contact', leader?.contact || '', 'tel')}
        ${formField('Biography', 'bio', leader?.bio || '', 'textarea', { rows: 3, placeholder: 'Brief biography' })}
        <div>${imageUploadHtml('leader-img', leader?.image || '', 'Upload portrait photo')}</div>
      </div>
    </form>
  `;
  
  openModal(id ? 'Edit Leader' : 'Add Leader', html);
}

async function saveLeader() {
  console.log('🔵 saveLeader() called');
  
  const form = document.getElementById('crud-form');
  if (!form) {
    showToast('Form not found.', 'error');
    return;
  }
  
  const data = getFormData(form);
  const image = getUploadedImage('leader-img');
  
  if (!data.name || !data.position) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }
  
  // Disable save button
  const saveBtn = document.getElementById('modal-save-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  }
  
  try {
    let result;
    if (modalState.editId) {
      result = await API.updateLeader(modalState.editId, { ...data, image: image || undefined });
      const index = currentData.leaders.findIndex(l => l.id === modalState.editId);
      if (index !== -1) currentData.leaders[index] = result;
      showToast('Leader updated successfully.', 'success');
    } else {
      result = await API.createLeader({ ...data, image: image || undefined });
      currentData.leaders.push(result);
      showToast('Leader added successfully.', 'success');
    }
    
    // ✅ Reset modal state
    resetModalState();
    closeModal();
    renderAdminLeadersList(currentData.leaders);
    
  } catch (error) {
    showToast(error.message || 'Failed to save leader.', 'error');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Save';
    }
  }
}

async function deleteLeaderItem(id) {
  const leader = currentData.leaders.find(l => l.id === id);
  showConfirm('Delete Leader', `Remove "${leader?.name}" from leadership?`, async () => {
    try {
      await API.deleteLeader(id);
      currentData.leaders = currentData.leaders.filter(l => l.id !== id);
      renderAdminLeadersList(currentData.leaders);
      showToast('Leader removed successfully.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete leader.', 'error');
    }
  });
}

// ============================================
// ===== ADMIN TESTIMONIALS CRUD =====
// ============================================

function renderAdminTestimonialsList(testimonials) {
  const container = document.getElementById('testimonials-mgmt-list');
  const count = document.getElementById('testimonials-count');
  if (count) count.textContent = testimonials.length;
  if (!container) return;
  
  if (!testimonials || testimonials.length === 0) {
    container.innerHTML = `<p class="text-center py-12 col-span-full" style="color:var(--muted)">No testimonials found.</p>`;
    return;
  }
  
  container.innerHTML = testimonials.map(t => `
    <div class="mgmt-card p-5">
      <div class="flex gap-4">
        <img src="${t.image || 'https://picsum.photos/seed/t' + t.id + '/100/100'}" class="w-14 h-14 rounded-full object-cover flex-shrink-0" alt="">
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-sm">${t.name}</h4>
          <p class="text-xs mb-2" style="color:var(--muted)">${t.role || ''}</p>
          <p class="text-sm line-clamp-3" style="color:var(--muted)">"${t.text}"</p>
        </div>
        <div class="flex flex-col gap-2 flex-shrink-0">
          <button class="action-btn edit" onclick="openTestimonialModal(${t.id})"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" onclick="deleteTestimonialItem(${t.id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}

function openTestimonialModal(id) {
  const testimonial = id ? currentData.testimonials.find(t => t.id === id) : null;
  
  // ✅ Set modal state
  modalState.entity = 'testimonials';
  modalState.editId = id || null;
  
  console.log('🔵 Opening testimonial modal:', { entity: modalState.entity, editId: modalState.editId });
  
  const html = `
    <form id="crud-form" onsubmit="event.preventDefault()">
      <div class="space-y-4">
        ${formField('Name *', 'name', testimonial?.name || '', 'text', { required: true, placeholder: "Person's name" })}
        ${formField('Role / Chapter', 'role', testimonial?.role || '', 'text', { placeholder: 'e.g. Member, Juba Chapter' })}
        ${formField('Testimony *', 'text', testimonial?.text || '', 'textarea', { required: true, rows: 4, placeholder: 'Their testimony' })}
        <div>${imageUploadHtml('testi-img', testimonial?.image || '', 'Upload photo (optional)')}</div>
      </div>
    </form>
  `;
  
  openModal(id ? 'Edit Testimonial' : 'Add Testimonial', html);
}

async function saveTestimonial() {
  console.log('🔵 saveTestimonial() called');
  
  const form = document.getElementById('crud-form');
  if (!form) {
    showToast('Form not found.', 'error');
    return;
  }
  
  const data = getFormData(form);
  const image = getUploadedImage('testi-img');
  
  if (!data.name || !data.text) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }
  
  // Disable save button
  const saveBtn = document.getElementById('modal-save-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  }
  
  try {
    let result;
    if (modalState.editId) {
      result = await API.updateTestimonial(modalState.editId, { ...data, image: image || undefined });
      const index = currentData.testimonials.findIndex(t => t.id === modalState.editId);
      if (index !== -1) currentData.testimonials[index] = result;
      showToast('Testimonial updated successfully.', 'success');
    } else {
      result = await API.createTestimonial({ ...data, image: image || undefined });
      currentData.testimonials.push(result);
      showToast('Testimonial added successfully.', 'success');
    }
    
    // ✅ Reset modal state
    resetModalState();
    closeModal();
    renderAdminTestimonialsList(currentData.testimonials);
    
  } catch (error) {
    showToast(error.message || 'Failed to save testimonial.', 'error');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Save';
    }
  }
}

async function deleteTestimonialItem(id) {
  const testimonial = currentData.testimonials.find(t => t.id === id);
  showConfirm('Delete Testimonial', `Delete testimony from "${testimonial?.name}"?`, async () => {
    try {
      await API.deleteTestimonial(id);
      currentData.testimonials = currentData.testimonials.filter(t => t.id !== id);
      renderAdminTestimonialsList(currentData.testimonials);
      showToast('Testimonial deleted successfully.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete testimonial.', 'error');
    }
  });
}

// ============================================
// ===== MODAL SAVE HANDLER =====
// ============================================

function handleModalSave() {
  console.log('🔵 ===== MODAL SAVE CLICKED =====');
  console.log('📋 Modal State:', JSON.stringify(modalState, null, 2));
  
  // Check if we have a valid entity
  if (!modalState || !modalState.entity) {
    console.error('❌ No entity set in modalState');
    showToast('Error: Unknown entity type.', 'error');
    return;
  }
  
  // Map entity names to their save functions
  const saveFunctions = {
    'members': saveMember,
    'news': saveNews,
    'events': saveEvent,
    'gallery': saveGallery,
    'chapters': saveChapter,
    'leaders': saveLeader,
    'testimonials': saveTestimonial
  };
  
  const saveFunction = saveFunctions[modalState.entity];
  
  if (!saveFunction) {
    console.error('❌ No save function found for entity:', modalState.entity);
    showToast(`Error: No save handler for "${modalState.entity}"`, 'error');
    return;
  }
  
  console.log('✅ Found save function for:', modalState.entity);
  
  // Disable save button to prevent double clicks
  const saveBtn = document.getElementById('modal-save-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  }
  
  try {
    saveFunction();
  } catch (error) {
    console.error('❌ Error in save function:', error);
    showToast('Error saving: ' + error.message, 'error');
    
    // Re-enable save button on error
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save text-xs"></i> Save';
    }
  }
}

// ============================================
// ===== FILTER HELPERS =====
// ============================================

function filterMgmtList(entity, query) {
  switch(entity) {
    case 'members':
      filterAdminMembers(query);
      break;
    case 'news':
      filterAdminNews(query);
      break;
    case 'events':
      filterAdminEvents(query);
      break;
    case 'chapters':
      filterAdminChapters(query);
      break;
  }
}

// ============================================
// ===== PDF GENERATION FUNCTIONS =====
// ============================================

// Generate PDF of all members by chapter
async function generateMembersPDF() {
  try {
    showToast('Generating PDF... Please wait.', 'info');
    
    // Get all members with chapter info
    const members = await API.getMembers();
    
    if (!members || members.length === 0) {
      showToast('No members found to export.', 'error');
      return;
    }
    
    // Group members by chapter
    const chaptersMap = {};
    members.forEach(member => {
      const chapterName = member.chapter?.name || member.chapter || 'Unassigned';
      if (!chaptersMap[chapterName]) {
        chaptersMap[chapterName] = [];
      }
      chaptersMap[chapterName].push(member);
    });
    
    // Sort chapters alphabetically
    const sortedChapters = Object.keys(chaptersMap).sort();
    
    // Create PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Add header
    doc.setFontSize(18);
    doc.setTextColor(11, 61, 46); // Primary color
    doc.text('Thiec Nhialic Ministry', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(201, 168, 76); // Accent color
    doc.text('Members Directory by Chapter', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 33, { align: 'center' });
    
    let yPosition = 40;
    
    // Loop through each chapter
    sortedChapters.forEach((chapterName, chapterIndex) => {
      const chapterMembers = chaptersMap[chapterName];
      
      // Check if we need a new page
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Chapter header
      doc.setFontSize(12);
      doc.setTextColor(11, 61, 46);
      doc.setFont('helvetica', 'bold');
      doc.text(`📋 ${chapterName}`, 14, yPosition);
      yPosition += 7;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Members: ${chapterMembers.length}`, 14, yPosition);
      yPosition += 5;
      
      // Add a line separator
      doc.setDrawColor(201, 168, 76);
      doc.line(14, yPosition, pageWidth - 14, yPosition);
      yPosition += 7;
      
      // Prepare table data
      const tableData = chapterMembers.map((member, index) => [
        index + 1,
        member.memberNumber || 'N/A',
        member.fullName || 'Unknown',
        member.gender || 'N/A',
        member.phone || 'N/A',
        member.email || 'N/A',
        member.country || 'N/A',
        member.membershipStatus || 'Active',
        member.dateJoined || 'N/A'
      ]);
      
      // AutoTable for members
      doc.autoTable({
        startY: yPosition,
        head: [['#', 'Member No.', 'Full Name', 'Gender', 'Phone', 'Email', 'Country', 'Status', 'Joined']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [11, 61, 46],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 7
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 25 },
          2: { cellWidth: 35 },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 28 },
          5: { cellWidth: 35 },
          6: { cellWidth: 22 },
          7: { cellWidth: 18, halign: 'center' },
          8: { cellWidth: 20, halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 14, right: 14 },
        didDrawPage: function(data) {
          // Footer
          const footerY = doc.internal.pageSize.getHeight() - 10;
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()} | Thiec Nhialic Ministry`,
            pageWidth / 2,
            footerY,
            { align: 'center' }
          );
        }
      });
      
      // Update yPosition after table
      yPosition = doc.lastAutoTable.finalY + 10;
      
      // Add spacing between chapters
      if (chapterIndex < sortedChapters.length - 1) {
        yPosition += 5;
      }
    });
    
    // Add summary page at the end
    doc.addPage();
    yPosition = 30;
    
    doc.setFontSize(16);
    doc.setTextColor(11, 61, 46);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Summary table
    const summaryData = sortedChapters.map(chapterName => [
      chapterName,
      chaptersMap[chapterName].length
    ]);
    
    // Add total row
    const totalMembers = members.length;
    summaryData.push(['TOTAL', totalMembers]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Chapter', 'Member Count']],
      body: summaryData,
      theme: 'striped',
      headStyles: {
        fillColor: [11, 61, 46],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 40, halign: 'center' }
      },
      margin: { left: 50, right: 50 },
      didDrawPage: function(data) {
        const footerY = doc.internal.pageSize.getHeight() - 10;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()} | Thiec Nhialic Ministry`,
          pageWidth / 2,
          footerY,
          { align: 'center' }
        );
      }
    });
    
    // Save the PDF
    const fileName = `Thiec_Nhialic_Members_Directory_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    showToast('PDF generated successfully!', 'success');
    
  } catch (error) {
    console.error('❌ PDF Generation Error:', error);
    showToast('Failed to generate PDF: ' + error.message, 'error');
  }
}

// Generate PDF for a specific chapter
async function generateChapterPDF(chapterName) {
  try {
    showToast('Generating PDF for chapter... Please wait.', 'info');
    
    const members = await API.getMembers();
    
    if (!members || members.length === 0) {
      showToast('No members found.', 'error');
      return;
    }
    
    // Filter members by chapter
    const chapterMembers = members.filter(member => {
      const memberChapter = member.chapter?.name || member.chapter || 'Unassigned';
      return memberChapter === chapterName;
    });
    
    if (chapterMembers.length === 0) {
      showToast(`No members found in chapter: ${chapterName}`, 'error');
      return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(11, 61, 46);
    doc.text('Thiec Nhialic Ministry', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(201, 168, 76);
    doc.text(`Chapter Report: ${chapterName}`, pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total Members: ${chapterMembers.length} | Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 33, { align: 'center' });
    
    // Table data
    const tableData = chapterMembers.map((member, index) => [
      index + 1,
      member.memberNumber || 'N/A',
      member.fullName || 'Unknown',
      member.gender || 'N/A',
      member.phone || 'N/A',
      member.email || 'N/A',
      member.country || 'N/A',
      member.membershipStatus || 'Active',
      member.dateJoined || 'N/A'
    ]);
    
    doc.autoTable({
      startY: 40,
      head: [['#', 'Member No.', 'Full Name', 'Gender', 'Phone', 'Email', 'Country', 'Status', 'Joined']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [11, 61, 46],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 28 },
        5: { cellWidth: 35 },
        6: { cellWidth: 22 },
        7: { cellWidth: 18, halign: 'center' },
        8: { cellWidth: 20, halign: 'center' }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 14, right: 14 },
      didDrawPage: function(data) {
        const footerY = doc.internal.pageSize.getHeight() - 10;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()} | Thiec Nhialic Ministry`,
          pageWidth / 2,
          footerY,
          { align: 'center' }
        );
      }
    });
    
    const fileName = `Thiec_Nhialic_${chapterName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    showToast(`PDF for ${chapterName} generated successfully!`, 'success');
    
  } catch (error) {
    console.error('❌ Chapter PDF Generation Error:', error);
    showToast('Failed to generate PDF: ' + error.message, 'error');
  }
}

// Add PDF buttons to the admin interface
function addPDFButtons() {
  // Add to Members Management tab
  const membersMgmt = document.getElementById('dash-members-mgmt');
  if (membersMgmt) {
    // Find the header div
    const headerDiv = membersMgmt.querySelector('.flex.flex-col.sm\\:flex-row');
    if (headerDiv) {
      // Check if buttons already exist
      if (!headerDiv.querySelector('.pdf-buttons')) {
        const pdfButtons = document.createElement('div');
        pdfButtons.className = 'pdf-buttons flex flex-wrap gap-2 mt-2 sm:mt-0';
        pdfButtons.innerHTML = `
          <button onclick="generateMembersPDF()" class="btn-accent text-sm py-2 px-4" style="background:var(--accent);color:var(--primary)">
            <i class="fas fa-file-pdf text-xs"></i> Export All Members
          </button>
          <button onclick="showChapterSelector()" class="btn-primary text-sm py-2 px-4">
            <i class="fas fa-file-pdf text-xs"></i> Export by Chapter
          </button>
        `;
        headerDiv.appendChild(pdfButtons);
      }
    }
  }
}

// Show chapter selector modal
function showChapterSelector() {
  const chapters = currentData.chapters || [];
  
  if (chapters.length === 0) {
    showToast('No chapters found. Please add chapters first.', 'error');
    return;
  }
  
  let chapterOptions = chapters.map(c => `
    <button onclick="generateChapterPDF('${c.name.replace(/'/g, "\\'")}')" 
            class="w-full text-left px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors border border-border mb-2"
            style="border-color:var(--border)">
      <div class="flex items-center justify-between">
        <span class="font-medium">${c.name}</span>
        <span class="text-sm" style="color:var(--muted)">${c.members || 0} members</span>
      </div>
    </button>
  `).join('');
  
  const html = `
    <div class="p-4">
      <h3 class="font-display text-xl font-bold mb-4">Select Chapter to Export</h3>
      <p class="text-sm mb-4" style="color:var(--muted)">Choose a chapter to generate a PDF report of all its members.</p>
      <div class="max-h-96 overflow-y-auto space-y-2">
        ${chapterOptions}
      </div>
      <div class="mt-4 pt-4 border-t" style="border-color:var(--border)">
        <button onclick="generateMembersPDF()" class="btn-primary w-full justify-center text-sm py-2.5">
          <i class="fas fa-file-pdf text-xs"></i> Export All Chapters
        </button>
      </div>
    </div>
  `;
  
  openModal('Export Members by Chapter', html);
}

// ============================================
// ===== EXPOSE GLOBAL FUNCTIONS =====
// ============================================

window.handleAdminLogin = handleAdminLogin;
window.handleAdminLogout = handleAdminLogout;
window.switchDashTab = switchDashTab;
window.filterAdminMembers = filterAdminMembers;
window.filterMgmtList = filterMgmtList;
window.openMemberModal = openMemberModal;
window.openNewsModal = openNewsModal;
window.openEventModal = openEventModal;
window.openGalleryModal = openGalleryModal;
window.openChapterModal = openChapterModal;
window.openLeaderModal = openLeaderModal;
window.openTestimonialModal = openTestimonialModal;
window.viewMember = viewMember;
window.deleteMember = deleteMember;
window.deleteNewsItem = deleteNewsItem;
window.deleteEventItem = deleteEventItem;
window.deleteGalleryItem = deleteGalleryItem;
window.deleteChapterItem = deleteChapterItem;
window.deleteLeaderItem = deleteLeaderItem;
window.deleteTestimonialItem = deleteTestimonialItem;
window.handleModalSave = handleModalSave;
window.loadAdminData = loadAdminData;
window.renderAdminMembersTable = renderAdminMembersTable;
window.renderAdminNewsList = renderAdminNewsList;
window.renderAdminEventsList = renderAdminEventsList;
window.renderAdminGalleryList = renderAdminGalleryList;
window.renderAdminChaptersTable = renderAdminChaptersTable;
window.renderAdminLeadersList = renderAdminLeadersList;
window.renderAdminTestimonialsList = renderAdminTestimonialsList;
window.saveMember = saveMember;
window.saveNews = saveNews;
window.saveEvent = saveEvent;
window.saveGallery = saveGallery;
window.saveChapter = saveChapter;
window.saveLeader = saveLeader;
window.saveTestimonial = saveTestimonial;
window.resetModalState = resetModalState;
window.modalState = modalState;

// ✅ PDF Export Functions
window.generateMembersPDF = generateMembersPDF;
window.generateChapterPDF = generateChapterPDF;
window.showChapterSelector = showChapterSelector;
window.addPDFButtons = addPDFButtons;

console.log('✅ Admin panel initialized');