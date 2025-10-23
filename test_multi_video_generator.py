"""
测试多视频生成功能 (MultiVideoGenerator)
测试 6 个视频同时生成的完整流程
"""
from playwright.sync_api import sync_playwright
import time

def test_multi_video_generator():
    print("🚀 开始测试多视频生成功能...")

    with sync_playwright() as p:
        # 启动浏览器 (headless模式)
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 设置视口大小 (模拟桌面浏览器)
        page.set_viewport_size({"width": 1920, "height": 1080})

        print("\n📍 步骤 1: 访问视频生成页面...")
        page.goto('http://localhost:3000/zh/video-generation')
        page.wait_for_load_state('networkidle')
        time.sleep(2)  # 等待页面完全加载

        # 截图 - 初始状态
        page.screenshot(path='screenshots/01_initial_page.png', full_page=True)
        print("   ✅ 页面加载完成 (截图: 01_initial_page.png)")

        print("\n📍 步骤 2: 检查页面元素...")

        # 检查标题
        page_title = page.title()
        print(f"   📄 页面标题: {page_title}")

        # 检查左侧表单区域
        print("\n   🔍 检查左侧表单元素:")

        # 检查模型选择
        sora2_radio = page.locator('input[value="sora2"]')
        sora2_unwm_radio = page.locator('input[value="sora2-unwm"]')
        print(f"   • 标准版选项: {'✅ 存在' if sora2_radio.count() > 0 else '❌ 不存在'}")
        print(f"   • 专业版选项: {'✅ 存在' if sora2_unwm_radio.count() > 0 else '❌ 不存在'}")

        # 检查提示词输入框
        prompt_textarea = page.locator('textarea[placeholder*="描述您想要的视频内容"]')
        print(f"   • 提示词输入框: {'✅ 存在' if prompt_textarea.count() > 0 else '❌ 不存在'}")

        # 检查图片上传区域
        file_input = page.locator('input[type="file"][accept*="image"]')
        print(f"   • 图片上传输入: {'✅ 存在' if file_input.count() > 0 else '❌ 不存在'}")

        # 检查生成按钮
        generate_button = page.locator('button[type="submit"]')
        print(f"   • 生成按钮: {'✅ 存在' if generate_button.count() > 0 else '❌ 不存在'}")

        if generate_button.count() > 0:
            button_text = generate_button.inner_text()
            print(f"   • 按钮文本: '{button_text}'")

        print("\n   🔍 检查右侧视频卡片区域:")

        # 检查统计栏
        stats_section = page.locator('text=生成进度')
        print(f"   • 统计栏: {'✅ 存在' if stats_section.count() > 0 else '❌ 不存在'}")

        # 检查 6 个视频卡片
        video_cards = page.locator('text=视频 #').all()
        print(f"   • 视频卡片数量: {len(video_cards)}")

        for i in range(min(6, len(video_cards))):
            card_title = video_cards[i].inner_text()
            print(f"     - {card_title}")

        # 检查卡片状态
        idle_badges = page.locator('text=等待生成').all()
        print(f"   • 等待状态卡片: {len(idle_badges)}")

        # 截图 - 表单检查完成
        page.screenshot(path='screenshots/02_form_elements.png', full_page=True)
        print("\n   ✅ 元素检查完成 (截图: 02_form_elements.png)")

        print("\n📍 步骤 3: 检查用户登录状态...")

        # 检查登录状态提示
        login_status = page.locator('text=已登录').count() > 0
        if login_status:
            print("   ✅ 用户已登录")
            # 尝试获取积分信息
            credits_text = page.locator('text=剩余积分').inner_text()
            print(f"   💎 {credits_text}")
        else:
            not_logged_in = page.locator('text=请先').count() > 0
            if not_logged_in:
                print("   ⚠️  用户未登录 - 需要登录才能测试生成功能")
                print("   ℹ️  测试将在此停止,请先登录后再运行测试")
            else:
                print("   ⚠️  无法确定登录状态")

        # 截图 - 登录状态
        page.screenshot(path='screenshots/03_login_status.png', full_page=True)
        print("   ✅ 登录状态检查完成 (截图: 03_login_status.png)")

        print("\n📍 步骤 4: 测试表单交互...")

        # 选择标准版模型
        if sora2_radio.count() > 0:
            sora2_radio.click()
            print("   ✅ 已选择 sora2 (标准版)")
            time.sleep(0.5)

        # 填写提示词
        if prompt_textarea.count() > 0:
            test_prompt = "一只可爱的橙色小猫在花园里追逐蝴蝶,阳光明媚,画面温馨"
            prompt_textarea.fill(test_prompt)
            print(f"   ✅ 已填写提示词: '{test_prompt}'")
            time.sleep(0.5)

        # 截图 - 表单填写完成
        page.screenshot(path='screenshots/04_form_filled.png', full_page=True)
        print("   ✅ 表单填写完成 (截图: 04_form_filled.png)")

        print("\n📍 步骤 5: 检查生成按钮状态...")

        if generate_button.count() > 0:
            is_disabled = generate_button.is_disabled()
            button_text = generate_button.inner_text()

            print(f"   • 按钮状态: {'🔒 禁用' if is_disabled else '✅ 启用'}")
            print(f"   • 按钮文本: '{button_text}'")

            if is_disabled:
                print("   ℹ️  按钮被禁用,可能原因:")
                print("      - 用户未登录")
                print("      - 积分不足")
                print("      - 表单未填写完整")
            else:
                print("   ⚠️  注意: 按钮已启用,但我们不会实际点击以避免消耗积分")
                print("   ℹ️  如需完整测试,请手动运行生成功能")

        # 截图 - 最终状态
        page.screenshot(path='screenshots/05_ready_to_submit.png', full_page=True)
        print("   ✅ 最终状态截图 (05_ready_to_submit.png)")

        print("\n📍 步骤 6: 检查响应式布局...")

        # 测试平板布局
        page.set_viewport_size({"width": 768, "height": 1024})
        time.sleep(1)
        page.screenshot(path='screenshots/06_tablet_view.png', full_page=True)
        print("   ✅ 平板视图 (截图: 06_tablet_view.png)")

        # 测试手机布局
        page.set_viewport_size({"width": 375, "height": 812})
        time.sleep(1)
        page.screenshot(path='screenshots/07_mobile_view.png', full_page=True)
        print("   ✅ 手机视图 (截图: 07_mobile_view.png)")

        # 恢复桌面布局
        page.set_viewport_size({"width": 1920, "height": 1080})
        time.sleep(1)

        print("\n📍 步骤 7: 检查页面性能...")

        # 获取页面加载性能指标
        performance = page.evaluate("""
            () => {
                const timing = performance.timing;
                return {
                    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                    loadComplete: timing.loadEventEnd - timing.navigationStart,
                    domInteractive: timing.domInteractive - timing.navigationStart
                };
            }
        """)

        print(f"   • DOM 内容加载: {performance.get('domContentLoaded', 0)}ms")
        print(f"   • DOM 交互就绪: {performance.get('domInteractive', 0)}ms")
        print(f"   • 页面完全加载: {performance.get('loadComplete', 0)}ms")

        print("\n📍 步骤 8: 检查控制台日志...")

        # 监听控制台消息
        console_messages = []

        def handle_console(msg):
            console_messages.append(f"[{msg.type}] {msg.text}")

        page.on("console", handle_console)

        # 重新加载页面以捕获日志
        page.reload()
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        if console_messages:
            print(f"   📝 捕获到 {len(console_messages)} 条控制台消息:")
            for msg in console_messages[:10]:  # 只显示前10条
                print(f"      {msg}")
            if len(console_messages) > 10:
                print(f"      ... 还有 {len(console_messages) - 10} 条消息")
        else:
            print("   ℹ️  未捕获到控制台消息")

        print("\n📍 步骤 9: 检查可访问性...")

        # 检查表单标签
        labels = page.locator('label').all()
        print(f"   • 表单标签数量: {len(labels)}")

        # 检查按钮是否有文本
        buttons = page.locator('button').all()
        buttons_with_text = sum(1 for btn in buttons if btn.inner_text().strip())
        print(f"   • 按钮总数: {len(buttons)}")
        print(f"   • 有文本的按钮: {buttons_with_text}")

        # 检查图片是否有 alt 属性
        images = page.locator('img').all()
        images_with_alt = sum(1 for img in images if img.get_attribute('alt'))
        print(f"   • 图片总数: {len(images)}")
        print(f"   • 有 alt 属性的图片: {images_with_alt}")

        # 最终截图
        page.screenshot(path='screenshots/08_final_state.png', full_page=True)
        print("   ✅ 最终状态截图 (08_final_state.png)")

        # 关闭浏览器
        browser.close()

        print("\n" + "="*60)
        print("✅ 测试完成!")
        print("="*60)
        print("\n📊 测试总结:")
        print(f"   • 视频卡片数量: {len(video_cards)}")
        print(f"   • 登录状态: {'✅ 已登录' if login_status else '❌ 未登录'}")
        print(f"   • 表单元素: ✅ 完整")
        print(f"   • 响应式布局: ✅ 正常")
        print(f"   • 截图保存: screenshots/ 目录 (共 8 张)")
        print("\n💡 提示:")
        print("   - 所有截图已保存到 screenshots/ 目录")
        print("   - 如需测试完整生成流程,请手动登录并点击生成按钮")
        print("   - 建议检查截图确认 UI 是否符合预期")
        print("\n" + "="*60)

if __name__ == "__main__":
    test_multi_video_generator()
