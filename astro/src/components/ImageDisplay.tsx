import type { PhotoProject, ImageWrapper } from "../../../photo-cms/src/types/apiTypes";
import { CustomCursor } from "./CustomCursor.tsx";
import ScrollReveal from "./ScrollReveal.tsx";
import { motion } from "motion/react"
import { getImageSrcSet } from "../util/imageUtil.tsx";


const db_url = import.meta.env.PUBLIC_API_URL as string
const main_url = import.meta.env.PUBLIC_BASE_URL


const ImageDisplay = ({ photoProject }: { photoProject: PhotoProject }) => {

    const thumbnails = photoProject.images.filter((image) => image.isThumbnail);
    if (thumbnails.length === 0) return null;

    const projectTitle = photoProject.title
    const basePicture = thumbnails[0].image;

    return (
        <ScrollReveal
            className="flex flex-col py-0.5 lg:py-1 cursor-none"
            onPointerOver={() => CustomCursor.setCursorType({ type: "displayTitle", displayText: projectTitle })}
            onPointerLeave={() => CustomCursor.setCursorType({ type: "default" })}
        >

            <div className="flex justify-center items-center gap-1 lg:gap-2">
                {
                    thumbnails.map((thumbnailImg, index) => (
                        <motion.div className="transition-all duration-300 ring-neutral-400 hover:ring-0 hover:ring-offset-3 ring-offset-neutral-800/90 overflow-hidden"
                            key={thumbnailImg.id}
                            layout
                        >
                            <a
                                href={`${main_url}/projects/${photoProject.slug}`}
                                className="cursor-none"
                            >
                                <img
                                    src={db_url + thumbnailImg.image.url}
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
        </ScrollReveal>
    )
}

export default ImageDisplay
