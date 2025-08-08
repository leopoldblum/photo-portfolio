import { useState } from "react";
import type { Photoset } from "../../../photo-cms/src/types/apiTypes";
import { AnimatePresence, motion } from "motion/react"
import { setCursorText } from "../components/CustomCursor";



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
        <div className="">
            <div className="flex items-center justify-center mt-20  w-full relative overflow-x-clip">

                <button className="flex justify-center cursor-none items-center p-5 font-extrabold text-4xl h-full absolute w-1/6 left-0 select-none z-10"
                    onClick={scrollLeft}
                >
                    {`<`}
                </button>

                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.img
                        loading="eager"
                        key={photoSet.images[imageIndex].image.url}
                        src={`http://localhost:3001/${photoSet.images[imageIndex].image.url}`}
                        className="object-contain h-[80vh] w-full z-0"
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
                        onMouseEnter={() => setCursorText(photoSet.project.title)}
                        onMouseLeave={() => setCursorText("O")}
                    />
                </AnimatePresence>

                <button className="flex justify-center cursor-none items-center p-5 font-extrabold text-4xl h-full absolute w-1/6 right-0 select-none z-10"
                    onClick={scrollRight}
                >
                    {`>`}
                </button>

            </div>

            <div className="p-5 font-extrabold flex justify-center items-center mt-5"
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