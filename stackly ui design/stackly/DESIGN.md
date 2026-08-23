---
name: Stackly
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#c3c6d6'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#8d909f'
  outline-variant: '#434653'
  surface-tint: '#b2c5ff'
  primary: '#b2c5ff'
  on-primary: '#002c72'
  primary-container: '#5b8cff'
  on-primary-container: '#002665'
  inverse-primary: '#1857c8'
  secondary: '#4de082'
  on-secondary: '#003919'
  secondary-container: '#00b55d'
  on-secondary-container: '#003e1c'
  tertiary: '#ffb3b0'
  on-tertiary: '#670211'
  tertiary-container: '#ea6767'
  on-tertiary-container: '#5c000d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001847'
  on-primary-fixed-variant: '#0040a0'
  secondary-fixed: '#6dfe9c'
  secondary-fixed-dim: '#4de082'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005227'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#ffb3b0'
  on-tertiary-fixed: '#410006'
  on-tertiary-fixed-variant: '#881d24'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  numeral-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 1.25rem
  stack-gap: 1rem
  section-gap: 2rem
  card-inner-padding: 1rem
  grid-gutter: 1rem
---

## Brand & Style
The design system for this personal finance app is built on a foundation of **Calm Minimalism** and **Modern Corporate** aesthetics. It prioritizes clarity and financial confidence, moving away from the aggressive "trading" vibe of legacy fintech toward a sophisticated, data-driven personal companion. 

The interface leverages a card-based architecture to modularize complex financial data, making it digestible on mobile screens. The style is defined by deep, monochromatic surfaces paired with high-clarity accents, evoking a sense of stability and professional-grade security. Use whitespace (or "dark space") generously to reduce cognitive load during high-stakes financial tracking.

## Colors
The palette uses a high-contrast dark theme to ensure legibility and focus. 
- **Primary Blue (#5B8CFF):** Used for interactive elements, progress bars, and primary CTAs. It represents trust and action.
- **Income Green (#4ADE80):** Specifically reserved for positive cash flow, savings goals, and upward trends.
- **Expense Coral (#F87171):** Used for spending alerts, negative trends, and critical debt indicators.
- **Neutrals:** The background utilizes a deep navy (#0B0F19) to provide a rich canvas, while the container navy (#161B26) creates a subtle physical separation for cards and inputs. Text employs pure white for headers and a soft grey-blue for secondary metadata.

## Typography
This design system utilizes **Inter** for its systematic, utilitarian, and highly legible characteristics. Given the finance context, typography is treated with a hierarchy that emphasizes numerical data.

- **Numerals:** For account balances, use `numeral-xl` with tight tracking.
- **Hierarchy:** Use `label-md` in all-caps with increased letter spacing for small category headers (e.g., "RECENT TRANSACTIONS").
- **Scale:** On mobile, `display` type should be used sparingly, reserved for the primary wallet balance only.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for mobile-first interaction. 
- **Margins:** A consistent 20px (1.25rem) side margin is maintained across all screens.
- **Rhythm:** An 8px base unit drives all spacing. Components are stacked with a 16px (1rem) gap.
- **Card Strategy:** Use full-width cards for primary data visualization (charts) and split-width (2-column) cards for secondary metrics like "Monthly Limit" or "Days Left."

## Elevation & Depth
In this dark-themed environment, depth is communicated through **Tonal Layers** rather than heavy shadows. 
- **Level 0:** Base background (#0B0F19).
- **Level 1:** Card containers (#161B26). 
- **Level 2:** Active states or overlays (#232936).
- **Shadows:** Use a single, highly diffused "Ambient Glow" for the primary action button (FAB). Avoid shadows on standard cards to maintain the clean, minimal aesthetic; use the color contrast between levels 0 and 1 to define the edges.

## Shapes
The shape language is defined by **Soft Geometric** forms. 
- **Cards & Containers:** Use a 16px (`rounded-lg`) corner radius to evoke a modern, friendly feel that balances the "serious" dark theme.
- **Buttons:** Use 12px corner radius for standard buttons and full-round (pill) for status chips.
- **Inputs:** Match the card radius (16px) to maintain visual consistency in forms.

## Components
- **Buttons:** The primary CTA is solid blue (#5B8CFF) with white text. Secondary buttons should use a ghost style with a 1px border of the primary color.
- **Financial Cards:** These are the core atoms. Every card must have a 16px radius, a background of #161B26, and internal padding of 16px. Use thin vertical progress bars within cards to show budget depletion.
- **Transaction Lists:** Use a clean list view with no dividers. Separate entries using the `stack-gap` (16px). Left-align the merchant name and category; right-align the amount and date.
- **Input Fields:** Use a filled style (#161B26) with no border. On focus, add a 1px solid border of the primary blue. 
- **Status Chips:** Small, pill-shaped indicators for categories (e.g., "Food", "Rent"). Use low-opacity versions of the green/red/blue colors for the chip background and full-opacity for the text/icon within.
- **Charts:** Use smooth, curved Sparklines with a gradient fill (10% opacity) beneath the line to show trends without cluttering the UI.