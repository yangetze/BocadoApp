from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:5173/')

    # Let's take a screenshot of whatever loads to see if we're redirected to a login page
    page.wait_for_timeout(3000)
    page.screenshot(path='frontend_index.png')

    browser.close()
