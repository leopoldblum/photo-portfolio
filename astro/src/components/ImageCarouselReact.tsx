import type { AvailableSizes, ImageWrapper, Photoset } from "../../../photo-cms/src/types/apiTypes";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CustomCursor } from "./CustomCursor";
import { imageCarouselSliderVariants } from "../util/motionSliderVariants";
import { getImageSrcSet, getAllURLs, getImageURLForGivenWidth } from "../util/imageUtil";
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
    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const [showBlurImage, setShowBlurImage] = useState(false)
    // const [isDraggable, setIsDraggable] = useState(true)

    const previousIndex = (imageIndex - 1 + photoSet.images.length) % photoSet.images.length
    const nextIndex = (imageIndex + 1) % photoSet.images.length

    // const imageWidthScaling = isFullscreen ? 1 : 0.6
    const imageWidthScaling = isFullscreen ? "100vw" : "60vw"

    useEffect(() => {
        // small delay for loading blurry images so that it doesnt flicker on fast connections
        // setShowBlurImage(true)

        const blurLoadingDelay = setTimeout(() => {
            setShowBlurImage(true);
        }, 150)
        return () => clearTimeout(blurLoadingDelay)


    }, [imageIndex])

    useEffect(() => {
        console.log("display blurred: ", showBlurImage)

    }, [showBlurImage])

    /**
     * @todo setup proper caching tags in response headers in cloudflare when hosting, for proper preloading
     */

    const prevImgWrapper = photoSet.images[previousIndex]
    const currImgWrapper = photoSet.images[imageIndex]
    const nextImgWrapper = photoSet.images[nextIndex]

    // preloading left neighbor image
    const img = new Image()
    img.src = db_url + prevImgWrapper.image.url
    img.srcset = getImageSrcSet(db_url, prevImgWrapper)
    img.sizes = imageWidthScaling

    // preloading right neighbor image
    const img2 = new Image()
    img2.src = db_url + nextImgWrapper.image.url
    img2.srcset = getImageSrcSet(db_url, nextImgWrapper)
    img2.sizes = imageWidthScaling

    // preloading tiny images for better interaction in carousel on slow connections
    preload(db_url + prevImgWrapper.image.sizes.tinyPreview.url, { as: "image" })
    preload(db_url + currImgWrapper.image.sizes.tinyPreview.url, { as: "image" })
    preload(db_url + nextImgWrapper.image.sizes.tinyPreview.url, { as: "image" })

    return (
        <>
            <div className={`flex flex-col justify-center items-center relative cursor-none w-full overflow-x-hidden ${isFullscreen ? "backdrop-blur-lg backdrop-grayscale-25" : ""} `}
                onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
            >

                <button
                    className={`absolute left-0 w-1/3 z-5 h-full cursor-none invisible lg:visible`}
                    onClick={() => scrollLeft()}
                    onPointerOver={() => CustomCursor.setCursorType({ type: "arrowLeft" })}
                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                />

                <div className={`flex items-center justify-center ${isFullscreen ? "h-[95vh]" : "h-[70vh]"} w-full `}
                    onPointerOver={isFullscreen ? () => CustomCursor.setCursorType({ type: "zoomOut" }) : () => CustomCursor.setCursorType({ type: "zoomIn" })}
                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                    onClick={!isClickBlocked ? () => toggleModal() : () => (0)}
                >

                    <AnimatePresence
                        mode="wait"
                        custom={direction}
                        initial={false}
                    >
                        {/* container that swipes */}
                        <motion.div
                            className="relative flex-1 w-full h-full overflow-hidden select-none"
                            key={currImgWrapper.image.url}

                            custom={direction}
                            variants={imageCarouselSliderVariants}
                            initial="incoming"
                            animate="active"
                            exit="exit"
                            transition={{ duration: 0.25, ease: "easeInOut" }}

                            // drag={isDraggable ? "x" : false}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragStart={() => setIsClickBlocked(true)}
                            onDragEnd={(_, { offset }) => {
                                if (offset.x < -100) scrollRight()
                                else if (offset.x > 100) scrollLeft()
                                setIsClickBlocked(false)
                            }}

                        // onAnimationStart={() => setIsDraggable(false)}
                        // onAnimationComplete={() => setIsDraggable(true)}

                        // onAnimationStart={() => {
                        //     setIsDraggable(false)
                        //     setTimeout(() => setIsDraggable(true), 0.85 * 0.25)
                        // }}
                        >

                            {/* blurry image */}
                            <motion.div
                                className="absolute inset-0 flex justify-center items-center pointer-events-none "
                            >
                                <motion.div className="overflow-hidden inline-block h-full">
                                    <motion.img
                                        className="object-contain w-full h-full blur-[15px] pointer-events-none"

                                        src={db_url + currImgWrapper.image.sizes.tinyPreview.url}
                                        alt={currImgWrapper.image.alt}
                                        loading="eager"

                                        initial={{ opacity: 1 }}
                                        animate={{ opacity: isImageLoaded ? 0 : (showBlurImage ? 1 : 0) }}
                                        transition={{ duration: isImageLoaded ? 1.5 : 0, ease: "easeIn" }}
                                    />
                                </motion.div>
                            </motion.div>

                            {/* real image */}
                            <motion.img
                                className="absolute object-contain w-full h-full pointer-events-none"

                                src={db_url + currImgWrapper.image.url}
                                srcSet={getImageSrcSet(db_url, photoSet.images[imageIndex])}
                                sizes={imageWidthScaling}
                                alt={currImgWrapper.image.alt}
                                loading="lazy"

                                initial={{ opacity: showBlurImage ? 0 : 1 }}
                                animate={{ opacity: isImageLoaded ? 1 : 0 }}
                                transition={{ duration: 0.3, ease: "linear" }}

                                onLoad={() => { setIsImageLoaded(true), setShowBlurImage(false) }}
                            />

                        </motion.div>

                    </AnimatePresence>

                </div>

                <button
                    className={`absolute right-0 w-1/3 z-5 h-full cursor-none invisible lg:visible `}
                    onClick={() => scrollRight()}
                    onPointerOver={() => CustomCursor.setCursorType({ type: "arrowRight" })}
                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                />

                <div className="py-2  w-full flex justify-center items-center">
                    {`${imageIndex + 1} / ${photoSet.images.length}`}
                </div>

            </div >
        </>
    );
};

export default ImageCarouselReact;
