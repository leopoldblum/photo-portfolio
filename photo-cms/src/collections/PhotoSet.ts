import type { CollectionConfig } from 'payload';

export const PhotoSet: CollectionConfig = {
    slug: 'photoSet',

    admin: {
        useAsTitle: 'project',
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
            label: 'Choose the Project: ',
        },
        {
            name: 'images',
            type: 'array',
            label: 'Upload the Picture(s): ',
            required: true,
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,
                },
                {
                    name: "isThumbnail",
                    type: "checkbox",
                    label: "Display this Picture on front page? (up to 2 in total)"
                }
            ],
            validate: (pics) => {
                const thumbnails: any = pics?.filter((pic: any) => pic.isThumbnail === true);
                if (thumbnails?.length > 2) {
                    return ("You can only select up to 2 thumbnails")
                }
                return true;
            }
        },
    ],
};