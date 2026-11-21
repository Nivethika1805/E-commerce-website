/**
 * MELting Universe - Shared Cart & Session Utilities
 * Works across Login, Menu, Checkout, About, and Contact pages
 */

'use strict';

const CART_STORAGE_KEY = 'melting_cart';
const USER_STORAGE_KEY = 'loggedInUser';

/**
 * Standard currency formatting helper.
 * Formats amount into INR (₹). If integer, formats without decimals (₹50, ₹100); otherwise with 2 decimals.
 * @param {number} amount
 * @returns {string} e.g. "₹50", "₹100", "₹40"
 */
function formatINR(amount) {
  if (Number.isInteger(amount)) {
    return `₹${amount}`;
  }
  return `₹${amount.toFixed(2)}`;
}

/**
 * Retrieves the current cart from localStorage.
 * @returns {Array<{ id: string, name: string, price: number, img: string, quantity: number }>}
 */
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading cart from localStorage', e);
    return [];
  }
}

/**
 * Saves the cart to localStorage and triggers header/badge update.
 * @param {Array} cart
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart to localStorage', e);
  }
  updateCartBadge();
}

/**
 * Adds an item to the cart or increments its quantity.
 * @param {string} id
 * @param {string} name
 * @param {number} price
 * @param {string} img
 * @returns {Array} updated cart
 */
function addItemToCart(id, name, price, img) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);

  if (existing) {
    if (existing.quantity < 10) {
      existing.quantity += 1;
    }
  } else {
    cart.push({
      id,
      name,
      price: Number(price),
      img: img || './Photos/c3.jpg',
      quantity: 1
    });
  }

  saveCart(cart);
  return cart;
}

/**
 * Changes quantity of a cart line item by delta (+1 or -1).
 * Clamped between 1 and 10.
 * @param {string} id
 * @param {number} delta
 * @returns {Array} updated cart
 */
function updateItemQuantity(id, delta) {
  const cart = getCart();
  const item = cart.find(item => item.id === id);

  if (item) {
    const nextQty = item.quantity + delta;
    if (nextQty >= 1 && nextQty <= 10) {
      item.quantity = nextQty;
      saveCart(cart);
    }
  }
  return cart;
}

/**
 * Removes an item from the cart entirely.
 * @param {string} id
 * @returns {Array} updated cart
 */
function removeItemFromCart(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  return cart;
}

/**
 * Empties the cart.
 */
function clearCart() {
  saveCart([]);
}

/**
 * Calculates cart subtotal.
 * @returns {number}
 */
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Calculates total item count.
 * @returns {number}
 */
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Retrieves the currently logged-in demo user.
 * @returns {string|null}
 */
function getLoggedInUser() {
  return localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY) || null;
}

/**
 * Sets the logged-in demo user.
 * @param {string} username
 */
function setLoggedInUser(username) {
  localStorage.setItem(USER_STORAGE_KEY, username.trim());
  sessionStorage.setItem(USER_STORAGE_KEY, username.trim());
}

/**
 * Logs out the demo user.
 */
function logoutUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Updates cart badge and user status in the header across all pages.
 */
function updateCartBadge() {
  const count = getCartItemCount();
  const total = getCartTotal();

  // Header badge
  const badge = document.getElementById('header-cart-count');
  if (badge) {
    badge.textContent = String(count);
  }

  // Floating order bar on menu page
  const floatCount = document.getElementById('floating-cart-count');
  const floatTotal = document.getElementById('floating-cart-total');
  const floatBar = document.getElementById('floating-cart-bar');

  if (floatCount) {
    floatCount.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  }
  if (floatTotal) {
    floatTotal.textContent = formatINR(total);
  }
  if (floatBar) {
    if (count > 0) {
      floatBar.classList.remove('hidden');
    } else {
      floatBar.classList.add('hidden');
    }
  }
}

// Sync on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  // Bind any logout button present in header
  const logoutBtn = document.getElementById('nav-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutUser();
      window.location.href = 'index.html';
    });
  }

  // Bind greeting if user is logged in
  const userGreeting = document.getElementById('nav-user-greeting');
  const user = getLoggedInUser();
  if (userGreeting && user) {
    userGreeting.textContent = `Hi, ${user}`;
    userGreeting.classList.remove('hidden');
  }
});
