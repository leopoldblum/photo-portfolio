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
        <div className="py-20 w-full h-full">

            {/* carousel */}
            <div className="flex items-center justify-center relative overflow-x-clip w-full h-full">

                <button className="absolute h-full w-3/7 left-0 z-10 cursor-none invisible md:visible"
                    onClick={scrollLeft}
                    onMouseOver={() => CustomCursor.setCursorText("<")}
                    onMouseLeave={() => CustomCursor.setCursorText("")}
                />

                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.img
                        className="object-contain w-full h-full z-0 cursor-none"
                        loading="eager"
                        key={photoSet.images[imageIndex].image.url}
                        src={`http://localhost:3001/${photoSet.images[imageIndex].image.url}`}

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

                <button className="absolute h-full w-3/7 right-0 z-10 cursor-none invisible md:visible"
                    onClick={scrollRight}
                    onMouseOver={() => CustomCursor.setCursorText(">")}
                    onMouseLeave={() => CustomCursor.setCursorText("")}
                />

            </div>

            {/* counter */}
            <div className="pt-3 font-extrabold flex justify-center items-center">
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