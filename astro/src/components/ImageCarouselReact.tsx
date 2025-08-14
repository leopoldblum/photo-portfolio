import { useEffect, useState } from "react";
import type { Photoset } from "../../../photo-cms/src/types/apiTypes";
import { AnimatePresence, motion } from "motion/react";
import { CustomCursor } from "./CustomCursor";

const db_url = import.meta.env.PUBLIC_API_URL

const sliderVariants = {
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

const ImageCarouselReact = ({ photoSet }: { photoSet: Photoset }) => {
    const [imageIndex, setImageIndex] = useState(0);
    const [direction, setDirection] = useState(1);


    const scrollLeft = () => {
        setDirection(-1);
        setImageIndex(prev => prev > 0 ? prev - 1 : photoSet.images.length - 1);
    };

    const scrollRight = () => {
        setDirection(1);
        setImageIndex(prev => prev < photoSet.images.length - 1 ? prev + 1 : 0);
    };

    return (
        <div className="flex flex-col justify-center items-center relative cursor-none w-full overflow-x-hidden bg-orange-200"
            onMouseLeave={() => CustomCursor.setCursorText("")}
        >

            <button
                className={`absolute left-0 w-1/3 z-10 h-full cursor-none invisible md:visible`}
                onClick={scrollLeft}
                onMouseOver={() => CustomCursor.setCursorText("<")}
                onMouseLeave={() => CustomCursor.setCursorText("")}
            />

            <div className="flex items-center justify-center h-[70vh] w-full"
                onMouseOver={() => CustomCursor.setCursorText("+")}
                onClick={() => console.log("open popup")}
            >

                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.img
                        className="object-scale-down flex-1 max-h-[70vh]"

                        loading="eager"
                        key={photoSet.images[imageIndex].image.url}
                        src={`${db_url}${photoSet.images[imageIndex].image.url}`}

                        custom={direction}
                        variants={sliderVariants}
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
                className={`absolute right-0 w-1/3 z-10 h-full cursor-none invisible md:visible `}
                onClick={scrollRight}
                onMouseOver={() => CustomCursor.setCursorText(">")}
                onMouseLeave={() => CustomCursor.setCursorText("")}
            />

            <div className="py-2">
                {`${imageIndex + 1} / ${photoSet.images.length}`}
            </div>
        </div>
    );
};

export default ImageCarouselReact;
