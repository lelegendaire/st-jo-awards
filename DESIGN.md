# Design

## Theme

Dark luxury stage lighting. The physical scene: a dimly lit auditorium during an awards ceremony, golden spotlights cutting through darkness, the audience holding phones illuminated by the screen. The interface is the digital extension of that stage.

## Color Strategy

Drenched — the surface IS the darkness. Deep black (#0A0A0A) as the canvas, gold (#D4AF37) as the primary accent, bright gold (#FFD700) for moments of emphasis (active states, celebrations). Gold carries 30-60% of visual weight on interactive surfaces.

### Palette

| Role | Value | Usage |
|------|-------|-------|
| Stage (bg) | #0A0A0A | All surfaces |
| Spotlight (primary) | #D4AF37 | Borders, icons, secondary text |
| Center stage (accent) | #FFD700 | Active states, CTAs, celebrations |
| Backstage (surface) | #141414 | Cards, elevated surfaces |
| Wings (muted) | #1A1A1A | Subtle dividers, inactive states |
| Dim light (text-secondary) | #A0A0A0 | Supporting text |
| Spotlight glow | rgba(212, 175, 55, 0.15) | Hover backgrounds, soft glows |
| Center glow | rgba(255, 215, 0, 0.25) | Active states, particle effects |

## Typography

Scale driven by ceremony hierarchy. Titles are commanding, body text is readable in low light.

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Hero | 3.5rem+ | 800 | "SAINT-JO AWARDS" title |
| H1 | 2rem | 700 | Section titles |
| H2 | 1.5rem | 600 | Question text |
| Body | 1rem | 400 | Supporting text |
| Small | 0.875rem | 500 | Labels, captions |

Font: System fonts preferred (Inter-like). No decorative fonts that compromise readability on mobile.

## Components

### Spotlight Button
- Gold border (1-2px), transparent background
- On hover: gold glow + slight background fill
- On active: filled gold, black text
- Large touch targets (min 48px height)

### Progress Ring
- Circular or arc-based progress indicator
- Gold stroke on dark track
- Subtle glow on the active segment
- Not a linear bar — too corporate

### Answer Card
- Dark surface (#141414) with gold border
- Hover: border brightens, subtle glow
- Selected: filled gold, text turns black
- Smooth transition between states

### Celebration Overlay
- Full-screen dark overlay
- Gold particle burst effect
- "Your vote has been recorded" message
- Event branding visible

## Layout

Mobile-first, since users scan QR codes with phones. Full-bleed backgrounds, generous vertical spacing (like scrolling through a premium event app). No cards-within-cards. Each screen is a single focused moment.

## Motion

- Page transitions: fade + slight upward movement (200-300ms)
- Button press: scale down slightly + glow burst (150ms)
- Progress indicator: smooth stroke animation
- Celebration: particle burst expanding outward (500ms)
- All easing: ease-out-expo for premium feel
- Respect prefers-reduced-motion

## Spacing

Vertical rhythm based on 8px grid but varied for dramatic effect:
- Between sections: 48-64px
- Within sections: 24-32px
- Touch target padding: 16px minimum
