import { GlobalConfig } from "payload";

export const WebsiteLayout: GlobalConfig = {
    slug: "websiteLayout",

    access: {
        read: () => true,
    },

    fields: [
        {
            name: 'siteMetadata',
            type: 'group',
            admin: {
                description: 'SEO defaults for the homepage and site-wide meta tags.',
            },
            fields: [
                {
                    name: 'siteName',
                    type: 'text',
                    defaultValue: 'LB Fotos',
                },
                {
                    name: 'siteDescription',
                    type: 'textarea',
                },
            ],
        },
        {
            name: "photoProjects",
            type: "array",
            admin: {
                description: "Pick your projects and organize them in display order, starting from the top.",
                components: {
                    RowLabel: '@/components/ProjectRowLabel',
                },
            },
            fields: [
                {
                    name: "photoProject",
                    type: "relationship",
                    relationTo: "photo-projects",
                    required: true,
                    label: "Select a project:",
                    admin: {
                        width: "40%",
                        components: {
                            Field: '@/components/ProjectPicker',
                        },
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
                    return 'Duplicate projects are not allowed.'
                }

                return true
            }

        },
    ],
}
