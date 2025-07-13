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
            type: 'row',
            fields: [
                {
                    name: "title",
                    type: "text",
                    required: true,
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
            name: "description",
            type: "text",
            required: false,
        },

    ],
}
