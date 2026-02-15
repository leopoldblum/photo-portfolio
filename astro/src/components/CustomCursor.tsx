import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react"
import { ArrowUpRight, ChevronLeft, ChevronRight, Maximize2Icon, Minimize2Icon, X } from "lucide-react";

type CursorType =
    | { type: "hidden" }
    | { type: "default" }
    | { type: "arrowLeft" }
    | { type: "arrowRight" }
    | { type: "zoomIn" }
    | { type: "zoomOut" }
    | { type: "close" }
    | { type: "link" }
    | { type: "displayTitle", displayText: string }

export const CustomCursor = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [cursor, setCursor] = useState<CursorType>({ type: "default" })

    const handleCursorTypeChange = (event: CustomEvent<CursorType>) => {
        setCursor(event.detail)
    }

    useEffect(() => {
        const updateMousePosition = (event: MouseEvent) => {
            if (containerRef.current) {
                containerRef.current.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
            }
        };

        const resetCursor = () => setCursor({ type: "default" });

        document.addEventListener("pointerenter", updateMousePosition, true)
        document.addEventListener("pointermove", updateMousePosition);
        document.addEventListener("cursor-text", handleCursorTypeChange as EventListener);
        document.addEventListener("astro:after-swap", resetCursor);

        return () => {
            document.removeEventListener("pointermove", updateMousePosition);
            document.removeEventListener("cursor-text", handleCursorTypeChange as EventListener);
            document.removeEventListener("astro:after-swap", resetCursor);
        };
    }, []);

    const renderIcon = (cursor: CursorType) => {
        switch (cursor.type) {
            case "hidden":
            case "default":
                return null;
            case "arrowLeft":
                return <ChevronLeft strokeWidth={2.5} />;
            case "arrowRight":
                return <ChevronRight strokeWidth={2.5} />;
            case "zoomIn":
                return <Maximize2Icon strokeWidth={2.5} />;
            case "zoomOut":
                return <Minimize2Icon strokeWidth={2.5} />;
            case "link":
                return <ArrowUpRight strokeWidth={2.5} />;
            case "close":
                return <X strokeWidth={2.5} />;
            case "displayTitle":
                return <span className="text-sm tracking-widest">{cursor.displayText}</span>;
        }
    }

    const isIcon = cursor.type !== "hidden" && cursor.type !== "default" && cursor.type !== "displayTitle";
    const isTitle = cursor.type === "displayTitle";

    return (
        <div
            ref={containerRef}
            className="fixed top-0 left-0 z-100 text-xl select-none pointer-events-none text-nowrap cursor-none will-change-transform"
        >
            <motion.div
                layout
                className={`text-neutral-100 overflow-hidden ${isTitle ? "px-5 py-2" : isIcon ? "p-2" : "size-6"} ${!isTitle ? "mix-blend-luminosity" : ""}`}
                animate={{
                    opacity: cursor.type === "hidden" ? 0 : 1,
                    scale: isTitle ? 1 : cursor.type === "hidden" ? 0.5 : 1,
                    borderRadius: isTitle ? 6 : isIcon ? 24 : 9999,
                    backgroundColor: "rgba(38, 38, 38, 0.7)",
                    boxShadow: "0 0 0 2px rgba(245, 245, 245, 0.3)",
                    backdropFilter: isTitle ? "blur(12px)" : "blur(2px)",
                }}
                initial={false}
                transition={{
                    layout: { duration: 0.15, ease: [0.32, 0.72, 0, 1] },
                    duration: 0.15,
                    ease: [0.32, 0.72, 0, 1],
                }}
            >
                <motion.div
                    key={isTitle ? cursor.displayText : cursor.type}
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.12, ease: [0.32, 0.72, 0, 1] }}
                >
                    {renderIcon(cursor)}
                </motion.div>
            </motion.div>
        </div>
    );
};


CustomCursor.setCursorType = (cursorType: CursorType) => {
    const event = new CustomEvent<CursorType>("cursor-text", { detail: cursorType });
    document.dispatchEvent(event);
};


export default CustomCursor;
