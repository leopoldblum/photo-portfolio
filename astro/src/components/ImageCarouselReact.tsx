import type { AvailableSizes, ImageSize, ImageWrapper, Photoset } from "../../../photo-cms/src/types/apiTypes";
import { AnimatePresence, motion } from "motion/react";
import { CustomCursor } from "./CustomCursor";
import { imageCarouselSliderVariants } from "../util/motionSliderVariants";

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

    const getImageUrl = (dbUrl: String, image: ImageWrapper, sizeName: keyof AvailableSizes) => {
        // idk if this is useful, is the full resolution truly ever needed? worst case its really really big and takes ages to load
        // if (isFullscreen) return dbUrl + image.image.url
        // else return dbUrl + (image.image.sizes?.[sizeName].url || image.image.url)

        return dbUrl + (image.image.sizes?.[sizeName].url || image.image.url)
    }

    return (
        <>
            <div className={`flex flex-col justify-center items-center relative cursor-none w-full overflow-x-hidden ${isFullscreen ? "backdrop-blur-xs" : ""} `}
                onMouseLeave={() => CustomCursor.setCursorText("")}
            >

                <button
                    className={`absolute left-0 w-1/3 z-5 h-full cursor-none invisible md:visible`}
                    onClick={() => scrollLeft()}
                    onMouseOver={() => CustomCursor.setCursorText("<")}
                    onMouseLeave={() => CustomCursor.setCursorText("")}
                />

                <div className={`flex items-center justify-center ${isFullscreen ? "h-[95vh]" : "h-[70vh]"} w-full`}
                    onMouseOver={isFullscreen ? () => CustomCursor.setCursorText("O") : () => CustomCursor.setCursorText("+")}
                    onMouseLeave={() => CustomCursor.setCursorText("")}
                    onClick={!isFullscreen ? () => toggleModal() : () => (0)}
                >

                    <AnimatePresence mode="wait" initial={false} custom={direction}>
                        <motion.img
                            className="object-scale-down flex-1 h-full w-full"

                            loading="eager"
                            key={photoSet.images[imageIndex].image.url}
                            src={`${db_url}${photoSet.images[imageIndex].image.url}`}
                            srcSet={
                                `${getImageUrl(db_url, photoSet.images[imageIndex], "small")} 800w, 
                            ${getImageUrl(db_url, photoSet.images[imageIndex], "res1080")} 1920w, 
                            ${getImageUrl(db_url, photoSet.images[imageIndex], "res1440")} 2560w, 
                            ${getImageUrl(db_url, photoSet.images[imageIndex], "res4k")} 3840w
                        `}
                            sizes="100vw"

                            custom={direction}
                            variants={imageCarouselSliderVariants}
                            initial="incoming"
                            animate="active"
                            exit="exit"
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            drag={isFullscreen ? "x" : undefined}
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(e, { offset }) => {
                                if (offset.x < -100) scrollRight();
                                else if (offset.x > 100) scrollLeft();
                            }}

                        />
                    </AnimatePresence>
                </div>

                <button
                    className={`absolute right-0 w-1/3 z-5 h-full cursor-none invisible md:visible `}
                    onClick={() => scrollRight()}
                    onMouseOver={() => CustomCursor.setCursorText(">")}
                    onMouseLeave={() => CustomCursor.setCursorText("")}
                />

                <div className="py-2">
                    {`${imageIndex + 1} / ${photoSet.images.length}`}
                </div>


            </div>
        </>
    );
};

export default ImageCarouselReact;
