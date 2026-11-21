# MELting Universe – Ice Cream Shop & Browser Test Suite

**Event / Challenge:** Fynd Hiring Hackathon (SDET Intern)  
**Role:** Senior Full-Stack Developer, UI/UX Designer & QA Automation Architect  
**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Node.js, Playwright Test  
**Local Host Link:** [http://localhost:8000](http://localhost:8000)  

---

## 1. Project Overview

**MELting Universe** is an enhanced, fully responsive ice cream e-commerce web application featuring a complete end-to-end customer journey coupled with an automated browser test suite built with Playwright:

$$\text{LOGIN PAGE} \longrightarrow \text{MENU PAGE} \longrightarrow \text{SINGLE-PAGE CHECKOUT} \longrightarrow \text{ORDER CONFIRMATION}$$

### Design & Architecture Highlights:
- **Theme Consistency:** Retains the light blue and white theme (`linear-gradient(135deg, #e0f7fa 0%, #ffffff 50%, #e0f7fa 100%)`), white cards, and teal/cyan accent colors (`#007B8F`, `#00acc1`).
- **Professional Typography:** Upgraded decorative cursive to modern Google Fonts: **Poppins** (headings), **Roboto** (body text), and **Inter** (buttons and navigation).
- **Zero Frontend Frameworks:** Native HTML5, modern modular CSS3, and vanilla JavaScript.
- **Cart & Session Persistence:** Integrated `localStorage` (`melting_cart` and `loggedInUser`) ensuring cart items and login state seamlessly persist between Menu, Checkout, About, and Contact pages.
- **Financial Accuracy:** Integer-safe arithmetic preventing floating-point rounding errors.
- **Duplicate Order Prevention:** Synchronous application-level locking (`isSubmitting`) preventing race conditions, multi-clicks, and Enter key spam.

---

## 2. Customer Journey & Page Structure

### Page 1: Login Page (`index.html`)
- The initial entry point of the website.
- Displays circular MELting Universe logo (`./img3.jpg`), brand name, and tagline (*"Born to CHILL , Built to MELT"*).
- Includes Username/Email and Password inputs, with demo authentication.
- Demo Credentials: `admin` / `123456` (or any valid username and password).
- Validates required inputs and smoothly redirects to the Menu page upon submission.

### Page 2: Menu Page (`menu.html`)
- Showcases the ice cream menu preserving all 5 original categories:
  1. **Cup Ice Creams** (Chocolate ₹50, Vanilla ₹40, Strawberry ₹40, Mixed Flavours ₹60, Blueberry ₹35)
  2. **Stick Ice Creams** (Jolly train - Blueberry ₹30, Little heart - Strawberry ₹35, Chocolate ₹40, Little heart - Choco ₹35, Jolly train - Chocolate ₹30)
  3. **Tub Ice Creams** (Chocolate ₹240, BlackCurrent ₹260, Red Velvet ₹280, Butterscotch ₹260, Vanilla ₹250)
  4. **Ice Cream Cakes** (Butterscotch ₹450, Red Velvet ₹460, Fruit & BlackCurrent ₹500, Strawberry ₹440, Dark Choco ₹575)
  5. **Bytes** (Strawberry Choco ₹15, Cotton Candy ₹5, Little Heart ₹10, Choco Bytes ₹5, Vanilla Choco ₹15)
- All product images sourced from the existing `Photos/` directory.
- Enhanced cards feature: Product image, Name, Price, Description, and an accessible **"Add to Cart"** button.
- Floating bottom bar displays real-time item count, subtotal, and an **"ORDER NOW / VIEW CART →"** button navigating directly to checkout.

### Page 3: Single-Page Checkout (`checkout.html`)
- Contains the entire checkout workflow on a single page.
- **Mandatory Hackathon Products:**
  1. **Chocolate – Cup Ice Cream** — ₹50 (Photos/c3.jpg)
  2. **Vanilla – Cup Ice Cream** — ₹40 (Photos/c4.jpg)
- **A. Shopping Cart:** Product visual, name, unit price, quantity steppers (`−` min 1, `+` max 10), line totals (`data-testid="line-total-<productId>"`), and Remove buttons.
- **B. Order Summary:** Real-time Subtotal and Order Total (`data-testid="order-total"`).
- **C. Customer Details:** Required `<label for="customer-name">Customer Name</label>` input.
- **D. Place Order & Validation:** Blocks empty-cart submissions (*"Your cart is empty. Add at least one product before placing an order."*) and blank-name submissions (*"Please enter your name to place the order."*). Preserves user input and cart items on failure.
- **E. Duplicate Order Prevention:** Synchronous guard `if (isSubmitting) return;` disables button, sets `aria-busy="true"`, shows `"Placing order…"`, and simulates an 800ms delay.
- **F. Order Confirmation:** Reveals in-page confirmation with customer name, unique reference (`FYND-YYYYMMDD-XXXXXX`), item breakdown, and final total. Includes a **"Start New Order"** button.

### Page 4: About Page (`about.html`)
- Preserved sections: *Fresh Ingredients*, *Unique Flavors*, *Family Friendly*, and *Events & Parties*.
- Styled with modern Poppins/Roboto typography and header navigation.

### Page 5: Contact Page (`contact.html`)
- Preserved fields: *Name*, *Email*, *Phone Number*, *Your Order / Message*, and *Send Message*.
- Enhanced with validation and instant feedback alert.

---

## 3. How to Run the Website Locally

1. **Start the local server:**
   ```bash
   python -m http.server 8000
   ```
   *(or run `npm start` which executes `http-server -p 8000 -c-1`)*

2. **Open in your browser:**
   - **Login Page (Entry):** [http://localhost:8000/index.html](http://localhost:8000/index.html)
   - **Menu Page:** [http://localhost:8000/menu.html](http://localhost:8000/menu.html)
   - **Checkout Page:** [http://localhost:8000/checkout.html](http://localhost:8000/checkout.html)
   - **About Page:** [http://localhost:8000/about.html](http://localhost:8000/about.html)
   - **Contact Page:** [http://localhost:8000/contact.html](http://localhost:8000/contact.html)

---

## 4. Automated Testing (Playwright)

### Run all tests:
```bash
npm test
```

### Run tests across 3 consecutive iterations (repeat stability check):
```bash
npx playwright test --repeat-each=3
```

### View interactive HTML report:
```bash
npm run report
```

### Real Execution Results:
```text
Running 15 tests using 1 worker (npx playwright test --repeat-each=3)

  ok  1 [chromium] › tests\checkout.spec.js › TEST 1: Successful Checkout (4.1s)
  ok  2 [chromium] › tests\checkout.spec.js › TEST 2: Missing Customer Name (7.3s)
  ok  3 [chromium] › tests\checkout.spec.js › TEST 3: Quantity and Exact Total (14.1s)
  ok  4 [chromium] › tests\checkout.spec.js › TC-04: Empty Cart Checkout Blocking (13.3s)
  ok  5 [chromium] › tests\checkout.spec.js › TC-05: Rapid Double-Click Duplicate Order Prevention (3.6s)
  ok  6 [chromium] › tests\checkout.spec.js › TEST 1: Successful Checkout (10.9s)
  ok  7 [chromium] › tests\checkout.spec.js › TEST 2: Missing Customer Name (26.5s)
  ok  8 [chromium] › tests\checkout.spec.js › TEST 3: Quantity and Exact Total (19.8s)
  ok  9 [chromium] › tests\checkout.spec.js › TC-04: Empty Cart Checkout Blocking (1.8s)
  ok 10 [chromium] › tests\checkout.spec.js › TC-05: Rapid Double-Click Duplicate Order Prevention (2.8s)
  ok 11 [chromium] › tests\checkout.spec.js › TEST 1: Successful Checkout (27.9s)
  ok 12 [chromium] › tests\checkout.spec.js › TEST 2: Missing Customer Name (2.6s)
  ok 13 [chromium] › tests\checkout.spec.js › TEST 3: Quantity and Exact Total (1.9s)
  ok 14 [chromium] › tests\checkout.spec.js › TC-04: Empty Cart Checkout Blocking (11.7s)
  ok 15 [chromium] › tests\checkout.spec.js › TC-05: Rapid Double-Click Duplicate Order Prevention (12.0s)

  15 passed (2.8m)
```
- **Total Tests Executed:** 15 (5 test cases × 3 repetitions)
- **Passed:** 15
- **Failed:** 0
- **Pass Rate:** 100%

---

## 5. Manual Testing Evidence

Committed in [test-results/manual-evidence/](file:///c:/Users/nivig/Documents/HTML/ICECREAM%20website/test-results/manual-evidence/):
- **`flow-01-login.png`**: Login interface with demo credentials hint.
- **`flow-02-menu.png`**: Ice cream menu with categories, Add to Cart buttons, and floating order bar.
- **`flow-03-checkout.png`**: Single-page checkout with quick add and cart table.
- **`mt-01-empty-cart.png`**: Empty cart checkout blocked with visible error message.
- **`mt-02-single-confirmation.png`**: Rapid double-click verified — exactly ONE order reference generated.
- **`responsive-mobile.png`**: Mobile layout verified at 375px width.
