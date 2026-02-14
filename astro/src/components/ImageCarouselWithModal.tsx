import type { PhotoProject } from "../../../photo-cms/src/types/apiTypes";
import { useState, useEffect } from "react";
import ImageCarouselReact from "./ImageCarouselReact";
import { CustomCursor } from "./CustomCursor";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useThrottledCallback } from "use-debounce";


const ImageCarouselWithModal = ({ photoProject }: { photoProject: PhotoProject }) => {

    const [imageIndex, setImageIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        document.body.classList.add("overflow-hidden")
        document.addEventListener('keydown', handleKeyDown);

        if (showModal) CustomCursor.setCursorType({ type: "default" })
        if (!showModal) CustomCursor.setCursorType({ type: "default" })



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
                if (showModal) toggleModal();
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
            {!showModal &&
                <ImageCarouselReact
                    photoProject={photoProject}
                    isFullscreen={false}
                    imageIndex={imageIndex}
                    direction={direction}
                    scrollLeft={scrollLeft}
                    scrollRight={scrollRight}
                    toggleModal={throttledToggleModal}
                />
            }

            {showModal &&
                // modal container
                <div className="h-screen w-screen fixed top-0 left-0 z-10 flex flex-col justify-center items-center bg-neutral-900/80">

                    <motion.button
                        className="fixed top-0 right-0  mx-7 my-7 lg:mx-20 lg:my-5 z-15 w-10 h-10 lg:w-15 lg:h-15 ring-1 rounded-sm cursor-none flex justify-center items-center"
                        onClick={toggleModal}
                        onPointerOver={() => CustomCursor.setCursorType({ type: "close" })}

                        whileHover={
                            {
                                scale: 0.95,
                                color: "#cd5c5c",

                                transition: { duration: 0.2 }
                            }
                        }
                    >
                        <X />
                    </motion.button>

                    {/* image display */}
                    <div className="h-full w-full flex justify-center items-center">
                        <ImageCarouselReact
                            photoProject={photoProject}
                            isFullscreen={true}
                            imageIndex={imageIndex}
                            direction={direction}
                            scrollLeft={scrollLeft}
                            scrollRight={scrollRight}
                            toggleModal={throttledToggleModal}
                        />
                    </div>
                </div >
            }
        </>
    )
}

export default ImageCarouselWithModal;
