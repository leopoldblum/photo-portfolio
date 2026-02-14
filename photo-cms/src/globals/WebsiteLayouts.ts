import { GlobalConfig } from "payload";

export const WebsiteLayout: GlobalConfig = {
    slug: "websiteLayout",

    access: {
        read: () => true,
    },

    fields: [
        {
            name: "photoProjects",
            type: "array",
            admin: {
                description: "Pick your projects and organize them in display order, starting from the top."

            },
            fields: [
                {
                    name: "photoProject",
                    type: "relationship",
                    relationTo: "photo-projects",
                    required: true,
                    label: "Select a project:",
                    admin: {
                        width: "40%"
                    },
                },
            ],
            validate: (photoProjects) => {
                if (!Array.isArray(photoProjects)) return true

                const ids = photoProjects.map((entry) => {
                    const photoProject = (entry as any)?.photoProject
                    return typeof photoProject === 'object' ? photoProject.id : photoProject
                })

                const uniqueIds = new Set(ids)

                if (ids.length !== uniqueIds.size) {
                    return 'you selected duplicate projects'
                }

                return true
            }

        },
    ],
}
