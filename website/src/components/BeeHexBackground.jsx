import React, { useEffect, useRef } from 'react'

// Bee hexagon background SVG that responds to mouse movement with subtle parallax
export default function BeeHexBackground({ intensity = 30 }) {
  const ref = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let mouseX = 0
    let mouseY = 0
    let lastX = 0
    let lastY = 0

    const handleMove = (e) => {
      const w = window.innerWidth
      const h = window.innerHeight
      mouseX = (e.clientX / w - 0.5) * 2 // -1..1
      mouseY = (e.clientY / h - 0.5) * 2
      if (!rafRef.current) rafRef.current = requestAnimationFrame(update)
    }

    const update = () => {
      // smooth lerp
      lastX += (mouseX - lastX) * 0.12
      lastY += (mouseY - lastY) * 0.12
      const tx = lastX * intensity
      const ty = lastY * intensity
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${lastX * 2}deg)`
      rafRef.current = null
    }

    window.addEventListener('mousemove', handleMove)
    // also slowly animate when idle
    let idleAnim = null
    const idle = () => {
      const t = Date.now() / 3000
      const sx = Math.sin(t) * (intensity * 0.08)
      const sy = Math.cos(t * 1.2) * (intensity * 0.06)
      el.style.transform = `translate3d(${sx}px, ${sy}px, 0) rotate(${sx * 0.5}deg)`
      idleAnim = requestAnimationFrame(idle)
    }
    idleAnim = requestAnimationFrame(idle)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (idleAnim) cancelAnimationFrame(idleAnim)
    }
  }, [intensity])

  return (
    <div
      ref={ref}
      aria-hidden
      className="bee-hex-bg pointer-events-none fixed inset-0 -z-10 opacity-60"
      style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}
    >
      <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="hex" x="0" y="0" width="120" height="104" patternUnits="userSpaceOnUse">
            <g fill="none" strokeOpacity="0.12" stroke="#FDB927" strokeWidth="1">
              <path d="M60 0 L120 30 L120 74 L60 104 L0 74 L0 30 Z" fillOpacity="0.02" fill="#FDB927" />
            </g>
          </pattern>
          <linearGradient id="honeyGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FDB927" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#honeyGrad)" />
        <rect width="100%" height="100%" fill="url(#hex)" />

        {/* decorative moving highlights */}
        <g opacity="0.08">
          <circle cx="200" cy="150" r="160" fill="#7BC043" />
          <circle cx="980" cy="620" r="220" fill="#FDB927" />
        </g>
      </svg>
    </div>
  )
}
