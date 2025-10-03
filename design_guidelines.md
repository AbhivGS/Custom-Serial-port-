# Design Guidelines: Serial Port Data Visualization Dashboard

## Design Approach

**Selected System:** Material Design + Linear-inspired aesthetics for a professional, data-focused technical tool

**Key Principles:**
- Clarity over decoration: Information hierarchy is paramount
- Functional aesthetics: Every visual element serves usability
- Professional minimalism: Clean, focused interface for technical users
- Data-first design: Visualizations are the hero, UI recedes

---

## Color Palette

### Dark Mode (Primary Interface)
- **Background Layers:**
  - Base: 220 15% 8%
  - Elevated cards: 220 15% 12%
  - Interactive panels: 220 15% 16%
  - Borders/dividers: 220 12% 22%

- **Primary Brand:**
  - Main: 210 100% 58% (bright blue for active connections, primary actions)
  - Hover: 210 100% 65%
  - Disabled: 210 30% 35%

- **Accent Colors:**
  - Success (connected): 142 76% 45% (green)
  - Warning (pending): 38 92% 55% (amber)
  - Error (disconnected): 0 72% 55% (red)
  - Info: 199 89% 48% (cyan)

- **Text:**
  - Primary: 220 10% 95%
  - Secondary: 220 8% 70%
  - Tertiary: 220 6% 50%

### Data Visualization Palette
- Graph Lines: 210 100% 58%, 142 76% 45%, 38 92% 55%, 280 85% 60%, 16 100% 60%
- Chart gradients use 20% opacity overlays

---

## Typography

**Font Stack:** Inter (primary), SF Mono (monospace for data)

### Hierarchy:
- **H1 (Page titles):** 32px, semibold, tracking tight
- **H2 (Section headers):** 24px, semibold
- **H3 (Card headers):** 18px, medium
- **Body:** 14px, regular, line-height 1.5
- **Small/Labels:** 12px, medium, uppercase tracking wide
- **Monospace (Data values):** SF Mono 16px for numeric displays

---

## Layout System

**Spacing Units:** Tailwind utilities - primarily 2, 4, 6, 8, 12, 16, 24 (as in p-4, gap-6, m-8)

**Grid Structure:**
- Sidebar: Fixed 280px width with serial controls and config
- Main dashboard: Fluid grid using CSS Grid (grid-cols-1 md:grid-cols-2 xl:grid-cols-3)
- Max container width: Full viewport with 24px padding

---

## Component Library

### 1. Authentication
**Login Page:**
- Centered card (max-w-md) on gradient background (220 15% 6% to 220 15% 10%)
- Logo/title at top
- Input fields with floating labels, focus ring in primary blue
- Single prominent "Sign In" button
- Subtle "Remember me" checkbox
- Clean, minimal - no hero image needed

### 2. Navigation & Header
**Top Bar (h-16):**
- App title/logo left
- Connection status indicator center (pill badge: green=connected, red=disconnected)
- User menu, save/load config buttons right
- Subtle bottom border in 220 12% 22%

**Left Sidebar (fixed 280px):**
- Serial Port Configuration section with dropdown for COM ports
- Baud rate input with common presets (9600, 115200)
- Large connect/disconnect toggle button
- CSV column configuration expandable panel
- Command interface section with tabs

### 3. Dashboard Widgets

**Graph Cards:**
- White/elevated background with subtle shadow
- Header with CSV column name, mini controls (fullscreen, settings)
- Plotly.js charts with dark theme, grid lines at 220 12% 18%
- Responsive: full width on mobile, 2-col on tablet, 3-col on desktop
- Minimum height: 320px

**Gauge Components:**
- Circular progress gauges in card format (280px × 280px)
- Large numeric value center in SF Mono
- Color-coded ranges (green safe, amber warning, red danger)
- Label below with CSV column name

**Numeric Displays:**
- Compact cards showing real-time values
- Large monospace numbers (32px)
- Small unit labels
- Sparkline micro-chart below showing recent trend (optional small line)
- Grid layout: 4 per row on desktop, 2 on tablet, 1 on mobile

### 4. Dashboard Builder Interface
**Customization Panel (Right drawer, 360px):**
- Drag handle visualization showing available CSV columns
- Drop zones for graph/gauge/numeric assignments
- Visual preview thumbnails
- "Add Widget" button with type selector
- Clear remove/edit controls per widget

### 5. Serial Command Interface
**Command Panel (Bottom drawer or sidebar tab):**
- Text input with send button
- Predefined command buttons in grid (3-4 cols), secondary button style
- Sliders with value labels and live preview
- Command history list (monospace, scrollable, max 100 entries)

### 6. Configuration Management
**Save/Load Modal:**
- Two-column layout: left shows current config preview, right has actions
- "Export Config" button downloads JSON
- "Import Config" with file drag-drop zone
- Named config slots for quick switching (list of saved configs)

---

## Data Visualization Standards

**Chart Styling:**
- Background: transparent
- Grid lines: 220 12% 18%
- Axis labels: 220 8% 70%, 12px
- Legend: Top-right, horizontal, small font
- Tooltips: Dark background with sharp corners, white text
- Line thickness: 2px, smooth curves

**Gauges:**
- Arc range: 220° (starting from bottom left)
- Needle: Thin, sharp pointer
- Value ranges with gradient fills
- Tick marks every 10% with labels

---

## Interactions & States

**Buttons:**
- Primary: Filled primary blue with white text
- Secondary: Outline with border in 220 12% 22%
- Hover: Slight brightness increase, subtle scale (1.02)
- Active state: Slight scale down (0.98)
- Disabled: 50% opacity, no interaction

**Form Inputs:**
- Height: 40px (h-10)
- Border: 1px in 220 12% 22%, focus ring in primary blue
- Dark background: 220 15% 12%
- Placeholder: 220 6% 50%

**Cards:**
- Border radius: 8px (rounded-lg)
- Shadow: Subtle elevation (0 2px 8px rgba(0,0,0,0.3))
- Hover: Slight shadow increase for interactive cards

**Status Indicators:**
- Connected: Pulsing green dot animation
- Disconnected: Static red dot
- Receiving Data: Blue dot with subtle pulse

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px - Single column, stacked layout, sidebar becomes drawer
- Tablet: 768-1024px - 2-column grid, compact sidebar
- Desktop: > 1024px - Full 3-column grid, persistent sidebar

**Mobile Optimizations:**
- Bottom navigation for key actions
- Collapsible sections for all config panels
- Fullscreen mode for active graphs
- Swipe gestures for widget navigation

---

## Performance & Loading States

**Loading Indicators:**
- Skeleton screens for graph placeholders (pulsing gradient)
- Spinner for connection attempts (blue circular)
- Shimmer effect for incoming data cells

**Empty States:**
- Centered icon + message + action button
- "No data yet" for graphs with helpful hint
- "Select COM port" prompt in disconnected state

---

## Images

No hero images or marketing visuals needed. This is a pure utility application. All imagery is functional:
- Icon library: Heroicons for UI controls
- Status icons: Custom connection/data flow indicators
- Gauge visualizations: Generated by react-gauge-chart
- Graphs: Rendered by Plotly.js

The interface should feel like Linear meets a professional oscilloscope - clean, data-dense, and highly functional with just enough visual polish to feel modern and professional.