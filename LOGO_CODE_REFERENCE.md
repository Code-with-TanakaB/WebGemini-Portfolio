# WebGemini Professional Logo - Code Reference

## Quick Copy-Paste References

### Logo Mark (Professional - Compact)
Use this for icons, buttons, and navigation:

```html
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="w-10 h-10">
    <defs>
        <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0066FF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00FFFF;stop-opacity:1" />
        </linearGradient>
    </defs>
    <!-- Central Hub -->
    <circle cx="100" cy="100" r="12" fill="url(#gradient-primary)"/>
    
    <!-- Connection Points -->
    <circle cx="100" cy="60" r="8" fill="url(#gradient-primary)"/>
    <circle cx="100" cy="140" r="8" fill="url(#gradient-primary)"/>
    <circle cx="65" cy="100" r="8" fill="url(#gradient-primary)"/>
    <circle cx="135" cy="100" r="8" fill="url(#gradient-primary)"/>
    
    <!-- Connection Lines -->
    <line x1="100" y1="100" x2="100" y2="60" stroke="url(#gradient-primary)" stroke-width="2" opacity="0.8"/>
    <line x1="100" y1="100" x2="100" y2="140" stroke="url(#gradient-primary)" stroke-width="2" opacity="0.8"/>
    <line x1="100" y1="100" x2="65" y2="100" stroke="url(#gradient-primary)" stroke-width="2" opacity="0.8"/>
    <line x1="100" y1="100" x2="135" y2="100" stroke="url(#gradient-primary)" stroke-width="2" opacity="0.8"/>
</svg>
```

---

## Integration Examples

### 1. Navigation Logo
```html
<a href="/" class="flex items-center space-x-2">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="w-10 h-10">
        <!-- Logo SVG here -->
    </svg>
    <span class="text-xl font-bold">WEBGEMINI</span>
</a>
```

### 2. Favicon
```html
<link rel="icon" type="image/svg+xml" href="image/favicon.svg">
<link rel="apple-touch-icon" href="image/logo-professional.svg">
```

### 3. Footer Logo
```html
<div class="flex items-center space-x-2">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8">
        <!-- Logo SVG here -->
    </svg>
    <span class="font-bold">WEBGEMINI</span>
</div>
```

### 4. Email Signature
```html
<table>
    <tr>
        <td>
            <img src="logo-horizontal.svg" alt="WebGemini" width="200" height="50">
        </td>
    </tr>
    <tr>
        <td>Contact info here...</td>
    </tr>
</table>
```

---

## CSS Classes for Logo

```css
/* Logo Text */
.logo-text {
    font-family: 'Plus Jakarta Sans', monospace;
    font-weight: 700;
    letter-spacing: 0.05em;
    background: linear-gradient(135deg, #0066FF 0%, #00FFFF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Logo Container */
.logo-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Logo SVG Sizing */
.logo-sm { width: 32px; height: 32px; } /* Small - Favicon */
.logo-md { width: 64px; height: 64px; } /* Medium - Nav */
.logo-lg { width: 128px; height: 128px; } /* Large - Banner */
.logo-xl { width: 256px; height: 256px; } /* Extra Large - Print */
```

---

## Tailwind CSS Integration

```html
<!-- Logo with Tailwind -->
<a href="/" class="flex items-center gap-2">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="w-10 h-10">
        <!-- Logo SVG -->
    </svg>
    <span class="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
        WEBGEMINI
    </span>
</a>
```

---

## Color Values Reference

```javascript
// JavaScript Color Constants
const WebGeminiColors = {
    primary: '#0066FF',      // Blue
    secondary: '#00FFFF',    // Cyan
    dark: '#0A0E27',         // Dark Navy
    accent: '#00FFFF'        // Cyan (same as secondary)
};

// CSS Variables
:root {
    --webgemini-primary: #0066FF;
    --webgemini-secondary: #00FFFF;
    --webgemini-dark: #0A0E27;
    --webgemini-accent: #00FFFF;
}

// Tailwind Config Extension
theme: {
    extend: {
        colors: {
            webgemini: {
                primary: '#0066FF',
                secondary: '#00FFFF',
                dark: '#0A0E27',
                accent: '#00FFFF'
            }
        }
    }
}
```

---

## Responsive Logo Component

```html
<!-- Responsive Logo -->
<div class="flex items-center">
    <!-- SVG Logo (scales with screen) -->
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" 
         class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
        <!-- Logo SVG -->
    </svg>
    
    <!-- Text (hidden on mobile, shown on desktop) -->
    <span class="hidden sm:inline text-lg md:text-xl font-bold ml-2">
        WEBGEMINI
    </span>
</div>
```

---

## Animation Examples

### Hover Effect
```css
.logo-svg {
    transition: transform 0.3s ease;
}

.logo-svg:hover {
    transform: scale(1.1);
}
```

### Floating Animation
```css
.logo-float {
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
}
```

### Gradient Animation
```css
.logo-gradient-animate {
    background: linear-gradient(-45deg, #0066FF, #00FFFF, #0066FF);
    background-size: 300% 300%;
    animation: gradient-shift 8s ease infinite;
}

@keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
```

---

## Export Instructions

### Export to PNG
```bash
# Using ImageMagick
convert -background none -size 500x500 image/logo-professional.svg logo.png

# Using Inkscape
inkscape -o logo.png -w 500 -h 500 image/logo-professional.svg
```

### Export to PDF
```bash
# Using Inkscape
inkscape -o logo.pdf image/logo-professional.svg
```

### Export to ICO (Favicon)
```bash
# First convert SVG to PNG, then PNG to ICO
convert -background none image/favicon.svg -define icon:auto-resize=256,128,96,64,48,32,16 favicon.ico
```

---

## Browser Compatibility

| Browser | SVG Support | Gradient Support | Status |
|---------|-------------|------------------|--------|
| Chrome | ✅ | ✅ | Full Support |
| Firefox | ✅ | ✅ | Full Support |
| Safari | ✅ | ✅ | Full Support |
| Edge | ✅ | ✅ | Full Support |
| IE 11 | ⚠️ | ⚠️ | Limited |
| Mobile Safari | ✅ | ✅ | Full Support |
| Android Chrome | ✅ | ✅ | Full Support |

---

## File Usage Summary

| File | Size | Format | Best For |
|------|------|--------|----------|
| logo-professional.svg | 3.6 KB | SVG | Primary logo, all uses |
| logo-horizontal.svg | 2.1 KB | SVG | Headers, business cards |
| favicon.svg | 1.2 KB | SVG | Browser icons |

---

## Tips & Best Practices

1. **Always use SVG** - Scalable and lightweight
2. **Maintain aspect ratio** - Keep proportions when resizing
3. **Include clear space** - Leave padding around logo
4. **Test on all backgrounds** - Works on white, dark, and gradient
5. **Use original colors** - Maintain brand consistency
6. **Optimize gradients** - Already optimized in provided files
7. **Cache SVG files** - Good for performance
8. **Use semantic HTML** - `<img>` or `<svg>` tags appropriately

---

**Last Updated**: December 7, 2025  
**Version**: 1.0
