// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * MELting Universe - Complete Flow & Checkout Automated Test Suite
 * Fynd Hiring Hackathon (SDET Intern) Requirements
 *
 * Mandatory Tests:
 * 1. TEST 1: Successful Checkout (Login -> Menu -> Add Ice Cream -> Checkout -> Place Order -> Order Confirmed)
 * 2. TEST 2: Missing Customer Name (Checkout blocked, validation message displayed, cart preserved)
 * 3. TEST 3: Quantity and Exact Total (Chocolate Ice Cream ₹50 increased to 2 = ₹100 line total & ₹100 order total)
 *
 * Supplementary Tests:
 * 4. Empty Cart Checkout Blocking
 * 5. Rapid Double-Click Duplicate Order Prevention
 */

test.describe('MELting Universe - Mandatory Test Suite', () => {

  test.beforeEach(async ({ page, context }) => {
    // Start each test from a clean state (clear cookies and storage)
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('TEST 1: Successful Checkout', async ({ page }) => {
    // 1. Clean state: navigate to login page
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Customer Login' })).toBeVisible();

    // 2. Enter demo login
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('123456');
    await page.locator('#login-btn').click();

    // 3. Navigate to the menu
    await page.waitForURL('**/menu.html');
    await expect(page.getByRole('heading', { name: 'Our Ice Cream Menu' })).toBeVisible();

    // 4. Add Chocolate Ice Cream to cart from the menu
    const addChocolateBtn = page.getByRole('button', { name: 'Add Chocolate to cart' });
    await expect(addChocolateBtn).toBeVisible();
    await addChocolateBtn.click();

    // Verify cart count badge updated
    const headerCartBadge = page.locator('#header-cart-count');
    await expect(headerCartBadge).toHaveText('1');

    // 5. Navigate to single-page checkout
    await page.goto('/checkout.html');
    await expect(page.getByRole('heading', { name: 'Single-Page Checkout' })).toBeVisible();

    // Verify item is present in cart
    await expect(page.locator('#checkout-cart-list')).toContainText('Chocolate');
    await expect(page.getByTestId('order-total')).toHaveText(/₹\s*50/);

    // 6. Enter customer name
    const customerName = 'Aarav Sharma';
    await page.getByLabel('Customer Name').fill(customerName);

    // 7. Place Order
    await page.getByRole('button', { name: 'Place Order' }).click();

    // 8. Verify successful confirmation
    const confirmationHeading = page.getByRole('heading', { name: 'Order Confirmed!' });
    await expect(confirmationHeading).toBeVisible();

    // 9. Verify unique order reference matches FYND-YYYYMMDD-XXXXXX
    const orderRefLocator = page.getByTestId('order-reference');
    await expect(orderRefLocator).toBeVisible();
    const orderRefText = await orderRefLocator.textContent();
    expect(orderRefText).toMatch(/^FYND-\d{8}-[A-Z0-9]{6}$/);

    // 10. Verify customer name and item breakdown
    await expect(page.locator('#confirmed-name')).toHaveText(customerName);
    await expect(page.locator('#confirmed-items-list')).toContainText('Chocolate × 1');
  });

  test('TEST 2: Missing Customer Name', async ({ page }) => {
    // 1. Clean state: navigate to checkout
    await page.goto('/checkout.html');

    // 2. Add product to cart (Vanilla ₹40)
    await page.getByRole('button', { name: 'Add Vanilla to cart' }).click();
    await expect(page.locator('#checkout-cart-list')).toContainText('Vanilla');
    await expect(page.getByTestId('order-total')).toHaveText(/₹\s*40/);

    // 3. Leave customer name blank and click Place Order
    await page.getByLabel('Customer Name').fill('');
    await page.getByRole('button', { name: 'Place Order' }).click();

    // 4. Verify checkout is blocked: confirmation is NOT visible
    await expect(page.getByRole('heading', { name: 'Order Confirmed!' })).toBeHidden();
    await expect(page.getByTestId('order-reference')).toHaveCount(0);

    // 5. Verify validation message is displayed
    const validationMessage = page.getByText('Please enter your name to place the order.');
    await expect(validationMessage).toBeVisible();

    // 6. Verify cart item is still preserved
    await expect(page.locator('#checkout-cart-list')).toContainText('Vanilla');
    await expect(page.getByTestId('order-total')).toHaveText(/₹\s*40/);
  });

  test('TEST 3: Quantity and Exact Total', async ({ page }) => {
    // 1. Clean state: navigate to checkout
    await page.goto('/checkout.html');

    // 2. Add Chocolate Ice Cream at ₹50
    await page.getByRole('button', { name: 'Add Chocolate to cart' }).click();
    await expect(page.locator('#checkout-cart-list')).toContainText('Chocolate');

    // 3. Increase quantity once (quantity becomes 2)
    const increaseBtn = page.getByRole('button', { name: 'Increase quantity of Chocolate' });
    await increaseBtn.click();

    // Verify quantity number displays 2
    const qtyDisplay = page.locator('#cart-line-chocolate-cup .quantity-display');
    await expect(qtyDisplay).toHaveText('2');

    // 4. Verify line total is ₹100
    const lineTotal = page.getByTestId('line-total-chocolate-cup');
    await expect(lineTotal).toHaveText(/₹\s*100(\.00)?/);

    // 5. Verify order total is ₹100
    const orderTotal = page.getByTestId('order-total');
    await expect(orderTotal).toHaveText(/₹\s*100(\.00)?/);
  });

});

test.describe('MELting Universe - Supplementary Test Suite', () => {

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/checkout.html');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
  });

  test('TC-04: Empty Cart Checkout Blocking', async ({ page }) => {
    // Keep cart empty, fill customer name
    await page.getByLabel('Customer Name').fill('Priya Patel');

    // Click Place Order
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Verify validation message
    const emptyCartMsg = page.getByText('Your cart is empty. Add at least one product before placing an order.');
    await expect(emptyCartMsg).toBeVisible();

    // Confirmation must NOT be visible
    await expect(page.getByRole('heading', { name: 'Order Confirmed!' })).toBeHidden();

    // Name must be preserved
    await expect(page.getByLabel('Customer Name')).toHaveValue('Priya Patel');
  });

  test('TC-05: Rapid Double-Click Duplicate Order Prevention', async ({ page }) => {
    // Add product and enter name
    await page.getByRole('button', { name: 'Add Chocolate to cart' }).click();
    await page.getByLabel('Customer Name').fill('Rohan Gupta');

    const placeOrderBtn = page.getByRole('button', { name: 'Place Order' });

    // Double-click rapidly
    await placeOrderBtn.dblclick();

    // Wait for confirmation heading
    await expect(page.getByRole('heading', { name: 'Order Confirmed!' })).toBeVisible();

    // Exactly ONE order reference in DOM
    await expect(page.getByTestId('order-reference')).toHaveCount(1);
    await expect(page.locator('#confirmation-panel:not(.hidden)')).toHaveCount(1);
  });

});
