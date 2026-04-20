from playwright.sync_api import sync_playwright
import time

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
                            "deliveryDate": "2024-12-31T00:00:00Z",
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

            row = page.locator("tr").filter(has_text="Test Customer")
            row.hover()
            time.sleep(1)

            page.screenshot(path="/home/jules/verification/screenshots/verification2.png")
            print("Screenshot saved to /home/jules/verification/screenshots/verification2.png")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/screenshots/verification_error.png")
            print("Error screenshot saved to /home/jules/verification/screenshots/verification_error.png")

        browser.close()

if __name__ == "__main__":
    verify_budget_aria()
