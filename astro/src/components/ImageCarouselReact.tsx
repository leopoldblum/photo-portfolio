import { useState } from "react";
import type { Photoset } from "../../../photo-cms/src/types/apiTypes";
import { AnimatePresence, motion } from "motion/react"
import { CustomCursor } from "./CustomCursor";



const ImageCarouselReact = ({ photoSet }: { photoSet: Photoset }) => {

    const [imageIndex, setImageIndex] = useState(0)
    const [direction, setDirection] = useState(1)

    const scrollLeft = () => {
        setDirection(-1)

        if (imageIndex > 0) setImageIndex(prev => prev - 1)
        else setImageIndex(photoSet.images.length - 1)
    }

    const scrollRight = () => {
        setDirection(1)

        if (imageIndex < photoSet.images.length - 1) setImageIndex(prev => prev + 1)
        else setImageIndex(0)
    }

    const sliderVariants = {
        incoming: (direction: number) => ({
            x: direction > 0 ? "200px" : "-200px",
            opacity: 0
        }),
        active: { x: 0, opacity: 1 },
        exit: (direction: number) => ({
            x: direction > 0 ? "-200px" : "200px",
            opacity: 0
        })
    }


    return (
        <div className="p-5">
            <div className="flex items-center justify-center w-full relative overflow-x-clip">

                <button className="absolute h-full w-1/3 left-0 z-10 cursor-none invisible md:visible"
                    onClick={scrollLeft}
                    onMouseOver={() => CustomCursor.setCursorText("<")}
                    onMouseLeave={() => CustomCursor.setCursorText("")}
                />

                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.img
                        loading="eager"
                        key={photoSet.images[imageIndex].image.url}
                        src={`http://localhost:3001/${photoSet.images[imageIndex].image.url}`}
                        className="object-contain h-[80vh] w-full z-0 cursor-none"
                        custom={direction}
                        variants={sliderVariants}
                        initial="incoming"
                        animate="active"
                        exit="exit"
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(e, info) => {
                            if (info.offset.x < 100) scrollRight();
                            else if (info.offset.x > -100) scrollLeft();
                        }
                        }
                        onMouseOver={() => CustomCursor.setCursorText("+")}
                        onMouseLeave={() => CustomCursor.setCursorText("")}
                    />
                </AnimatePresence>

                <button className="absolute h-full w-1/3 right-0 z-10 cursor-none invisible md:visible"
                    onClick={scrollRight}
                    onMouseOver={() => CustomCursor.setCursorText(">")}
                    onMouseLeave={() => CustomCursor.setCursorText("")}
                />

            </div>

            <div className="pt-3 font-extrabold flex justify-center items-center"
            >
                <AnimatePresence mode="wait" custom={direction}>
                    <div>
                        {`${imageIndex + 1} / ${photoSet.images.length}`}
                    </div>
                </AnimatePresence>
            </div>
        </div>

    )
}



export default ImageCarouselReact