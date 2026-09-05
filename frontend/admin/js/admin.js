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
  realTimeMetrics: {},
  realTimeTimer: null,
  clockTimer: null,

  menuTree: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '📊',
      url: 'index.html',
      perm: 'analytics.view',
      badgeKey: null,
      children: [
        { title: 'Revenue', url: 'index.html#valRevenue', badgeKey: 'revenue', badgeType: 'revenue' },
        { title: 'Orders', url: 'index.html#valOrders', badgeKey: 'orders', badgeType: 'orders' },
        { title: 'Customers', url: 'index.html#valCustomers', badgeKey: 'customers' },
        { title: 'Products', url: 'index.html#valProducts', badgeKey: 'products' },
        { title: 'Stock Alerts', url: 'index.html#lowStockBanner', badgeKey: 'stockAlerts', badgeType: 'alert' }
      ]
    },
    {
      id: 'products',
      title: 'Products',
      icon: '💎',
      url: 'products.html',
      perm: 'products.view',
      badgeKey: 'products',
      children: [
        { title: 'All Products', url: 'products.html', badgeKey: 'products' },
        { title: 'Add Product', url: 'products.html?action=new', badgeText: '+ New', badgeType: 'accent' },
        { title: 'Edit Product', url: 'products.html?action=edit' },
        { title: 'Categories', url: 'products.html?action=categories' },
        { title: 'Product Variants', url: 'products.html?action=variants' }
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory & Stock',
      icon: '📦',
      url: 'inventory.html',
      perm: 'inventory.view',
      badgeKey: 'stockAlerts',
      badgeType: 'alert',
      children: [
        { title: 'Stock Overview', url: 'inventory.html' },
        { title: 'Stock Movements', url: 'inventory.html?action=movements' },
        { title: 'Low Stock', url: 'inventory.html?filter=low_stock', badgeKey: 'lowStock', badgeType: 'warn' },
        { title: 'Out of Stock', url: 'inventory.html?filter=out_of_stock', badgeKey: 'outStock', badgeType: 'danger' },
        { title: 'Purchase / Stock In', url: 'inventory.html?action=stock_in', badgeText: 'Receive', badgeType: 'accent' },
        { title: 'Stock Adjustment', url: 'inventory.html?action=adjust' },
        { title: 'Inventory History', url: 'inventory.html?action=history' }
      ]
    },
    {
      id: 'orders',
      title: 'Orders & Dispatch',
      icon: '🛍️',
      url: 'orders.html',
      perm: 'orders.view',
      badgeKey: 'ordersPending',
      badgeType: 'orders',
      children: [
        { title: 'All Orders', url: 'orders.html', badgeKey: 'orders' },
        { title: 'Pending', url: 'orders.html?status=Pending', badgeKey: 'status_Pending', badgeType: 'pending' },
        { title: 'Confirmed', url: 'orders.html?status=Confirmed', badgeKey: 'status_Confirmed' },
        { title: 'Processing', url: 'orders.html?status=Processing', badgeKey: 'status_Processing' },
        { title: 'Shipped', url: 'orders.html?status=Shipped', badgeKey: 'status_Shipped' },
        { title: 'Delivered', url: 'orders.html?status=Delivered', badgeKey: 'status_Delivered' },
        { title: 'Cancelled', url: 'orders.html?status=Cancelled', badgeKey: 'status_Cancelled' }
      ]
    },
    {
      id: 'customers',
      title: 'Clients Directory',
      icon: '👑',
      url: 'customers.html',
      perm: 'customers.view',
      badgeKey: 'customers',
      children: [
        { title: 'Customers', url: 'customers.html', badgeKey: 'customers' },
        { title: 'Customer Details', url: 'customers.html?action=details' },
        { title: 'Order History', url: 'customers.html?action=orders' }
      ]
    },
    {
      id: 'staff',
      title: 'Staff & RBAC',
      icon: '🛡️',
      url: 'staff.html',
      perm: 'staff.manage',
      badgeKey: null,
      children: [
        { title: 'Staff', url: 'staff.html' },
        { title: 'Roles', url: 'staff.html#roles' },
        { title: 'Permissions', url: 'staff.html#permissions' }
      ]
    },
    {
      id: 'analytics',
      title: 'Commerce Analytics',
      icon: '📈',
      url: 'analytics.html',
      perm: 'analytics.view',
      badgeKey: null,
      children: [
        { title: 'Sales', url: 'analytics.html#sales' },
        { title: 'Products', url: 'analytics.html#products' },
        { title: 'Customers', url: 'analytics.html#customers' },
        { title: 'Inventory', url: 'analytics.html#inventory' }
      ]
    },
    {
      id: 'settings',
      title: 'Store Settings',
      icon: '⚙️',
      url: 'settings.html',
      perm: 'settings.manage',
      badgeKey: null,
      children: []
    }
  ],

  init() {
    this.currentUser = Auth.getUser();
    this.renderSidebar();
    this.renderTopNav();
    this.startRealTimeSync();
    this.handlePageActions();
  },

  renderSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    if (!sidebar) return;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const currentFullUrl = currentPath + window.location.search + window.location.hash;
    const user = this.currentUser;
    const isOwner = Auth.isOwner();

    const allowedGroups = this.menuTree.filter(item => isOwner || Auth.hasPermission(item.perm));

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <a href="index.html" class="admin-brand">
          <span style="color: var(--color-gold);">✦</span>
          <span>LUMIÈRE</span>
        </a>
        <span style="font-size: 0.65rem; padding: 0.2rem 0.45rem; background: rgba(201,169,110,0.15); color: var(--color-gold); border-radius: 2px; font-weight: 600;">ATELIER</span>
      </div>

      <div style="padding: 0.65rem 1rem 0.25rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(201,169,110,0.7);">
        <span>Navigation Architecture</span>
        <span class="live-pulse-dot" title="Real-Time Sync Active"></span>
      </div>

      <ul class="sidebar-nav" id="sidebarNavTree">
        ${allowedGroups.map(group => {
          const isCurrentGroup = (currentPath === group.url.split('?')[0].split('#')[0]);
          const hasChildren = group.children && group.children.length > 0;

          return `
            <li class="nav-group ${isCurrentGroup ? 'expanded active-page' : ''}" data-group-id="${group.id}">
              <div class="nav-parent-row ${isCurrentGroup && !window.location.hash && !window.location.search ? 'active' : ''}" onclick="Admin.handleParentClick(event, '${group.id}', '${group.url}', ${hasChildren})">
                <div class="nav-parent-main">
                  <span class="nav-parent-icon">${group.icon}</span>
                  <span class="nav-parent-title">${group.title}</span>
                </div>
                <div class="nav-parent-right">
                  ${group.badgeKey ? `<span class="live-nav-badge badge-${group.badgeType || 'orders'}" data-badge-key="${group.badgeKey}" id="badge_${group.id}">-</span>` : ''}
                  ${hasChildren ? `<span class="nav-chevron">▶</span>` : ''}
                </div>
              </div>

              ${hasChildren ? `
                <ul class="nav-sub-tree">
                  ${group.children.map(sub => {
                    const isSubActive = (currentFullUrl === sub.url || (currentPath === sub.url.split('?')[0].split('#')[0] && window.location.search === sub.url.substring(sub.url.indexOf('?')) && sub.url.includes('?')));
                    return `
                      <li>
                        <a href="${sub.url}" class="nav-sub-item ${isSubActive ? 'active' : ''}" data-sub-url="${sub.url}">
                          <span>${sub.title}</span>
                          ${sub.badgeKey ? `<span class="live-nav-badge badge-${sub.badgeType || 'orders'}" data-badge-key="${sub.badgeKey}">-</span>` : ''}
                          ${sub.badgeText ? `<span class="live-nav-badge badge-${sub.badgeType || 'accent'}">${sub.badgeText}</span>` : ''}
                        </a>
                      </li>
                    `;
                  }).join('')}
                </ul>
              ` : ''}
            </li>
          `;
        }).join('')}
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

  handleParentClick(event, groupId, url, hasChildren) {
    const groupEl = document.querySelector(`.nav-group[data-group-id="${groupId}"]`);
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const targetPath = url.split('?')[0].split('#')[0];

    // If already on this page and has children, toggle accordion
    if (currentPath === targetPath && hasChildren) {
      if (groupEl) groupEl.classList.toggle('expanded');
      return;
    }

    // Otherwise navigate to page
    window.location.href = url;
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
      <div style="display: flex; align-items: center; gap: 1.25rem;">
        <div class="live-status-pill">
          <span class="live-pulse-dot"></span>
          <span id="topbarLiveClock">--:--:--</span>
          <span style="color: rgba(46,204,113,0.7); font-weight: 400; margin-left: 0.2rem;">SYNCED</span>
        </div>
        <a href="../index.html" target="_blank" class="btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.7rem;">
          VIEW BOUTIQUE ↗
        </a>
      </div>
    `;

    if (window.innerWidth <= 960) {
      const btn = document.getElementById('sidebarToggleBtn');
      if (btn) btn.style.display = 'block';
    }

    this.startClock();
  },

  startClock() {
    if (this.clockTimer) clearInterval(this.clockTimer);
    const updateTime = () => {
      const el = document.getElementById('topbarLiveClock');
      if (!el) return;
      const now = new Date();
      el.innerText = now.toLocaleTimeString();
    };
    updateTime();
    this.clockTimer = setInterval(updateTime, 1000);
  },

  /* ==========================================================
     REAL-TIME SYNC ENGINE (8-Second Polling & Live DOM Injection)
     ========================================================== */
  async startRealTimeSync() {
    if (this.realTimeTimer) clearInterval(this.realTimeTimer);

    const syncMetrics = async () => {
      try {
        const res = await Auth.apiFetch('/api/admin/overview');
        const data = await res.json();
        if (data.success && data.metrics) {
          const m = data.metrics;
          const map = {
            revenue: `$${Math.round(m.totalRevenue || 0).toLocaleString()}`,
            orders: m.totalOrders || 0,
            todayOrders: m.todayOrders || 0,
            todayRev: `$${(m.todayRevenue || 0).toFixed(0)}`,
            customers: m.totalCustomers || 0,
            products: m.totalProducts || 0,
            lowStock: m.lowStockCount || 0,
            outStock: m.outOfStockCount || 0,
            stockAlerts: (m.lowStockCount || 0) + (m.outOfStockCount || 0),
          };

          // Map order status counts from statusBreakdown
          if (Array.isArray(data.statusBreakdown)) {
            data.statusBreakdown.forEach(st => {
              map[`status_${st.status}`] = st.count || 0;
            });
            map['ordersPending'] = map['status_Pending'] || 0;
          }

          this.realTimeMetrics = map;
          this.applyLiveBadges(map);
        }
      } catch (err) {
        console.warn('[Admin Live Sync] Polling offline:', err.message);
      }
    };

    // Initial immediate call
    syncMetrics();
    // 8-second continuous real-time sync
    this.realTimeTimer = setInterval(syncMetrics, 8000);
  },

  applyLiveBadges(metrics) {
    document.querySelectorAll('[data-badge-key]').forEach(badgeEl => {
      const key = badgeEl.getAttribute('data-badge-key');
      if (metrics[key] !== undefined) {
        const val = metrics[key];
        const oldVal = badgeEl.innerText;
        badgeEl.innerText = val;

        // Visual pulse if updated
        if (oldVal !== '-' && oldVal !== String(val)) {
          badgeEl.style.transform = 'scale(1.25)';
          setTimeout(() => { badgeEl.style.transform = ''; }, 300);
        }

        // Auto-hide 0 counts for non-critical badges, show critical
        if (key === 'stockAlerts' || key === 'lowStock' || key === 'outStock') {
          if (Number(val) > 0) {
            badgeEl.style.display = 'inline-flex';
            if (key === 'stockAlerts') badgeEl.innerText = `⚠️ ${val}`;
          } else {
            badgeEl.style.display = 'none';
          }
        }
      }
    });
  },

  /* ==========================================================
     DEEP-LINK ACTION & HASH DISPATCHER
     ========================================================== */
  handlePageActions() {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    // 1. Dashboard Hash Highlighting
    if (hash) {
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
          target.style.borderColor = 'var(--color-gold)';
          target.style.boxShadow = '0 0 25px rgba(201, 169, 110, 0.5)';
          setTimeout(() => {
            target.style.boxShadow = '';
          }, 2400);
        }
      }, 350);
    }

    // 2. Orders Filter Preselection
    const statusParam = urlParams.get('status');
    const orderSelect = document.getElementById('statusFilter');
    if (statusParam && orderSelect) {
      orderSelect.value = statusParam;
      if (typeof loadOrders === 'function') loadOrders();
    }

    // 3. Products Create Modal Pre-trigger
    const actionParam = urlParams.get('action');
    if (actionParam === 'new' && typeof openCreateProductModal === 'function') {
      setTimeout(openCreateProductModal, 200);
    } else if (actionParam === 'categories') {
      const catSelect = document.getElementById('categoryFilter');
      if (catSelect) catSelect.focus();
    }

    // 4. Inventory Filters & Actions
    const filterParam = urlParams.get('filter');
    const stockSelect = document.getElementById('stockFilter');
    if (filterParam && stockSelect) {
      stockSelect.value = filterParam;
      if (typeof loadInventory === 'function') loadInventory();
    }

    if (actionParam === 'stock_in') {
      setTimeout(() => {
        Admin.openModal('adjustModal');
        const adjType = document.getElementById('adjType');
        if (adjType) adjType.value = 'STOCK_RECEIVED';
      }, 200);
    } else if (actionParam === 'adjust') {
      setTimeout(() => Admin.openModal('adjustModal'), 200);
    } else if (actionParam === 'history' || actionParam === 'movements') {
      setTimeout(() => Admin.openModal('historyModal'), 200);
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
