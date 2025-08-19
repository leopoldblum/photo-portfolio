import type { Photoset } from "../../../photo-cms/src/types/apiTypes";
import { useState, useEffect } from "react";
import ImageCarouselReact from "./ImageCarouselReact";
import { CustomCursor } from "./CustomCursor";
import { motion } from "motion/react";

const ImageCarouselWithModal = ({ photoSet }: { photoSet: Photoset }) => {

    const [imageIndex, setImageIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        document.body.classList.add("overflow-hidden")
        document.addEventListener('keydown', handleKeyDown);
        console.log("toggled modal open")


        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.classList.remove("overflow-hidden")
            console.log("toggled modal closed")
        }

    }, [showModal])


    const toggleModal = () => {
        setShowModal(prev => !prev);
    }

    const scrollLeft = () => {
        setDirection(-1);
        setImageIndex(prev => prev > 0 ? prev - 1 : photoSet.images.length - 1);
    };

    const scrollRight = () => {
        setDirection(1);
        setImageIndex(prev => prev < photoSet.images.length - 1 ? prev + 1 : 0);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        console.log("pressed key")

        switch (e.key) {
            case "Escape":
                if (showModal) toggleModal();
                break;

            case "ArrowLeft":
                scrollLeft(); break;

            case "ArrowRight":
                scrollRight(); break;

            default:
        }
    }


    return (
        <>
            <ImageCarouselReact
                photoSet={photoSet}
                isFullscreen={false}
                imageIndex={imageIndex}
                direction={direction}
                scrollLeft={scrollLeft}
                scrollRight={scrollRight}
                toggleModal={toggleModal}
            />

            {showModal &&
                // modal container
                <div className="h-screen w-screen fixed top-0 left-0 z-10 flex flex-col justify-center items-center bg-neutral-900/80">

                    <motion.button
                        className="fixed top-0 right-0  mx-7 my-7 lg:mx-20 lg:my-5 z-15 w-15 h-15 lg:w-15 lg:h-15 ring-1 rounded-sm cursor-none"
                        onClick={toggleModal}
                        onMouseOver={() => CustomCursor.setCursorType({ type: "close" })}

                        whileHover={
                            {
                                scale: 0.95,
                                color: "#cd5c5c",

                                transition: { duration: 0.2 }
                            }
                        }
                    >
                        X
                    </motion.button>

                    {/* image display */}
                    <div className="h-full w-full flex justify-center items-center">
                        <ImageCarouselReact
                            photoSet={photoSet}
                            isFullscreen={true}
                            imageIndex={imageIndex}
                            direction={direction}
                            scrollLeft={scrollLeft}
                            scrollRight={scrollRight}
                            toggleModal={toggleModal}
                        />
                    </div>
                </div >
            }
        </>
    )
}

export default ImageCarouselWithModal;