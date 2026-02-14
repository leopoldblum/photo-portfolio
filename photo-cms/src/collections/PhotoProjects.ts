import { CollectionConfig } from "payload";
import { ImageWrapper } from '@/types/apiTypes';
import slugify from "slugify";



export const PhotoProjects: CollectionConfig = {
    slug: "photo-projects",
    admin: {
        useAsTitle: "title",
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            type: "row",
            fields: [
                {
                    name: "title",
                    type: "text",
                    required: true,
                    unique: true,
                    admin: {
                        width: "75%",
                    }
                },
                {
                    name: "date",
                    type: "date",
                    required: true,
                    label: "When was this project done?",
                    admin: {
                        width: "25%",
                    }
                },
            ],
        },
        {
            type: "row", fields: [
                {
                    name: "description",
                    type: "text",
                    required: false,
                    admin: {
                        width: "75%",
                    }
                },
                {
                    name: "slugTitle",
                    label: "URL Ending",
                    type: "text",
                    unique: true,
                    // required: true,
                    admin: {
                        readOnly: true,
                        width: "25%",
                    },
                },
            ]
        },
        {
            name: "images",
            type: "array",
            label: "Project Images",
            admin: {
                description: "Upload the Picture(s) and choose 1 – 5 thumbnails which get displayed on the main page.",
            },
            fields: [
                {
                    name: "image",
                    type: "upload",
                    relationTo: "media",
                    label: "Choose or upload your image:",

                },
                {
                    type: "row",
                    fields: [
                        {
                            name: "description",
                            type: "text",
                            label: "Description",
                            admin: {
                                width: "85%",
                            },
                        },
                        {
                            name: "isThumbnail",
                            type: "checkbox",
                            label: "Display as thumbnail?",
                            admin: {
                                width: "15%",
                                style: {
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                },
                            },
                        },
                    ],
                }
            ],
            validate: (pics: any) => {
                const thumbnails: ImageWrapper[] = pics?.filter((pic: ImageWrapper) => pic.isThumbnail);
                if (thumbnails.length > 5) return ("Youre selecting way too many thumbnails lol")
                if (thumbnails.length === 0) return ("You have to pick atleast 1 thumbnail")
                return true;
            }
        },
        {
            name: "thumbnailImages",
            type: "array",
            fields: [
                {
                    name: "image",
                    type: "upload",
                    relationTo: "media",
                },
            ],

        },
    ],
    // hooks: {
    //     beforeChange: [
    //         ({ data }) => {
    //             if (data.title) {
    //                 data.slugTitle = slugify(data.title, { lower: true, strict: true });
    //             }
    //             return data;
    //         },
    //     ],
    // },
};

