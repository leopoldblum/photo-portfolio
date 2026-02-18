import type { AvailableSizes, ImageWrapper, PhotoProject } from "../../../photo-cms/src/types/apiTypes";
import type { AdjacentProject } from "./ImageCarouselWithModal";
import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CustomCursor } from "./CustomCursor";
import { imageCarouselSliderVariants, adjacentCardVariants } from "../util/motionSliderVariants";
import { getImageSrcSet, getAllURLs, getImageURLForGivenWidth } from "../util/imageUtil";
import { preload } from "react-dom";
import { useThrottledCallback } from "use-debounce";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { navigate } from "astro:transitions/client";
import ImageInfoOverlay from "./ImageInfoOverlay";
import { hasAnyExif } from "../util/exifFormatters";

const navigateSlide = (slug: string, dir: 'prev' | 'next') => {
    document.documentElement.dataset.slide = dir;
    navigate(`/projects/${slug}`);
    setTimeout(() => { delete document.documentElement.dataset.slide; }, 600);
};

const db_url = import.meta.env.PUBLIC_API_URL as string

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
    showInfo: boolean,
    onToggleInfo: () => void,
    skipInitialBlur?: boolean,
}

const ImageCarouselReact = ({ photoProject, isFullscreen, imageIndex, direction, scrollLeft, scrollRight, toggleModal, prevProject, nextProject, onFirstImageReady, showInfo, onToggleInfo, skipInitialBlur }: CarouselProps) => {

    const [isInfoHovered, setIsInfoHovered] = useState(false)
    const [isClickBlocked, setIsClickBlocked] = useState(false)
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
    const firstImageShown = useRef(false)
    const blurGracePeriod = useRef(true)
    const imageWidthScaling = isFullscreen ? "100vw" : "60vw"

    const totalImages = photoProject.images.length;
    const isOnPrevCard = imageIndex === -1;
    const isOnNextCard = imageIndex === totalImages;
    const isOnCard = isOnPrevCard || isOnNextCard;

    /**
     * @todo setup proper caching tags in response headers in cloudflare when hosting, for proper preloading
     */

    const clampedIndex = Math.max(0, Math.min(imageIndex, totalImages - 1));
    const currImgWrapper = photoProject.images[clampedIndex];

    // Preload adjacent images and project thumbnails near boundaries
    useEffect(() => {
        if (isOnCard) return;

        if (imageIndex > 0) {
            const prevImgWrapper = photoProject.images[imageIndex - 1];
            preload(db_url + prevImgWrapper.image.url, { as: "image", imageSrcSet: getImageSrcSet(db_url, prevImgWrapper), imageSizes: imageWidthScaling });
            const tinyUrl = prevImgWrapper.image.sizes?.tinyPreview?.url;
            if (tinyUrl) preload(db_url + tinyUrl, { as: "image" });
        }

        if (imageIndex < totalImages - 1) {
            const nextImgWrapper = photoProject.images[imageIndex + 1];
            preload(db_url + nextImgWrapper.image.url, { as: "image", imageSrcSet: getImageSrcSet(db_url, nextImgWrapper), imageSizes: imageWidthScaling });
            const tinyUrl = nextImgWrapper.image.sizes?.tinyPreview?.url;
            if (tinyUrl) preload(db_url + tinyUrl, { as: "image" });
        }

        if (imageIndex === 0) preload(prevProject.thumbnailUrl, { as: "image", imageSrcSet: prevProject.placeholderSrcSet, imageSizes: "60vw" });
        if (imageIndex === totalImages - 1) preload(nextProject.thumbnailUrl, { as: "image", imageSrcSet: nextProject.placeholderSrcSet, imageSizes: "60vw" });
    }, [imageIndex, imageWidthScaling]);

    // Grace period: if image loads within 200ms, use a quick blur fade-out instead of slow crossfade
    useEffect(() => {
        blurGracePeriod.current = true
        const timer = setTimeout(() => { blurGracePeriod.current = false }, 200)
        return () => clearTimeout(timer)
    }, [imageIndex])


    const throttledScrollLeft = useThrottledCallback(scrollLeft, 400, { leading: true, trailing: false })
    const throttledScrollRight = useThrottledCallback(scrollRight, 400, { leading: true, trailing: false })


    const adjacentProject = isOnPrevCard ? prevProject : nextProject;

    // Compute blur/image opacity — extracted for readability
    const isCurrentLoaded = loadedImages.has(currImgWrapper.id)
    const suppressBlur = skipInitialBlur && !firstImageShown.current
    const blurOpacity = suppressBlur ? 0 : (isCurrentLoaded ? 0 : 1)
    const blurFadeDuration = isCurrentLoaded ? (blurGracePeriod.current ? 0.1 : 1.5) : 0.15
    const imageOpacity = suppressBlur ? 1 : (isCurrentLoaded ? 1 : 0)
    const imageFadeDuration = (imageIndex === 0 && !firstImageShown.current) ? 0 : 0.15

    const markLoaded = (imgId: string) => {
        setLoadedImages(prev => {
            if (prev.has(imgId)) return prev
            const next = new Set(prev)
            next.add(imgId)
            return next
        })
    }

    return (
        <>
            <div className={`flex flex-col justify-center items-center relative cursor-none w-full overflow-x-clip`}
                onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
            >

                <button
                    aria-label="Previous image"
                    className={`absolute left-0 w-1/3 z-5 h-full cursor-none invisible lg:visible`}
                    onClick={isOnPrevCard
                        ? () => navigateSlide(prevProject.slug, 'prev')
                        : throttledScrollLeft}
                    onPointerOver={() => CustomCursor.setCursorType({ type: "arrowLeft" })}
                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                />

                <div className={`relative flex items-center justify-center ${isFullscreen ? "h-[95vh]" : "h-[70vh]"} w-full `}
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
                                variants={adjacentCardVariants}
                                initial="incoming"
                                animate="active"
                                exit="exit"
                                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}

                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={(_, { offset }) => {
                                    if (isOnPrevCard && offset.x > 100) {
                                        navigateSlide(prevProject.slug, 'prev');
                                    } else if (isOnNextCard && offset.x < -100) {
                                        navigateSlide(nextProject.slug, 'next');
                                    } else if (isOnPrevCard && offset.x < -100) {
                                        scrollRight();
                                    } else if (isOnNextCard && offset.x > 100) {
                                        scrollLeft();
                                    }
                                }}
                            >
                                <a
                                    href={`/projects/${adjacentProject.slug}`}
                                    className="flex flex-col lg:flex-row items-center gap-6 lg:gap-16 cursor-none group px-6"
                                    onClick={() => {
                                        document.documentElement.dataset.slide = isOnPrevCard ? 'prev' : 'next';
                                        setTimeout(() => { delete document.documentElement.dataset.slide; }, 600);
                                    }}
                                    onPointerOver={() => CustomCursor.setCursorType({ type: "default" })}
                                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                                >
                                    {/* Thumbnail image */}
                                    <div className={`overflow-hidden ${isOnPrevCard ? "lg:order-1" : "lg:order-2"}`}>
                                        <img
                                            src={adjacentProject.thumbnailUrl}
                                            alt={adjacentProject.title}
                                            className="max-h-[50vh] object-contain opacity-70 group-hover:opacity-100 scale-100 group-hover:scale-[1.03] transition-all duration-500"
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

                                        <span className="text-lg font-sans text-neutral-400 group-hover:text-[#cd5c5c] transition-colors duration-300">
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
                                            animate={{ opacity: blurOpacity }}
                                            transition={{ duration: blurFadeDuration, ease: "easeIn" }}
                                        />
                                    </motion.div>
                                </motion.div>

                                {/* real image */}
                                <motion.img
                                    ref={(el) => {
                                        if (el?.complete && !loadedImages.has(currImgWrapper.id)) {
                                            markLoaded(currImgWrapper.id)
                                        }
                                    }}
                                    className="absolute object-contain w-full h-full pointer-events-none"

                                    src={db_url + currImgWrapper.image.url}
                                    srcSet={getImageSrcSet(db_url, photoProject.images[imageIndex])}
                                    sizes={imageWidthScaling}
                                    alt={currImgWrapper.image.alt}
                                    loading="eager"

                                    initial={{ opacity: imageOpacity }}
                                    animate={{ opacity: imageOpacity }}
                                    transition={{ opacity: { duration: imageFadeDuration, ease: "easeIn" } }}

                                    onLoad={(e) => {
                                        markLoaded(currImgWrapper.id)
                                        if (imageIndex === 0 && !firstImageShown.current && onFirstImageReady) {
                                            firstImageShown.current = true;
                                            const imgEl = e.currentTarget as HTMLImageElement;
                                            if (skipInitialBlur && imgEl.decode) {
                                                imgEl.decode().then(() => onFirstImageReady()).catch(() => onFirstImageReady());
                                            } else {
                                                requestAnimationFrame(() => {
                                                    onFirstImageReady();
                                                });
                                            }
                                        }
                                    }}
                                    onError={() => markLoaded(currImgWrapper.id)}
                                />

                            </motion.div>
                        )}

                    </AnimatePresence>

                </div>

                <button
                    aria-label="Next image"
                    className={`absolute right-0 w-1/3 z-5 h-full cursor-none invisible lg:visible `}
                    onClick={isOnNextCard
                        ? () => navigateSlide(nextProject.slug, 'next')
                        : throttledScrollRight}
                    onPointerOver={() => CustomCursor.setCursorType({ type: "arrowRight" })}
                    onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
                />

                {!isOnCard && (
                    <div className="py-2 w-full flex justify-center items-center relative">
                        <span role="status" aria-live="polite" aria-label={`Image ${imageIndex + 1} of ${photoProject.images.length}`}>
                            {`${imageIndex + 1} / ${photoProject.images.length}`}
                        </span>
                        {(currImgWrapper.description || hasAnyExif(currImgWrapper.image.exif)) && (
                            <div
                                className="absolute right-2 top-1/2 -translate-y-1/2 z-20"
                                onMouseEnter={() => setIsInfoHovered(true)}
                                onMouseLeave={() => setIsInfoHovered(false)}
                            >
                                <button
                                    aria-label="Image info"
                                    className={`cursor-none p-3 transition-colors duration-200 ${showInfo || isInfoHovered ? 'text-neutral-300' : 'text-neutral-500 hover:text-neutral-300'}`}
                                    onClick={(e) => { e.stopPropagation(); onToggleInfo(); }}
                                    onPointerOver={() => CustomCursor.setCursorType({ type: "default" })}
                                    onPointerLeave={() => CustomCursor.setCursorType({ type: isFullscreen ? "zoomOut" : "zoomIn" })}
                                >
                                    <Info size={20} />
                                </button>
                                <AnimatePresence>
                                    {(showInfo || isInfoHovered) && (
                                        <ImageInfoOverlay imageWrapper={currImgWrapper} />
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}

            </div >
        </>
    );
};

export default ImageCarouselReact;
