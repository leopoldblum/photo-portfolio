import { useState } from "react";
import type { ImageWrapper } from "../../../photo-cms/src/types/apiTypes";
import { AnimatePresence, motion, spring } from "motion/react"


const ImageCarouselReact = ({ photoSetWrappers }: { photoSetWrappers: ImageWrapper[] }) => {

    const [imageIndex, setImageIndex] = useState(0)
    const [direction, setDirection] = useState(1)

    const scrollLeft = () => {
        setDirection(-1)

        if (imageIndex > 0) setImageIndex(prev => prev - 1)
        else setImageIndex(photoSetWrappers.length - 1)
    }

    const scrollRight = () => {
        setDirection(1)

        if (imageIndex < photoSetWrappers.length - 1) setImageIndex(prev => prev + 1)
        else setImageIndex(0)
    }

    const sliderVariants = {
        incoming: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 0
        }),
        active: { x: 0, opacity: 1 },
        exit: (direction: any) => ({
            x: direction > 0 ? "-100%" : "100%",
            opacity: 0.2
        })
    }


    return (
        <>
            <div className="flex items-center justify-center mt-20 h-[80vh] w-full relative ">

                <div className="flex justify-center items-center cursor-pointer p-5 font-extrabold text-4xl h-full absolute left-0 w-2/6"
                    onClick={scrollLeft}
                >
                    {`<`}
                </div>

                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.img
                        key={photoSetWrappers[imageIndex].image.url}
                        src={`http://localhost:3001/${photoSetWrappers[imageIndex].image.url}`}
                        className="object-contain h-[80vh] w-full"
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
                        }}
                    />
                </AnimatePresence>

                <div className="flex justify-center items-center cursor-pointer p-5 font-extrabold text-4xl h-full absolute right-0 w-2/6"
                    onClick={scrollRight}
                >
                    {`>`}
                </div>

            </div>

            <div className="p-10 font-extrabold flex justify-center items-center  mt-10 mb-20">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={imageIndex}
                        transition={{ duration: 0.3, type: "tween" }}
                    >
                        {`${imageIndex + 1} / ${photoSetWrappers.length}`}
                    </motion.div>
                </AnimatePresence>
                <div>
                    <p>
                    </p>
                </div>
            </div>
        </>

    )
}



export default ImageCarouselReact