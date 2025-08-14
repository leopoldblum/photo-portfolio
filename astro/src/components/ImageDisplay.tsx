import type { Photoset } from "../../../photo-cms/src/types/apiTypes.ts";
import { CustomCursor } from "./CustomCursor.tsx";
import { AnimatePresence, easeIn, motion } from "motion/react"


const db_url = import.meta.env.PUBLIC_API_URL
const main_url = import.meta.env.PUBLIC_BASE_URL

const ImageDisplay = ({ photoSet }: { photoSet: Photoset }) => {

    const thumbnails = photoSet.images.filter((image) => image.isThumbnail);
    const projectTitle = photoSet.project.title

    const basePicture = thumbnails[0].image;

    return (
        <div className="flex flex-col py-0.5 lg:py-1 cursor-none"
            onMouseOver={() => CustomCursor.setCursorText(projectTitle)}
            onMouseLeave={() => CustomCursor.setCursorText("")}
        >

            <div className="flex justify-center items-center gap-1 lg:gap-2 ">
                {
                    thumbnails.map((thumbnailImg) => (
                        <motion.div className="transition-all duration-300 ring-neutral-400 hover:ring-0 hover:ring-offset-3 ring-offset-neutral-800/90 lg:hover:scale-98"
                            key={thumbnailImg.id}
                            layout
                        >
                            <a
                                href={`${main_url}projects/${photoSet.project.slugTitle}`}
                                className="cursor-none"
                            >
                                <img
                                    src={`${db_url}${thumbnailImg.image.url}`}

                                    alt={thumbnailImg.image.alt}
                                    height={basePicture.height}
                                    width={
                                        (basePicture.height * thumbnailImg.image.width) /
                                        thumbnailImg.image.height
                                    }
                                    loading="eager"
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