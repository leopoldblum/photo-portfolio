import type { AvailableSizes, ImageWrapper, Photoset } from "../../../photo-cms/src/types/apiTypes";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CustomCursor } from "./CustomCursor";
import { imageCarouselSliderVariants } from "../util/motionSliderVariants";
import { getImageSrcSet, getAllURLs } from "../util/imageUtil";
import { preload } from "react-dom";

const db_url = import.meta.env.PUBLIC_API_URL as String

interface CarouselProps {
    photoSet: Photoset,
    isFullscreen: boolean,
    imageIndex: number,
    direction: number
    scrollLeft: () => void,
    scrollRight: () => void,
    toggleModal: () => void,
}

const ImageCarouselReact = ({ photoSet, isFullscreen, imageIndex, direction, scrollLeft, scrollRight, toggleModal }: CarouselProps) => {

    const [isClickBlocked, setIsClickBlocked] = useState(false)

    return (
        <>
            <div className={`flex flex-col justify-center items-center relative cursor-none w-full overflow-x-hidden ${isFullscreen ? "backdrop-blur-xs" : ""} `}
                onMouseLeave={() => CustomCursor.setCursorType({ type: "default" })}
            >

                <button
                    className={`absolute left-0 w-1/3 z-5 h-full cursor-none invisible md:visible`}
                    onClick={() => scrollLeft()}
                    onMouseOver={() => CustomCursor.setCursorType({ type: "arrowLeft" })}
                    onMouseLeave={() => CustomCursor.setCursorType({ type: "default" })}
                />

                <div className={`flex items-center justify-center ${isFullscreen ? "h-[95vh]" : "h-[70vh]"} w-full`}
                    onMouseOver={isFullscreen ? () => CustomCursor.setCursorType({ type: "default" }) : () => CustomCursor.setCursorType({ type: "zoomIn" })}
                    onMouseLeave={() => CustomCursor.setCursorType({ type: "default" })}
                    onClick={!isFullscreen && !isClickBlocked ? () => toggleModal() : () => (0)}
                >

                    <AnimatePresence mode="wait" initial={false} custom={direction}>
                        <motion.img
                            className="object-scale-down flex-1 h-full w-full"

                            loading="eager"
                            key={photoSet.images[imageIndex].image.url}
                            src={`${db_url}${photoSet.images[imageIndex].image.url}`}
                            srcSet={getImageSrcSet(db_url, photoSet.images[imageIndex]).join(', \n')}
                            sizes={isFullscreen ? "100vw" : "60vw"}

                            custom={direction}
                            variants={imageCarouselSliderVariants}
                            initial="incoming"
                            animate="active"
                            exit="exit"
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            drag={"x"}
                            dragConstraints={{ left: 0, right: 0 }}

                            onDragStart={(e) => {
                                setIsClickBlocked(true)
                            }}
                            onDragEnd={(e, { offset }) => {
                                if (offset.x < -100) scrollRight();
                                else if (offset.x > 100) scrollLeft();
                                setIsClickBlocked(false)
                            }}

                        />
                    </AnimatePresence>
                </div>

                <button
                    className={`absolute right-0 w-1/3 z-5 h-full cursor-none invisible md:visible `}
                    onClick={() => scrollRight()}
                    onMouseOver={() => CustomCursor.setCursorType({ type: "arrowRight" })}
                    onMouseLeave={() => CustomCursor.setCursorType({ type: "default" })}
                />

                <div className="py-2">
                    {`${imageIndex + 1} / ${photoSet.images.length}`}
                </div>


            </div>
        </>
    );
};

export default ImageCarouselReact;
