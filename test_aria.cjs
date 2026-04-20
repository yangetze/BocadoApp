const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("http://localhost:5173/");
  await page.evaluate("localStorage.setItem('token', 'fake-token-123')");
  await page.evaluate("localStorage.setItem('user', JSON.stringify({id: 1, name: 'Test User', role: 'USER'}))");

  await page.route("**/*", route => {
    const url = route.request().url();
    if (url.includes("/api/")) {
      if (url.includes("auth/me")) {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({"user": {"id": 1, "email": "test@test.com", "role": "USER", "name": "Test User"}}) });
      } else if (url.includes("budgets")) {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
          {
            "id": 1,
            "customerName": "Test Customer",
            "totalPrice": 150,
            "deliveryDate": "2024-12-31T00:00:00Z",
            "status": "pending",
            "superRecipe": {
                "name": "Test Recipe"
            }
          }
        ])});
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    } else {
      route.continue();
    }
  });

  await page.goto("http://localhost:5173/app");
  await page.waitForLoadState("networkidle");

  await page.click("text=Constructor Presupuestos");
  await page.waitForSelector("text=Test Customer");

  // Verify ARIA labels exist in DOM
  const editLabel = await page.getAttribute("button:has(svg.lucide-pencil)", "aria-label");
  const deleteLabel = await page.getAttribute("button:has(svg.lucide-trash2)", "aria-label");

  console.log(`Edit aria-label: ${editLabel}`);
  console.log(`Delete aria-label: ${deleteLabel}`);

  if (editLabel === "Editar presupuesto de Test Customer" && deleteLabel === "Eliminar presupuesto de Test Customer") {
      console.log("SUCCESS: ARIA labels verified!");
  } else {
      console.log("FAILED to verify ARIA labels");
  }

  await browser.close();
})();
