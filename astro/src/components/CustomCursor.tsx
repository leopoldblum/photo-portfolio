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
            <motion.div
                className="fixed z-50 rounded-2xl text-neutral-300 bg-neutral-900/60 p-5 text-2xl select-none pointer-events-none"
                style={{
                    top: `${mousePosition.y}px`,
                    left: `${mousePosition.x}px`,
                    transform: 'translate(-50%, -50%)',
                }}

                key={cursorText}


                initial={{ opacity: 0.1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.1 }}
                transition={{ duration: 0.2, ease: "easeIn" }}


            >
                {cursorText}
            </motion.div>
        </>
    );
};

export const setCursorText = (text: string) => {
    const event = new CustomEvent("cursor-text", { detail: text });
    document.dispatchEvent(event);
};