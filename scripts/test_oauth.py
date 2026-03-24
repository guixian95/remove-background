from playwright.sync_api import sync_playwright
import time

def test_oauth_callback():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # 打开浏览器，便于观察
        context = browser.new_context()
        page = context.new_page()
        
        # 监听所有请求
        def on_request(request):
            if 'auth' in request.url.lower() or 'callback' in request.url.lower():
                print(f"[REQUEST] {request.method} {request.url}")
        
        def on_response(response):
            if 'auth' in response.url.lower() or 'callback' in response.url.lower():
                print(f"[RESPONSE] {response.status} {response.url}")
        
        page.on('request', on_request)
        page.on('response', on_response)
        
        # 访问登录页面
        print("1. 访问登录页面...")
        page.goto('http://localhost:3000/auth/login')
        page.wait_for_load_state('networkidle')
        
        # 截图
        page.screenshot(path='D:/code/my-remove-bg/screenshots/01-login-page.png')
        print("   登录页面截图已保存")
        
        # 点击 GitHub 登录按钮
        print("\n2. 点击 GitHub 登录按钮...")
        github_button = page.locator('button:has-text("GitHub")')
        if github_button.count() > 0:
            github_button.click()
            print("   已点击 GitHub 按钮")
        else:
            print("   未找到 GitHub 按钮")
            browser.close()
            return
        
        # 等待页面跳转
        print("\n3. 等待授权流程...")
        time.sleep(5)
        
        # 检查当前 URL
        current_url = page.url
        print(f"   当前 URL: {current_url}")
        
        # 如果跳转到 GitHub，等待用户授权
        if 'github.com' in current_url:
            print("   请在浏览器中完成 GitHub 授权...")
            # 等待用户授权，最多等待 2 分钟
            try:
                page.wait_for_url('**/localhost:3000/**', timeout=120000)
                print("   已返回应用")
            except:
                print("   等待超时")
        
        # 检查最终 URL
        final_url = page.url
        print(f"\n4. 最终 URL: {final_url}")
        
        # 截图
        page.screenshot(path='D:/code/my-remove-bg/screenshots/02-final-page.png')
        print("   最终页面截图已保存")
        
        browser.close()

if __name__ == '__main__':
    test_oauth_callback()
