# Moka Express 3D — Bialetti Lab Tribute

An immersive, premium 3D interactive landing page showcasing the engineering, history, and physics of the iconic 1933 Italian Moka Express coffee maker. Developed as a high-fidelity interactive portfolio showcase.

🌐 **Live Portfolio:** [almonther.studio](https://almonther.studio/)

---

## ⚙️ Technical Architecture & Design Decisions

### 1. 3D Rendering & Exploded View Engine
*   **Frameworks:** React Three Fiber (R3F), `@react-three/drei`, and `Three.js`.
*   **Scroll-Linked Splitting:** Procedural geometry splitting decouples the boiler, gasket, filter plate, funnel, and collector. As the user scrolls, the components disassemble on the Y-axis using interpolated scroll metrics, exposing the inner chambers of the pot.
*   **Intro Grab Teaser:** A mount-aware intro animation simulates a swipe-right interaction, pulling the user's focus onto the model and introducing its 3D interactive capabilities.
*   **Materials & Lights:** Custom physical materials with realistic metallic roughness, brass elements, matte silicone gaskets, and coffee beans, illuminated by a dynamic studio lighting setup with soft shadows.

### 2. High-Fidelity Gasket & Filter Micro-Texture
*   **Planar Canvas Texture:** Built a dynamic canvas-based texture generator for the gasket filter plate to eliminate radial/specular rendering artifacts. Instead of using complex shaders or massive image files, the canvas renders a clean grid of micro-perforated holes programmatically to create a premium finish.

### 3. Procedural Steam Acoustic Simulator
*   **Web Audio API:** The sound simulator synthesizes escaping steam pressure in real-time, avoiding heavy external audio files.
*   **Sound Synthesis Pipe:**
    *   **White Noise Generator:** Feeds random audio data to simulate high-pressure steam.
    *   **Biquad Filters:** Shapes the steam hiss with a bandpass filter (resonance around 3200Hz) and high-pass filter (above 1800Hz) to create a clean, continuous steam hiss.
    *   **Linear Gain Ramp:** Smoothly fades the sound in and out to prevent popping.
*   **Vibrating Line UI:** An organic horizontal waveform constructed from 30 vertical bar elements. When active, it uses longhand CSS keyframes with index-based deterministic animation durations and delays to vibrate like a real audio spectrum.

### 4. Interactive Specifications Overlay
*   **Mouse/Touch Hover Raycasting:** Hovering over individual floating parts triggers a raycast check, pulling material specs, description copy, and technical details into a glassmorphic technical overlay card.
*   **Lightweight Modals:** Anchored non-blocking popover panels sitting above the footer links for History and Acoustics, allowing continuous background interaction with the 3D scene. Featuring a click-outside detection handler.

---

## 📁 Repository Structure

```bash
moka-pot-app/
├── public/                 # Static assets (clean line-art logo)
├── src/
│   ├── app/
│   │   ├── page.tsx        # Entry point containing the Canvas and Overlay UI
│   │   └── layout.tsx      # Fonts (Inter, Outfit, JetBrains Mono) & metadata
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── Scene.tsx   # Canvas environment lighting & shadow setup
│   │   │   └── MokaPot.tsx # Part separation, coffee beans, and materials
│   │   └── ui/
│   │       └── ContentOverlay.tsx # Header, status pills, popovers, and Audio Engine
└── tailwind.config.ts      # Custom Tailwind styling & gradients
```

---

## 🚀 Getting Started

### 1. Installation
Install the project dependencies:
```bash
npm install
```

### 2. Running Locally
Launch the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
Build and optimize for production deployment:
```bash
npm run build
npm run start
```

---

## 🛠️ Tech Stack
*   **Core:** Next.js (App Router), TypeScript, Tailwind CSS
*   **3D Graphics:** React Three Fiber, Three.js, `@react-three/drei`
*   **Animations:** Framer Motion, Framer Motion 3D
*   **Audio Synthesis:** Native Web Audio API
*   **Fonts:** Outfit (headings), Inter (body copy), JetBrains Mono (technical specifications)

---

> Made with ♥ by [Almonther](https://almonther.studio/)
