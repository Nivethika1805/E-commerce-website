# Fynd Mini Checkout & Browser Test Suite

**Event:** Fynd Hiring Hackathon (November 2026)  
**Track:** SDET Intern (Round 1 Submission)  
**Role Scope:** Senior SDET, Senior Full-Stack Developer & QA Automation Architect  
**Author:** Individual Submission  

---

## 1. Project Overview

The **Fynd Mini Checkout** is a high-reliability, self-contained single-page e-commerce checkout application coupled with an end-to-end browser test automation suite built with Playwright.

The project strictly follows SDET and modern full-stack development best practices:
- **Zero Frontend Frameworks:** Native HTML5 semantic elements, modern CSS3 with custom properties and responsive grid/flexbox, and vanilla JavaScript.
- **Robust Financial Logic:** All monetary amounts are handled strictly as integer paise (1 Rupee = 100 Paise) to completely eliminate floating-point calculation and rounding anomalies. Formatted via a single source of truth (`Intl.NumberFormat('en-IN', ...)`).
- **Application-Level Duplicate Order Prevention:** Employs a synchronous locking mechanism (`isSubmitting` boolean lock) at the start of the submission pipeline to block rapid clicks and Enter key spam before any asynchronous work or DOM updates occur.
- **In-Memory Architecture:** Clean in-memory state with zero client-side persistence (`localStorage`, `sessionStorage`, or cookies). Fresh page loads always produce an unpolluted baseline state for zero-flakiness test execution.
- **Accessibility & Testability First:** ARIA attributes (`aria-label`, `aria-busy`, `aria-invalid`, `aria-describedby`, `role="alert"`), keyboard navigation, and semantic DOM structures designed for resilient locator strategies.

---

## 2. Hackathon Challenge Description

The challenge requires engineering a self-contained Mini Checkout single-page web app and a Playwright test suite to evaluate:
1. **Functional UI & Modern UX:** Responsive product catalog, cart manipulation, and order confirmation.
2. **Business Logic & Error Handling:** Strict validation, integer paise currency formatting in INR (₹), and duplicate order suppression.
3. **QA Automation & Test Design:** Comprehensive Playwright test suite covering mandatory requirements without brittle locators or sleeps.
4. **Honest Defect Documentation:** Accurate defect discovery, root cause analysis, and regression verification.

---

## 3. Features Implemented

### 3.1 Product Showcase
- Two synthetic fixed-price products with inline SVG illustrations (no external images or CDNs):
  - **Aero Wireless Earbuds**: ₹2,499.00 (249,900 paise)
  - **Nimbus Insulated Bottle**: ₹1,299.00 (129,900 paise)
- Accessible "Add to Cart" controls with product-specific `aria-label` hooks.

### 3.2 Dynamic Shopping Cart & Financial Calculations
- **Add to Cart:** Adds item with quantity 1 or increments existing quantity (capped at 10).
- **Line Controls:** Dedicated Stepper buttons for Increase (+) and Decrease (−), plus "Remove" button.
- **Boundary Clamping:**
  - Minimum quantity: 1 (Decrease button disabled; item removal is handled via Remove button).
  - Maximum quantity: 10 (Increase button disabled).
- **Instant Calculations:** Unit price, line totals (`data-testid="line-total-<productId>"`), and complete order total (`data-testid="order-total"`) calculated synchronously from integer paise.

### 3.3 Form Validation & Accessibility Hooks
- Single customer input: **Customer Name** (`<label for="customer-name">Customer Name</label>`).
- Strict validation rules:
  - **Empty Cart:** Order blocked with message: *"Your cart is empty. Add at least one product before placing an order."*
  - **Missing Name:** Blank or whitespace-only name blocked with message: *"Please enter your name to place the order."* Marks field with `aria-invalid="true"`, links with `aria-describedby="name-alert"`, and shifts focus to input.
  - **Simultaneous Errors:** Both messages displayed in a consolidated `role="alert"` container.
  - **Information Preservation:** Form state and cart items remain fully preserved across failed validations.
  - **Dynamic Clearance:** Correcting errors immediately clears alert banners.

### 3.4 Duplicate Order Prevention (Synchronous Lock)
- Synchronous guard `if (isSubmitting) return;` evaluated immediately on form submission.
- Sets `isSubmitting = true`, disables the Place Order button, sets `aria-busy="true"`, and changes label to *"Placing order…"*.
- Simulates an 800ms processing window (`setTimeout`/Promise) to mimic network/payment processing.
- Order reference generated and confirmation rendered exactly once.

### 3.5 Order Confirmation & Reset
- Unique session reference formatted as `FYND-YYYYMMDD-XXXXXX` generated via `crypto.getRandomValues`. Collisions checked against an in-memory `Set`.
- Displays order reference (`data-testid="order-reference"`), customer name (`textContent` to prevent XSS), itemized product summary, and final total.
- Cart cleared automatically upon confirmation.
- **Start New Order:** Resets application back to initial clean state.

---

## 4. Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES2022, no frameworks).
- **Test Automation:** Playwright Test (`@playwright/test` v1.50+), JavaScript (CommonJS).
- **Static Web Server:** `http-server` (serving port `4173`).
- **Runtime:** Node.js (v18+ recommended; developed & verified on Node v24.12.0) + npm.
- **Browser:** Chromium.

---

## 5. Folder Structure

```
fynd-mini-checkout/
├── index.html                           # Semantic HTML5 Single-Page App
├── css/
│   └── style.css                        # Modern CSS3 Design System & Responsive Styles
├── js/
│   └── script.js                        # In-memory State, Calculations & Submission Lock
├── tests/
│   └── checkout.spec.js                 # Playwright Automated Test Suite
├── test-results/
│   ├── manual-evidence/                 # Committed Manual Test Evidence & Screenshots
│   │   ├── mt-01-01-initial-state.png
│   │   ├── mt-01-02-validation-errors.png
│   │   ├── mt-01-03-empty-cart-only-error.png
│   │   ├── mt-02-01-before-rapid-click.png
│   │   ├── mt-02-02-processing-state.png
│   │   ├── mt-02-03-single-confirmation.png
│   │   ├── responsive-desktop-1280px.png
│   │   ├── responsive-mobile-375px.png
│   │   └── stepper-and-cart-features.png
│   └── artifacts/                       # Playwright test execution artifacts
├── package.json                         # Project scripts & devDependencies
├── playwright.config.js                 # Playwright test & webServer configuration
├── .gitignore                           # Git ignore rules
├── README.md                            # Comprehensive Project Documentation
└── TEST_PLAN.md                         # Detailed Test Plan & QA Execution Summary
```

---

## 6. Prerequisites

- **Node.js**: Version 18.0.0 or higher (Verified on `v24.12.0`).
- **npm**: Version 9.0.0 or higher.
- **Operating System**: Windows, macOS, or Linux.

---

## 7. Step-by-Step Setup

1. **Navigate to the project root:**
   ```bash
   cd fynd-mini-checkout
   ```

2. **Install project devDependencies:**
   ```bash
   npm install
   ```

3. **Install the Playwright Chromium browser binary:**
   ```bash
   npx playwright install chromium
   ```

---

## 8. How to Run the Application

Start the local static server:
```bash
npm start
```
- The application will be served at: **`http://localhost:4173`** (or `http://127.0.0.1:4173`).
- Open your browser and navigate to `http://localhost:4173` to explore the app.

---

## 9. How to Run Automated Tests

### Run headless test suite:
```bash
npm test
```

### Run headed test suite (with visible browser):
```bash
npm run test:headed
```

### Run repeated tests for flakiness / stability verification (3x consecutive):
```bash
npx playwright test --repeat-each=3
```

### View interactive HTML test report:
```bash
npm run report
```

---

## 10. Automated Test Cases Description

Located in [tests/checkout.spec.js](file:///c:/Users/nivig/Documents/HTML/ICECREAM%20website/fynd-mini-checkout/tests/checkout.spec.js):

### Mandatory Suite
1. **TC-01: Successful Checkout**
   - **Scope:** Complete order flow, order reference generation, confirmation rendering, and itemized summary.
   - **Action:** Starts from clean state, adds Aero Wireless Earbuds to cart, fills customer name ("Aarav Sharma"), clicks Place Order.
   - **Assertions:** Confirmation heading `Order Confirmed!` is visible; order reference is visible and satisfies regex `/^FYND-\d{8}-[A-Z0-9]{6}$/`; customer name and itemized breakdown are accurately rendered.
2. **TC-02: Missing Required Field**
   - **Scope:** Customer name validation and state preservation.
   - **Action:** Adds Nimbus Insulated Bottle to cart, leaves Customer Name blank, clicks Place Order.
   - **Assertions:** Validation message *"Please enter your name to place the order."* is displayed; confirmation panel is NOT displayed; cart items and order total (₹1,299.00) remain fully preserved.
3. **TC-03: Quantity and Total Calculation**
   - **Scope:** Stepper controls and precision integer paise formatting.
   - **Action:** Adds Aero Wireless Earbuds, clicks Increase quantity button once.
   - **Assertions:** Quantity display updates to `"2"`; line total `data-testid="line-total-aero-earbuds"` updates to exact value `₹4,998.00`; order total `data-testid="order-total"` updates to exact value `₹4,998.00`.

### Supplementary Suite
4. **TC-04: Empty Cart Blocking**
   - **Scope:** Empty cart validation without adding items.
   - **Action:** Enters customer name "Priya Patel", leaves cart empty, clicks Place Order.
   - **Assertions:** Message *"Your cart is empty. Add at least one product before placing an order."* is displayed; confirmation is hidden; entered name is preserved.
5. **TC-05: Rapid Double-Click Duplicate Order Prevention**
   - **Scope:** Application-level submission lock under rapid click / double-click conditions.
   - **Action:** Adds product, enters name, issues rapid double-click on Place Order button.
   - **Assertions:** Exactly ONE confirmation container is visible; exactly ONE `data-testid="order-reference"` element exists in the DOM.

---

## 11. Manual Testing Instructions

Manual testing was conducted using a Chromium browser session with console error interception and full-page screenshots:

1. **Scenario MT-01: Empty Cart Checkout**
   - Open `http://localhost:4173`.
   - Without adding any items, click "Place Order".
   - **Observed:** Dual error alerts appear: "Your cart is empty. Add at least one product before placing an order." and "Please enter your name to place the order."
   - Enter name "Aarav Mehta" and click "Place Order".
   - **Observed:** Name error clears; empty cart error remains.
   - **Result:** PASS. Evidence saved to `test-results/manual-evidence/mt-01-02-validation-errors.png`.

2. **Scenario MT-02: Rapid Double-Click Duplicate Prevention**
   - Add Aero Wireless Earbuds.
   - Enter name "Siddharth Rao".
   - Double-click "Place Order" button in rapid succession (< 200ms).
   - **Observed:** Button immediately transitions to disabled state with text "Placing order…". After ~800ms, exactly ONE order confirmation is rendered with a single unique reference `FYND-YYYYMMDD-XXXXXX`.
   - **Result:** PASS. Evidence saved to `test-results/manual-evidence/mt-02-03-single-confirmation.png`.

---

## 12. Real Test Execution Results

### Automated Test Suite Execution:
```
Running 15 tests using 1 worker (--repeat-each=3)

  ok  1 [chromium] › tests\checkout.spec.js:22:3 › Mandatory Checkout Test Suite › TC-01 Successful Checkout (1.6s)
  ok  2 [chromium] › tests\checkout.spec.js:55:3 › Mandatory Checkout Test Suite › TC-02 Missing Required Field (758ms)
  ok  3 [chromium] › tests\checkout.spec.js:76:3 › Mandatory Checkout Test Suite › TC-03 Quantity and Total Calculation (970ms)
  ok  4 [chromium] › tests\checkout.spec.js:103:3 › Supplementary Checkout Test Suite › TC-04 Empty Cart Blocking (879ms)
  ok  5 [chromium] › tests\checkout.spec.js:121:3 › Supplementary Checkout Test Suite › TC-05 Rapid Double-Click Duplicate Order Prevention (1.8s)
  ok  6 [chromium] › tests\checkout.spec.js:22:3 › Mandatory Checkout Test Suite › TC-01 Successful Checkout (1.6s)
  ok  7 [chromium] › tests\checkout.spec.js:55:3 › Mandatory Checkout Test Suite › TC-02 Missing Required Field (988ms)
  ok  8 [chromium] › tests\checkout.spec.js:76:3 › Mandatory Checkout Test Suite › TC-03 Quantity and Total Calculation (726ms)
  ok  9 [chromium] › tests\checkout.spec.js:103:3 › Supplementary Checkout Test Suite › TC-04 Empty Cart Blocking (914ms)
  ok 10 [chromium] › tests\checkout.spec.js:121:3 › Supplementary Checkout Test Suite › TC-05 Rapid Double-Click Duplicate Order Prevention (1.9s)
  ok 11 [chromium] › tests\checkout.spec.js:22:3 › Mandatory Checkout Test Suite › TC-01 Successful Checkout (1.8s)
  ok 12 [chromium] › tests\checkout.spec.js:55:3 › Mandatory Checkout Test Suite › TC-02 Missing Required Field (697ms)
  ok 13 [chromium] › tests\checkout.spec.js:76:3 › Mandatory Checkout Test Suite › TC-03 Quantity and Total Calculation (818ms)
  ok 14 [chromium] › tests\checkout.spec.js:103:3 › Supplementary Checkout Test Suite › TC-04 Empty Cart Blocking (640ms)
  ok 15 [chromium] › tests\checkout.spec.js:121:3 › Supplementary Checkout Test Suite › TC-05 Rapid Double-Click Duplicate Order Prevention (1.8s)

  15 passed (27.5s)
```

- **Total Tests Executed:** 15 (5 tests × 3 consecutive repetitions)
- **Passed:** 15
- **Failed:** 0
- **Flakiness:** 0%

---

## 13. Screenshots / Evidence References

All manual test evidence is permanently committed in [test-results/manual-evidence/](file:///c:/Users/nivig/Documents/HTML/ICECREAM%20website/fynd-mini-checkout/test-results/manual-evidence/):
- **`mt-01-01-initial-state.png`**: Baseline app state with empty cart.
- **`mt-01-02-validation-errors.png`**: Dual validation error alerts when submitting an empty form.
- **`mt-01-03-empty-cart-only-error.png`**: Isolated empty-cart error when valid name is entered.
- **`mt-02-01-before-rapid-click.png`**: Populated cart and customer name ready for submission.
- **`mt-02-02-processing-state.png`**: Active duplicate lock with button showing "Placing order…" and disabled.
- **`mt-02-03-single-confirmation.png`**: Final confirmation screen showing exactly one order reference.
- **`responsive-desktop-1280px.png`**: Clean 2-column layout at 1280px desktop resolution.
- **`responsive-mobile-375px.png`**: Clean stacked layout at 375px mobile resolution.
- **`stepper-and-cart-features.png`**: Validation of quantity boundaries (disabled at 1 and 10).

---

## 14. Known Limitations & Architecture Decisions

1. **In-Memory State by Design:** As required by the evaluation brief, no `localStorage`, cookies, or database are used. Refreshing the browser resets the cart and form, which is an intentional architectural decision that guarantees a deterministic clean state for every automated test.
2. **Simulated Processing Window:** An 800ms artificial delay is included via `setTimeout` in the submission flow. This models real-world payment gateway latency and provides a realistic window to test and verify duplicate order suppression.
3. **Chromium Target:** The test suite is pre-configured for Chromium per the evaluation brief to ensure rapid, deterministic CI runs.
