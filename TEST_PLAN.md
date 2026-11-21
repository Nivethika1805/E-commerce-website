# QA Test Plan & Execution Report: MELting Universe

**Project:** MELting Universe – Complete Website Flow & Mini Checkout  
**Event:** Fynd Hiring Hackathon (SDET Intern)  
**Execution Date:** November 22, 2026  
**Environment:** Node.js v24.12.0 | Playwright Test v1.50.1 | Chromium  
**Application URL:** http://localhost:8000  

---

## A. Testing Scope

1. **End-to-End User Flow:**
   - Login Page (`index.html`) → Menu Page (`menu.html`) → Single-Page Checkout (`checkout.html`) → Order Confirmation.
2. **Product Catalog & Cart Integration:**
   - 5 categories of ice creams: Cup Ice Creams, Stick Ice Creams, Tub Ice Creams, Ice Cream Cakes, Bytes.
   - Products: Chocolate Cup (₹50), Vanilla Cup (₹40), and all supporting flavors.
   - Steppers: `−` (disabled at 1), `+` (disabled at 10), and line removal.
3. **Form Validation & Accessibility:**
   - Empty-cart prevention.
   - Blank / whitespace-only customer name prevention.
   - Preservation of entered information across failed validations.
4. **Duplicate Order Prevention:**
   - Synchronous boolean locking during the 800ms processing delay.
   - Suppression of double-clicks and repeated Enter key submissions.
5. **Cross-Page State Persistence:**
   - `localStorage` cart synchronization across navigation.

---

## B. Test Case Documentation

### TEST 1: Successful Checkout (Automated)
- **ID:** TEST-01
- **Preconditions:** Clean state (`localStorage` and cookies cleared).
- **Steps:**
  1. Open `http://localhost:8000/`.
  2. Enter demo login credentials (`admin` / `123456`) and click Login.
  3. Verify redirection to `menu.html`.
  4. Click "Add to Cart" on Chocolate Ice Cream (₹50).
  5. Navigate to `checkout.html`.
  6. Fill Customer Name with "Aarav Sharma".
  7. Click "Place Order".
- **Expected Result:** Order Confirmed heading appears; order reference matching `/^FYND-\d{8}-[A-Z0-9]{6}$/` is visible; customer name "Aarav Sharma" and item "Chocolate × 1" are displayed.
- **Actual Result:** **PASS**. Confirmed heading visible, reference generated, total ₹50 confirmed.

### TEST 2: Missing Customer Name (Automated)
- **ID:** TEST-02
- **Preconditions:** Clean state at `checkout.html`.
- **Steps:**
  1. Add Vanilla Cup (₹40) to cart.
  2. Leave Customer Name field blank.
  3. Click "Place Order".
- **Expected Result:** Checkout is blocked; error message *"Please enter your name to place the order."* is displayed; confirmation panel is NOT visible; Vanilla item remains in cart.
- **Actual Result:** **PASS**. Confirmation hidden, error message displayed, cart item preserved.

### TEST 3: Quantity and Exact Total (Automated)
- **ID:** TEST-03
- **Preconditions:** Clean state at `checkout.html`.
- **Steps:**
  1. Add Chocolate Ice Cream at ₹50.
  2. Click Increase quantity button (`+`) once.
  3. Inspect quantity display.
  4. Inspect line total (`[data-testid="line-total-chocolate-cup"]`).
  5. Inspect order total (`[data-testid="order-total"]`).
- **Expected Result:** Quantity displays `"2"`; line total is `₹100`; order total is `₹100`.
- **Actual Result:** **PASS**. Stepper updated quantity to 2; exact line total and order total updated to ₹100.

### TC-04: Empty Cart Checkout Blocking (Supplementary Automated)
- **ID:** TC-04
- **Steps:** Leave cart empty, enter name "Priya Patel", click "Place Order".
- **Expected Result:** Message *"Your cart is empty. Add at least one product before placing an order."* is shown; confirmation is hidden; name is preserved.
- **Actual Result:** **PASS**.

### TC-05: Rapid Double-Click Duplicate Prevention (Supplementary Automated)
- **ID:** TC-05
- **Steps:** Add item, enter name, double click Place Order button (`dblclick()`).
- **Expected Result:** Synchronous lock prevents duplicate submission; exactly ONE order reference and ONE confirmation panel exist in DOM.
- **Actual Result:** **PASS**. Exactly 1 confirmation panel and 1 order reference element in DOM.

---

## C. Prioritized Risk Matrix

| Priority | Risk | Mitigation | Test Coverage |
| :---: | :--- | :--- | :---: |
| **1** | **Incorrect Order Total** | Integer-safe financial math; verified multiplication and aggregation | **TEST 3** |
| **2** | **Duplicate Order Submission** | Synchronous application-level lock `if (isSubmitting) return;` | **TC-05, MT-02** |
| **3** | **Checkout with Empty Cart** | Pre-submit check blocking execution when `cart.length === 0` | **TC-04, MT-01** |
| **4** | **Missing Customer Name** | Trimmed length check blocking execution with field highlight | **TEST 2, MT-01** |
| **5** | **Incorrect Quantity Updates** | Clamped boundaries (min 1, max 10) with disabled stepper states | **TEST 3** |
| **6** | **State Loss Across Navigation** | Centralized `localStorage` synchronization in `cart.js` | **TEST 1** |

---

## D. Manual Test Execution Outcomes

- **MT-01 Empty Cart Validation:**
  - *Action:* Navigated to `checkout.html` with empty cart; clicked Place Order.
  - *Observation:* Checkout was prevented; error *"Your cart is empty. Add at least one product before placing an order."* appeared in red alert box.
  - *Status:* **PASS** (Evidence: `mt-01-empty-cart.png`).
- **MT-02 Rapid Double-Click Duplicate Order Prevention:**
  - *Action:* Added Chocolate Cup; entered name "Aarav Sharma"; double-clicked Place Order in rapid succession (< 150ms).
  - *Observation:* Button immediately transitioned to `"Placing order…"` and disabled. After the 800ms simulated delay, exactly ONE confirmation screen appeared with a single unique order reference `FYND-20261122-XXXXXX`.
  - *Status:* **PASS** (Evidence: `mt-02-single-confirmation.png`).

---

## E. Execution Summary

```text
Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total (across 3 consecutive runs)
Pass Rate:   100%
Flakiness:   0%
Duration:    2.8m
Status:      ACCEPTED FOR ROUND 1 SUBMISSION
```
