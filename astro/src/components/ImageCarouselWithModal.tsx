import type { PhotoProject } from "../../../photo-cms/src/types/apiTypes";
import { useState, useEffect, useRef } from "react";
import ImageCarouselReact from "./ImageCarouselReact";
import { CustomCursor } from "./CustomCursor";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useThrottledCallback } from "use-debounce";


const ImageCarouselWithModal = ({ photoProject }: { photoProject: PhotoProject }) => {

    const [imageIndex, setImageIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [showModal, setShowModal] = useState(false)
    const wasModalOpen = useRef(false)
    const closeCursorType = useRef<"zoomIn" | "default">("zoomIn")

    useEffect(() => {
        document.body.classList.add("overflow-hidden")
        document.addEventListener('keydown', handleKeyDown);

        if (showModal) {
            wasModalOpen.current = true
            CustomCursor.setCursorType({ type: "zoomOut" })
        } else if (wasModalOpen.current) {
            wasModalOpen.current = false
            CustomCursor.setCursorType({ type: closeCursorType.current })
            closeCursorType.current = "zoomIn"
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.classList.remove("overflow-hidden")
        }

    }, [showModal])


    const toggleModal = () => {
        setShowModal(prev => !prev);
    }

    const scrollLeft = () => {
        setDirection(-1);
        setImageIndex(prev => prev > 0 ? prev - 1 : photoProject.images.length - 1);
    };

    const scrollRight = () => {
        setDirection(1);
        setImageIndex(prev => prev < photoProject.images.length - 1 ? prev + 1 : 0);
    };


    const throttledScrollLeft = useThrottledCallback(scrollLeft, 500, { leading: true, trailing: false })
    const throttledScrollRight = useThrottledCallback(scrollRight, 500, { leading: true, trailing: false })

    // controversial IMO, open to change
    const throttledToggleModal = useThrottledCallback(toggleModal, 200, { leading: true, trailing: false })


    const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
            case "Escape":
                if (showModal) { closeCursorType.current = "default"; toggleModal() }
                break;

            case "ArrowLeft":
                throttledScrollLeft();
                break;

            case "ArrowRight":
                throttledScrollRight();
                break;

            default:
        }
    }


    return (
        <>
            <ImageCarouselReact
                photoProject={photoProject}
                isFullscreen={false}
                imageIndex={imageIndex}
                direction={direction}
                scrollLeft={scrollLeft}
                scrollRight={scrollRight}
                toggleModal={throttledToggleModal}
            />

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        key="modal"
                        className="h-screen w-screen fixed top-0 left-0 z-10 flex flex-col justify-center items-center bg-neutral-950/70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 1, ease: [0.32, 0.72, 0, 1] } }}
                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                    >
                        {/* close button — enters last, exits first */}
                        <motion.button
                            className="fixed top-0 right-0 mx-7 my-7 lg:mx-20 lg:my-5 z-15 w-10 h-10 lg:w-15 lg:h-15 ring-1 rounded-sm cursor-none flex justify-center items-center"
                            onClick={() => { closeCursorType.current = "default"; toggleModal() }}
                            onPointerOver={() => CustomCursor.setCursorType({ type: "close" })}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                delay: 0.15,
                                duration: 0.3,
                                ease: [0.32, 0.72, 0, 1],
                            }}
                            whileHover={{
                                scale: 0.95,
                                color: "#cd5c5c",
                                transition: { duration: 0.2 },
                            }}
                        >
                            <X />
                        </motion.button>

                        {/* image content — spring entrance, tween exit */}
                        <motion.div
                            className="h-full w-full flex justify-center items-center"
                            initial={{ scale: 0.92, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 10, opacity: 0 }}
                            transition={{
                                scale: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 },
                                y: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 },
                                opacity: { duration: 0.25, ease: [0.32, 0.72, 0, 1], delay: 0.05 },
                            }}
                        >
                            <ImageCarouselReact
                                photoProject={photoProject}
                                isFullscreen={true}
                                imageIndex={imageIndex}
                                direction={direction}
                                scrollLeft={scrollLeft}
                                scrollRight={scrollRight}
                                toggleModal={throttledToggleModal}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default ImageCarouselWithModal;
