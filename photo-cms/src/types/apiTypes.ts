export interface Image {
    createdAt: string;
    updatedAt: string;
    alt: string;
    filename: string;
    mimeType: string;
    filesize: number;
    width: number;
    height: number;
    focalX: number;
    focalY: number;
    id: string;
    url: string;
    thumbnailURL: string | null;
}

export interface ImageWrapper {
    image: Image;
    isThumbnail: boolean;
    id: string;
}

export interface Project {
    createdAt: string;
    updatedAt: string;
    title: string;
    date: string;
    id: string;
}

export interface Photoset {
    createdAt: string;
    updatedAt: string;
    project: Project;
    images: ImageWrapper[];
    title: string;
    id: string;
}

export interface PhotosetsWrapper {
    photoset: Photoset;
    id: string;
}

export interface WebsiteLayout {
    createdAt: string;
    updatedAt: string;
    globalType: string;
    photosets: PhotosetsWrapper[];
    id: string;
}