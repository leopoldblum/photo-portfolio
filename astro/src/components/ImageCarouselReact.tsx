import type { AvailableSizes, ImageWrapper, PhotoProject } from "../../../photo-cms/src/types/apiTypes";
import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CustomCursor } from "./CustomCursor";
import { imageCarouselSliderVariants } from "../util/motionSliderVariants";
import { getImageSrcSet, getAllURLs, getImageURLForGivenWidth } from "../util/imageUtil";
import { preload } from "react-dom";
import { useThrottledCallback } from "use-debounce";

const db_url = import.meta.env.PUBLIC_API_URL as String

interface CarouselProps {
    photoProject: PhotoProject,
    isFullscreen: boolean,
    imageIndex: number,
    direction: number
    scrollLeft: () => void,
    scrollRight: () => void,
    toggleModal: () => void,
}

const ImageCarouselReact = ({ photoProject, isFullscreen, imageIndex, direction, scrollLeft, scrollRight, toggleModal }: CarouselProps) => {

    const [isClickBlocked, setIsClickBlocked] = useState(false)
    const [isImageLoaded, setIsImageLoaded] = useState<Map<ImageWrapper, Boolean>>(new Map(photoProject.images.map(img => [img, false])))
    const [showBlurImage, setShowBlurImage] = useState(false)
    const [isFirstLoad, setIsFirstLoad] = useState(true)
    const imageWidthScaling = isFullscreen ? "100vw" : "60vw"

    /**
     * @todo setup proper caching tags in response headers in cloudflare when hosting, for proper preloading
     */

    const previousIndex = (imageIndex - 1 + photoProject.images.length) % photoProject.images.length
    const nextIndex = (imageIndex + 1) % photoProject.images.length

    const prevImgWrapper = photoProject.images[previousIndex]
    const currImgWrapper = photoProject.images[imageIndex]
    const nextImgWrapper = photoProject.images[nextIndex]

    // preloading left neighbor image, using Image() to use srcset
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

    useEffect(() => {
        // small delay for loading blurry images so that it doesnt flicker on fast connections
        setShowBlurImage(false)

        const blurLoadingDelay = setTimeout(() => {
            setShowBlurImage(true);
        }, 200)
        return () => clearTimeout(blurLoadingDelay)

    }, [imageIndex])


    const throttledScrollLeft = useThrottledCallback(scrollLeft, 400, { leading: true, trailing: false })
    const throttledScrollRight = useThrottledCallback(scrollRight, 400, { leading: true, trailing: false })


    return (
        <>
            <div className={`flex flex-col justify-center items-center relative cursor-none w-full overflow-x-hidden ${isFullscreen ? "backdrop-blur-lg backdrop-grayscale-25" : ""} `}
                onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
            >

                <button
                    className={`absolute left-0 w-1/3 z-5 h-full cursor-none invisible lg:visible`}
                    onClick={throttledScrollLeft}
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
                            transition={{ duration: 0.18, ease: "easeInOut" }}

                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragStart={() => setIsClickBlocked(true)}
                            onDragEnd={(_, { offset }) => {
                                if (offset.x < -100) throttledScrollRight()
                                else if (offset.x > 100) throttledScrollLeft()
                                setIsClickBlocked(false)
                            }}

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

                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: isImageLoaded.get(currImgWrapper) ? 0 : (showBlurImage ? 1 : 0) }}
                                        transition={{ duration: isImageLoaded.get(currImgWrapper) ? 1.5 : 0.15, ease: "easeIn" }}
                                    />
                                </motion.div>
                            </motion.div>

                            {/* real image */}
                            <motion.img
                                className="absolute object-contain w-full h-full pointer-events-none"

                                src={db_url + currImgWrapper.image.url}
                                srcSet={getImageSrcSet(db_url, photoProject.images[imageIndex])}
                                sizes={imageWidthScaling}
                                alt={currImgWrapper.image.alt}
                                loading="eager"

                                initial={{ opacity: isImageLoaded.get(currImgWrapper) ? 1 : 0 }}
                                animate={{ opacity: isImageLoaded.get(currImgWrapper) ? 1 : 0 }}
                                transition={{ opacity: { duration: 0.15, ease: "easeIn" } }}

                                onLoad={() => {
                                    setIsImageLoaded(prev => {
                                        const newMap = new Map(prev);
                                        newMap.set(currImgWrapper, true);
                                        return newMap;
                                    })
                                }}
                            />

                        </motion.div>

                    </AnimatePresence>

                </div>

                <button
                    className={`absolute right-0 w-1/3 z-5 h-full cursor-none invisible lg:visible `}
                    onClick={throttledScrollRight}
                    onPointerOver={() => CustomCursor.setCursorType({ type: "arrowRight" })}
                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                />

                <div className="py-2 w-full flex justify-center items-center">
                    {`${imageIndex + 1} / ${photoProject.images.length}`}
                </div>

            </div >
        </>
    );
};

export default ImageCarouselReact;
