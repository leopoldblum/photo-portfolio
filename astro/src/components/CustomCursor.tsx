import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, easeIn, motion } from "motion/react"


export const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [cursorText, setCursorText] = useState("O")

    useEffect(() => {
        const updateMousePosition = (event: MouseEvent) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
        };

        const handleTextChange = (event: CustomEvent<string>) => {
            setCursorText(event.detail)
        }

        document.addEventListener("mousemove", updateMousePosition);
        document.addEventListener("cursor-text", handleTextChange as EventListener);

        return () => {
            document.removeEventListener("mousemove", updateMousePosition);
            document.removeEventListener("cursor-text", handleTextChange as EventListener);

        };
    }, []);

    return (
        <>
            {cursorText !== "" &&
                <motion.div
                    className="fixed z-50 px-4 py-2 text-xl rounded-xl text-neutral-100 bg-neutral-900/80 select-none pointer-events-none"
                    style={{
                        top: `${mousePosition.y}px`,
                        left: `${mousePosition.x}px`,
                    }}

                    key={cursorText}


                    initial={{ scaleY: 0.4, scaleX: 0.9, translateX: "-50%", translateY: "-50%" }}
                    animate={{ scaleY: 1, scaleX: 1, translateX: "-50%", translateY: "-50%" }}
                    exit={{ scaleY: 0.4, scaleX: 0.9, translateX: "-50%", translateY: "-50%" }}
                    transition={{ duration: 0.2, ease: "easeIn" }}

                >
                    {cursorText === "" ? "" : cursorText}
                </motion.div>
            }
        </>
    );
};

CustomCursor.setCursorText = (text: string) => {
    const event = new CustomEvent("cursor-text", { detail: text });
    document.dispatchEvent(event);
};

export default CustomCursor;