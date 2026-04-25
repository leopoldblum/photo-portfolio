import { useEffect, useRef, useState } from "react";

/**
 * Soft magenta light that trails the cursor with a 500ms ease-out lag.
 * Renders as a 720px positioned element at `mix-blend-mode: screen` so it
 * reads as additive light on dark, not as a flat overlay. The same magenta
 * is reused for image-hover glows — one accent, used everywhere as light.
 */
const CursorBloom = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        const hover = window.matchMedia("(hover: hover)").matches;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setEnabled(hover);
        if (!hover) return;

        const el = ref.current;
        if (!el) return;
        if (reduced) el.style.transition = "none";

        let pendingX = window.innerWidth / 2;
        let pendingY = window.innerHeight / 2;
        let raf = 0;
        const flush = () => {
            raf = 0;
            el.style.left = pendingX + "px";
            el.style.top = pendingY + "px";
        };
        const onMove = (e: PointerEvent) => {
            pendingX = e.clientX;
            pendingY = e.clientY;
            if (!raf) raf = requestAnimationFrame(flush);
        };
        window.addEventListener("pointermove", onMove);
        return () => {
            window.removeEventListener("pointermove", onMove);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    if (!enabled) return null;
    return (
        <div
            ref={ref}
            aria-hidden="true"
            style={{
                position: "fixed",
                left: "50%",
                top: "30%",
                width: "720px",
                height: "720px",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                zIndex: -1,
                background:
                    "radial-gradient(circle, rgba(255,43,110,0.10) 0%, rgba(255,43,110,0.03) 30%, transparent 60%)",
                transition: "left 500ms ease-out, top 500ms ease-out",
                willChange: "left, top",
                mixBlendMode: "screen",
            }}
        />
    );
};

export default CursorBloom;
