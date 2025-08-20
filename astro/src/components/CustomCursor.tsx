import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight, Circle, DotIcon, Maximize2Icon, Minimize2Icon, PlusIcon, SparkleIcon, Triangle, X, ZoomInIcon } from "lucide-react";

type CursorTypeNames =
    | "hidden"
    | "default"
    | "arrowLeft"
    | "arrowRight"
    | "zoomIn"
    | "zoomOut"
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
                return (
                    <div className="text-xs rounded-3xl text-neutral-100 bg-neutral-600/30 ring-[2px] ring-neutral-100/30 mix-blend-difference">
                        <DotIcon strokeWidth={2.5} />
                        {/* <Triangle strokeWidth={2.5} /> */}
                    </div>
                )

            case "arrowLeft":
                return (
                    <div className="px-1 py-2 rounded-md text-neutral-100 bg-neutral-600/30 ring-[2px] ring-neutral-100/30 mix-blend-difference">
                        <ChevronLeft strokeWidth={2.5} />
                    </div>
                )

            case "arrowRight":
                return (
                    <div className="px-1 py-2 rounded-md text-neutral-100 bg-neutral-600/30 ring-[2px] ring-neutral-100/30 mix-blend-difference">
                        <ChevronRight strokeWidth={2.5} />
                    </div>
                )

            case "zoomIn":
                return (
                    <div className="p-2 rounded-3xl text-neutral-100 bg-neutral-600/50 ring-[2px] ring-neutral-100/30 mix-blend-difference">
                        {/* <ZoomInIcon /> */}
                        {/* <PlusIcon /> */}
                        <Maximize2Icon strokeWidth={2.5} />
                    </div>
                )

            case "zoomOut":
                return (
                    <div className="p-2 rounded-3xl text-neutral-100 bg-neutral-600/50 ring-[2px] ring-neutral-100/30 mix-blend-difference">
                        {/* <ZoomInIcon /> */}
                        {/* <PlusIcon /> */}
                        <Minimize2Icon strokeWidth={2.5} />
                    </div>
                )

            case "close":
                return (
                    <div className="p-2 rounded-md text-neutral-100 bg-neutral-600/30 ring-[2px] ring-neutral-100/30 mix-blend-difference">
                        <X strokeWidth={2.5} />
                    </div>
                )

            case "displayTitle":
                return (
                    <div className="px-4 py-2 rounded-md  text-neutral-100 bg-neutral-600/50 ">
                        {cursor.displayText}
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <>
            <motion.div
                className="fixed z-100 text-xl select-none pointer-events-none text-nowrap cursor-none mix-blend-luminosity rounded-md backdrop-blur-[2px]"
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
                {
                    renderCursor(cursor)
                }
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