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
      perm: null, // Accessible by all staff roles; sub-links filtered strictly by role permissions
      badgeKey: null,
      children: [
        { title: 'Revenue', url: 'index.html#valRevenue', badgeKey: 'revenue', badgeType: 'revenue', perm: 'analytics.view' },
        { title: 'Orders', url: 'index.html#valOrders', badgeKey: 'orders', badgeType: 'orders', perm: 'orders.view' },
        { title: 'Customers', url: 'index.html#valCustomers', badgeKey: 'customers', perm: 'customers.view' },
        { title: 'Products', url: 'index.html#valProducts', badgeKey: 'products', perm: 'products.view' },
        { title: 'Stock Alerts', url: 'index.html#lowStockBanner', badgeKey: 'stockAlerts', badgeType: 'alert', perm: 'inventory.view' }
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
        { title: 'Add Product', url: 'product-add.html', badgeText: '+ New', badgeType: 'accent' },
        { title: 'Edit Product', url: 'product-edit.html' },
        { title: 'Categories', url: 'categories.html' },
        { title: 'Product Variants', url: 'product-variants.html' }
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
        { title: 'Stock Movements', url: 'inventory-movements.html' },
        { title: 'Low Stock', url: 'inventory-low-stock.html', badgeKey: 'lowStock', badgeType: 'warn' },
        { title: 'Out of Stock', url: 'inventory-out-of-stock.html', badgeKey: 'outStock', badgeType: 'danger' },
        { title: 'Purchase / Stock In', url: 'inventory-stock-in.html', badgeText: 'Receive', badgeType: 'accent' },
        { title: 'Stock Adjustment', url: 'inventory-adjust.html' },
        { title: 'Inventory History', url: 'inventory-history.html' }
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
        { title: 'Cancelled', url: 'orders.html?status=Cancelled', badgeKey: 'status_Cancelled' },
        { title: 'Deleted Orders', url: 'orders.html?status=Deleted', badgeKey: 'status_Deleted', badgeType: 'danger' }
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
        { title: 'Customer Details', url: 'customer-details.html' },
        { title: 'Order History', url: 'customer-orders.html' }
      ]
    },
    {
      id: 'staff',
      title: 'Staff & RBAC',
      icon: '🛡️',
      url: 'staff.html',
      perm: 'staff.manage',
      badgeKey: 'staff',
      badgeType: 'accent',
      children: [
        { title: 'Staff Directory', url: 'staff.html', badgeKey: 'staff' },
        { title: 'Roles Hierarchy', url: 'roles.html', badgeKey: 'totalRoles' },
        { title: 'Permissions Matrix', url: 'permissions.html', badgeKey: 'totalPermissions' },
        { title: 'Security Audit Log', url: 'audit.html' }
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
        { title: 'Sales', url: 'analytics.html' },
        { title: 'Products', url: 'analytics-products.html' },
        { title: 'Customers', url: 'analytics-customers.html' },
        { title: 'Inventory', url: 'analytics-inventory.html' }
      ]
    },
    {
      id: 'settings',
      title: 'Store Settings',
      icon: '⚙️',
      url: 'settings.html',
      perm: 'settings.manage',
      badgeKey: null,
      children: [
        { title: 'General Store', url: 'settings.html#general', icon: '🏪' },
        { title: 'Branding & Appearance', url: 'settings.html#branding', icon: '🎨' },
        { title: 'Website & Domain', url: 'settings.html#website', icon: '🌐' },
        { title: 'Storefront', url: 'settings.html#storefront', icon: '🛒' },
        { title: 'Payments', url: 'settings.html#payments', icon: '💳' },
        { title: 'Shipping & Delivery', url: 'settings.html#shipping', icon: '📦' },
        { title: 'Inventory Settings', url: 'settings.html#inventory', icon: '📊' },
        { title: 'Orders & Checkout', url: 'settings.html#orders', icon: '🧾' },
        { title: 'Notifications', url: 'settings.html#notifications', icon: '🔔' },
        { title: 'Email & Communication', url: 'settings.html#email', icon: '📧' },
        { title: 'Customer Settings', url: 'settings.html#customers', icon: '👥' },
        { title: 'Taxes', url: 'settings.html#taxes', icon: '🧮' },
        { title: 'Integrations', url: 'settings.html#integrations', icon: '🔗' },
        { title: 'Security', url: 'settings.html#security', icon: '🔐' },
        { title: 'Data & Privacy', url: 'settings.html#privacy', icon: '🗑️' },
        { title: 'Advanced', url: 'settings.html#advanced', icon: '⚠️' }
      ]
    },
    {
      id: 'reports',
      title: 'Executive Reports',
      icon: '📑',
      url: 'reports.html',
      perm: 'analytics.view',
      badgeKey: null,
      children: [
        { title: 'Overview & Archives', url: 'reports.html', icon: '📋' },
        { title: 'Sales Register', url: 'reports-sales.html', icon: '📈', perm: 'analytics.view' },
        { title: 'Inventory Register', url: 'reports-inventory.html', icon: '📦', perm: 'inventory.view' },
        { title: 'Orders Register', url: 'reports-orders.html', icon: '🛍️', perm: 'orders.view' },
        { title: 'Patron Register', url: 'reports-customers.html', icon: '👑', perm: 'customers.view' },
        { title: 'Tax & GST Register', url: 'reports-tax.html', icon: '🧮', perm: 'analytics.view' },
        { title: 'Audit Register', url: 'reports-audit.html', icon: '🛡️', perm: 'settings.manage' },
        { title: 'Create Custom Report', url: 'reports-create.html', icon: '➕', badgeText: '+ New', badgeType: 'accent', perm: 'analytics.view' }
      ]
    }
  ],

  init() {
    this.currentUser = Auth.getUser();
    this.renderSidebar();
    this.renderTopNav();
    this.startRealTimeSync();
    this.handlePageActions();

    // Listen for hash navigation within the page
    window.addEventListener('hashchange', () => {
      this.handlePageActions();
      this.updateActiveSubItems();
    });

    // Handle clicking same-hash sub-items directly without page reload
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-sub-item');
      if (!link) return;
      const href = link.getAttribute('data-sub-url') || link.getAttribute('href') || '';
      if (href.includes('#')) {
        const hash = href.substring(href.indexOf('#'));
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const targetPath = href.split('?')[0].split('#')[0];
        if (currentPath === targetPath && window.location.hash === hash) {
          Admin.handlePageActions();
        }
      }
    });
  },

  updateActiveSubItems() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const currentHash = window.location.hash.toLowerCase();
    const currentSearch = window.location.search;

    document.querySelectorAll('.nav-sub-item').forEach(link => {
      const subUrl = link.getAttribute('data-sub-url') || '';
      const subPath = subUrl.split('?')[0].split('#')[0];
      const subHash = subUrl.includes('#') ? subUrl.substring(subUrl.indexOf('#')).toLowerCase() : '';
      const subSearch = subUrl.includes('?') ? subUrl.substring(subUrl.indexOf('?')).split('#')[0] : '';

      let isActive = false;
      if (currentPath === subPath) {
        if (subHash) {
          isActive = (currentHash === subHash);
        } else if (subSearch) {
          isActive = (currentSearch === subSearch);
        } else {
          isActive = (!currentSearch && !currentHash);
        }
      }
      if (isActive) link.classList.add('active');
      else link.classList.remove('active');
    });
  },

  renderSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    if (!sidebar) return;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const currentFullUrl = currentPath + window.location.search + window.location.hash;
    const user = this.currentUser;
    const isOwner = Auth.isOwner();

    const allowedGroups = this.menuTree.filter(item => {
      if (isOwner) return true;
      if (item.id === 'dashboard') return Auth.isStaff();
      if (item.id === 'reports') {
        return Auth.isStaff() || Auth.hasPermission('analytics.view');
      }
      return !item.perm || Auth.hasPermission(item.perm);
    });

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
          const visibleChildren = (group.children || []).filter(sub => {
            if (isOwner) return true;
            if (!sub.perm) return true;
            return Auth.hasPermission(sub.perm);
          });
          const isCurrentGroup = (currentPath === group.url.split('?')[0].split('#')[0]) ||
            (visibleChildren.some(sub => sub.url.split('?')[0].split('#')[0] === currentPath));
          const hasChildren = visibleChildren.length > 0;

          return `
            <li class="nav-group ${isCurrentGroup ? 'expanded active-page' : ''}" data-group-id="${group.id}">
              <div class="nav-parent-row ${isCurrentGroup && !window.location.hash && !window.location.search && currentPath === group.url ? 'active' : ''}" onclick="Admin.handleParentClick(event, '${group.id}', '${group.url}', ${hasChildren})">
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
                  ${visibleChildren.map(sub => {
                    const subPath = sub.url.split('?')[0].split('#')[0];
                    const subHash = sub.url.includes('#') ? sub.url.substring(sub.url.indexOf('#')) : '';
                    const subSearch = sub.url.includes('?') ? sub.url.substring(sub.url.indexOf('?')).split('#')[0] : '';
                    let isSubActive = false;
                    if (currentPath === subPath) {
                      if (subHash) {
                        isSubActive = (window.location.hash.toLowerCase() === subHash.toLowerCase()) || (!window.location.hash && subHash === '#general');
                      } else if (subSearch) {
                        isSubActive = (window.location.search === subSearch);
                      } else {
                        isSubActive = (!window.location.search && !window.location.hash);
                      }
                    }
                    return `
                      <li>
                        <a href="${sub.url}" class="nav-sub-item ${isSubActive ? 'active' : ''}" data-sub-url="${sub.url}">
                          <span>${sub.icon ? `<span style="margin-right: 0.35rem; font-size: 0.85rem;">${sub.icon}</span>` : ''}${sub.title}</span>
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
            revenue: `₹${Math.round(m.totalRevenue || 0).toLocaleString('en-IN')}`,
            orders: m.totalOrders || 0,
            todayOrders: m.todayOrders || 0,
            todayRev: `₹${(m.todayRevenue || 0).toFixed(0)}`,
            customers: m.totalCustomers || 0,
            staff: m.totalStaff || 0,
            totalRoles: 4,
            totalPermissions: 12,
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
        if (key === 'status_Deleted') {
          if (Number(val) > 0) {
            badgeEl.style.display = 'inline-flex';
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

    // 1. Dashboard Hash Highlighting & Target Resolution
    if (hash) {
      setTimeout(() => {
        let target = document.querySelector(hash);

        // Fallback for stock alerts banner if hidden
        if (hash === '#lowStockBanner') {
          const banner = document.getElementById('lowStockBanner');
          if (banner && banner.style.display !== 'none') {
            target = banner;
          } else {
            target = document.getElementById('cardLowStock') || banner;
          }
        }

        // If target is an inner stat element (e.g. #valRevenue, #valOrders, #valCustomers, #valProducts), highlight the parent card!
        const highlightTarget = (target && target.closest) ? (target.closest('.stat-card') || target) : target;

        if (highlightTarget) {
          highlightTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
          highlightTarget.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease, transform 0.4s ease';
          highlightTarget.style.borderColor = 'var(--color-gold)';
          highlightTarget.style.boxShadow = '0 0 35px rgba(201, 169, 110, 0.7)';
          highlightTarget.style.transform = 'translateY(-4px)';
          setTimeout(() => {
            highlightTarget.style.boxShadow = '';
            highlightTarget.style.transform = '';
          }, 2400);
        }

        // When navigating to products, also highlight and scroll towards live catalog fleet
        if (hash === '#valProducts' || hash === '#cardProducts') {
          const fleet = document.getElementById('ownerCatalogSection');
          if (fleet) {
            setTimeout(() => {
              fleet.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
              fleet.style.borderColor = 'rgba(201, 169, 110, 0.6)';
              fleet.style.boxShadow = '0 0 25px rgba(201, 169, 110, 0.35)';
              setTimeout(() => { fleet.style.boxShadow = ''; }, 2400);
            }, 500);
          }
        }
      }, 150);
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
