export interface ApiResponse {
    docs: Doc[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
}

export interface Doc {
    createdAt: string;
    updatedAt: string;
    project: Project;
    images: ImageWrapper[];
    id: string;
}

export interface Project {
    createdAt: string;
    updatedAt: string;
    title: string;
    description: string;
    date: string;
    id: string;
}

export interface ImageWrapper {
    image: Image;
    isThumbnail: boolean;
    id: string;
}

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