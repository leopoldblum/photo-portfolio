import { motion } from "motion/react"
import type { ReactNode, ComponentProps } from "react"

type ScrollRevealProps = {
    children: ReactNode
    className?: string
} & Omit<ComponentProps<typeof motion.div>, "initial" | "whileInView" | "viewport" | "transition">

const ScrollReveal = ({ children, className, ...rest }: ScrollRevealProps) => {
    // Skip entrance animation when arriving via morph transition (detail -> landing)
    const skip = typeof document !== 'undefined' &&
        document.documentElement.hasAttribute('data-morph-nav');

    return (
        <motion.div
            initial={skip ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.0, ease: [0.25, 1, 0.5, 1] }}
            className={className}
            {...rest}
        >
            {children}
        </motion.div>
    )
}

export default ScrollReveal
