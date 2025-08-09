import type { CollectionConfig } from 'payload'
import slugify from 'slugify';

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
            name: "description",
            type: "text",
            required: false,
        },
        {
            name: 'slugTitle',
            label: "URL Ending",
            type: 'text',
            unique: true,
            required: true,
            admin: {
                readOnly: true,
            },
        },
    ],
    hooks: {
        beforeChange: [
            ({ data }) => {
                if (data.title) {
                    data.slugTitle = slugify(data.title, { lower: true, strict: true });
                }
                return data;
            },
        ],
    },
}
