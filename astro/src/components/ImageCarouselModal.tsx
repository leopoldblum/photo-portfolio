import { useContext, useEffect, useState } from "react";
import type { Photoset } from "../../../photo-cms/src/types/apiTypes";
import ImageCarouselReact from "./ImageCarouselReact";


const ImageCarouselModal = ({ displayPhotoset, isOpen, toggleFunction }: { displayPhotoset: Photoset, isOpen: boolean, toggleFunction: Function }) => {

    function handleKeyDown(e: KeyboardEvent) {
        console.log("pressed key")
        if (e.key === "Escape") {
            toggleFunction()
        }
    }

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("overflow-hidden")
            document.addEventListener('keydown', handleKeyDown);
            console.log("toggled modal open")
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.classList.remove("overflow-hidden")
            console.log("toggled modal closed")
        }

    }, [isOpen])

    return (
        <>
            {isOpen &&
                // modal container
                <div className="h-screen w-screen fixed top-0 left-0 z-10 flex flex-col justify-center items-center bg-neutral-900/80">

                    <button
                        className="fixed top-0 right-0 mx-20 my-5 z-15 w-15 h-15 lg:w-20 lg:h-20 hover:cursor-pointer"
                        onClick={() => toggleFunction()}
                    >
                        X
                    </button>
                    {/* image display */}
                    <div className="h-full w-full flex justify-center items-center">
                        <ImageCarouselReact photoSet={displayPhotoset} isFullscreen={true} />
                    </div>
                </div>
            }
        </>
    )
}

export default ImageCarouselModal;