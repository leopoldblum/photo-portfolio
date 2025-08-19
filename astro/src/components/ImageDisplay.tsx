import { preload } from "react-dom";
import type { Photoset, ImageWrapper, AvailableSizes, Image } from "../../../photo-cms/src/types/apiTypes.js";
import { CustomCursor } from "./CustomCursor.tsx";
import { AnimatePresence, easeIn, motion } from "motion/react"
import { getImageSrcSet } from "../util/imageUtil.tsx";


const db_url = import.meta.env.PUBLIC_API_URL as String
const main_url = import.meta.env.PUBLIC_BASE_URL


const ImageDisplay = ({ photoSet }: { photoSet: Photoset }) => {

    const thumbnails = photoSet.images.filter((image) => image.isThumbnail);
    const projectTitle = photoSet.project.title

    const basePicture = thumbnails[0].image;

    return (
        <div className="flex flex-col py-0.5 lg:py-1 cursor-none"
            onMouseOver={() => CustomCursor.setCursorType({ type: "displayTitle", displayText: projectTitle })}
            onMouseLeave={() => CustomCursor.setCursorType({ type: "default" })}
        >

            <div className="flex justify-center items-center gap-1 lg:gap-2">
                {
                    thumbnails.map((thumbnailImg) => (
                        <motion.div className="transition-all duration-300 ring-neutral-400 hover:ring-0 hover:ring-offset-3 ring-offset-neutral-800/90 overflow-hidden"
                            key={thumbnailImg.id}
                            layout
                        >
                            <a
                                href={`${main_url}/projects/${photoSet.project.slugTitle}`}
                                className="cursor-none"
                            >
                                <img
                                    src={`${db_url}${thumbnailImg.image.url}`}
                                    srcSet={getImageSrcSet(db_url, thumbnailImg)}
                                    sizes="(max-width: 768px) 100vw, 30vw"
                                    className="hover:scale-105 transition-all duration-300 select-none"

                                    alt={thumbnailImg.image.alt}
                                    height={basePicture.height}
                                    width={
                                        (basePicture.height * thumbnailImg.image.width) /
                                        thumbnailImg.image.height
                                    }
                                    loading="lazy"
                                    draggable={false}
                                />
                            </a>
                        </motion.div>
                    ))
                }
            </div>
        </div>
    )
}

export default ImageDisplay