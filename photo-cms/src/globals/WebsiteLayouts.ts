import { GlobalConfig } from "payload";

export const WebsiteLayout: GlobalConfig = {
    slug: "websiteLayout",

    access: {
        read: () => true,
    },

    fields: [
        {
            name: "photosets",
            type: "array",
            admin: {
                description: "Pick your sets and organize them in display order, starting from the top."

            },
            fields: [
                {
                    name: "photoset",
                    type: "relationship",
                    relationTo: "photoSet",
                    required: true,
                    label: "Select a set:",
                    admin: {
                        width: "40%"
                    },
                },
            ],
            validate: (photosets) => {
                if (!Array.isArray(photosets)) return true

                const ids = photosets.map((set) => {
                    const photoset = (set as any)?.photoset
                    return typeof photoset === 'object' ? photoset.id : photoset
                })

                const uniqueIds = new Set(ids)

                if (ids.length !== uniqueIds.size) {
                    return 'you selected duplicate sets'
                }

                return true
            }

        },
    ],
}
