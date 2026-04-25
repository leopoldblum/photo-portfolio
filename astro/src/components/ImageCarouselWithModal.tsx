import type { PhotoProject } from "../../../photo-cms/src/types/apiTypes";
import { useState, useEffect, useRef } from "react";
import ImageCarouselReact from "./ImageCarouselReact";
import { CustomCursor } from "./CustomCursor";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useThrottledCallback } from "use-debounce";
import { extractDominantColor, dispatchBackgroundColor } from "../util/dominantColor";

export type AdjacentProject = {
    slug: string;
    title: string;
    thumbnailUrl: string;
    placeholderSrcSet: string;
};

interface CarouselWithModalProps {
    photoProject: PhotoProject;
    prevProject: AdjacentProject;
    nextProject: AdjacentProject;
    onSlideNavigate: (slug: string, dir: 'prev' | 'next') => void;
}

const ImageCarouselWithModal = ({ photoProject, prevProject, nextProject, onSlideNavigate }: CarouselWithModalProps) => {

    const [imageIndex, setImageIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [showModal, setShowModal] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const wasModalOpen = useRef(false)
    const closeCursorType = useRef<"zoomIn" | "default">("zoomIn")

    const totalImages = photoProject.images.length;
    const isOnCard = imageIndex === -1 || imageIndex === totalImages;

    useEffect(() => {
        setShowInfo(false)

        // Extract dominant color from current image and dispatch to background
        if (imageIndex >= 0 && imageIndex < totalImages) {
            const img = photoProject.images[imageIndex]
            const tinyUrl = img.image.sizes?.tinyPreview?.url
            if (tinyUrl) {
                const db_url = import.meta.env.PUBLIC_API_URL as string
                extractDominantColor(db_url + tinyUrl).then(dispatchBackgroundColor)
            }
        }
    }, [imageIndex])

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

    }, [showModal, imageIndex])


    const toggleModal = () => {
        if (!isOnCard) setShowModal(prev => !prev);
    }

    const scrollLeft = () => {
        setDirection(-1);
        setImageIndex(prev => prev > -1 ? prev - 1 : prev);
    };

    const scrollRight = () => {
        setDirection(1);
        setImageIndex(prev => prev < totalImages ? prev + 1 : prev);
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
                if (imageIndex === -1) {
                    onSlideNavigate(prevProject.slug, 'prev');
                } else {
                    throttledScrollLeft();
                }
                break;

            case "ArrowRight":
                if (imageIndex === totalImages) {
                    onSlideNavigate(nextProject.slug, 'next');
                } else {
                    throttledScrollRight();
                }
                break;

            case "i":
            case "I":
                if (!isOnCard) setShowInfo(prev => !prev)
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
                prevProject={prevProject}
                nextProject={nextProject}
                onSlideNavigate={onSlideNavigate}
                showInfo={showInfo}
                onToggleInfo={() => setShowInfo(prev => !prev)}
                hideInfoIcon={showModal}
            />

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        key="modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Fullscreen image viewer"
                        className="h-screen w-screen fixed top-0 left-0 z-10 flex flex-col justify-center items-center"
                        initial={{ backgroundColor: "rgba(10,10,10,0)", backdropFilter: "blur(0px)" }}
                        animate={{ backgroundColor: "rgba(10,10,10,0.7)", backdropFilter: "blur(4px)" }}
                        exit={{
                            backgroundColor: "rgba(10,10,10,0)",
                            backdropFilter: "blur(0px)",
                            transition: {
                                backgroundColor: { duration: 1, ease: [0.32, 0.72, 0, 1] },
                                backdropFilter: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
                            },
                        }}
                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                    >
                        {/* close button — enters last, exits first */}
                        <motion.button
                            aria-label="Close fullscreen"
                            className="fixed top-0 right-0 mx-7 my-7 lg:mx-20 lg:my-5 z-15 w-10 h-10 lg:w-15 lg:h-15 cursor-none flex justify-center items-center"
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
                                prevProject={prevProject}
                                nextProject={nextProject}
                                onSlideNavigate={onSlideNavigate}
                                showInfo={showInfo}
                                onToggleInfo={() => setShowInfo(prev => !prev)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default ImageCarouselWithModal;
