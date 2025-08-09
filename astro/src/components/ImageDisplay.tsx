import type { Photoset } from "../../../photo-cms/src/types/apiTypes.ts";
import { CustomCursor } from "./CustomCursor.tsx";

const ImageDisplay = ({ photoSet }: { photoSet: Photoset }) => {

    const thumbnails = photoSet.images.filter((image) => image.isThumbnail);
    const projectTitle = photoSet.project.title

    const basePicture = thumbnails[0].image;

    return (
        <div className="flex flex-col py-0.5 lg:py-1">

            <div className="flex justify-center items-center gap-1 lg:gap-2">
                {
                    thumbnails.map((thumbnailImg, index) => (
                        <div className="transition-all duration-300 ring-neutral-600 hover:ring-3 cursor-none"
                            key={thumbnailImg.id}
                            onMouseOver={() => CustomCursor.setCursorText(projectTitle)}
                            onMouseLeave={() => CustomCursor.setCursorText("")}
                        >
                            <img
                                src={`http://localhost:3001/${thumbnailImg.image.url}`}
                                alt={thumbnailImg.image.alt}
                                height={basePicture.height}
                                width={
                                    (basePicture.height * thumbnailImg.image.width) /
                                    thumbnailImg.image.height
                                }
                                loading={index < 2 ? "eager" : "lazy"}
                                draggable={false}
                            />
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default ImageDisplay