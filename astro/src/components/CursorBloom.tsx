import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'motion/react'

const CursorBloom = () => {
  const [hasHover, setHasHover] = useState(true)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 40, mass: 0.5 })
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 40, mass: 0.5 })

  const bg = useMotionTemplate`radial-gradient(ellipse 600px 450px at ${smoothX}px ${smoothY}px, hsla(260, 50%, 65%, 0.1), transparent 70%)`

  useEffect(() => {
    setHasHover(window.matchMedia('(hover: hover)').matches)

    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    mouseX.set(cx)
    mouseY.set(cy)

    let pendingX = cx
    let pendingY = cy
    let rafId = 0
    const flush = () => {
      rafId = 0
      mouseX.set(pendingX)
      mouseY.set(pendingY)
    }
    const onPointerMove = (e: PointerEvent) => {
      pendingX = e.clientX
      pendingY = e.clientY
      if (!rafId) rafId = requestAnimationFrame(flush)
    }

    window.addEventListener('pointermove', onPointerMove)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  if (!hasHover) return null

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1, background: bg }}
    />
  )
}

export default CursorBloom
