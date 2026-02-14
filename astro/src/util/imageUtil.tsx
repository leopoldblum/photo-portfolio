import type { ImageWrapper, AvailableSizes } from "../../../photo-cms/src/types/apiTypes";

const sizeBreakpoints: Record<keyof AvailableSizes, number> = {
    tinyPreview: 50,
    small: 800,
    res1080: 1920,
    res1440: 2560,
    res4k: 3840
};

const orderedSizes = (Object.entries(sizeBreakpoints) as [keyof AvailableSizes, number][])
    .filter(([size]) => size !== "tinyPreview")
    .map(([size, width]) => ({ size, width }))

const getImageUrl = (dbUrl: String, image: ImageWrapper, sizeName: keyof AvailableSizes) => {
    return dbUrl + (image.image.sizes?.[sizeName].url || image.image.url)
}

export const getImageSrcSet = (db_url: String, image: ImageWrapper) => {

    const sizes = image.image.sizes
    if (!sizes) return "";

    return orderedSizes
        .map(({ size, width }) => `${getImageUrl(db_url, image, size)} ${width}w`)
        .join(', \n');
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

    const firstBestSize = orderedSizes.find(bp => calcDisplayWidth <= bp.width) ?? orderedSizes.find(biggestBP => biggestBP.size === "res4k")!

    return getImageUrl(db_url, image, firstBestSize.size)
}