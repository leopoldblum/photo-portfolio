import { image, main } from "motion/react-client";
import type { ImageWrapper, AvailableSizes, Image } from "../../../photo-cms/src/types/apiTypes";

const sizeBreakpoints: Record<keyof AvailableSizes, number> = {
    small: 800,
    res1080: 1920,
    res1440: 2560,
    res4k: 3840
};

const sizeBreakpoints_2: { size: keyof AvailableSizes; width: number }[] = [
    { size: "small", width: 800 },
    { size: "res1080", width: 1920 },
    { size: "res1440", width: 2560 },
    { size: "res4k", width: 3840 },

]

const getImageUrl = (dbUrl: String, image: ImageWrapper, sizeName: keyof AvailableSizes) => {
    return dbUrl + (image.image.sizes?.[sizeName].url || image.image.url)
}

export const getImageSrcSet = (db_url: String, image: ImageWrapper) => {

    const sizes = image.image.sizes
    if (!sizes) return "";

    return Object.keys(sizes)
        .map(sizeName => {
            const sizeKey = sizeName as keyof AvailableSizes;
            return `${getImageUrl(db_url, image, sizeKey)} ${sizeBreakpoints[sizeKey]}w`;
        }).join(', \n');
}


export const getAllURLs = (db_url: String, imageWrapper: ImageWrapper) => {

    const sizes = imageWrapper.image.sizes
    if (!sizes) return [];

    const sizeLinks = Object.keys(sizes).flatMap(sizeName => {

        if (imageWrapper.image.sizes[sizeName as keyof AvailableSizes].url) {
            return db_url + imageWrapper.image.sizes[sizeName as keyof AvailableSizes].url
        }
        else {
            return [];
        }
    })

    sizeLinks.push(db_url + imageWrapper.image.url)

    return sizeLinks
}

/**
 * 
 * @param image - The image to display.
 * @param clientWidth - The width of the client's viewport (in pixels).
 * @param imageWidthScaler - A number between 0 and 1 representing the fraction of the screen width 
 *   the image should occupy (e.g. `1` = full width, `0.6` = 60% width, `0.2` = 20% width).
 */

export const getImageURLForGivenWidth = (db_url: String, image: ImageWrapper, clientWidth: number, imageWidthScaler: number) => {
    if (imageWidthScaler < 0 || imageWidthScaler > 1) throw Error("The scaler has to be in range 0, ... ,1 .")

    const calcDisplayWidth = clientWidth * imageWidthScaler

    const firstBestSize = sizeBreakpoints_2.find(bp => calcDisplayWidth <= bp.width) ?? sizeBreakpoints_2.find(biggestBP => biggestBP.size === "res4k")!

    // console.log("best size found: ", firstBestSize)

    return getImageUrl(db_url, image, firstBestSize.size)
}