/**
 * Lumière Luxury Commerce — Shared Admin & Staff Controller
 * Enforces staff authentication, role permissions, and sidebar navigation.
 */

// Immediate security check
(function enforceAdminAuth() {
  if (!window.Auth || !Auth.isLoggedIn()) {
    window.location.href = '../auth.html?redirect=' + encodeURIComponent(window.location.pathname);
    return;
  }

  const user = Auth.getUser();
  if (!Auth.isStaff()) {
    alert('Access Denied: Administrative privileges are strictly reserved for verified Lumière atelier staff.');
    window.location.href = '../index.html';
    return;
  }
})();

const Admin = {
  currentUser: null,

  init() {
    this.currentUser = Auth.getUser();
    this.renderSidebar();
    this.renderTopNav();
  },

  renderSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    if (!sidebar) return;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const user = this.currentUser;
    const isOwner = Auth.isOwner();

    const menuItems = [
      { id: 'overview', title: 'Dashboard', icon: '📊', url: 'index.html', perm: 'analytics.view' },
      { id: 'products', title: 'Products', icon: '💎', url: 'products.html', perm: 'products.view' },
      { id: 'inventory', title: 'Inventory & Stock', icon: '📦', url: 'inventory.html', perm: 'inventory.view' },
      { id: 'orders', title: 'Orders & Dispatch', icon: '🛍️', url: 'orders.html', perm: 'orders.view' },
      { id: 'customers', title: 'Clients Directory', icon: '👑', url: 'customers.html', perm: 'customers.view' },
      { id: 'staff', title: 'Staff & RBAC', icon: '🛡️', url: 'staff.html', perm: 'staff.manage' },
      { id: 'analytics', title: 'Commerce Analytics', icon: '📈', url: 'analytics.html', perm: 'analytics.view' },
      { id: 'settings', title: 'Store Settings', icon: '⚙️', url: 'settings.html', perm: 'settings.manage' },
    ];

    const allowedItems = menuItems.filter(item => isOwner || Auth.hasPermission(item.perm));

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <a href="index.html" class="admin-brand">
          <span style="color: var(--color-gold);">✦</span>
          <span>LUMIÈRE</span>
        </a>
        <span style="font-size: 0.65rem; padding: 0.2rem 0.45rem; background: rgba(201,169,110,0.15); color: var(--color-gold); border-radius: 2px; font-weight: 600;">ATELIER</span>
      </div>

      <ul class="sidebar-nav">
        ${allowedItems.map(item => `
          <li>
            <a href="${item.url}" class="sidebar-link ${currentPath === item.url ? 'active' : ''}">
              <span>${item.icon}</span>
              <span>${item.title}</span>
            </a>
          </li>
        `).join('')}
      </ul>

      <div class="sidebar-footer">
        <div class="user-badge">
          <div class="user-badge-avatar">${user.firstName ? user.firstName[0] : '✦'}</div>
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: 600; font-size: 0.8rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${user.firstName || ''} ${user.lastName || ''}</div>
            <div style="font-size: 0.68rem; color: var(--color-gold);">${user.roles ? user.roles[0] : 'STAFF'}</div>
          </div>
          <button onclick="Auth.logout()" title="Sign Out" style="background: none; border: none; color: rgba(250,247,242,0.5); cursor: pointer; font-size: 0.9rem;">
            ⎋
          </button>
        </div>
      </div>
    `;
  },

  renderTopNav() {
    const topbar = document.getElementById('adminTopbar');
    if (!topbar) return;

    topbar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <button onclick="document.getElementById('adminSidebar').classList.toggle('open')" style="display: none; background: none; border: none; color: #fff; font-size: 1.25rem; cursor: pointer;" id="sidebarToggleBtn">
          ☰
        </button>
        <span style="font-family: var(--font-serif); font-size: 1.25rem; letter-spacing: 0.05em;">Administration Atelier</span>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <a href="../index.html" target="_blank" class="btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.7rem;">
          VIEW BOUTIQUE ↗
        </a>
      </div>
    `;

    // Show toggle on mobile screens
    if (window.innerWidth <= 960) {
      const btn = document.getElementById('sidebarToggleBtn');
      if (btn) btn.style.display = 'block';
    }
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    const backdrop = document.getElementById('adminBackdrop');
    if (modal) modal.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const backdrop = document.getElementById('adminBackdrop');
    if (modal) modal.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  },

  toast(message) {
    let t = document.getElementById('adminToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'adminToast';
      t.style.cssText = `
        position: fixed; bottom: 2rem; right: 2rem; background: #191416;
        border: 1px solid var(--color-gold); color: #FAF7F2; padding: 0.85rem 1.5rem;
        font-size: 0.82rem; z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        display: flex; align-items: center; gap: 0.5rem; border-radius: 2px;
      `;
      document.body.appendChild(t);
    }
    t.innerHTML = `<span style="color: var(--color-gold);">✦</span> <span>${message}</span>`;
    t.style.display = 'flex';
    setTimeout(() => { t.style.display = 'none'; }, 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Admin.init();
});

window.Admin = Admin;
