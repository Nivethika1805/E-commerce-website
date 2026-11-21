// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Fynd Hiring Hackathon (SDET Intern) – Mini Checkout Automated Test Suite
 *
 * Requirements Coverage:
 * - TC-01: Successful Checkout (Order Reference generation, Confirmation display)
 * - TC-02: Missing Required Field (Validation message, Information preservation)
 * - TC-03: Quantity and Total Calculation (Stepper controls, Exact INR currency formatting)
 * - Supplementary:
 *   - TC-04: Empty Cart Checkout Blocking
 *   - TC-05: Rapid Double-Click Duplicate Order Prevention (Application-level lock)
 */

test.describe('Mandatory Checkout Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Fresh navigation guarantees clean state (in-memory state, zero persistence)
    await page.goto('/');
  });

  test('TC-01 Successful Checkout', async ({ page }) => {
    // 1. Clean state: verify empty cart state initially
    await expect(page.getByText('Your cart is empty.')).toBeVisible();

    // 2. Add product to cart
    await page.getByRole('button', { name: 'Add Aero Wireless Earbuds to cart' }).click();

    // Verify product was added to cart
    await expect(page.getByRole('button', { name: 'Remove Aero Wireless Earbuds from cart' })).toBeVisible();

    // 3. Enter customer name
    const customerName = 'Aarav Sharma';
    await page.getByLabel('Customer Name').fill(customerName);

    // 4. Click Place Order
    await page.getByRole('button', { name: 'Place Order' }).click();

    // 5. Assert confirmation heading is visible (auto-waits for simulated processing delay)
    const confirmationHeading = page.getByRole('heading', { name: 'Order Confirmed!' });
    await expect(confirmationHeading).toBeVisible();

    // 6. Assert order reference is visible and matches /FYND-\d{8}-[A-Z0-9]{6}/
    const orderRefLocator = page.getByTestId('order-reference');
    await expect(orderRefLocator).toBeVisible();

    const orderRefText = await orderRefLocator.textContent();
    expect(orderRefText).toMatch(/^FYND-\d{8}-[A-Z0-9]{6}$/);

    // 7. Verify customer name and itemized summary in confirmation
    await expect(page.getByText(customerName)).toBeVisible();
    await expect(page.getByText('Aero Wireless Earbuds × 1')).toBeVisible();
  });

  test('TC-02 Missing Required Field', async ({ page }) => {
    // 1. Add product to cart
    await page.getByRole('button', { name: 'Add Nimbus Insulated Bottle to cart' }).click();
    await expect(page.getByRole('button', { name: 'Remove Nimbus Insulated Bottle from cart' })).toBeVisible();

    // 2. Leave name blank and click Place Order
    await page.getByLabel('Customer Name').fill('');
    await page.getByRole('button', { name: 'Place Order' }).click();

    // 3. Assert validation message is visible
    const validationMessage = page.getByText('Please enter your name to place the order.');
    await expect(validationMessage).toBeVisible();

    // 4. Assert confirmation is NOT visible / not displayed
    await expect(page.getByRole('heading', { name: 'Order Confirmed!' })).toBeHidden();

    // 5. Assert cart item is still present (information preserved)
    await expect(page.getByRole('button', { name: 'Remove Nimbus Insulated Bottle from cart' })).toBeVisible();
    await expect(page.getByTestId('order-total')).toHaveText('₹1,299.00');
  });

  test('TC-03 Quantity and Total Calculation', async ({ page }) => {
    // 1. Add Aero Wireless Earbuds (Price: ₹2,499.00)
    await page.getByRole('button', { name: 'Add Aero Wireless Earbuds to cart' }).click();

    // 2. Click Increase quantity once (quantity becomes 2)
    const increaseBtn = page.getByRole('button', { name: 'Increase quantity of Aero Wireless Earbuds' });
    await increaseBtn.click();

    // 3. Assert displayed quantity is "2"
    const cartLine = page.locator('#cart-line-aero-earbuds');
    await expect(cartLine.locator('.quantity-display')).toHaveText('2');

    // 4. Assert exact line total is ₹4,998.00
    const lineTotal = page.getByTestId('line-total-aero-earbuds');
    await expect(lineTotal).toHaveText('₹4,998.00');

    // 5. Assert exact order total is ₹4,998.00
    const orderTotal = page.getByTestId('order-total');
    await expect(orderTotal).toHaveText('₹4,998.00');
  });
});

test.describe('Supplementary Checkout Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('TC-04 Empty Cart Blocking', async ({ page }) => {
    // 1. Keep cart empty, enter valid customer name
    await page.getByLabel('Customer Name').fill('Priya Patel');

    // 2. Click Place Order
    await page.getByRole('button', { name: 'Place Order' }).click();

    // 3. Assert empty cart validation message is visible
    const emptyCartMsg = page.getByText('Your cart is empty. Add at least one product before placing an order.');
    await expect(emptyCartMsg).toBeVisible();

    // 4. Assert confirmation is NOT shown
    await expect(page.getByRole('heading', { name: 'Order Confirmed!' })).toBeHidden();

    // 5. Assert entered name is preserved
    await expect(page.getByLabel('Customer Name')).toHaveValue('Priya Patel');
  });

  test('TC-05 Rapid Double-Click Duplicate Order Prevention', async ({ page }) => {
    // 1. Add product to cart
    await page.getByRole('button', { name: 'Add Aero Wireless Earbuds to cart' }).click();

    // 2. Enter customer name
    await page.getByLabel('Customer Name').fill('Rohan Gupta');

    const placeOrderBtn = page.getByRole('button', { name: 'Place Order' });

    // 3. Trigger rapid double-click
    await placeOrderBtn.dblclick();

    // 4. Wait for confirmation heading
    await expect(page.getByRole('heading', { name: 'Order Confirmed!' })).toBeVisible();

    // 5. Assert exactly ONE order reference element exists in DOM
    const orderReferences = page.getByTestId('order-reference');
    await expect(orderReferences).toHaveCount(1);

    // 6. Assert exactly ONE confirmation container is visible
    const confirmationPanels = page.locator('.confirmation-panel:not(.hidden)');
    await expect(confirmationPanels).toHaveCount(1);
  });
});
