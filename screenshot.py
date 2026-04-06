from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173/login")
    page.screenshot(path="login_screenshot.png")
    page.goto("http://localhost:5173/register")
    page.screenshot(path="register_screenshot.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
