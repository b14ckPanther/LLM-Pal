# LLMPal UI System

## Design Principles
- **Minimal, not empty**: remove visual noise while preserving depth and affordances.
- **Premium feel**: refined contrast, layered surfaces, subtle gradients, polished spacing.
- **Smooth by default**: motion should communicate state changes, never distract.
- **Intentional hierarchy**: every element has clear purpose and rank.
- **Non-template aesthetic**: customized primitives, signature spacing, and bespoke interaction details.

## Visual Direction
- Dark-first interface with deep neutral canvases (not pure black).
- Soft futuristic accents (purple-blue family) with restrained glow.
- Glassmorphism used only for overlays and elevated cards.
- Surfaces stack in clear layers to increase depth and orientation.

## Color Palette
- **Background Base**: `#0B1020`
- **Background Elevated**: `#111831`
- **Surface Glass**: `rgba(27, 38, 72, 0.55)`
- **Primary Accent**: `#7C8CFF`
- **Secondary Accent**: `#4DE2C5`
- **Text Primary**: `#E8ECFF`
- **Text Secondary**: `#A8B2D8`
- **Border Subtle**: `rgba(168, 178, 216, 0.18)`
- **Danger**: `#FF6B8A`

## Typography Scale
- Language-specific font family:
  - English UI/chat mode: `Ubuntu` (Dalton Maag)
  - Arabic UI/chat mode: `Cairo`
  - Hebrew UI/chat mode: `Heebo`
- Font is driven by selected language mode, not script detection in individual messages.
- **Display**: 40/48, semibold
- **H1**: 32/40, semibold
- **H2**: 24/32, semibold
- **H3**: 20/28, medium
- **Body L**: 16/26, regular
- **Body M**: 14/22, regular
- **Body S**: 13/20, regular
- **Caption**: 12/16, medium

## Spacing System
- Base step: 4px
- Preferred rhythm: 8, 12, 16, 24, 32, 40, 56
- Core rules:
  - 16px minimum breathing room around interactive controls
  - 24px+ between major layout blocks
  - Keep dense data views aligned to 8px rhythm

## Radius + Depth
- Radius tokens: 10, 14, 18, 24
- Shadow style:
  - soft ambient shadows with low opacity
  - avoid hard drop-shadows
- Border strategy:
  - thin, tinted borders to define surfaces in dark UI

## Motion Guidelines
- **Micro interactions**: 120-180ms, ease-out
- **Panel/page transitions**: 220-320ms, cubic-bezier(0.22, 1, 0.36, 1)
- **Message enter transitions**: 180-240ms, opacity + Y translation
- **Hover feedback**: slight scale (1.01-1.02) + opacity or glow shift
- **Focus states**: animated ring/border transition for input clarity

## Component Philosophy
- Use shadcn primitives as foundations, then fully restyle with LLMPal tokens.
- Buttons and inputs should feel tactile and alive with subtle motion.
- Chat bubbles are content-first: clear text hierarchy, balanced padding, rich but restrained surfaces.
- Sidebars/panels should feel integrated, not boxed template widgets.
- Skeleton placeholders mirror real layout to reduce perceived latency.

## Interaction Heuristics
- Prefer progressive disclosure (show secondary actions on hover/focus).
- Keep primary user actions one-click away.
- Avoid modal overload; use inline affordances where possible.
- Ensure keyboard-first navigation for power users (command palette, shortcuts).
