import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
    slug: 'projects',
    admin: {
        useAsTitle: "title",
    },

    access: {
        read: () => true,
    },

    fields: [
        {
            name: "title",
            type: "text",
            required: true,
        },
        {
            name: "description",
            type: "text",
            required: false,
        },
        {
            name: "date",
            type: "date",
            required: true,
            label: "When was this project done?"
        }
    ],
}
