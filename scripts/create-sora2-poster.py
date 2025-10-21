#!/usr/bin/env python3
"""
Sora 2 Poster Generator
Following the "Digital Alchemy" design philosophy
"""

from PIL import Image, ImageDraw, ImageFont
import math

# Canvas dimensions (cinematic ratio: 3:4 portrait)
WIDTH = 1200
HEIGHT = 1600
DPI = 300

# Color palette (Digital Alchemy)
COLOR_DEEP_PURPLE = (102, 126, 234)  # #667eea
COLOR_VIOLET = (118, 75, 162)  # #764ba2
COLOR_PINK = (240, 147, 251)  # #f093fb
COLOR_ELECTRIC_BLUE = (106, 155, 204)  # #6a9bcc
COLOR_WHITE = (255, 255, 255)
COLOR_BLACK = (20, 20, 19)  # #141413
COLOR_LIGHT_BG = (250, 249, 245)  # #faf9f5

def create_gradient(draw, x1, y1, x2, y2, color1, color2):
    """Create a smooth gradient between two colors"""
    for y in range(y1, y2):
        ratio = (y - y1) / (y2 - y1)
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
        draw.rectangle([(x1, y), (x2, y+1)], fill=(r, g, b))

def draw_circle_outline(draw, center_x, center_y, radius, color, width=3):
    """Draw a perfect circle outline"""
    bbox = [center_x - radius, center_y - radius,
            center_x + radius, center_y + radius]
    draw.ellipse(bbox, outline=color, width=width)

def main():
    # Create canvas
    img = Image.new('RGB', (WIDTH, HEIGHT), COLOR_BLACK)
    draw = ImageDraw.Draw(img)

    # === BACKGROUND: Gradient (Digital Alchemy transformation) ===
    create_gradient(draw, 0, 0, WIDTH, HEIGHT,
                   COLOR_DEEP_PURPLE, COLOR_VIOLET)
    create_gradient(draw, 0, HEIGHT//2, WIDTH, HEIGHT,
                   COLOR_VIOLET, COLOR_PINK)

    # === SACRED VOID: Central breathing space ===
    # Large circle - geometric vessel
    center_x = WIDTH // 2
    center_y = HEIGHT // 2
    main_radius = 280

    # Draw concentric circles (precision and transformation)
    for i in range(3):
        radius = main_radius - (i * 40)
        alpha_overlay = Image.new('RGBA', (WIDTH, HEIGHT), (255, 255, 255, 0))
        alpha_draw = ImageDraw.Draw(alpha_overlay)
        draw_circle_outline(alpha_draw, center_x, center_y, radius,
                          (*COLOR_WHITE, 60 + i*30), width=2)
        img.paste(Image.alpha_composite(img.convert('RGBA'), alpha_overlay).convert('RGB'))

    # === MONOLITHIC TYPOGRAPHY: SORA 2 ===
    try:
        # Use system fonts
        font_title = ImageFont.truetype("arial.ttf", 180)
        font_subtitle = ImageFont.truetype("arial.ttf", 32)
        font_body = ImageFont.truetype("arial.ttf", 20)
        font_tiny = ImageFont.truetype("arial.ttf", 14)
    except:
        font_title = ImageFont.load_default()
        font_subtitle = ImageFont.load_default()
        font_body = ImageFont.load_default()
        font_tiny = ImageFont.load_default()

    # Main title - placed with precision
    title = "SORA 2"
    title_bbox = draw.textbbox((0, 0), title, font=font_title)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (WIDTH - title_width) // 2
    title_y = HEIGHT // 2 - 100

    # Draw title with subtle shadow for depth
    draw.text((title_x + 3, title_y + 3), title,
             fill=(*COLOR_BLACK, 80), font=font_title)
    draw.text((title_x, title_y), title,
             fill=COLOR_WHITE, font=font_title)

    # === GEOMETRIC ZONES: Information blocks ===
    # Top tagline - whispered annotation
    tagline = "AI VIDEO GENERATION"
    tagline_bbox = draw.textbbox((0, 0), tagline, font=font_subtitle)
    tagline_width = tagline_bbox[2] - tagline_bbox[0]
    tagline_x = (WIDTH - tagline_width) // 2
    draw.text((tagline_x, 120), tagline,
             fill=COLOR_WHITE, font=font_subtitle)

    # Bottom feature indicators - minimal text
    features = [
        "8K PHOTOREALISTIC",
        "CINEMATIC LIGHTING",
        "INSTANT PROCESSING",
        "WATERMARK REMOVAL"
    ]

    feature_y = HEIGHT - 280
    feature_spacing = 50

    for i, feature in enumerate(features):
        # Small rectangle accent
        rect_x = WIDTH // 2 - 180
        rect_y = feature_y + (i * feature_spacing)
        draw.rectangle(
            [rect_x, rect_y, rect_x + 6, rect_y + 20],
            fill=COLOR_WHITE
        )

        # Feature text - clinical annotation
        draw.text((rect_x + 20, rect_y), feature,
                 fill=COLOR_WHITE, font=font_body)

    # === FOOTER: Minimal branding ===
    footer_text = "REMOVEWM.COM"
    footer_bbox = draw.textbbox((0, 0), footer_text, font=font_body)
    footer_width = footer_bbox[2] - footer_bbox[0]
    draw.text(((WIDTH - footer_width) // 2, HEIGHT - 80),
             footer_text, fill=COLOR_WHITE, font=font_body)

    # Subtitle - essence captured
    essence = "Transform words into cinematic reality"
    essence_bbox = draw.textbbox((0, 0), essence, font=font_tiny)
    essence_width = essence_bbox[2] - essence_bbox[0]
    draw.text(((WIDTH - essence_width) // 2, HEIGHT - 50),
             essence, fill=(*COLOR_WHITE, 180), font=font_tiny)

    # === SUBTLE MARKERS: Visual system ===
    # Corner marks - suggesting systematic documentation
    marker_length = 30
    marker_offset = 40
    marker_color = (*COLOR_WHITE, 100)

    # Top-left
    draw.line([(marker_offset, marker_offset),
              (marker_offset + marker_length, marker_offset)],
             fill=marker_color, width=1)
    draw.line([(marker_offset, marker_offset),
              (marker_offset, marker_offset + marker_length)],
             fill=marker_color, width=1)

    # Top-right
    draw.line([(WIDTH - marker_offset, marker_offset),
              (WIDTH - marker_offset - marker_length, marker_offset)],
             fill=marker_color, width=1)
    draw.line([(WIDTH - marker_offset, marker_offset),
              (WIDTH - marker_offset, marker_offset + marker_length)],
             fill=marker_color, width=1)

    # Save as high-quality PNG
    output_path = '../public/sora2-poster-canvas.png'
    img.save(output_path, 'PNG', dpi=(DPI, DPI), quality=100)
    print(f"✓ Poster created: {output_path}")
    print(f"  Dimensions: {WIDTH}x{HEIGHT}px")
    print(f"  Philosophy: Digital Alchemy")
    print(f"  Quality: Museum-grade")

if __name__ == "__main__":
    main()
