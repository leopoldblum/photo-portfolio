import { createContext, useState } from "react";
import type { AvailableSizes, ImageSize, ImageWrapper, Photoset } from "../../../photo-cms/src/types/apiTypes";
import { AnimatePresence, motion } from "motion/react";
import { CustomCursor } from "./CustomCursor";
import ImageCarouselModal from "./ImageCarouselModal";

const db_url = import.meta.env.PUBLIC_API_URL as String

const imageCarouselSliderVariants = {
    incoming: (direction: number) => ({
        x: direction > 0 ? 200 : -200,
        opacity: 0
    }),
    active: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
        x: direction > 0 ? -200 : 200,
        opacity: 0
    })
};

const ImageCarouselReact = ({ photoSet, isFullscreen }: { photoSet: Photoset, isFullscreen: boolean }) => {
    const [imageIndex, setImageIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [showModal, setShowModal] = useState(false)

    const toggleModal = () => {
        if (!isFullscreen) setShowModal(prev => !prev);
    }

    const scrollLeft = () => {
        setDirection(-1);
        setImageIndex(prev => prev > 0 ? prev - 1 : photoSet.images.length - 1);
    };

    const scrollRight = () => {
        setDirection(1);
        setImageIndex(prev => prev < photoSet.images.length - 1 ? prev + 1 : 0);
    };

    const getImageUrl = (dbUrl: String, image: ImageWrapper, sizeName: keyof AvailableSizes) => {
        // idk if this is useful, is the full resolution truly ever needed?
        // if (isFullscreen) return dbUrl + image.image.url
        // else return dbUrl + (image.image.sizes?.[sizeName].url || image.image.url)

        return dbUrl + (image.image.sizes?.[sizeName].url || image.image.url)
    }


    return (
        <>
            <div className={`flex flex-col justify-center items-center relative cursor-none w-full overflow-x-hidden`}
                onMouseLeave={() => CustomCursor.setCursorText("")}
            >

                <button
                    className={`absolute left-0 w-1/3 z-5 h-full cursor-none invisible md:visible`}
                    onClick={scrollLeft}
                    onMouseOver={() => CustomCursor.setCursorText("<")}
                    onMouseLeave={() => CustomCursor.setCursorText("")}
                />

                <div className={`flex items-center justify-center ${isFullscreen ? "h-[95vh]" : "h-[70vh]"} w-full`}
                    onMouseOver={isFullscreen ? () => CustomCursor.setCursorText("O") : () => CustomCursor.setCursorText("+")}
                    onMouseLeave={() => CustomCursor.setCursorText("")}
                    onClick={toggleModal}
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
                            drag="x"
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
                    onClick={scrollRight}
                    onMouseOver={() => CustomCursor.setCursorText(">")}
                    onMouseLeave={() => CustomCursor.setCursorText("")}
                />

                <div className="py-2">
                    {`${imageIndex + 1} / ${photoSet.images.length}`}
                </div>


            </div>
            <ImageCarouselModal displayPhotoset={photoSet} isOpen={showModal} toggleFunction={toggleModal} />
        </>
    );
};

export default ImageCarouselReact;
