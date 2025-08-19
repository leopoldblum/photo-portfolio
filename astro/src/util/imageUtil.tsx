import { image, main } from "motion/react-client";
import type { ImageWrapper, AvailableSizes, Image } from "../../../photo-cms/src/types/apiTypes";

const sizeBreakpoints: Record<keyof AvailableSizes, number> = {
    small: 800,
    res1080: 1920,
    res1440: 2560,
    res4k: 3840
};

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