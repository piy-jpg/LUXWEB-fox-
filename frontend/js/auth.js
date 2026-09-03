/**
 * Lumière Luxury Client Authentication & Session Management
 * Handles JWT storage, API request authorization, navbar state sync, and routing.
 */

const AUTH_TOKEN_KEY = 'lumiere_token';
const AUTH_USER_KEY = 'lumiere_user';

const Auth = {
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    this.updateNavbar();
  },

  clearSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this.updateNavbar();
  },

  isLoggedIn() {
    return Boolean(this.getToken() && this.getUser());
  },

  isStaff() {
    const user = this.getUser();
    if (!user || !user.roles) return false;
    return user.roles.some(r => ['OWNER', 'MANAGER', 'INVENTORY_STAFF', 'ORDER_STAFF'].includes(r));
  },

  isOwner() {
    const user = this.getUser();
    return Boolean(user && user.roles && user.roles.includes('OWNER'));
  },

  hasPermission(permCode) {
    const user = this.getUser();
    if (!user) return false;
    if (this.isOwner()) return true;
    return Boolean(user.permissions && user.permissions.includes(permCode));
  },

  getBaseUrl() {
    if (window.location.protocol === 'file:') return 'http://localhost:5000';
    if (window.location.port === '5000' || window.location.hostname.includes('vercel.app')) return '';
    return 'http://localhost:5000';
  },

  async apiFetch(url, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fullUrl = url.startsWith('http') ? url : (this.getBaseUrl() + url);
    let res;
    try {
      res = await fetch(fullUrl, { ...options, headers });
    } catch (networkErr) {
      console.warn('[Auth.apiFetch] Network error:', networkErr.message);
      throw new Error('Unable to connect to Lumière server. Please ensure the backend is running.');
    }

    if (res.status === 401) {
      // Token expired or invalid
      this.clearSession();
      if (!window.location.pathname.includes('auth.html')) {
        window.location.href = 'auth.html?session=expired';
      }
    }

    return res;
  },

  logout() {
    this.clearSession();
    window.location.href = 'index.html';
  },

  /**
   * Dynamically update the storefront navbar with user profile dropdown or login link
   */
  updateNavbar() {
    const accountBtn = document.getElementById('navAccountBtn');
    if (!accountBtn) return;

    const user = this.getUser();
    if (user && this.getToken()) {
      const initials = `${user.firstName ? user.firstName[0] : ''}${user.lastName ? user.lastName[0] : ''}`.toUpperCase() || '✦';
      accountBtn.innerHTML = `
        <span class="nav-user-avatar" title="${user.firstName || 'Account'}">${initials}</span>
      `;
      accountBtn.onclick = (e) => {
        e.preventDefault();
        this.toggleAccountMenu();
      };
    } else {
      accountBtn.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      `;
      accountBtn.onclick = () => {
        window.location.href = 'auth.html';
      };
    }
  },

  toggleAccountMenu() {
    let menu = document.getElementById('lumiereAccountDropdown');
    if (menu) {
      menu.classList.toggle('active');
      return;
    }

    const user = this.getUser();
    menu = document.createElement('div');
    menu.id = 'lumiereAccountDropdown';
    menu.className = 'lumiere-account-dropdown active';

    let staffLinks = '';
    if (this.isStaff()) {
      staffLinks = `
        <div class="account-menu-divider"></div>
        <a href="admin/index.html" class="account-menu-item staff-portal-link">
          <span style="color: var(--color-gold, #C9A96E);">✦</span>
          <span>Admin Portal</span>
        </a>
      `;
    }

    menu.innerHTML = `
      <div class="account-menu-header">
        <div class="account-user-name">${user.firstName || ''} ${user.lastName || ''}</div>
        <div class="account-user-email">${user.email}</div>
      </div>
      <div class="account-menu-divider"></div>
      <a href="account.html" class="account-menu-item">
        <span>My Account Overview</span>
      </a>
      <a href="account.html#orders" class="account-menu-item">
        <span>Order History &amp; Tracking</span>
      </a>
      <a href="account.html#wishlist" class="account-menu-item">
        <span>My Wishlist</span>
      </a>
      ${staffLinks}
      <div class="account-menu-divider"></div>
      <button class="account-menu-item logout-item" onclick="Auth.logout()">
        <span>Sign Out</span>
      </button>
    `;

    document.body.appendChild(menu);

    // Close when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && !e.target.closest('#navAccountBtn')) {
          menu.classList.remove('active');
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 10);
  }
};

/**
 * Real Luxury Checkout Processing
 */
async function processCheckout() {
  const raw = localStorage.getItem('lumiere_cart') || localStorage.getItem('lumiere-cart');
  let items = [];
  try {
    items = raw ? JSON.parse(raw) : [];
  } catch {
    items = [];
  }

  if (!items || items.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Your luxury shopping bag is empty.');
    } else {
      alert('Your luxury shopping bag is empty.');
    }
    return;
  }

  const user = Auth.getUser();
  let customerName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : null;
  let customerEmail = user ? user.email : null;

  if (!user) {
    const wantsLogin = confirm('Would you like to sign in to your Lumière Account to track this order? Click OK to Sign In, or Cancel to continue with Complimentary Guest Delivery.');
    if (wantsLogin) {
      window.location.href = 'auth.html';
      return;
    }
    customerName = prompt('Enter your full name for delivery:', 'Guest Client');
    if (!customerName) return;
    customerEmail = prompt('Enter your email address for dispatch notification & receipt:', 'client@example.com');
    if (!customerEmail) return;
  }

  if (typeof showToast === 'function') {
    showToast('✦ Reserving inventory & placing order...');
  }

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(Auth.getToken() ? { 'Authorization': `Bearer ${Auth.getToken()}` } : {})
      },
      body: JSON.stringify({
        items: items.map(i => ({ productId: i.id, quantity: i.qty || 1 })),
        customerName,
        customerEmail,
        shippingAddress: { address: 'Complimentary White-Glove Concierge Delivery' }
      })
    });

    const data = await res.json();
    if (data.success) {
      localStorage.removeItem('lumiere_cart');
      localStorage.removeItem('lumiere-cart');
      if (typeof cart !== 'undefined' && Array.isArray(cart)) {
        cart.length = 0;
      }
      if (typeof updateCartUI === 'function') {
        updateCartUI();
      }
      if (typeof closeCartDrawer === 'function') {
        closeCartDrawer();
      }

      if (typeof showToast === 'function') {
        showToast(`✦ Order #${data.order.orderNumber} confirmed!`);
      }

      setTimeout(() => {
        if (Auth.isLoggedIn()) {
          window.location.href = 'account.html';
        } else {
          alert(`✦ Thank you! Your order #${data.order.orderNumber} has been placed. A confirmation receipt has been sent to ${customerEmail}.`);
        }
      }, 1000);
    } else {
      alert(data.error || 'Failed to complete order');
    }
  } catch (err) {
    alert(err.message || 'Order network error');
  }
}

// Initialize auth check on DOM load
document.addEventListener('DOMContentLoaded', () => {
  Auth.updateNavbar();
});

window.Auth = Auth;
window.processCheckout = processCheckout;
