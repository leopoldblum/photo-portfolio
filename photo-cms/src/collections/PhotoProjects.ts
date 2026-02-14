import { CollectionConfig } from "payload";
import slugify from "slugify";

export const PhotoProjects: CollectionConfig = {
    slug: "photo-projects",
    admin: {
        useAsTitle: "title",
        defaultColumns: ['title', 'thumbnail', 'date'],
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            type: 'ui',
            name: 'thumbnail',
            label: ' ',
            admin: {
                components: {
                    Cell: '@/components/ThumbnailCell',
                },
            },
        },
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
                    type: "textarea",
                    required: false,
                    admin: {
                        width: "75%",
                    }
                },
                {
                    name: "slug",
                    label: "URL Ending",
                    type: "text",
                    unique: true,
                    required: true,
                    admin: {
                        readOnly: true,
                        width: "25%",
                    },
                },
            ]
        },
        {
            type: 'ui',
            name: 'bulkUpload',
            label: 'Bulk Image Upload',
            admin: {
                components: {
                    Field: '@/components/BulkImageUpload',
                },
            },
        },
        {
            name: "images",
            type: "array",
            label: "Project Images",
            admin: {
                description: "Upload the Picture(s) and choose 1 – 5 thumbnails which get displayed on the main page.",
                initCollapsed: true,
                components: {
                    RowLabel: '@/components/ImageRowLabel',
                },
            },
            fields: [
                {
                    name: "image",
                    type: "upload",
                    relationTo: "media",
                    required: true,
                    displayPreview: true,
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
                const thumbnails = pics?.filter((pic: { isThumbnail?: boolean }) => pic.isThumbnail);
                if (thumbnails.length > 5) return ("A project can have at most 5 thumbnails.")
                if (thumbnails.length === 0) return ("Select at least 1 thumbnail.")
                return true;
            }
        },
    ],
    hooks: {
        beforeChange: [
            ({ data }) => {
                if (data.title) {
                    data.slug = slugify(data.title, { lower: true, strict: true });
                }
                return data;
            },
        ],
    },
};
