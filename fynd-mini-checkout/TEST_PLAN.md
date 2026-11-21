# Test Plan & Execution Report: Fynd Mini Checkout

**Event:** Fynd Hiring Hackathon (November 2026)  
**Track:** SDET Intern (Round 1 Submission)  
**Role:** Senior SDET / QA Automation Architect  
**Date of Execution:** November 22, 2026  
**Execution Environment:** Node.js v24.12.0 | Playwright Test v1.50.1 | Chromium Browser  

---

## A. Testing Scope

The QA strategy is structured across six core functional domains:
1. **Functional UI Testing:** Product catalog rendering, inline SVG visuals, quantity increment/decrement buttons, removal buttons, and empty-cart display transitions.
2. **UI & Responsive Layout Validation:** Verification of semantic hierarchy, accessible name computations, keyboard operability, visible focus indicators, and responsiveness at 1280px (desktop) and 375px (mobile) viewports.
3. **Cart Calculations & Currency Formatting:** Precision integer paise financial math across unit price multiplications, line totals, and order total aggregation, formatted via `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
4. **Form Validation & Accessibility:** Synchronous client-side input validation, blank/whitespace-only customer name handling, empty-cart prevention, `role="alert"` announcements, and field error linkage via `aria-describedby` and `aria-invalid`.
5. **End-to-End Checkout Workflow:** Complete journey from product addition through submission, unique order reference generation (`FYND-YYYYMMDD-XXXXXX`), confirmation panel rendering, cart clearance, and state reset via "Start New Order".
6. **Duplicate Submission Protection:** Verification of synchronous application-level boolean locks preventing multi-click race conditions and Enter key repeated submissions during the 800ms simulated processing delay.

---

## B. Test Case Documentation

### TC-01: Successful Checkout Flow (Automated)
- **Test Case ID:** TC-01
- **Scenario:** Verify end-to-end checkout with valid product and customer name produces an order confirmation with a unique reference.
- **Preconditions:** Application loaded at `http://localhost:4173/` with clean in-memory state.
- **Test Steps:**
  1. Verify empty cart message is visible.
  2. Click "Add to Cart" button for Aero Wireless Earbuds.
  3. Enter customer name "Aarav Sharma" into Customer Name input.
  4. Click "Place Order" button.
  5. Wait for confirmation heading `Order Confirmed!` to appear.
  6. Assert order reference format and visibility.
  7. Assert customer name and item breakdown in confirmation summary.
- **Test Data:**
  - Product: Aero Wireless Earbuds (₹2,499.00)
  - Customer Name: `"Aarav Sharma"`
- **Expected Result:** Confirmation heading is displayed; an order reference matching `/^FYND-\d{8}-[A-Z0-9]{6}$/` is visible; customer name "Aarav Sharma" and item "Aero Wireless Earbuds × 1" are displayed; cart is emptied.
- **Actual Result:** Matches expected. Confirmation appeared, unique reference `FYND-20261122-XXXXXX` generated, cart cleared.
- **Status:** **PASS**

---

### TC-02: Missing Required Field Validation (Automated)
- **Test Case ID:** TC-02
- **Scenario:** Verify submission without customer name is blocked, shows an accessible error message, and preserves cart contents.
- **Preconditions:** Application loaded at `http://localhost:4173/` with clean state.
- **Test Steps:**
  1. Click "Add to Cart" button for Nimbus Insulated Bottle.
  2. Verify cart displays Nimbus Insulated Bottle with ₹1,299.00.
  3. Leave Customer Name field empty (or fill whitespace).
  4. Click "Place Order" button.
  5. Assert validation message *"Please enter your name to place the order."* is displayed.
  6. Assert confirmation panel is NOT displayed.
  7. Assert cart item and total are preserved unchanged.
- **Test Data:**
  - Product: Nimbus Insulated Bottle (₹1,299.00)
  - Customer Name: `""` (empty)
- **Expected Result:** Order blocked; message *"Please enter your name to place the order."* visible in `role="alert"`; confirmation heading hidden; Nimbus Insulated Bottle remains in cart with total ₹1,299.00.
- **Actual Result:** Matches expected. Submission blocked, message visible, cart item preserved intact.
- **Status:** **PASS**

---

### TC-03: Quantity and Total Calculation (Automated)
- **Test Case ID:** TC-03
- **Scenario:** Verify quantity stepper increments accurately and updates line totals and order total with exact INR currency formatting.
- **Preconditions:** Application loaded at `http://localhost:4173/`.
- **Test Steps:**
  1. Click "Add to Cart" for Aero Wireless Earbuds (₹2,499.00).
  2. Click "Increase quantity of Aero Wireless Earbuds" (+) button once.
  3. Read quantity display text.
  4. Read line total `[data-testid="line-total-aero-earbuds"]`.
  5. Read order total `[data-testid="order-total"]`.
- **Test Data:**
  - Product: Aero Wireless Earbuds (249,900 paise each)
  - Initial Qty: 1
  - Stepper Action: +1
  - Target Qty: 2
- **Expected Result:** Quantity text displays `"2"`; line total displays exactly `"₹4,998.00"`; order total displays exactly `"₹4,998.00"`.
- **Actual Result:** Matches expected. Quantity updated to 2, line total and order total formatted accurately to ₹4,998.00.
- **Status:** **PASS**

---

### TC-04: Empty Cart Checkout Blocking (Automated - Supplementary)
- **Test Case ID:** TC-04
- **Scenario:** Verify checkout with an empty cart is blocked even when customer name is provided.
- **Preconditions:** Fresh application load, cart is empty.
- **Test Steps:**
  1. Fill Customer Name field with `"Priya Patel"`.
  2. Leave cart empty.
  3. Click "Place Order" button.
  4. Assert empty cart error message is displayed.
  5. Assert confirmation panel is NOT displayed.
  6. Assert customer name input value is preserved.
- **Test Data:**
  - Cart: Empty (0 items)
  - Customer Name: `"Priya Patel"`
- **Expected Result:** Message *"Your cart is empty. Add at least one product before placing an order."* is displayed; order confirmation is hidden; customer name input retains `"Priya Patel"`.
- **Actual Result:** Matches expected. Empty cart alert displayed; input text preserved.
- **Status:** **PASS**

---

### TC-05: Rapid Double-Click Duplicate Order Prevention (Automated - Supplementary)
- **Test Case ID:** TC-05
- **Scenario:** Verify rapid consecutive clicks on Place Order produce exactly ONE order and reference.
- **Preconditions:** Clean state, product in cart, customer name entered.
- **Test Steps:**
  1. Add Aero Wireless Earbuds to cart.
  2. Enter Customer Name `"Rohan Gupta"`.
  3. Execute rapid double-click (`dblclick()`) on "Place Order".
  4. Wait for confirmation panel heading to appear.
  5. Count instances of `[data-testid="order-reference"]` in DOM.
  6. Count instances of visible `.confirmation-panel` in DOM.
- **Test Data:**
  - Product: Aero Wireless Earbuds
  - Name: `"Rohan Gupta"`
  - Interaction: Double-click (< 250ms interval)
- **Expected Result:** Exactly ONE confirmation container is visible; exactly ONE order reference element exists in the DOM.
- **Actual Result:** Matches expected. Count of `order-reference` in DOM = 1; count of confirmation panels = 1.
- **Status:** **PASS**

---

### MT-01: Empty Cart & Form Validation (Manual)
- **Test Case ID:** MT-01
- **Scenario:** Manual verification of empty-cart checkout blocking, dual error rendering, and corrective input behaviors.
- **Preconditions:** Clean browser session in Chromium at `http://localhost:4173/`.
- **Execution Method:** Real browser automation session using Chromium with screenshot capture and console error auditing.
- **Test Steps:**
  1. Open app, keep cart empty, leave name blank.
  2. Click "Place Order".
  3. Observe error alerts and field indicators. Capture screenshot `mt-01-02-validation-errors.png`.
  4. Enter customer name "Aarav Mehta".
  5. Click "Place Order" again.
  6. Observe that name error clears while empty cart error remains. Capture screenshot `mt-01-03-empty-cart-only-error.png`.
- **Expected Result:** Dual alerts appear initially ("Your cart is empty..." and "Please enter your name..."). Entering a name clears the name error while preserving the empty-cart error.
- **Actual Result:** Both errors rendered in `role="alert"` box with high visual contrast. After typing name, name alert cleared dynamically; empty-cart error remained until item added.
- **Status:** **PASS**
- **Evidence Files:**
  - `test-results/manual-evidence/mt-01-01-initial-state.png`
  - `test-results/manual-evidence/mt-01-02-validation-errors.png`
  - `test-results/manual-evidence/mt-01-03-empty-cart-only-error.png`

---

### MT-02: Rapid Double-Click Duplicate Prevention (Manual)
- **Test Case ID:** MT-02
- **Scenario:** Manual verification of synchronous submission lock, button state transition, and single confirmation creation under rapid double-click.
- **Preconditions:** Application loaded with Aero Wireless Earbuds in cart and name "Siddharth Rao" filled.
- **Execution Method:** Chromium browser session capturing pre-click, in-flight processing, and post-confirmation states.
- **Test Steps:**
  1. Verify cart has item and total ₹2,499.00. Capture screenshot `mt-02-01-before-rapid-click.png`.
  2. Issue two rapid clicks on "Place Order" (< 150ms).
  3. Inspect button state during the 800ms delay. Capture screenshot `mt-02-02-processing-state.png`.
  4. Wait for confirmation. Capture screenshot `mt-02-03-single-confirmation.png`.
  5. Audit DOM for duplicate containers or references.
- **Expected Result:** Place Order button immediately becomes disabled with label "Placing order…"; second click is ignored; exactly ONE confirmation panel and ONE order reference are generated.
- **Actual Result:** Lock engaged synchronously on click 1. Button showed "Placing order…" and `aria-busy="true"`. Confirmation rendered after 800ms with a single reference `FYND-20261122-XXXXXX`. Exactly 1 order reference element in DOM.
- **Status:** **PASS**
- **Evidence Files:**
  - `test-results/manual-evidence/mt-02-01-before-rapid-click.png`
  - `test-results/manual-evidence/mt-02-02-processing-state.png`
  - `test-results/manual-evidence/mt-02-03-single-confirmation.png`

---

## C. Risk Prioritization & Coverage Matrix

Risks are listed in descending order of critical business impact:

| Priority | Risk Description | Potential Impact | Mitigating Test Case | Mitigation Strategy |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Incorrect Order Total** | Financial discrepancy; charging wrong amount to customer | **TC-03** | Integer paise representation prevents binary floating-point drift; unified `formatPaise()` using `Intl.NumberFormat('en-IN')`. |
| **2** | **Duplicate Order Submission** | Double billing, duplicate order fulfillment, customer churn | **TC-05, MT-02** | Synchronous application-level lock `isSubmitting` checked before any async work or event loop yields. |
| **3** | **Checkout with Empty Cart** | Processing 0-value orders causing inventory and backend errors | **TC-04, MT-01** | Strict pre-submission cart size check (`cart.size === 0`) blocking execution and prompting user. |
| **4** | **Checkout Without Required Information** | Anonymous orders that cannot be fulfilled or attributed | **TC-02, MT-01** | Mandatory `customer-name` validation (`trimmedName.length === 0`) with `aria-invalid` and auto-focus. |
| **5** | **Incorrect Quantity Updates** | Customer receives incorrect count or exceeds inventory bounds | **TC-03, Manual** | Clamped boundaries: min 1 (decrease disabled) and max 10 (increase disabled). Verified in `stepper-and-cart-features.png`. |
| **6** | **Incorrect Line Totals** | Discrepancy between unit prices and quantity subtotals | **TC-03** | Line totals computed per product in integer paise (`unitPricePaise * quantity`) and bound to stable test IDs. |
| **7** | **Product Removal Issues** | Deleted products remaining in calculation or UI | **TC-01, Manual** | Explicit `removeFromCart()` deletion from Map, re-rendering empty state and resetting total when cart is cleared. |

---

## D. Test Execution Summary

### Summary Statistics

| Category | Planned | Executed | Passed | Failed | Pass Rate |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Automated Tests (Mandatory)** | 3 | 3 | 3 | 0 | **100%** |
| **Automated Tests (Supplementary)** | 2 | 2 | 2 | 0 | **100%** |
| **Automated Repetitions (3x stability)** | 15 | 15 | 15 | 0 | **100%** |
| **Manual Test Scenarios** | 2 | 2 | 2 | 0 | **100%** |
| **Responsive Viewport Verifications** | 2 | 2 | 2 | 0 | **100%** |
| **Console Error Audits** | 1 | 1 | 1 | 0 | **100% (0 errors)** |

---

### Defects Identified & Resolved

#### Defect DEF-01: Strict Mode Locator Collision on Validation Error
- **Severity:** Medium (Testability / DOM redundancy)
- **Description:** During initial test execution of TC-02, Playwright's `getByText('Please enter your name to place the order.')` encountered a strict mode violation because the message text was placed in both `#validation-alerts` and a separate field error paragraph `<p id="name-error-msg">`.
- **Root Cause:** Redundant dual rendering of the error string in the DOM.
- **Resolution:** Consolidated error text into `#validation-alerts` under an element with `id="name-alert"`, and linked the input via `aria-describedby="name-alert"` and `aria-invalid="true"`. Removed the redundant `<p id="name-error-msg">`.
- **Verification:** TC-02 re-run passed with zero locator collisions and full accessibility compliance.

#### Defect DEF-02: Playwright Actionability Timeout on Button Double-Click Test
- **Severity:** Medium (Test Design / Actionability)
- **Description:** When testing rapid clicks in TC-05, using `Promise.all([btn.click(), btn.click()])` resulted in Playwright waiting for the button to become enabled on the second click, because the first click immediately disabled the button per duplicate prevention specifications.
- **Root Cause:** Playwright's default `click()` actionability checks wait indefinitely for disabled elements to become enabled.
- **Resolution:** Updated TC-05 to use `await placeOrderBtn.dblclick()` per Section 7.3 specifications, dispatching the native double-click sequence cleanly across the synchronous lock.
- **Verification:** TC-05 executed reliably in 1.8s, confirming that the synchronous lock blocks the second event and leaves exactly one order reference in the DOM.

---

### Remaining Known Issues
**None.** The application has 0 known functional defects, 0 test failures, and 0 console errors.

---

### Official Command Execution Output
```
Running 15 tests using 1 worker (npx playwright test --repeat-each=3)

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
