/**
 * MELting Universe - Single Page Checkout Application Logic
 *
 * Implements:
 * 1. Two synthetic fixed-price products with inline visuals
 * 2. Shopping cart with stepper controls (min 1, max 10), removal, and real-time INR totals
 * 3. Validation: blocks empty cart and blank/whitespace name, preserves user data
 * 4. Application-level synchronous submission lock (blocks rapid double-clicks & Enter spam)
 * 5. Unique order reference generation (FYND-YYYYMMDD-XXXXXX) & confirmation panel
 */

'use strict';

// ============================================================================
// 1. PRODUCTS & CONSTANTS
// ============================================================================

const PRODUCTS = [
  {
    id: 'aero-earbuds',
    name: 'Aero Wireless Earbuds',
    description: 'High-fidelity audio with adaptive active noise cancellation and 30-hour battery life.',
    pricePaise: 249900 // ₹2,499.00
  },
  {
    id: 'nimbus-bottle',
    name: 'Nimbus Insulated Bottle',
    description: 'Double-walled stainless steel vacuum insulation keeping liquids cold for 24h or hot for 12h.',
    pricePaise: 129900 // ₹1,299.00
  }
];

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 10;
const SUBMISSION_DELAY_MS = 800; // Simulated network / processing delay

// ============================================================================
// 2. IN-MEMORY STATE (Zero persistence across reloads)
// ============================================================================

/**
 * In-memory shopping cart mapping productId -> { product, quantity }
 * @type {Map<string, { product: typeof PRODUCTS[0], quantity: number }>}
 */
const cart = new Map();

/**
 * In-memory Set of issued order references to guarantee collision-free references.
 * @type {Set<string>}
 */
const issuedReferences = new Set();

/**
 * Synchronous application-level lock to prevent double orders.
 * @type {boolean}
 */
let isSubmitting = false;

// Shared Currency Formatter (Single source of truth)
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

// ============================================================================
// 3. CORE FINANCIAL CALCULATIONS
// ============================================================================

/**
 * Converts integer paise into INR formatted currency string.
 * @param {number} paise
 * @returns {string} e.g. "₹2,499.00"
 */
function formatPaise(paise) {
  return inrFormatter.format(paise / 100);
}

/**
 * Calculates line total in paise.
 * @param {number} unitPricePaise
 * @param {number} quantity
 * @returns {number}
 */
function calculateLineTotal(unitPricePaise, quantity) {
  return unitPricePaise * quantity;
}

/**
 * Calculates order total in paise.
 * @returns {number}
 */
function calculateOrderTotal() {
  let totalPaise = 0;
  for (const item of cart.values()) {
    totalPaise += calculateLineTotal(item.product.pricePaise, item.quantity);
  }
  return totalPaise;
}

/**
 * Generates unique reference matching format FYND-YYYYMMDD-XXXXXX
 * @returns {string}
 */
function generateOrderReference() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let ref = '';

  do {
    const randomBytes = new Uint8Array(6);
    crypto.getRandomValues(randomBytes);
    let randomCode = '';
    for (let i = 0; i < 6; i++) {
      randomCode += chars[randomBytes[i] % chars.length];
    }
    ref = `FYND-${dateStr}-${randomCode}`;
  } while (issuedReferences.has(ref));

  issuedReferences.add(ref);
  return ref;
}

// ============================================================================
// 4. CART OPERATIONS
// ============================================================================

/**
 * Adds product to cart with quantity 1 or increments existing quantity.
 * @param {string} productId
 */
function addToCart(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  if (cart.has(productId)) {
    const item = cart.get(productId);
    if (item.quantity < MAX_QUANTITY) {
      item.quantity += 1;
    }
  } else {
    cart.set(productId, { product, quantity: 1 });
  }

  // Clear empty-cart error once item is added
  clearCartError();
  renderCart();
}

/**
 * Changes quantity of a cart line item by delta (+1 or -1).
 * Clamped between MIN_QUANTITY (1) and MAX_QUANTITY (10).
 * @param {string} productId
 * @param {number} delta
 */
function changeQuantity(productId, delta) {
  if (!cart.has(productId)) return;

  const item = cart.get(productId);
  const nextQuantity = item.quantity + delta;

  if (nextQuantity >= MIN_QUANTITY && nextQuantity <= MAX_QUANTITY) {
    item.quantity = nextQuantity;
    renderCart();
  }
}

/**
 * Removes product from cart completely.
 * @param {string} productId
 */
function removeFromCart(productId) {
  if (cart.has(productId)) {
    cart.delete(productId);
    renderCart();
  }
}

// ============================================================================
// 5. VALIDATION & ERROR HANDLING
// ============================================================================

/**
 * Validates checkout requirements.
 * @returns {{ isValid: boolean, emptyCart: boolean, missingName: boolean, trimmedName: string }}
 */
function validateOrder() {
  const nameInput = document.getElementById('customer-name');
  const trimmedName = nameInput ? nameInput.value.trim() : '';

  const emptyCart = cart.size === 0;
  const missingName = trimmedName.length === 0;

  return {
    isValid: !emptyCart && !missingName,
    emptyCart,
    missingName,
    trimmedName
  };
}

/**
 * Displays accessible validation errors in role="alert" container.
 * @param {boolean} emptyCart
 * @param {boolean} missingName
 */
function renderValidationErrors(emptyCart, missingName) {
  const alertsContainer = document.getElementById('validation-alerts');
  const nameInput = document.getElementById('customer-name');

  if (!alertsContainer) return;
  alertsContainer.innerHTML = '';

  if (emptyCart) {
    const cartAlert = document.createElement('div');
    cartAlert.id = 'cart-alert';
    cartAlert.className = 'alert-item alert-danger';
    cartAlert.textContent = 'Your cart is empty. Add at least one product before placing an order.';
    alertsContainer.appendChild(cartAlert);
  }

  if (missingName) {
    const nameAlert = document.createElement('div');
    nameAlert.id = 'name-alert';
    nameAlert.className = 'alert-item alert-danger';
    nameAlert.textContent = 'Please enter your name to place the order.';
    alertsContainer.appendChild(nameAlert);

    if (nameInput) {
      nameInput.setAttribute('aria-invalid', 'true');
      nameInput.setAttribute('aria-describedby', 'name-alert');
    }
  }

  // Move focus to name field if missing
  if (missingName && nameInput) {
    nameInput.focus();
  }
}

/**
 * Clears customer name validation error.
 */
function clearNameError() {
  const nameInput = document.getElementById('customer-name');
  if (nameInput) {
    nameInput.removeAttribute('aria-invalid');
    nameInput.removeAttribute('aria-describedby');
  }
  const nameAlert = document.getElementById('name-alert');
  if (nameAlert) {
    nameAlert.remove();
  }
}

/**
 * Clears empty cart validation error.
 */
function clearCartError() {
  const cartAlert = document.getElementById('cart-alert');
  if (cartAlert) {
    cartAlert.remove();
  }
}

/**
 * Clears all error banners.
 */
function clearAllErrors() {
  clearNameError();
  clearCartError();
}

// ============================================================================
// 6. DOM RENDERING
// ============================================================================

/**
 * Renders the shopping cart items, steppers, line totals, and order total.
 */
function renderCart() {
  const emptyState = document.getElementById('cart-empty-state');
  const cartList = document.getElementById('cart-items-list');
  const orderTotalEl = document.getElementById('order-total-amount');

  if (!cartList || !emptyState || !orderTotalEl) return;

  if (cart.size === 0) {
    emptyState.classList.remove('hidden');
    cartList.innerHTML = '';
  } else {
    emptyState.classList.add('hidden');
    cartList.innerHTML = '';

    for (const item of cart.values()) {
      const { product, quantity } = item;
      const lineTotalPaise = calculateLineTotal(product.pricePaise, quantity);

      const li = document.createElement('li');
      li.className = 'cart-item-row';
      li.id = `cart-line-${product.id}`;

      // Left item info
      const infoDiv = document.createElement('div');
      infoDiv.className = 'cart-item-info';

      const nameDiv = document.createElement('div');
      nameDiv.className = 'cart-item-name';
      nameDiv.textContent = product.name;

      const unitPriceDiv = document.createElement('div');
      unitPriceDiv.className = 'cart-item-unit-price';
      unitPriceDiv.textContent = `${formatPaise(product.pricePaise)} each`;

      infoDiv.appendChild(nameDiv);
      infoDiv.appendChild(unitPriceDiv);

      // Right item controls
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'cart-item-actions';

      // Decrease stepper button
      const decBtn = document.createElement('button');
      decBtn.type = 'button';
      decBtn.className = 'stepper-btn dec-btn';
      decBtn.textContent = '−';
      decBtn.setAttribute('aria-label', `Decrease quantity of ${product.name}`);
      decBtn.disabled = quantity <= MIN_QUANTITY;
      decBtn.addEventListener('click', () => changeQuantity(product.id, -1));

      // Quantity number display
      const qtySpan = document.createElement('span');
      qtySpan.className = 'quantity-display';
      qtySpan.textContent = String(quantity);

      // Increase stepper button
      const incBtn = document.createElement('button');
      incBtn.type = 'button';
      incBtn.className = 'stepper-btn inc-btn';
      incBtn.textContent = '+';
      incBtn.setAttribute('aria-label', `Increase quantity of ${product.name}`);
      incBtn.disabled = quantity >= MAX_QUANTITY;
      incBtn.addEventListener('click', () => changeQuantity(product.id, 1));

      // Line total with stable testid
      const lineTotalSpan = document.createElement('span');
      lineTotalSpan.className = 'cart-item-total';
      lineTotalSpan.setAttribute('data-testid', `line-total-${product.id}`);
      lineTotalSpan.textContent = formatPaise(lineTotalPaise);

      // Remove button
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn-remove';
      removeBtn.textContent = 'Remove';
      removeBtn.setAttribute('aria-label', `Remove ${product.name} from cart`);
      removeBtn.addEventListener('click', () => removeFromCart(product.id));

      actionsDiv.appendChild(decBtn);
      actionsDiv.appendChild(qtySpan);
      actionsDiv.appendChild(incBtn);
      actionsDiv.appendChild(lineTotalSpan);
      actionsDiv.appendChild(removeBtn);

      li.appendChild(infoDiv);
      li.appendChild(actionsDiv);

      cartList.appendChild(li);
    }
  }

  // Update order total
  const totalPaise = calculateOrderTotal();
  orderTotalEl.textContent = formatPaise(totalPaise);
}

/**
 * Renders confirmation panel safely upon successful order.
 * @param {string} orderRef
 * @param {string} customerName
 * @param {Array<{ product: typeof PRODUCTS[0], quantity: number }>} orderedItems
 * @param {number} totalPaise
 */
function renderConfirmation(orderRef, customerName, orderedItems, totalPaise) {
  const confirmationContainer = document.getElementById('confirmation-container');
  const checkoutPanel = document.getElementById('checkout-panel');
  const refEl = document.getElementById('confirmed-order-ref');
  const nameEl = document.getElementById('confirmed-customer-name');
  const itemsListEl = document.getElementById('confirmation-items-list');
  const totalEl = document.getElementById('confirmed-order-total');

  if (!confirmationContainer || !checkoutPanel) return;

  if (refEl) {
    refEl.textContent = orderRef;
  }

  if (nameEl) {
    nameEl.textContent = customerName;
  }

  if (itemsListEl) {
    itemsListEl.innerHTML = '';
    for (const item of orderedItems) {
      const li = document.createElement('li');
      li.className = 'confirm-item-line';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = `${item.product.name} × ${item.quantity}`;

      const priceStrong = document.createElement('strong');
      priceStrong.textContent = formatPaise(calculateLineTotal(item.product.pricePaise, item.quantity));

      li.appendChild(nameSpan);
      li.appendChild(priceStrong);
      itemsListEl.appendChild(li);
    }
  }

  if (totalEl) {
    totalEl.textContent = formatPaise(totalPaise);
  }

  checkoutPanel.classList.add('hidden');
  confirmationContainer.classList.remove('hidden');

  const heading = document.getElementById('confirmation-heading');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }
}

// ============================================================================
// 7. SUBMIT HANDLER WITH SYNCHRONOUS LOCK
// ============================================================================

/**
 * Handles order checkout.
 * Synchronously checks and sets isSubmitting to block race conditions.
 * @param {Event} e
 */
async function handleSubmit(e) {
  e.preventDefault();

  // 1. SYNCHRONOUS LOCK CHECK
  if (isSubmitting) {
    return;
  }

  // 2. VALIDATION CHECK
  const validation = validateOrder();
  if (!validation.isValid) {
    renderValidationErrors(validation.emptyCart, validation.missingName);
    return;
  }

  clearAllErrors();

  // 3. ENGAGE LOCK IMMEDIATELY
  isSubmitting = true;

  const placeOrderBtn = document.getElementById('place-order-btn');
  if (placeOrderBtn) {
    placeOrderBtn.disabled = true;
    placeOrderBtn.setAttribute('aria-busy', 'true');
    placeOrderBtn.textContent = 'Placing order…';
  }

  const orderedItemsSnapshot = Array.from(cart.values());
  const finalTotalPaise = calculateOrderTotal();
  const customerName = validation.trimmedName;

  try {
    // 4. SIMULATED PROCESSING DELAY (800ms)
    await new Promise((resolve) => setTimeout(resolve, SUBMISSION_DELAY_MS));

    // 5. GENERATE REFERENCE & RENDER CONFIRMATION EXACTLY ONCE
    const orderRef = generateOrderReference();

    cart.clear();
    renderCart();

    renderConfirmation(orderRef, customerName, orderedItemsSnapshot, finalTotalPaise);
  } finally {
    // 6. RESET LOCK AND RESTORE BUTTON
    isSubmitting = false;
    if (placeOrderBtn) {
      placeOrderBtn.disabled = false;
      placeOrderBtn.setAttribute('aria-busy', 'false');
      placeOrderBtn.textContent = 'Place Order';
    }
  }
}

/**
 * Resets application back to initial state for new order.
 */
function resetApplication() {
  cart.clear();
  clearAllErrors();

  const nameInput = document.getElementById('customer-name');
  if (nameInput) {
    nameInput.value = '';
    nameInput.removeAttribute('aria-invalid');
    nameInput.removeAttribute('aria-describedby');
  }

  renderCart();

  const confirmationContainer = document.getElementById('confirmation-container');
  const checkoutPanel = document.getElementById('checkout-panel');

  if (confirmationContainer) {
    confirmationContainer.classList.add('hidden');
  }
  if (checkoutPanel) {
    checkoutPanel.classList.remove('hidden');
  }

  const placeOrderBtn = document.getElementById('place-order-btn');
  if (placeOrderBtn) {
    placeOrderBtn.disabled = false;
    placeOrderBtn.setAttribute('aria-busy', 'false');
    placeOrderBtn.textContent = 'Place Order';
  }

  const firstAddBtn = document.querySelector('.btn-add-cart');
  if (firstAddBtn) {
    firstAddBtn.focus();
  }
}

// ============================================================================
// 8. EVENT LISTENERS INITIALIZATION
// ============================================================================

function init() {
  // Add to cart buttons
  const addButtons = document.querySelectorAll('.btn-add-cart');
  addButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const productId = e.currentTarget.getAttribute('data-product-id');
      if (productId) {
        addToCart(productId);
      }
    });
  });

  // Form submit
  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  // Name input listener to clear error as user types
  const nameInput = document.getElementById('customer-name');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (nameInput.value.trim().length > 0) {
        clearNameError();
      }
    });
  }

  // Start new order button
  const startNewOrderBtn = document.getElementById('start-new-order-btn');
  if (startNewOrderBtn) {
    startNewOrderBtn.addEventListener('click', resetApplication);
  }

  // Initial cart render
  renderCart();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
