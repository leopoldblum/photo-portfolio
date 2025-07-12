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
            ],
        },
    ],
};