from playwright.sync_api import sync_playwright
import time

def open_login_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("打开登录页面...")
        page.goto('http://localhost:3000/auth/login')
        page.wait_for_load_state('networkidle')
        
        print("\n浏览器已打开，请手动：")
        print("1. 点击 GitHub 登录按钮")
        print("2. 完成 GitHub 授权")
        print("3. 观察是否成功跳转到 /dashboard")
        print("\n等待 5 分钟后自动关闭...")
        
        # 等待 5 分钟
        time.sleep(300)
        
        browser.close()

if __name__ == '__main__':
    open_login_page()
