import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react"

type CursorTypeNames =
    | "hidden"
    | "default"
    | "arrowLeft"
    | "arrowRight"
    | "zoomIn"
    | "close"
    | "displayTitle"

export interface CursorType {
    type: CursorTypeNames,
    displayText?: string,
}

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

        document.addEventListener("mouseenter", updateMousePosition, true)
        document.addEventListener("mousemove", updateMousePosition);
        document.addEventListener("cursor-text", handleCursorTypeChange as EventListener);

        return () => {
            document.removeEventListener("mousemove", updateMousePosition);
            document.removeEventListener("cursor-text", handleCursorTypeChange as EventListener);

        };
    }, []);

    const renderCursor = (cursor: CursorType) => {
        switch (cursor.type) {
            case "hidden":
                return null;
            case "default":
                return ("O")
            case "arrowLeft":
                return ("<")
            case "arrowRight":
                return (">")
            case "zoomIn":
                return ("+")
            case "close":
                return ("X")
            case "displayTitle":
                return (cursor.displayText)

            default:
                return null
        }
    }

    return (
        <>
            <motion.div
                className="fixed z-100 px-4 py-2 text-xl rounded-xl text-neutral-100 bg-neutral-600/80 select-none pointer-events-none text-nowrap"
                style={{
                    top: `${mousePosition.y}px`,
                    left: `${mousePosition.x}px`,
                }}
                key={`${cursor.type}_${cursor.displayText}`}

                initial={{ scaleY: 0.5, scaleX: 0.2, translateX: "-50%", translateY: "-50%" }}
                animate={{ scaleY: 1, scaleX: 1, translateX: "-50%", translateY: "-50%" }}
                exit={{ scaleY: 0.5, scaleX: 0.2, translateX: "-50%", translateY: "-50%" }}
                transition={{ duration: 0.15, ease: "easeIn" }}

            >
                {renderCursor(cursor)}
            </motion.div>
        </>
    );
};


CustomCursor.setCursorType = (cursorType: CursorType) => {
    // console.log("changing type to: " + cursorType.type)
    const event = new CustomEvent<CursorType>("cursor-text", { detail: cursorType });
    document.dispatchEvent(event);
};


export default CustomCursor;