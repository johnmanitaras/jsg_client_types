# Styling Rules & Guidelines

## Authoritative Documentation

The authoritative styling documentation is maintained in the wrapper repository:

**Location**: `C:\Users\mail\Desktop\jetsetgo\app\jsg_wrapper\docs\`

| Document | Purpose |
|----------|---------|
| `STYLE_GUIDE.md` | Complete visual and component standards |
| `CSS_NAMESPACING_FOR_CHILD_APPS.md` | PostCSS namespacing setup (required) |
| `CONTAINER_QUERY_RESPONSIVE_LAYOUT.md` | Responsive design for embedded apps |

**Always refer to these authoritative documents for the latest standards.**

---

## Local Files (Reference Only)

The files in this folder are **supplementary reference copies** that may become outdated. Always verify against the authoritative documentation above.

- `STYLE_GUIDE.md` - Local reference copy
- `DESIGN_SYSTEM_USAGE_RULES.md` - Local reference copy
- `css-compliance-guide.md` - Local compliance guide (if present)
- `css-pattern-examples.md` - Implementation examples (if present)
- `css-mapping.md` - Variable mapping reference (if present)

---

## Quick Reference

### CSS Variables

Use the CSS variables defined in the wrapper's design system:

```css
/* Colors */
var(--color-primary-600)
var(--color-text)
var(--color-text-secondary)
var(--color-background)
var(--color-border)

/* Spacing */
var(--spacing-2)
var(--spacing-4)
var(--spacing-6)

/* Components */
var(--height-button)
var(--radius-button)
```

### CSS Namespacing (Required)

All child apps must use PostCSS namespacing. See: `jsg_wrapper/docs/CSS_NAMESPACING_FOR_CHILD_APPS.md`

### Standard Component Classes

```html
<button class="btn-primary">Primary Button</button>
<button class="btn-secondary">Secondary Button</button>
<input class="input" placeholder="Input field" />
<div class="card">
  <div class="card-header">Header</div>
  <div class="card-body">Content</div>
</div>
```

---

**Last Updated**: Documentation now references authoritative sources in jsg_wrapper/docs/
