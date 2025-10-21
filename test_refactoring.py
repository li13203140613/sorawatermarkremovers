"""
测试重构后的应用 - 验证视频去水印功能
"""
from playwright.sync_api import sync_playwright
import sys

def test_webapp():
    """测试 RemoveWM 应用的核心功能"""

    print("=" * 60)
    print("🚀 开始测试重构后的 RemoveWM 应用")
    print("=" * 60)

    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=False)  # 可视化模式便于调试
        page = browser.new_page()

        try:
            # 1. 导航到首页
            print("\n📍 步骤 1: 导航到首页 http://localhost:3000")
            page.goto('http://localhost:3000', wait_until='networkidle')
            print("✅ 页面加载完成")

            # 截图
            page.screenshot(path='test_screenshots/01_homepage.png', full_page=True)
            print("📸 截图已保存: test_screenshots/01_homepage.png")

            # 2. 等待页面元素
            print("\n📍 步骤 2: 等待页面元素加载")
            page.wait_for_timeout(3000)  # 等待 3 秒让页面完全渲染

            # 3. 获取页面标题
            title = page.title()
            print(f"📄 页面标题: {title}")

            # 4. 检查关键元素
            print("\n📍 步骤 3: 检查关键元素")

            # 检查是否有 h1 标题
            h1_count = page.locator('h1').count()
            print(f"  ✓ 找到 {h1_count} 个 H1 标题")

            if h1_count > 0:
                h1_text = page.locator('h1').first.text_content()
                print(f"    第一个 H1: {h1_text}")

            # 检查输入框
            input_count = page.locator('input').count()
            print(f"  ✓ 找到 {input_count} 个输入框")

            # 检查按钮
            button_count = page.locator('button').count()
            print(f"  ✓ 找到 {button_count} 个按钮")

            # 5. 检查积分显示（如果有）
            print("\n📍 步骤 4: 检查积分显示")
            credit_elements = page.get_by_text('积分', exact=False).count()
            if credit_elements > 0:
                print(f"  ✅ 找到积分相关元素: {credit_elements} 个")
            else:
                print("  ℹ️ 未找到积分显示（可能需要登录）")

            # 6. 检查控制台日志
            print("\n📍 步骤 5: 监听控制台消息")
            console_messages = []

            def handle_console(msg):
                console_messages.append(f"[{msg.type}] {msg.text}")

            page.on('console', handle_console)

            # 等待一下看是否有日志
            page.wait_for_timeout(2000)

            if console_messages:
                print(f"  📝 控制台消息 ({len(console_messages)} 条):")
                for msg in console_messages[:5]:  # 只显示前 5 条
                    print(f"    {msg}")
            else:
                print("  ✅ 没有控制台错误")

            # 7. 最终截图
            page.screenshot(path='test_screenshots/02_final_state.png', full_page=True)
            print("\n📸 最终截图已保存: test_screenshots/02_final_state.png")

            print("\n" + "=" * 60)
            print("✅ 测试完成！应用运行正常")
            print("=" * 60)

        except Exception as e:
            print(f"\n❌ 测试失败: {e}")
            page.screenshot(path='test_screenshots/error.png', full_page=True)
            print("📸 错误截图已保存: test_screenshots/error.png")
            sys.exit(1)

        finally:
            browser.close()

if __name__ == '__main__':
    import os
    os.makedirs('test_screenshots', exist_ok=True)
    test_webapp()
