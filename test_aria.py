from playwright.sync_api import sync_playwright

def verify_budget_aria():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto("http://localhost:5173/")
        page.evaluate("localStorage.setItem('token', 'fake-token-123')")
        page.evaluate("localStorage.setItem('user', JSON.stringify({id: 1, name: 'Test User', role: 'USER'}))")

        def route_handler(route):
            url = route.request.url
            if "/api/" in url:
                if "auth/me" in url:
                    route.fulfill(status=200, json={"user": {"id": 1, "email": "test@test.com", "role": "USER", "name": "Test User"}})
                elif "budgets" in url:
                    route.fulfill(status=200, json=[
                        {
                            "id": 1,
                            "customerName": "Test Customer",
                            "totalPrice": 150,
                            "createdAt": "2024-12-31T00:00:00Z",
                            "status": "pending",
                            "superRecipe": {
                                "name": "Test Recipe"
                            }
                        }
                    ])
                else:
                    route.fulfill(status=200, json=[])
            else:
                route.continue_()

        context.route("**/*", route_handler)

        page.goto("http://localhost:5173/app")
        page.wait_for_load_state("networkidle")

        try:
            page.click("text=Constructor Presupuestos")
            page.wait_for_selector("text=Test Customer", timeout=5000)

            # Hover over the row so the buttons become visible and present in DOM depending on how it's styled
            # Although the buttons are only hidden via opacity-0, they are in the DOM, but let's hover anyway
            row = page.locator("tr").filter(has_text="Test Customer")
            row.hover()

            edit_label = page.locator('button[title="Editar Presupuesto"]').get_attribute("aria-label", timeout=5000)
            delete_label = page.locator('button[title="Eliminar Presupuesto"]').get_attribute("aria-label", timeout=5000)

            print(f"Edit aria-label: {edit_label}")
            print(f"Delete aria-label: {delete_label}")

            if edit_label == "Editar presupuesto de Test Customer" and delete_label == "Eliminar presupuesto de Test Customer":
                print("SUCCESS: ARIA labels verified!")
            else:
                print("FAILED to verify ARIA labels")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error.png")

        browser.close()

if __name__ == "__main__":
    verify_budget_aria()
