import { ImageWrapper } from '@/types/apiTypes';
import type { CollectionConfig } from 'payload';

export const PhotoSet: CollectionConfig = {
    slug: 'photoSet',

    admin: {
        useAsTitle: 'title',
    },

    access: {
        read: () => true,
    },
    fields: [

        {
            name: 'project',
            type: 'relationship',
            relationTo: 'projects',
            required: true,
            label: 'Project: ',
            admin: {
                description: "Choose the associated project",
            }
        },
        {
            name: 'images',
            type: 'array',
            label: 'Pictures',
            required: true,
            admin: {
                description: "Upload the Picture(s) and choose 1 – 5 thumbnails which get displayed on the main page.",
            },
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,
                    displayPreview: true,
                    label: "Pick your image:"

                },
                {
                    name: "isThumbnail",
                    type: "checkbox",
                    label: "choose as thumbnail",
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
            name: 'title',
            type: 'text',
            admin: {
                hidden: true,
            },

            hooks: {
                afterRead: [
                    async ({ data, req }) => {
                        if (data?.project) {
                            try {
                                const project = await req.payload.findByID({
                                    collection: 'projects',
                                    id: data.project
                                });

                                return `set – ${project.title}`;
                            } catch (error) {
                                console.error('Error fetching project:', error);
                                return 'Unknown Project';
                            }
                        }
                        return data?.title || 'Untitled';
                    }
                ],
            },
        },
    ],
};