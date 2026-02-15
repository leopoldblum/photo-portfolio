import type { AvailableSizes, ImageWrapper, PhotoProject } from "../../../photo-cms/src/types/apiTypes";
import type { AdjacentProject } from "./ImageCarouselWithModal";
import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CustomCursor } from "./CustomCursor";
import { imageCarouselSliderVariants } from "../util/motionSliderVariants";
import { getImageSrcSet, getAllURLs, getImageURLForGivenWidth } from "../util/imageUtil";
import { preload } from "react-dom";
import { useThrottledCallback } from "use-debounce";
import { ChevronLeft, ChevronRight } from "lucide-react";

const db_url = import.meta.env.PUBLIC_API_URL as String

interface CarouselProps {
    photoProject: PhotoProject,
    isFullscreen: boolean,
    imageIndex: number,
    direction: number
    scrollLeft: () => void,
    scrollRight: () => void,
    toggleModal: () => void,
    prevProject: AdjacentProject,
    nextProject: AdjacentProject,
    onFirstImageReady?: () => void,
}

const ImageCarouselReact = ({ photoProject, isFullscreen, imageIndex, direction, scrollLeft, scrollRight, toggleModal, prevProject, nextProject, onFirstImageReady }: CarouselProps) => {

    const [isClickBlocked, setIsClickBlocked] = useState(false)
    const [isImageLoaded, setIsImageLoaded] = useState<Map<ImageWrapper, Boolean>>(new Map(photoProject.images.map(img => [img, false])))
    const [showBlurImage, setShowBlurImage] = useState(false)
    const imageWidthScaling = isFullscreen ? "100vw" : "60vw"

    const totalImages = photoProject.images.length;
    const isOnPrevCard = imageIndex === -1;
    const isOnNextCard = imageIndex === totalImages;
    const isOnCard = isOnPrevCard || isOnNextCard;

    /**
     * @todo setup proper caching tags in response headers in cloudflare when hosting, for proper preloading
     */

    // Guard preloading: only access photoProject.images for valid indices
    const clampedIndex = Math.max(0, Math.min(imageIndex, totalImages - 1));
    const currImgWrapper = photoProject.images[clampedIndex];

    if (!isOnCard) {
        const shouldPreloadPrev = imageIndex > 0;
        const shouldPreloadNext = imageIndex < totalImages - 1;

        if (shouldPreloadPrev) {
            const prevImgWrapper = photoProject.images[imageIndex - 1];
            const img = new Image();
            img.src = db_url + prevImgWrapper.image.url;
            img.srcset = getImageSrcSet(db_url, prevImgWrapper);
            img.sizes = imageWidthScaling;
            preload(db_url + prevImgWrapper.image.sizes.tinyPreview.url, { as: "image" });
        }

        if (shouldPreloadNext) {
            const nextImgWrapper = photoProject.images[imageIndex + 1];
            const img2 = new Image();
            img2.src = db_url + nextImgWrapper.image.url;
            img2.srcset = getImageSrcSet(db_url, nextImgWrapper);
            img2.sizes = imageWidthScaling;
            preload(db_url + nextImgWrapper.image.sizes.tinyPreview.url, { as: "image" });
        }

        // Preload current image tiny preview
        preload(db_url + currImgWrapper.image.sizes.tinyPreview.url, { as: "image" });
    }

    // Preload adjacent project thumbnail when near the boundary
    if (imageIndex === 0) preload(prevProject.thumbnailUrl, { as: "image" });
    if (imageIndex === totalImages - 1) preload(nextProject.thumbnailUrl, { as: "image" });

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


    const adjacentProject = isOnPrevCard ? prevProject : nextProject;

    return (
        <>
            <div className={`flex flex-col justify-center items-center relative cursor-none w-full overflow-x-hidden`}
                onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
            >

                <button
                    className={`absolute left-0 w-1/3 z-5 h-full cursor-none invisible lg:visible`}
                    onClick={isOnPrevCard
                        ? () => document.getElementById(`project-link-${prevProject.slug}`)?.click()
                        : throttledScrollLeft}
                    onPointerOver={() => CustomCursor.setCursorType({ type: "arrowLeft" })}
                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                />

                <div className={`flex items-center justify-center ${isFullscreen ? "h-[95vh]" : "h-[70vh]"} w-full `}
                    onPointerOver={isOnCard ? undefined : (isFullscreen ? () => CustomCursor.setCursorType({ type: "zoomOut" }) : () => CustomCursor.setCursorType({ type: "zoomIn" }))}
                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                    onClick={!isClickBlocked && !isOnCard ? () => toggleModal() : undefined}
                >

                    <AnimatePresence
                        mode="wait"
                        custom={direction}
                        initial={false}
                    >
                        {isOnCard ? (
                            /* Next/Previous project card */
                            <motion.div
                                key={isOnPrevCard ? "prev-card" : "next-card"}
                                className="relative flex-1 w-full h-full flex flex-col items-center justify-center select-none"

                                custom={direction}
                                variants={imageCarouselSliderVariants}
                                initial="incoming"
                                animate="active"
                                exit="exit"
                                transition={{ duration: 0.18, ease: "easeInOut" }}

                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={(_, { offset }) => {
                                    if (isOnPrevCard && offset.x > 100) {
                                        document.getElementById(`project-link-${prevProject.slug}`)?.click();
                                    } else if (isOnNextCard && offset.x < -100) {
                                        document.getElementById(`project-link-${nextProject.slug}`)?.click();
                                    } else if (isOnPrevCard && offset.x < -100) {
                                        scrollRight();
                                    } else if (isOnNextCard && offset.x > 100) {
                                        scrollLeft();
                                    }
                                }}
                            >
                                <a
                                    id={`project-link-${adjacentProject.slug}`}
                                    href={`/projects/${adjacentProject.slug}`}
                                    className="flex flex-col lg:flex-row items-center gap-6 lg:gap-16 cursor-none group px-6"
                                    onPointerOver={() => CustomCursor.setCursorType({ type: "default" })}
                                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                                >
                                    {/* Thumbnail image */}
                                    <div className={`overflow-hidden ${isOnPrevCard ? "lg:order-1" : "lg:order-2"}`}>
                                        <img
                                            src={adjacentProject.thumbnailUrl}
                                            alt={adjacentProject.title}
                                            className="max-h-[50vh] object-contain opacity-70 group-hover:opacity-100 scale-100 group-hover:scale-[1.03] transition-all duration-500"
                                            style={{ viewTransitionName: `project-${adjacentProject.slug}` }}
                                            draggable={false}
                                        />
                                    </div>

                                    {/* Typography stack */}
                                    <div className={`flex flex-col items-center lg:items-start gap-4 ${isOnPrevCard ? "lg:order-2" : "lg:order-1"}`}>
                                        <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-500/80 flex items-center gap-2">
                                            {isOnPrevCard && <ChevronLeft size={12} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform duration-300" />}
                                            {isOnPrevCard ? "Previous Project" : "Next Project"}
                                            {isOnNextCard && <ChevronRight size={12} strokeWidth={2} className="group-hover:translate-x-1 transition-transform duration-300" />}
                                        </span>

                                        <div className="h-px bg-neutral-600/50 w-12 group-hover:w-20 transition-all duration-500" />

                                        <span className="text-lg font-['Bodoni_Moda'] italic text-neutral-400 group-hover:text-[#cd5c5c] transition-colors duration-300">
                                            {adjacentProject.title}
                                        </span>
                                    </div>
                                </a>
                            </motion.div>
                        ) : (
                            /* Image slide */
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
                                        if (imageIndex === 0 && onFirstImageReady) {
                                            onFirstImageReady();
                                        }
                                    }}
                                />

                            </motion.div>
                        )}

                    </AnimatePresence>

                </div>

                <button
                    className={`absolute right-0 w-1/3 z-5 h-full cursor-none invisible lg:visible `}
                    onClick={isOnNextCard
                        ? () => document.getElementById(`project-link-${nextProject.slug}`)?.click()
                        : throttledScrollRight}
                    onPointerOver={() => CustomCursor.setCursorType({ type: "arrowRight" })}
                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                />

                {!isOnCard && (
                    <div className="py-2 w-full flex justify-center items-center">
                        {`${imageIndex + 1} / ${photoProject.images.length}`}
                    </div>
                )}

            </div >
        </>
    );
};

export default ImageCarouselReact;
