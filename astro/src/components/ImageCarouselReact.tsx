import type { AvailableSizes, ImageWrapper, Photoset } from "../../../photo-cms/src/types/apiTypes";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CustomCursor } from "./CustomCursor";
import { imageCarouselSliderVariants } from "../util/motionSliderVariants";
import { getImageSrcSet, getAllURLs, getImageURLForGivenWidth } from "../util/imageUtil";
import { preload } from "react-dom";
import { prefetch } from "astro/virtual-modules/prefetch.js";

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

    const previousIndex = (imageIndex - 1 + photoSet.images.length) % photoSet.images.length
    const nextIndex = (imageIndex + 1) % photoSet.images.length

    const imageWidthScaling = isFullscreen ? 1 : 0.6

    // const url_prev = getImageURLForGivenWidth(db_url, photoSet.images[previousIndex], document.documentElement.clientWidth, imageWidthScaling)
    // const url_curr = getImageURLForGivenWidth(db_url, photoSet.images[imageIndex], document.documentElement.clientWidth, imageWidthScaling)
    // const url_next = getImageURLForGivenWidth(db_url, photoSet.images[nextIndex], document.documentElement.clientWidth, imageWidthScaling)

    // prefetch(url_prev)
    // preload(url_curr, { as: "image" })
    // prefetch(url_next)

    // console.log("preloading: ")
    // console.log(url_prev)
    // console.log(url_curr)
    // console.log(url_next)
    // console.log("")

    const prevImgWrapper = photoSet.images[previousIndex]
    const currImgWrapper = photoSet.images[imageIndex]
    const nextImgWrapper = photoSet.images[nextIndex]

    const img = new Image()
    img.src = db_url + prevImgWrapper.image.url
    img.srcset = getImageSrcSet(db_url, prevImgWrapper)

    const img2 = new Image()
    img2.src = db_url + nextImgWrapper.image.url
    img2.srcset = getImageSrcSet(db_url, nextImgWrapper)


    return (
        <>
            <div className={`flex flex-col justify-center items-center relative cursor-none w-full overflow-x-hidden ${isFullscreen ? "backdrop-blur-xs" : ""} `}
                onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
            >

                <button
                    className={`absolute left-0 w-1/3 z-5 h-full cursor-none invisible md:visible`}
                    onClick={() => scrollLeft()}
                    onPointerOver={() => CustomCursor.setCursorType({ type: "arrowLeft" })}
                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                />

                <div className={`flex items-center justify-center ${isFullscreen ? "h-[95vh]" : "h-[70vh]"} w-full`}
                    onPointerOver={isFullscreen ? () => CustomCursor.setCursorType({ type: "zoomOut" }) : () => CustomCursor.setCursorType({ type: "zoomIn" })}
                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                    onClick={!isClickBlocked ? () => toggleModal() : () => (0)}
                >

                    <AnimatePresence mode="wait" initial={false} custom={direction}>
                        <motion.img
                            className="object-scale-down flex-1 h-full w-full"

                            loading="eager"
                            key={currImgWrapper.image.url}
                            src={db_url + currImgWrapper.image.url}
                            srcSet={getImageSrcSet(db_url, photoSet.images[imageIndex])}
                            sizes={imageWidthScaling.toString()}

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
                    onPointerOver={() => CustomCursor.setCursorType({ type: "arrowRight" })}
                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                />

                <div className="py-2">
                    {`${imageIndex + 1} / ${photoSet.images.length}`}
                </div>


            </div>
        </>
    );
};

export default ImageCarouselReact;
