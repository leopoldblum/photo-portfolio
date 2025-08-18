import type { Photoset } from "../../../photo-cms/src/types/apiTypes";
import { useState, useEffect } from "react";
import ImageCarouselReact from "./ImageCarouselReact";



const ImageCarouselWithModal = ({ photoSet }: { photoSet: Photoset }) => {

    const [imageIndex, setImageIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        if (showModal) {
            document.body.classList.add("overflow-hidden")
            document.addEventListener('keydown', handleKeyDown);
            console.log("toggled modal open")
        }

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
        if (e.key === "Escape") {
            toggleModal()
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

                    <button
                        className="fixed top-0 right-0 mx-20 my-5 z-15 w-15 h-15 lg:w-20 lg:h-20 hover:cursor-pointer ring-1 rounded-sm"
                        onClick={toggleModal}
                    >
                        X
                    </button>

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
                </div>
            }
        </>
    )
}

export default ImageCarouselWithModal;