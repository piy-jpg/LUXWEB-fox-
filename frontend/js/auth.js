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

  requireAuth(permCode) {
    if (!this.isLoggedIn()) {
      const isAdm = window.location.pathname.includes('/admin/');
      window.location.href = (isAdm ? '../auth.html' : 'auth.html') + '?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
      return false;
    }
    if (this.isOwner()) return true;
    if (!this.isStaff()) {
      alert('Access restricted to atelier personnel.');
      window.location.href = window.location.pathname.includes('/admin/') ? '../index.html' : 'index.html';
      return false;
    }
    if (permCode && !this.hasPermission(permCode)) {
      alert('Access restricted: your assigned role does not grant permission: ' + permCode);
      window.location.href = window.location.pathname.includes('/admin/') ? 'index.html' : 'index.html';
      return false;
    }
    return true;
  },

  getBaseUrl() {
    if (window.location.protocol === 'file:') return 'http://localhost:5000';
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return '';
    if (window.location.port === '5000') return '';
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
 * ============================================================
 * ATELIER LUXURY CHECKOUT & ORDER PROCESSING SUITE
 * ============================================================
 */
let currentCheckoutItems = [];
let currentCheckoutTotal = 0;
let currentCheckoutAddress = null;
let currentPaymentMethod = 'RAZORPAY';
let selectedUpiApp = '';
let userSavedAddresses = [];

function ensureRazorpayScriptLoaded() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('lumiereBackdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop && !(typeof isAnyOtherModalOpen === 'function' && isAnyOtherModalOpen())) {
    backdrop.classList.remove('open');
  }
  document.body.style.overflow = '';
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  const backdrop = document.getElementById('lumiereBackdrop');
  if (modal) modal.classList.remove('open');
  if (backdrop && !(typeof isAnyOtherModalOpen === 'function' && isAnyOtherModalOpen())) {
    backdrop.classList.remove('open');
  }
  document.body.style.overflow = '';

  setTimeout(() => {
    goToAddressStep();
    const addressStep = document.getElementById('chkStepAddress');
    const paymentStep = document.getElementById('chkStepPayment');
    const successStep = document.getElementById('checkoutSuccessStep');
    if (addressStep) addressStep.style.display = 'block';
    if (paymentStep) paymentStep.style.display = 'none';
    if (successStep) successStep.style.display = 'none';
  }, 350);
}

function continueShoppingFromCheckout() {
  closeCheckoutModal();
  if (window.location.pathname.endsWith('shop.html') || window.location.pathname.includes('shop')) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.location.href = 'shop.html';
  }
}

function goToAddressStep() {
  const stepAddr = document.getElementById('chkStepAddress');
  const stepPay = document.getElementById('chkStepPayment');
  const indAddr = document.getElementById('chkStepIndAddress');
  const indPay = document.getElementById('chkStepIndPayment');

  if (stepAddr) stepAddr.style.display = 'block';
  if (stepPay) stepPay.style.display = 'none';

  if (indAddr) {
    indAddr.className = 'step-indicator-item active';
    indAddr.innerHTML = '<span class="step-badge">1</span><span>Delivery Address</span>';
  }
  if (indPay) {
    indPay.className = 'step-indicator-item';
    indPay.innerHTML = '<span class="step-badge">2</span><span>Payment Method</span>';
  }

  const modalInner = document.querySelector('#checkoutModal .checkout-modal-inner');
  if (modalInner) modalInner.scrollTop = 0;
}

function proceedToPaymentStep() {
  const nameInput = document.getElementById('chkFullName');
  const emailInput = document.getElementById('chkEmail');
  const phoneInput = document.getElementById('chkPhone');
  const addressInput = document.getElementById('chkAddress');
  const cityInput = document.getElementById('chkCity');
  const stateInput = document.getElementById('chkState');
  const postalInput = document.getElementById('chkPostalCode');
  const notesInput = document.getElementById('chkNotes');

  const fullName = (nameInput ? nameInput.value : '').trim();
  const email = (emailInput ? emailInput.value : '').trim();
  const phone = (phoneInput ? phoneInput.value : '').trim();
  const address = (addressInput ? addressInput.value : '').trim();
  const city = (cityInput ? cityInput.value : '').trim();
  const state = (stateInput ? stateInput.value : '').trim();
  const postalCode = (postalInput ? postalInput.value : '').trim();
  const notes = (notesInput ? notesInput.value : '').trim();

  // Highlight helper
  const markField = (input, isErr) => {
    if (!input) return;
    input.style.borderColor = isErr ? '#e74c3c' : 'rgba(255,255,255,0.15)';
    if (isErr) input.focus();
  };

  if (!fullName) {
    markField(nameInput, true);
    if (typeof showToast === 'function') showToast('⚠️ Please provide your full name for delivery.');
    else alert('Please provide your full name.');
    return;
  } else { markField(nameInput, false); }

  if (!phone || phone.length < 7) {
    markField(phoneInput, true);
    if (typeof showToast === 'function') showToast('⚠️ Please enter a contact phone number for courier dispatch.');
    else alert('Please enter a valid phone number.');
    return;
  } else { markField(phoneInput, false); }

  if (!email || !email.includes('@')) {
    markField(emailInput, true);
    if (typeof showToast === 'function') showToast('⚠️ Please provide a valid email address for tracking.');
    else alert('Please provide a valid email.');
    return;
  } else { markField(emailInput, false); }

  if (!address) {
    markField(addressInput, true);
    if (typeof showToast === 'function') showToast('⚠️ Please enter your street address.');
    else alert('Please enter your street address.');
    return;
  } else { markField(addressInput, false); }

  if (!city) {
    markField(cityInput, true);
    if (typeof showToast === 'function') showToast('⚠️ Please enter your city.');
    else alert('Please enter your city.');
    return;
  } else { markField(cityInput, false); }

  if (!postalCode) {
    markField(postalInput, true);
    if (typeof showToast === 'function') showToast('⚠️ Please enter your postal / PIN code.');
    else alert('Please enter your postal / PIN code.');
    return;
  } else { markField(postalInput, false); }

  currentCheckoutAddress = {
    fullName,
    phone,
    email,
    address,
    city,
    state,
    postalCode,
    notes
  };

  // Populate Step 2 Address Recap Bar
  const recapEl = document.getElementById('chkAddressRecapContent');
  if (recapEl) {
    recapEl.innerHTML = `
      <div style="font-weight:600; color:var(--color-gold); margin-bottom:0.2rem;">Deliver to: ${escapeHtml(fullName)} &bull; ${escapeHtml(phone)}</div>
      <div style="color:rgba(250,247,242,0.85);">${escapeHtml(address)}, ${escapeHtml(city)}${state ? ', ' + escapeHtml(state) : ''} - ${escapeHtml(postalCode)}</div>
      ${notes ? `<div style="font-size:0.7rem; color:rgba(250,247,242,0.55); margin-top:0.15rem;">Note: ${escapeHtml(notes)}</div>` : ''}
    `;
  }

  // Update QR code & amount
  updateCheckoutQrCode(currentCheckoutTotal);

  // Transition views
  const stepAddr = document.getElementById('chkStepAddress');
  const stepPay = document.getElementById('chkStepPayment');
  const indAddr = document.getElementById('chkStepIndAddress');
  const indPay = document.getElementById('chkStepIndPayment');

  if (stepAddr) stepAddr.style.display = 'none';
  if (stepPay) stepPay.style.display = 'block';

  if (indAddr) {
    indAddr.className = 'step-indicator-item completed';
    indAddr.innerHTML = '<span class="step-badge">✓</span><span>Address Confirmed</span>';
  }
  if (indPay) {
    indPay.className = 'step-indicator-item active';
    indPay.innerHTML = '<span class="step-badge">2</span><span>Payment Method</span>';
  }

  // Reset payment selection to RAZORPAY default or current selection
  selectPaymentOption(currentPaymentMethod || 'RAZORPAY');

  const modalInner = document.querySelector('#checkoutModal .checkout-modal-inner');
  if (modalInner) modalInner.scrollTop = 0;
}

function selectPaymentOption(mode, element) {
  if (mode !== 'COD') mode = 'RAZORPAY';
  currentPaymentMethod = mode;

  // Toggle active class on cards
  const cards = document.querySelectorAll('.payment-method-card');
  cards.forEach(c => c.classList.remove('selected'));

  const targetId = mode === 'COD' ? 'pmCardCod' : 'pmCardRazorpay';
  const cardTarget = element || document.getElementById(targetId);
  if (cardTarget) {
    cardTarget.classList.add('selected');
    const radio = cardTarget.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }

  // Update Place Order CTA button
  const btn = document.getElementById('btnPlaceOrder');
  if (btn) {
    const formattedTotal = `₹${currentCheckoutTotal.toFixed(2)}`;
    if (mode === 'COD') {
      btn.innerHTML = `<span>💵</span> CONFIRM ORDER WITH CASH ON DELIVERY (${formattedTotal}) &rarr;`;
    } else {
      btn.innerHTML = `<span>💳</span> PAY VIA RAZORPAY (${formattedTotal}) &rarr;`;
    }
  }
}

function selectUpiApp(appName, chipEl) {
  selectedUpiApp = appName;
  document.querySelectorAll('.upi-app-chip').forEach(c => {
    c.style.background = 'rgba(255, 255, 255, 0.05)';
    c.style.borderColor = 'rgba(255, 255, 255, 0.12)';
    c.style.color = 'rgba(250, 247, 242, 0.85)';
  });

  if (chipEl) {
    chipEl.style.background = 'rgba(200, 169, 126, 0.2)';
    chipEl.style.borderColor = 'var(--color-gold)';
    chipEl.style.color = 'var(--color-gold)';
  }

  const upiInput = document.getElementById('chkUpiId');
  if (upiInput && !upiInput.value.trim()) {
    if (appName === 'Google Pay') upiInput.placeholder = 'e.g. yourname@okhdfcbank or @okaxis';
    else if (appName === 'PhonePe') upiInput.placeholder = 'e.g. yourname@ybl or @ibl';
    else if (appName === 'Paytm') upiInput.placeholder = 'e.g. mobile@paytm';
    else upiInput.placeholder = 'e.g. yourname@upi';
    upiInput.focus();
  }
}

function appendUpiHandle(handle) {
  const upiInput = document.getElementById('chkUpiId');
  if (!upiInput) return;

  let currentVal = upiInput.value.trim();
  if (currentVal.includes('@')) {
    currentVal = currentVal.split('@')[0];
  }
  upiInput.value = (currentVal || 'client') + handle;
  upiInput.focus();
}

const OWNER_UPI_CONFIG = {
  vpa: '7300212948-2@axl',
  name: 'PIYUSH VERMA',
  qrImage: 'images/phonepe_owner_qr.jpg'
};

let currentQrViewMode = 'dynamic';

function setQrViewMode(mode) {
  currentQrViewMode = mode;
  const dynContainer = document.getElementById('chkQrDynamicContainer');
  const ownerContainer = document.getElementById('chkQrOwnerContainer');
  const tabDyn = document.getElementById('chkQrTabDynamic');
  const tabOwner = document.getElementById('chkQrTabOwner');

  if (mode === 'dynamic') {
    if (dynContainer) dynContainer.style.display = 'block';
    if (ownerContainer) ownerContainer.style.display = 'none';
    if (tabDyn) tabDyn.classList.add('active');
    if (tabOwner) tabOwner.classList.remove('active');
  } else {
    if (dynContainer) dynContainer.style.display = 'none';
    if (ownerContainer) ownerContainer.style.display = 'block';
    if (tabOwner) tabOwner.classList.add('active');
    if (tabDyn) tabDyn.classList.remove('active');
  }
}

function copyPayeeUpiId() {
  const vpa = OWNER_UPI_CONFIG.vpa;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(vpa).then(() => {
      if (typeof showToast === 'function') showToast(`✦ Payee UPI ID copied: ${vpa} (${OWNER_UPI_CONFIG.name})`);
      else alert(`Payee UPI ID copied: ${vpa}`);
    }).catch(() => {
      if (typeof showToast === 'function') showToast(`✦ UPI ID: ${vpa}`);
    });
  } else {
    if (typeof showToast === 'function') showToast(`✦ UPI ID: ${vpa}`);
  }
}

function updateCheckoutQrCode(totalAmount) {
  const qrImg = document.getElementById('chkQrCodeImg');
  const qrAmountVal = document.getElementById('chkQrAmountVal');
  const inrAmountSpan = document.getElementById('chkQrInrAmount');
  const tabDynAmount = document.getElementById('chkQrTabDynAmount');
  const directLink = document.getElementById('chkQrDirectPayLink');

  const inrAmount = Math.max(1, Math.round(totalAmount || 0));
  const inrFormatted = `₹${inrAmount.toLocaleString('en-IN')}`;

  if (qrAmountVal) {
    qrAmountVal.textContent = inrFormatted;
  }
  if (inrAmountSpan) {
    inrAmountSpan.textContent = inrFormatted;
  }
  if (tabDynAmount) {
    tabDynAmount.textContent = inrAmount;
  }

  // Clean, standard NPCI P2P UPI URI without problematic merchant parameters
  const upiUri = `upi://pay?pa=${encodeURIComponent(OWNER_UPI_CONFIG.vpa)}&pn=${encodeURIComponent(OWNER_UPI_CONFIG.name)}&am=${inrAmount}&cu=INR&tn=${encodeURIComponent('Lumiere Order')}`;

  if (directLink) {
    directLink.href = upiUri;
  }

  if (qrImg) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(upiUri)}`;
    qrImg.src = qrUrl;
    qrImg.onerror = function() {
      this.onerror = null;
      // If external API fails, display the owner's PhonePe QR image
      this.src = OWNER_UPI_CONFIG.qrImage;
    };
  }
}

function copyWhatsAppOrderText(encodedText) {
  try {
    const text = decodeURIComponent(encodedText);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') showToast('✦ Complete WhatsApp order text copied to clipboard!');
        else alert('WhatsApp order details copied to clipboard!');
      }).catch(() => {
        if (typeof showToast === 'function') showToast('✦ Order details ready for WhatsApp');
      });
    } else {
      if (typeof showToast === 'function') showToast('✦ Order details ready for WhatsApp');
    }
  } catch {
    if (typeof showToast === 'function') showToast('✦ Order details ready for WhatsApp');
  }
}

async function loadSavedAddressesForCheckout() {
  const container = document.getElementById('chkSavedAddressesContainer');
  const list = document.getElementById('chkSavedAddressesList');
  if (!container || !list) return;

  if (!Auth.isLoggedIn()) {
    container.style.display = 'none';
    return;
  }

  try {
    const res = await fetch('/api/account/addresses', {
      headers: {
        'Authorization': `Bearer ${Auth.getToken()}`
      }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
      userSavedAddresses = data.addresses;
      container.style.display = 'block';

      list.innerHTML = userSavedAddresses.map((addr, idx) => `
        <div class="saved-address-card ${addr.is_default || idx === 0 ? 'selected' : ''}" onclick="selectSavedAddress(${addr.id})" id="savedAddrCard_${addr.id}">
          <input type="radio" name="chkSavedAddrRadio" ${addr.is_default || idx === 0 ? 'checked' : ''} style="accent-color:var(--color-gold); margin-top:2px;" />
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="font-size:0.85rem; color:#FAF7F2;">${escapeHtml(addr.full_name)}</strong>
              ${addr.is_default ? '<span style="font-size:0.62rem; color:var(--color-gold); border:1px solid rgba(200,169,126,0.4); padding:0.1rem 0.4rem; border-radius:10px;">DEFAULT</span>' : ''}
            </div>
            <div style="font-size:0.75rem; color:rgba(250,247,242,0.7); margin-top:0.2rem;">
              ${escapeHtml(addr.address_line1)}${addr.address_line2 ? ', ' + escapeHtml(addr.address_line2) : ''}, ${escapeHtml(addr.city)}, ${escapeHtml(addr.state || '')} ${escapeHtml(addr.postal_code)}
            </div>
            <div style="font-size:0.7rem; color:rgba(250,247,242,0.5); margin-top:0.15rem;">
              📞 ${escapeHtml(addr.phone || '')}
            </div>
          </div>
        </div>
      `).join('');

      // Auto-fill form with the default or first saved address
      const selected = userSavedAddresses.find(a => a.is_default) || userSavedAddresses[0];
      if (selected) {
        populateAddressForm(selected);
      }
    } else {
      container.style.display = 'none';
    }
  } catch {
    container.style.display = 'none';
  }
}

function selectSavedAddress(addrId) {
  if (addrId === 'new') {
    document.querySelectorAll('.saved-address-card').forEach(c => c.classList.remove('selected'));
    const formFields = ['chkAddress', 'chkCity', 'chkState', 'chkPostalCode', 'chkNotes'];
    formFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const addrInput = document.getElementById('chkAddress');
    if (addrInput) addrInput.focus();
    return;
  }

  document.querySelectorAll('.saved-address-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById(`savedAddrCard_${addrId}`);
  if (card) {
    card.classList.add('selected');
    const radio = card.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }

  const addr = userSavedAddresses.find(a => a.id === addrId);
  if (addr) {
    populateAddressForm(addr);
  }
}

function populateAddressForm(addr) {
  const nameInput = document.getElementById('chkFullName');
  const phoneInput = document.getElementById('chkPhone');
  const addressInput = document.getElementById('chkAddress');
  const cityInput = document.getElementById('chkCity');
  const stateInput = document.getElementById('chkState');
  const postalInput = document.getElementById('chkPostalCode');

  if (nameInput && addr.full_name) nameInput.value = addr.full_name;
  if (phoneInput && addr.phone) phoneInput.value = addr.phone;
  if (addressInput) addressInput.value = `${addr.address_line1 || ''}${addr.address_line2 ? ', ' + addr.address_line2 : ''}`.trim();
  if (cityInput && addr.city) cityInput.value = addr.city;
  if (stateInput && addr.state) stateInput.value = addr.state;
  if (postalInput && addr.postal_code) postalInput.value = addr.postal_code;
}

function ensureCheckoutModalInDom() {
  if (document.getElementById('checkoutModal')) return;

  const modalHtml = `
  <div class="checkout-modal" id="checkoutModal" role="dialog" aria-modal="true" aria-labelledby="checkoutModalTitle">
    <div class="checkout-modal-inner">
      <button class="modal-close-btn" onclick="closeCheckoutModal()" aria-label="Close Checkout" style="position:absolute; top:-0.5rem; right:-0.5rem; background:none; border:none; color:rgba(250,247,242,0.6); font-size:1.8rem; cursor:pointer; padding:0.25rem 0.5rem; line-height:1; z-index:10;">&times;</button>
      
      <!-- Progress Bar (2-Step Guided Experience) -->
      <div class="checkout-step-progress">
        <div class="step-indicator-item active" id="chkStepIndAddress">
          <span class="step-badge">1</span>
          <span>Delivery Address</span>
        </div>
        <span class="step-arrow">&rarr;</span>
        <div class="step-indicator-item" id="chkStepIndPayment">
          <span class="step-badge">2</span>
          <span>Payment (COD / UPI / QR)</span>
        </div>
      </div>

      <!-- STEP 1: Delivery Address & Client Destination -->
      <div id="chkStepAddress">
        <div class="checkout-header">
          <div class="checkout-gold-badge">✦ ATELIER LUXURY CHECKOUT &bull; STEP 1</div>
          <h2 id="checkoutModalTitle" class="checkout-main-title">Delivery Destination &amp; Client Details</h2>
          <p class="checkout-subtitle">Complimentary insured courier delivery &amp; white-glove atelier packaging on all orders.</p>
        </div>

        <div class="checkout-grid">
          <!-- Left: Address Form & Saved Address Selector -->
          <div class="checkout-left-col">
            <!-- Saved Addresses (if logged in) -->
            <div id="chkSavedAddressesContainer" style="display:none; margin-bottom: 1.25rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--color-gold); margin-bottom:0.65rem; font-weight:600;">
                ✦ Select Saved Delivery Address
              </div>
              <div id="chkSavedAddressesList" class="saved-addresses-grid"></div>
              <button type="button" class="upi-chip-btn" onclick="selectSavedAddress('new')" style="margin-top:0.4rem; padding:0.3rem 0.75rem;">
                + Enter a Different Delivery Address Below
              </button>
            </div>

            <!-- Client Identification Section -->
            <div class="checkout-section">
              <div class="checkout-section-header">
                <span class="checkout-step-num">✦</span>
                <h3>Client Identification</h3>
              </div>
              <div class="checkout-fields-row">
                <div class="checkout-field-group">
                  <label>Full Name *</label>
                  <input type="text" id="chkFullName" class="checkout-input" placeholder="e.g. Genevieve Vance" required />
                </div>
                <div class="checkout-field-group">
                  <label>Contact Phone * (Courier Dispatch)</label>
                  <input type="tel" id="chkPhone" class="checkout-input" placeholder="+1 (555) 019-2834" required />
                </div>
              </div>
              <div class="checkout-fields-row">
                <div class="checkout-field-group">
                  <label>Email Address * (Receipt &amp; Tracking)</label>
                  <input type="email" id="chkEmail" class="checkout-input" placeholder="client@lumiere.com" required />
                </div>
                <div class="checkout-field-group">
                  <label>Special Instructions (Optional)</label>
                  <input type="text" id="chkNotes" class="checkout-input" placeholder="e.g. Leave with concierge desk" />
                </div>
              </div>
            </div>

            <!-- Delivery Street Address Section -->
            <div class="checkout-section" style="margin-bottom:0;">
              <div class="checkout-section-header">
                <span class="checkout-step-num">📍</span>
                <h3>Delivery Address</h3>
              </div>
              <div class="checkout-field-group">
                <label>Street Address * (Apartment, Suite, Unit)</label>
                <input type="text" id="chkAddress" class="checkout-input" placeholder="740 Park Avenue, Penthouse B" required />
              </div>
              <div class="checkout-fields-row">
                <div class="checkout-field-group">
                  <label>City *</label>
                  <input type="text" id="chkCity" class="checkout-input" placeholder="New York" required />
                </div>
                <div class="checkout-field-group">
                  <label>State / Province</label>
                  <input type="text" id="chkState" class="checkout-input" placeholder="NY" />
                </div>
                <div class="checkout-field-group">
                  <label>Postal / PIN Code *</label>
                  <input type="text" id="chkPostalCode" class="checkout-input" placeholder="10021" required />
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Order Summary Deck & Proceed to Payment -->
          <div class="checkout-right-col">
            <div class="checkout-summary-card">
              <h3 class="checkout-summary-title">Curated Order Summary</h3>
              <div class="checkout-items-list" id="checkoutItemsListStep1"></div>

              <div class="checkout-ledger">
                <div class="ledger-row">
                  <span>Bag Subtotal</span>
                  <span id="chkSubtotalValStep1">₹0.00</span>
                </div>
                <div class="ledger-row">
                  <span>Haute Packaging &amp; Wax Seal</span>
                  <span style="color: #C8A97E;">Complimentary ✦</span>
                </div>
                <div class="ledger-row">
                  <span>Insured White-Glove Shipping</span>
                  <span style="color: #7bed9f;">Free Delivery</span>
                </div>
                <div class="ledger-divider"></div>
                <div class="ledger-row ledger-total">
                  <span>Total Settlement</span>
                  <span class="ledger-total-amount" id="chkTotalValStep1">₹0.00</span>
                </div>
              </div>

              <button type="button" id="btnToPaymentStep" class="btn-luxury-primary checkout-submit-btn" onclick="proceedToPaymentStep()">
                <span>✦</span> PROCEED TO PAYMENT (COD / UPI / QR) &rarr;
              </button>
              <button type="button" class="btn-luxury-outline" style="width: 100%; margin-top: 0.75rem;" onclick="closeCheckoutModal()">
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 2: Payment & Settlement Method (COD, UPI, QR) -->
      <div id="chkStepPayment" style="display: none;">
        <div class="checkout-header">
          <div class="checkout-gold-badge">✦ ATELIER LUXURY CHECKOUT &bull; STEP 2</div>
          <h2 class="checkout-main-title">Select Payment &amp; Settlement Method</h2>
          <p class="checkout-subtitle">Choose Cash on Delivery, instant UPI payment, or scan UPI QR code.</p>
        </div>

        <!-- Address Recap Bar with Edit Button -->
        <div id="chkAddressRecapBar" class="address-recap-bar">
          <div id="chkAddressRecapContent" style="font-size:0.8rem; line-height:1.4;"></div>
          <button type="button" class="btn-luxury-outline" style="padding:0.35rem 0.85rem; font-size:0.72rem; white-space:nowrap; border-color:var(--color-gold); color:var(--color-gold);" onclick="goToAddressStep()">
            ✏️ Edit Address
          </button>
        </div>

        <div class="checkout-grid">
          <!-- Left: Payment Options (COD, UPI, QR) -->
          <div class="checkout-left-col">
            <!-- 0. Instant Online Payment via Razorpay (PhonePe, Google Pay, UPI, Cards) -->
            <div class="payment-method-card selected" id="pmCardRazorpay" onclick="selectPaymentOption('RAZORPAY', this)">
              <div class="pm-header">
                <input type="radio" name="chkPaymentOption" class="pm-radio" value="RAZORPAY" checked />
                <div>
                  <div class="pm-title">💳 Pay Online (PhonePe / Google Pay / UPI / Cards / Net Banking)</div>
                  <div class="pm-sub">Instant 1-click UPI, PhonePe, Cards, Net Banking with automated verification.</div>
                </div>
                <span class="pm-badge" style="background:rgba(200,169,126,0.22); color:var(--color-gold); border:1px solid rgba(200,169,126,0.45);">✦ Recommended</span>
              </div>
            </div>

            <!-- 1. Cash on Delivery (COD) -->
            <div class="payment-method-card" id="pmCardCod" onclick="selectPaymentOption('COD', this)">
              <div class="pm-header">
                <input type="radio" name="chkPaymentOption" class="pm-radio" value="COD" />
                <div>
                  <div class="pm-title">💵 Cash on Delivery (COD)</div>
                  <div class="pm-sub">Pay in cash or via mobile scanner upon white-glove arrival at your doorstep.</div>
                </div>
                <span class="pm-badge pm-badge-cod">Zero Advance Payment</span>
              </div>
            </div>

            <!-- End of Payment Options (Razorpay and COD only) -->

            <!-- Navigation Buttons -->
            <div style="display:flex; gap:0.75rem; margin-top:1.25rem;">
              <button type="button" class="btn-luxury-outline" onclick="goToAddressStep()" style="padding:0.75rem 1.25rem; font-size:0.8rem;">
                &larr; Back to Delivery Address
              </button>
            </div>
          </div>

          <!-- Right: Order Summary & Place Order CTA -->
          <div class="checkout-right-col">
            <div class="checkout-summary-card">
              <h3 class="checkout-summary-title">Order Summary</h3>
              <div class="checkout-items-list" id="checkoutItemsListStep2"></div>

              <div class="checkout-ledger">
                <div class="ledger-row">
                  <span>Bag Subtotal</span>
                  <span id="chkSubtotalValStep2">₹0.00</span>
                </div>
                <div class="ledger-row">
                  <span>Haute Packaging &amp; Wax Seal</span>
                  <span style="color: #C8A97E;">Complimentary ✦</span>
                </div>
                <div class="ledger-row">
                  <span>Insured White-Glove Shipping</span>
                  <span style="color: #7bed9f;">Free Delivery</span>
                </div>
                <div class="ledger-divider"></div>
                <div class="ledger-row ledger-total">
                  <span>Total Settlement</span>
                  <span class="ledger-total-amount" id="chkTotalValStep2">₹0.00</span>
                </div>
              </div>

              <div class="checkout-guarantees">
                <div class="guarantee-item">
                  <span class="g-icon">🔒</span>
                  <span>256-Bit SSL End-to-End Encrypted Settlement</span>
                </div>
                <div class="guarantee-item">
                  <span class="g-icon">✦</span>
                  <span>Fresh Atelier Batch Formulation Allocation</span>
                </div>
                <div class="guarantee-item">
                  <span class="g-icon">📦</span>
                  <span>Complimentary 30-Day White-Glove Returns</span>
                </div>
              </div>

              <button type="button" id="btnPlaceOrder" class="btn-luxury-primary checkout-submit-btn" onclick="executeOrderPlacement()">
                <span>✦</span> CONFIRM ORDER WITH CASH ON DELIVERY (₹0.00) &rarr;
              </button>
              <button type="button" class="btn-luxury-outline" style="width: 100%; margin-top: 0.75rem;" onclick="closeCheckoutModal()">
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 3: Order Success Receipt Screen -->
      <div id="checkoutSuccessStep" style="display: none; padding: 2.5rem 1.5rem; text-align: center;">
        <div class="order-success-icon">✦</div>
        <span class="order-success-tag">ATELIER DISPATCH CONFIRMED</span>
        <h2 class="order-success-title">Thank You For Your Order</h2>
        <p class="order-success-sub" id="orderSuccessSub">Your luxury selection is now being curated with white-glove precision.</p>

        <div class="order-success-card" id="orderSuccessCard"></div>

        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; flex-wrap: wrap;">
          <button type="button" class="btn-luxury-primary" onclick="continueShoppingFromCheckout()" style="padding: 0.85rem 2rem;">
            CONTINUE SHOPPING &rarr;
          </button>
          <button type="button" id="btnSuccessTrackAccount" class="btn-luxury-outline" onclick="window.location.href='account.html';" style="padding: 0.85rem 2rem;">
            VIEW IN MY ACCOUNT
          </button>
        </div>
      </div>

    </div>
  </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = modalHtml.trim();
  document.body.appendChild(div.firstElementChild);

  // Ensure backdrop exists
  if (!document.getElementById('lumiereBackdrop')) {
    const bd = document.createElement('div');
    bd.id = 'lumiereBackdrop';
    bd.className = 'lumiere-backdrop';
    bd.onclick = function() {
      if (typeof closeAllDrawersAndModals === 'function') closeAllDrawersAndModals();
      else {
        closeCheckoutModal();
        closeCartDrawer();
      }
    };
    document.body.appendChild(bd);
  }
}

function openCheckoutModal(items) {
  ensureCheckoutModalInDom();
  currentCheckoutItems = items || [];

  const modal = document.getElementById('checkoutModal');
  const backdrop = document.getElementById('lumiereBackdrop');
  const listStep1 = document.getElementById('checkoutItemsListStep1');
  const listStep2 = document.getElementById('checkoutItemsListStep2');
  const subtotalStep1 = document.getElementById('chkSubtotalValStep1');
  const totalStep1 = document.getElementById('chkTotalValStep1');
  const subtotalStep2 = document.getElementById('chkSubtotalValStep2');
  const totalStep2 = document.getElementById('chkTotalValStep2');

  // Reset steps to step 1
  goToAddressStep();
  const successStep = document.getElementById('checkoutSuccessStep');
  if (successStep) successStep.style.display = 'none';

  // Populate items
  let subtotal = 0;
  const itemsHtml = currentCheckoutItems.map(item => {
    const qty = parseInt(item.qty || item.quantity || 1, 10);
    const price = parseFloat(item.price || 0);
    const lineTotal = price * qty;
    subtotal += lineTotal;

    let imgPath = item.img || item.image || 'images/skincare_products_1788328338930.jpg';

    return `
      <div class="checkout-summary-item">
        <img src="${imgPath}" alt="${escapeHtml(item.name)}" onerror="this.src='images/skincare_products_1788328338930.jpg'" />
        <div class="checkout-item-details">
          <div class="checkout-item-name">${escapeHtml(item.name)}</div>
          <div class="checkout-item-sub">Qty: ${qty} ${item.shade ? `&bull; Shade: ${escapeHtml(item.shade)}` : ''} &bull; ₹${price.toFixed(2)} ea</div>
        </div>
        <div class="checkout-item-total">₹${lineTotal.toFixed(2)}</div>
      </div>
    `;
  }).join('');

  currentCheckoutTotal = subtotal;
  const formattedSubtotal = `₹${subtotal.toFixed(2)}`;

  if (listStep1) listStep1.innerHTML = itemsHtml;
  if (listStep2) listStep2.innerHTML = itemsHtml;
  if (subtotalStep1) subtotalStep1.textContent = formattedSubtotal;
  if (totalStep1) totalStep1.textContent = formattedSubtotal;
  if (subtotalStep2) subtotalStep2.textContent = formattedSubtotal;
  if (totalStep2) totalStep2.textContent = formattedSubtotal;

  const btnStep1 = document.getElementById('btnToPaymentStep');
  if (btnStep1) {
    btnStep1.innerHTML = `<span>✦</span> PROCEED TO PAYMENT (${formattedSubtotal}) &rarr;`;
  }

  // Pre-fill user details if logged in
  const user = Auth.getUser();
  const nameInput = document.getElementById('chkFullName');
  const emailInput = document.getElementById('chkEmail');
  const phoneInput = document.getElementById('chkPhone');

  if (user) {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || '';
    if (nameInput && !nameInput.value) nameInput.value = fullName;
    if (emailInput && !emailInput.value) emailInput.value = user.email || '';
    if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '';
    loadSavedAddressesForCheckout();
  }

  // Update QR Code
  updateCheckoutQrCode(currentCheckoutTotal);
  selectPaymentOption(currentPaymentMethod || 'RAZORPAY');

  // Open modal & backdrop
  if (modal) modal.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function playBlinkitSuccessChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    
    // Tone 1: Gentle Bell Harmonics (D5 climbing to A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.32, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.55);

    // Tone 2: Sparkle Note (D6 chime resonance)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.09);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22);
    gain2.gain.setValueAtTime(0, now + 0.09);
    gain2.gain.linearRampToValueAtTime(0.38, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.85);
  } catch (e) {
    console.log('[Audio] Chime skipped:', e);
  }
}

function launchBlinkitConfetti(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#C8A97E', '#25D366', '#FAF7F2', '#FFD700', '#00D2D3', '#FF6B6B', '#D4AF37'];
  for (let i = 0; i < 48; i++) {
    const p = document.createElement('div');
    const left = Math.random() * 98;
    const w = 6 + Math.random() * 6;
    const h = w * (0.6 + Math.random() * 0.8);
    const bg = colors[Math.floor(Math.random() * colors.length)];
    const delay = Math.random() * 0.4;
    const duration = 1.4 + Math.random() * 1.3;
    const rot = Math.random() * 360;
    p.style.cssText = `
      position: absolute;
      top: -12px;
      left: ${left}%;
      width: ${w}px;
      height: ${h}px;
      background: ${bg};
      border-radius: 2px;
      transform: rotate(${rot}deg);
      opacity: 0.95;
      pointer-events: none;
      animation: blinkitConfettiFall ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards;
    `;
    container.appendChild(p);
  }
}

function copyOrderNumber(num) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(num).then(() => {
      if (typeof showToast === 'function') showToast(`✦ Order #${num} copied to clipboard!`);
      else alert(`Order #${num} copied!`);
    }).catch(() => {
      if (typeof showToast === 'function') showToast(`✦ Order #${num}`);
    });
  } else {
    if (typeof showToast === 'function') showToast(`✦ Order #${num}`);
  }
}

function handleCheckoutSuccess(data) {
  // Clear Cart
  localStorage.removeItem('lumiere_cart');
  localStorage.removeItem('lumiere-cart');
  if (typeof cart !== 'undefined' && Array.isArray(cart)) {
    cart.length = 0;
  }
  if (typeof updateCartUI === 'function') {
    updateCartUI();
  }

  // Persist order in client localStorage so it immediately reflects in Account (/account.html)
  if (data && data.order) {
    try {
      const existingOrders = JSON.parse(localStorage.getItem('lumiere_customer_orders') || '[]');
      const newOrder = {
        id: data.order.id || Date.now(),
        order_number: data.order.orderNumber || data.order.order_number,
        subtotal: data.order.subtotal,
        total_amount: data.order.totalAmount || data.order.total_amount || currentCheckoutTotal,
        status: data.order.status || 'Confirmed',
        payment_status: data.order.paymentStatus || data.order.payment_status || 'Paid',
        payment_method: data.order.paymentMethod || (currentPaymentMethod === 'RAZORPAY' ? 'Online Payment (PhonePe / UPI / Cards via Razorpay)' : 'Cash on Delivery (COD)'),
        created_at: data.order.createdAt || new Date().toISOString(),
        items: data.order.items || currentCheckoutItems || []
      };
      const filtered = existingOrders.filter(o => (o.order_number || o.orderNumber) !== newOrder.order_number);
      filtered.unshift(newOrder);
      localStorage.setItem('lumiere_customer_orders', JSON.stringify(filtered));
    } catch (_) {}
  }

  try {
    const bc = new BroadcastChannel('lumiere_cart_bus');
    bc.postMessage({ type: 'CART_CLEARED' });
  } catch {}

  // Play satisfying success chime (Blinkit audio feedback)
  playBlinkitSuccessChime();

  const stepAddr = document.getElementById('chkStepAddress');
  const stepPay = document.getElementById('chkStepPayment');
  const successStep = document.getElementById('checkoutSuccessStep');

  if (stepAddr) stepAddr.style.display = 'none';
  if (stepPay) stepPay.style.display = 'none';
  if (successStep) successStep.style.display = 'block';

  const orderNum = data.order.orderNumber;
  const totalAmt = parseFloat(data.order.totalAmount || currentCheckoutTotal).toFixed(2);
  const pmLabel = data.order.paymentMethod || (currentPaymentMethod === 'RAZORPAY' ? 'Online Payment (Razorpay Live)' : 'Cash on Delivery (COD)');
  const payStatus = data.order.paymentStatus || 'Paid';

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Items HTML with Blinkit-style compact bill format
  const itemsHtml = currentCheckoutItems.map(i => `
    <div class="blinkit-bill-row">
      <span style="color:#FAF7F2; max-width:70%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
        ${escapeHtml(i.name)} <span style="color:rgba(250,247,242,0.5);">&times; ${i.qty || 1}</span>
      </span>
      <strong style="color:#FAF7F2;">₹${((parseFloat(i.price || 0)) * (parseInt(i.qty || 1, 10))).toFixed(2)}</strong>
    </div>
  `).join('');

  const ownerNotif = data.order.ownerNotification || {};
  const whatsAppUrl = ownerNotif.whatsAppUrl || `https://api.whatsapp.com/send?phone=917300212948&text=${encodeURIComponent(`New Order #${orderNum} (₹${totalAmt}) from ${currentCheckoutAddress.fullName}`)}`;
  const whatsAppTextEncoded = encodeURIComponent(ownerNotif.whatsAppText || `New Order #${orderNum}`);

  successStep.innerHTML = `
    <div class="blinkit-success-wrap">
      <!-- Confetti Canvas -->
      <div id="blinkitConfettiBox" class="blinkit-confetti-container"></div>

      <!-- Hero Animated Green Ripple & Checkmark Badge -->
      <div class="blinkit-hero-badge">
        <div class="blinkit-ripple-ring"></div>
        <div class="blinkit-ripple-ring-2"></div>
        <div class="blinkit-check-circle">
          <svg viewBox="0 0 52 52" class="blinkit-check-svg">
            <path class="blinkit-check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
      </div>

      <!-- Blinkit Success Heading & Amount Pill -->
      <h2 class="blinkit-title">Order Placed &amp; Payment Confirmed!</h2>
      <div>
        <div class="blinkit-amount-pill">
          <span>✓</span>
          <span>₹${totalAmt} ${payStatus === 'Paid' ? 'Paid' : 'To Pay On Delivery'}</span>
          <span style="font-size:0.75rem; font-weight:500; opacity:0.85;">• ${escapeHtml(pmLabel)}</span>
        </div>
      </div>
      <div class="blinkit-ref-sub">
        Order ID: <strong style="color:#C8A97E; cursor:pointer;" onclick="copyOrderNumber('${orderNum}')">#${orderNum} 📋</strong> &bull; Placed Today at ${timeStr} &bull; Confirmation sent to <strong style="color:#FAF7F2;">${escapeHtml(currentCheckoutAddress.email)}</strong>
      </div>

      <!-- Blinkit Live Delivery & Atelier Preparation Tracker -->
      <div class="blinkit-eta-card">
        <div class="blinkit-eta-header">
          <div>
            <div style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.1em; color:#C8A97E; font-weight:700; margin-bottom:0.2rem;">
              DELIVERY TIMELINE
            </div>
            <div class="blinkit-eta-time">
              <span>⏱️</span>
              <span>Arriving in 2–3 Business Days</span>
            </div>
          </div>
          <div class="blinkit-live-badge">
            <span class="blinkit-pulse-dot"></span>
            <span>LIVE PREPARATION</span>
          </div>
        </div>

        <!-- 4-Step Visual Stepper -->
        <div class="blinkit-stepper">
          <!-- Step 1: Completed -->
          <div class="blinkit-step-item completed">
            <div class="blinkit-step-icon">✓</div>
            <div class="blinkit-step-title">
              <span>Order Received &amp; Payment Verified</span>
              <span style="font-size:0.68rem; color:#25D366; font-weight:500;">Just now</span>
            </div>
            <div class="blinkit-step-sub">
              Your transaction was securely verified. Atelier inventory allocated.
            </div>
          </div>

          <!-- Step 2: Active / In Progress -->
          <div class="blinkit-step-item active">
            <div class="blinkit-step-icon">✦</div>
            <div class="blinkit-step-title">
              <span>Atelier Formulation &amp; Wax-Sealing</span>
              <span style="background:rgba(200,169,126,0.2); color:#C8A97E; font-size:0.65rem; padding:0.1rem 0.45rem; border-radius:10px; font-weight:700;">IN PROGRESS</span>
            </div>
            <div class="blinkit-step-sub">
              Master artisans are preparing your fresh formulation with signature wax seal.
            </div>
          </div>

          <!-- Step 3: Pending -->
          <div class="blinkit-step-item pending">
            <div class="blinkit-step-icon">3</div>
            <div class="blinkit-step-title">Olfactory &amp; Purity Quality Inspection</div>
            <div class="blinkit-step-sub">
              Audited and certified to Parisian haute parfumerie standards before departure.
            </div>
          </div>

          <!-- Step 4: Pending -->
          <div class="blinkit-step-item pending">
            <div class="blinkit-step-icon">4</div>
            <div class="blinkit-step-title">White-Glove Courier Dispatch</div>
            <div class="blinkit-step-sub">
              Insured courier pickup. Live tracking link will be sent via SMS &amp; WhatsApp.
            </div>
          </div>
        </div>
      </div>

      <!-- Clean 2-Column Info Grid: Delivery Address & Itemized Bill -->
      <div class="blinkit-details-grid">
        <!-- Delivery Destination Card -->
        <div class="blinkit-info-card">
          <div class="blinkit-card-tag">
            <span>📍</span>
            <span>Delivery Destination</span>
          </div>
          <div class="blinkit-address-text">
            <strong style="color:#FAF7F2; display:block; margin-bottom:0.25rem;">
              ${escapeHtml(currentCheckoutAddress.fullName)}
            </strong>
            <div style="color:rgba(250,247,242,0.65); font-size:0.75rem; margin-bottom:0.4rem;">
              📞 ${escapeHtml(currentCheckoutAddress.phone)}
            </div>
            <div style="line-height:1.45;">
              ${escapeHtml(currentCheckoutAddress.address)}<br/>
              ${escapeHtml(currentCheckoutAddress.city)}, ${escapeHtml(currentCheckoutAddress.state || '')} ${escapeHtml(currentCheckoutAddress.postalCode)}
            </div>
            <div style="margin-top:0.6rem; font-size:0.72rem; color:#C8A97E;">
              ✦ Complimentary White-Glove Courier Delivery
            </div>
          </div>
        </div>

        <!-- Blinkit-Style Itemized Bill Summary -->
        <div class="blinkit-info-card">
          <div class="blinkit-card-tag">
            <span>🧾</span>
            <span>Bill Summary &amp; Receipt</span>
          </div>
          <div style="margin-bottom:0.6rem;">
            ${itemsHtml}
          </div>
          <div class="blinkit-bill-row" style="border-top:1px dashed rgba(255,255,255,0.08); padding-top:0.5rem;">
            <span>Atelier Velvet Box &amp; Wax Seal</span>
            <span style="color:#C8A97E;">FREE (✦)</span>
          </div>
          <div class="blinkit-bill-row">
            <span>Insured Courier Delivery</span>
            <span style="color:#25D366;">FREE</span>
          </div>
          <div class="blinkit-bill-row blinkit-bill-total">
            <span>Total Paid</span>
            <span style="color:#7bed9f;">₹${totalAmt}</span>
          </div>
          <div style="font-size:0.68rem; color:rgba(250,247,242,0.45); margin-top:0.45rem; text-align:right;">
            Payment: ${escapeHtml(pmLabel)}
          </div>
        </div>
      </div>

      <!-- Instant WhatsApp Updates Card (Blinkit Style) -->
      <div class="blinkit-wa-strip">
        <div>
          <div style="font-weight:700; font-size:0.86rem; color:#25D366; display:flex; align-items:center; gap:0.4rem; margin-bottom:0.25rem;">
            <span>💬</span> Get Instant Updates on WhatsApp
          </div>
          <div style="font-size:0.75rem; color:rgba(250,247,242,0.8);">
            Order receipt &amp; real-time dispatch alerts are sent to the Atelier Concierge (+91 7300212948).
          </div>
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <a href="${whatsAppUrl}" target="_blank" rel="noopener" class="blinkit-wa-btn">
            <span>📲</span> Open WhatsApp Updates &rarr;
          </a>
          <button type="button" class="btn-luxury-outline" onclick="copyWhatsAppOrderText('${whatsAppTextEncoded}')" style="padding:0.6rem 0.95rem; font-size:0.75rem; border-color:rgba(37,211,102,0.4); color:#FAF7F2;">
            📋 Copy Receipt
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-top:1.5rem;">
        <button type="button" class="btn-luxury-primary" onclick="continueShoppingFromCheckout()" style="padding:0.85rem 2rem; font-size:0.82rem; letter-spacing:0.08em;">
          CONTINUE SHOPPING &rarr;
        </button>
        <button type="button" class="btn-luxury-outline" onclick="window.location.href='account.html';" style="padding:0.85rem 2rem; font-size:0.82rem; letter-spacing:0.08em; border-color:var(--color-gold); color:var(--color-gold);">
          TRACK IN MY ACCOUNT
        </button>
      </div>
    </div>
  `;

  launchBlinkitConfetti('blinkitConfettiBox');

  const modalInner = document.querySelector('#checkoutModal .checkout-modal-inner');
  if (modalInner) modalInner.scrollTop = 0;

  if (typeof showToast === 'function') {
    showToast(`✦ Order #${orderNum} placed successfully!`);
  }

  // Automatically trigger WhatsApp window to reflect on owner (+91 7300212948)
  if (ownerNotif.whatsAppUrl) {
    try {
      const waWin = window.open(ownerNotif.whatsAppUrl, '_blank');
      if (!waWin || waWin.closed || typeof waWin.closed === 'undefined') {
        console.log('[Order] Automatic WhatsApp popup held by browser; direct action button is displayed.');
      }
    } catch (e) {
      console.warn('[Order] Auto WhatsApp open:', e);
    }
  }
}

async function executeOrderPlacement() {
  const btn = document.getElementById('btnPlaceOrder');
  if (!currentCheckoutAddress) {
    if (typeof showToast === 'function') showToast('⚠️ Address information missing. Returning to address step.');
    goToAddressStep();
    return;
  }

  if (currentCheckoutItems.length === 0) {
    if (typeof showToast === 'function') showToast('⚠️ Shopping bag is empty.');
    return;
  }

  let paymentDetails = {};
  if (currentPaymentMethod === 'RAZORPAY') {
    paymentDetails = { method: 'RAZORPAY_ONLINE' };
  } else {
    currentPaymentMethod = 'COD';
    paymentDetails = { method: 'CASH_ON_DELIVERY' };
  }

  const orderPayload = {
    items: currentCheckoutItems.map(i => ({
      id: parseInt(i.id || i.productId, 10),
      productId: parseInt(i.id || i.productId, 10),
      quantity: parseInt(i.qty || 1, 10),
      name: i.name || 'Lumière Item',
      price: parseFloat(i.price || 0),
      sku: i.sku || `LUM-PRD-${i.id || i.productId}`
    })),
    customerName: currentCheckoutAddress.fullName,
    customerEmail: currentCheckoutAddress.email,
    shippingAddress: {
      address: currentCheckoutAddress.address,
      city: currentCheckoutAddress.city,
      state: currentCheckoutAddress.state,
      postalCode: currentCheckoutAddress.postalCode,
      phone: currentCheckoutAddress.phone,
      notes: currentCheckoutAddress.notes || 'Complimentary Concierge Delivery'
    },
    paymentMethod: currentPaymentMethod,
    paymentDetails,
    notes: currentCheckoutAddress.notes
  };

  // 1. If Online Payment via Razorpay (PhonePe / GPay / UPI / Cards)
  if (currentPaymentMethod === 'RAZORPAY') {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> INITIALIZING SECURE RAZORPAY GATEWAY...';

    try {
      const scriptReady = await ensureRazorpayScriptLoaded();
      if (!scriptReady) {
        throw new Error('Unable to load Razorpay payment gateway. Please check internet connection.');
      }

      // Create order session on backend
      const rzpInitRes = await fetch('/api/orders/razorpay-create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(Auth.getToken() ? { 'Authorization': `Bearer ${Auth.getToken()}` } : {})
        },
        body: JSON.stringify({
          amount: currentCheckoutTotal,
          currency: 'INR',
          items: orderPayload.items
        })
      });

      const rzpInitData = await rzpInitRes.json();
      if (!rzpInitData.success || !rzpInitData.orderId) {
        throw new Error(rzpInitData.error || 'Failed to initialize payment session.');
      }

      const rzpOptions = {
        key: rzpInitData.keyId,
        amount: rzpInitData.amount,
        currency: rzpInitData.currency || 'INR',
        name: 'Lumière Haute Parfumerie',
        description: `Order Checkout (₹${currentCheckoutTotal.toFixed(2)})`,
        order_id: rzpInitData.orderId,
        prefill: {
          name: currentCheckoutAddress.fullName,
          email: currentCheckoutAddress.email,
          contact: currentCheckoutAddress.phone
        },
        theme: {
          color: '#C8A97E'
        },
        handler: async function (response) {
          btn.innerHTML = '<span>🔒</span> VERIFYING CRYPTOGRAPHIC PAYMENT SIGNATURE...';
          try {
            const verifyRes = await fetch('/api/orders/razorpay-verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(Auth.getToken() ? { 'Authorization': `Bearer ${Auth.getToken()}` } : {})
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderPayload
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success && verifyData.order) {
              handleCheckoutSuccess(verifyData);
            } else {
              throw new Error(verifyData.error || 'Cryptographic payment verification failed.');
            }
          } catch (vErr) {
            btn.disabled = false;
            selectPaymentOption(currentPaymentMethod);
            if (typeof showToast === 'function') showToast(`⚠️ ${vErr.message}`);
            else alert(vErr.message);
          }
        },
        modal: {
          ondismiss: function () {
            btn.disabled = false;
            selectPaymentOption(currentPaymentMethod);
            if (typeof showToast === 'function') showToast('Payment window closed.');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(rzpOptions);
      razorpayInstance.on('payment.failed', function (resp) {
        btn.disabled = false;
        selectPaymentOption(currentPaymentMethod);
        const failDesc = resp.error?.description || 'Payment was declined by bank.';
        if (typeof showToast === 'function') showToast(`⚠️ ${failDesc}`);
        else alert(`Payment Failed: ${failDesc}`);
      });

      razorpayInstance.open();
      return;
    } catch (rzpErr) {
      btn.disabled = false;
      selectPaymentOption(currentPaymentMethod);
      if (typeof showToast === 'function') showToast(`⚠️ ${rzpErr.message}`);
      else alert(`Razorpay Error: ${rzpErr.message}`);
      return;
    }
  }

  // 2. Standard COD / Manual UPI Orders
  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span> SECURING ATELIER INVENTORY &amp; DISPATCHING...';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(Auth.getToken() ? { 'Authorization': `Bearer ${Auth.getToken()}` } : {})
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();
    if (data.success && data.order) {
      handleCheckoutSuccess(data);
    } else {
      btn.disabled = false;
      selectPaymentOption(currentPaymentMethod);
      const errMsg = data.error || 'Failed to complete order reservation.';
      if (typeof showToast === 'function') showToast(`⚠️ ${errMsg}`);
      else alert(`Order Error: ${errMsg}`);
    }
  } catch (err) {
    btn.disabled = false;
    selectPaymentOption(currentPaymentMethod);
    if (typeof showToast === 'function') showToast(`⚠️ Network error: ${err.message}`);
    else alert(`Network Error: ${err.message}`);
  }
}

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

  // Close bag drawer cleanly
  if (typeof closeCartDrawer === 'function') {
    closeCartDrawer();
  }

  // Open Atelier Luxury Checkout Modal
  openCheckoutModal(items);
}

// Initialize auth check on DOM load
document.addEventListener('DOMContentLoaded', () => {
  Auth.updateNavbar();
});

window.Auth = Auth;
window.processCheckout = processCheckout;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.continueShoppingFromCheckout = continueShoppingFromCheckout;
window.closeCartDrawer = closeCartDrawer;
window.selectPaymentOption = selectPaymentOption;
window.proceedToPaymentStep = proceedToPaymentStep;
window.goToAddressStep = goToAddressStep;
window.selectUpiApp = selectUpiApp;
window.appendUpiHandle = appendUpiHandle;
window.copyPayeeUpiId = copyPayeeUpiId;
window.selectSavedAddress = selectSavedAddress;
window.setQrViewMode = setQrViewMode;
window.OWNER_UPI_CONFIG = OWNER_UPI_CONFIG;
window.copyWhatsAppOrderText = copyWhatsAppOrderText;
window.executeOrderPlacement = executeOrderPlacement;
