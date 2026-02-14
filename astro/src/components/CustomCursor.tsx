import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react"
import { ChevronLeft, ChevronRight, Maximize2Icon, Minimize2Icon, X } from "lucide-react";

type CursorType =
    | { type: "hidden" }
    | { type: "default" }
    | { type: "arrowLeft" }
    | { type: "arrowRight" }
    | { type: "zoomIn" }
    | { type: "zoomOut" }
    | { type: "close" }
    | { type: "displayTitle", displayText: string }

export const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [cursor, setCursor] = useState<CursorType>({ type: "default" })

    const handleCursorTypeChange = (event: CustomEvent<CursorType>) => {
        setCursor(event.detail)
    }

    useEffect(() => {
        const updateMousePosition = (event: MouseEvent) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
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



    const renderCursor = (cursor: CursorType) => {
        switch (cursor.type) {
            case "hidden":
                return null;

            case "default":
                return (
                    <div className="cursor-base-style size-6 rounded-full" />
                )

            case "arrowLeft":
                return (
                    <div className="cursor-base-style px-1 py-2 rounded-md">
                        <ChevronLeft strokeWidth={2.5} />
                    </div>
                )

            case "arrowRight":
                return (
                    <div className="cursor-base-style px-1 py-2 rounded-md">
                        <ChevronRight strokeWidth={2.5} />
                    </div>
                )

            case "zoomIn":
                return (
                    <div className="cursor-base-style p-2 rounded-3xl">
                        <Maximize2Icon strokeWidth={2.5} />
                    </div>
                )

            case "zoomOut":
                return (
                    <div className="cursor-base-style p-2 rounded-3xl">
                        <Minimize2Icon strokeWidth={2.5} />
                    </div>
                )

            case "close":
                return (
                    <div className="cursor-base-style p-2 rounded-3xl">
                        <X strokeWidth={2.5} />
                    </div>
                )

            case "displayTitle":
                return (
                    <div className="cursor-base-style px-5 py-2 rounded-full text-sm tracking-widest">
                        {cursor.displayText}
                    </div>
                )

            default:
                return null
        }
    }

    const cursorKey =
        cursor.type === "displayTitle"
            ? `${cursor.type}-${cursor.displayText}`
            : cursor.type;

    return (
        <div
            className="fixed z-100 text-xl select-none pointer-events-none text-nowrap cursor-none"
            style={{
                top: `${mousePosition.y}px`,
                left: `${mousePosition.x}px`,
                transform: "translate(-50%, -50%)",
            }}
        >
            <AnimatePresence mode="popLayout">
                {cursor.type !== "hidden" && (
                    <motion.div
                        key={cursorKey}
                        className={`rounded-full ${cursor.type !== "displayTitle" ? "mix-blend-luminosity backdrop-blur-[2px]" : ""}`}
                        initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                        transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                    >
                        {renderCursor(cursor)}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


CustomCursor.setCursorType = (cursorType: CursorType) => {
    const event = new CustomEvent<CursorType>("cursor-text", { detail: cursorType });
    document.dispatchEvent(event);
};


export default CustomCursor;