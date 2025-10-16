from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    # 创建图像
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)

    # 绘制渐变背景（紫色）
    for y in range(size):
        # 从 #667eea 到 #764ba2 的渐变
        r = int(102 + (118 - 102) * y / size)
        g = int(126 + (75 - 126) * y / size)
        b = int(234 + (162 - 234) * y / size)
        draw.line([(0, y), (size, y)], fill=(r, g, b))

    # 绘制白色字母 S
    try:
        font_size = int(size * 0.6)
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()

    text = "S"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    position = ((size - text_width) // 2, (size - text_height) // 2 - size // 10)
    draw.text(position, text, fill='white', font=font)

    # 保存
    img.save(filename)
    print(f"✅ 已生成: {filename}")

# 生成 3 个尺寸的图标
create_icon(16, 'icon16.png')
create_icon(48, 'icon48.png')
create_icon(128, 'icon128.png')

print("\n🎉 所有图标生成完成！")
