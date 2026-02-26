# Modern Dashboard - Component Structure

```
ModernDashboard (Main Page)
│
├── ModernNavbar
│   ├── Logo & Brand
│   ├── User Profile Section
│   │   ├── Avatar
│   │   ├── Name & Email
│   │   └── Logout Button
│   └── Mobile Menu Toggle
│
├── HeroSection
│   ├── Gradient Background
│   ├── Welcome Message
│   ├── CTA Buttons
│   │   ├── "Talk to AI Assistant"
│   │   └── "Explore Schemes"
│   └── Stats Cards (3)
│       ├── Schemes Available
│       ├── 24/7 Support
│       └── Active Citizens
│
├── AIAssistant
│   ├── Header (Icon + Title)
│   ├── Input Section
│   │   ├── Text Input Box
│   │   ├── 🎤 Voice Button
│   │   ├── 📷 Image Upload
│   │   └── ✈️ Send Button
│   ├── Quick Prompts Grid (4 items)
│   │   ├── 📋 File a complaint
│   │   ├── 🔍 Find schemes for me
│   │   ├── 📊 Track my application
│   │   └── 💳 Check eligibility
│   └── Listening Indicator (when voice active)
│
├── QuickServices
│   ├── Title & Description
│   └── Service Cards Grid (5 columns, responsive)
│       ├── Health Card
│       │   ├── Icon (Heart)
│       │   ├── Title & Description
│       │   └── Gradient Background
│       ├── Emergency Card
│       ├── Travel Card
│       ├── Utility Card
│       └── Agriculture Card
│
├── PersonalizedInsights
│   ├── Title & Description
│   └── Insights Grid (2 columns)
│       ├── Eligible Schemes Card
│       │   ├── Icon
│       │   ├── Title
│       │   └── Scheme List (2-3 items)
│       ├── Your Complaints Card
│       │   ├── Resolved Count
│       │   └── Pending Count
│       ├── Nearby Issues Card
│       │   └── Issue List (2-3 items)
│       └── Recent Activity Card
│       │   └── Activity Count
│   └── CTA Section
│       ├── "Need Help?" Heading
│       └── "Chat with AI" Button
│
├── ComplaintWidget
│   ├── Alert Section
│   │   ├── Icon & Title
│   │   ├── Description
│   │   └── Report Button
│   └── Expanded Form (conditional)
│       ├── Issue Type Dropdown
│       ├── Description TextArea
│       ├── Photo Upload Area
│       └── Action Buttons
│           ├── Submit
│           └── Cancel
│
├── Footer
│   ├── Main Content Grid (4 columns)
│   │   ├── About Section
│   │   ├── Quick Links
│   │   ├── Policies
│   │   └── Contact Info
│   ├── Divider
│   └── Bottom Section
│       ├── Copyright
│       └── Social Links
│
└── Toast Notification (floating)
    ├── Status Indicator
    └── Message Text
```

## File Structure

```
frontend/src/
│
├── components/
│   ├── ModernNavbar.js
│   ├── HeroSection.js
│   ├── AIAssistant.js
│   ├── QuickServices.js
│   ├── PersonalizedInsights.js
│   ├── ComplaintWidget.js
│   └── Footer.js
│
├── pages/
│   └── ModernDashboard.js
│
├── context/
│   └── AuthContext.js (existing)
│
├── utils/
│   └── api.js (existing)
│
├── App.js (updated with route)
├── index.js (existing)
├── index.css (updated with Tailwind)
│
├── tailwind.config.js (new)
├── postcss.config.js (new)
│
└── public/
    └── index.html (existing)

Root Files:
├── package.json (updated)
├── MODERN_DASHBOARD_DOCUMENTATION.md (new)
└── MODERN_DASHBOARD_QUICKSTART.md (new)
```

## Component Dependencies

```
ModernDashboard
    ├── uses: AuthContext
    ├── imports: ModernNavbar
    ├── imports: HeroSection
    ├── imports: AIAssistant
    ├── imports: QuickServices
    ├── imports: PersonalizedInsights
    ├── imports: ComplaintWidget
    ├── imports: Footer
    └── imports: api (from ../utils/api)

ModernNavbar
    └── uses: AuthContext

HeroSection
    └── uses: AuthContext

Lucide Icons (used in multiple components):
    ├── LogOut (ModernNavbar)
    ├── Menu, X (ModernNavbar mobile)
    ├── MessageCircle (HeroSection, AIAssistant)
    ├── Lightbulb (HeroSection)
    ├── Mic (AIAssistant)
    ├── Upload (AIAssistant)
    ├── Send (AIAssistant)
    ├── Heart, AlertCircle, Plane, Zap, Sprout (QuickServices)
    ├── TrendingUp, MapPin, Clock (PersonalizedInsights)
    ├── ChevronRight (PersonalizedInsights)
    ├── AlertTriangle, FileText, Camera, MessageSquare (ComplaintWidget)
    ├── Mail, Phone, MapPin, Heart (Footer)
    └── Others for SVG icons
```

## State Management

```
ModernDashboard (parent)
    ├── State: loading
    ├── State: chatMessages []
    ├── State: toastMessage
    │
    ├── Handler: handleAIChat
    ├── Handler: handleServiceClick
    ├── Handler: handleViewMore
    ├── Handler: handleReportIssue
    ├── Handler: handleExploreSchemes
    └── Helper: showToast
```

## Props Flow

```
ModernDashboard
    ├─ HeroSection (props)
    │   ├── onAIChat: function
    │   └── onExploreSchemes: function
    │
    ├─ AIAssistant (props)
    │   └── onSendMessage: function
    │
    ├─ QuickServices (props)
    │   └── onServiceClick: function
    │
    ├─ PersonalizedInsights (props)
    │   └── onViewMore: function
    │
    └─ ComplaintWidget (props)
        └── onReportIssue: function
```

## Styling Hierarchy

```
Global Styles (index.css)
    ├── Tailwind Base Styles
    ├── Tailwind Components
    ├── Tailwind Utilities
    └── Custom CSS

Component Styles (Tailwind classes)
    ├── Layout Classes
    ├── Color Classes
    ├── Animation Classes
    ├── Responsive Classes
    └── State Classes (hover, focus, active)

Custom Tailwind Config (tailwind.config.js)
    ├── Color Theme
    ├── Custom Animations
    ├── Box Shadows
    └── Responsive Breakpoints
```

## Responsive Breakpoints

```
Mobile First Approach:
    Base (0px)      → Mobile phones (<640px)
    sm (640px)      → Large phones/small tablets
    md (768px)      → Tablets
    lg (1024px)     → Desktops
    xl (1280px)     → Wide desktops
    2xl (1536px)    → Ultra-wide displays

Example: grid-cols-1 sm:grid-cols-2 lg:grid-cols-5
    → 1 column on mobile
    → 2 columns on tablets
    → 5 columns on desktops
```

## Authentication Flow

```
User Not Logged In
    ↓
PrivateRoute Check
    ↓
Redirect to /login
    ↓
Login Form
    ↓
Set AuthContext
    ↓
Access /modern-dashboard
    ↓
ModernDashboard Renders
```

## Data Integration Points (Ready for Backend)

```
ModernDashboard
    ├── fetchDashboardData()
    │   ├── GET /api/schemes/eligible/me
    │   ├── GET /api/complaints/my-complaints
    │   ├── GET /api/applications/nearby
    │   └── GET /api/applications/my-activity
    │
    ├── handleAIChat(message)
    │   └── POST /api/ai/chat (with message)
    │
    ├── handleReportIssue(issueData)
    │   └── POST /api/complaints/create (with issue data)
    │
    └── handleServiceClick(service)
        └── GET /api/services/{service.id}/details
```

## Animation Classes

```
Fade In
    .animate-fade-in
    Duration: 0.5s
    Easing: ease-in-out

Slide Up
    .animate-slide-up
    Duration: 0.5s
    Easing: ease-out
    Transform: translateY(10px) → Y(0)

Bounce Slow
    .animate-bounce-slow
    Duration: 3s
    Infinite loop

Hover Effects
    - scale-105 (on hover)
    - shadow-medium (on hover)
    - text-color-600 (on hover)
    - bg-color-100 (on hover)

Transitions
    - duration-200 (fast)
    - duration-300 (medium)
    - all (all properties)
```

## Accessibility Features

```
Semantic HTML
    ├── <nav> for navigation
    ├── <button> for buttons
    ├── <input> for inputs
    ├── <footer> for footer
    └── <h1>, <h2>... for headings

ARIA Labels
    ├── aria-label on buttons
    ├── role attributes where needed
    └── alt text on images

Keyboard Navigation
    ├── Tab through elements
    ├── Enter to activate buttons
    ├── Esc to close modals
    └── Arrow keys in menus

Focus States
    ├── outline on focus
    ├── ring-2 focus style
    └── :focus-visible selectors

Color Contrast
    ├── Text min 4.5:1 ratio
    ├── Large text 3:1 ratio
    └── Icons meet WCAG AA
```

## Performance Considerations

```
Code Splitting
    ├── Route-based splitting (ready)
    ├── Component lazy loading (ready)
    └── Icon library (optimized)

Asset Optimization
    ├── Lucide icons (SVG, lightweight)
    ├── No image loading (ready for CDN)
    └── Minified Tailwind CSS

Render Optimization
    ├── useContext for state
    ├── No unnecessary re-renders
    ├── Memoization ready
    └── React.lazy ready

Bundle Size
    ├── Tailwind: ~50KB (minified)
    ├── Lucide: ~5KB per icon
    ├── React: ~42KB
    └── Total: ~100KB+ (optimized)
```

---

This document provides a complete visual and structural overview of the Modern Dashboard component architecture. Use it as reference for understanding data flow, component relationships, and styling organization.
