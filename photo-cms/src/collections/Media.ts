import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    imageSizes: [
      {
        name: "tinyPreview", width: 50, height: undefined, formatOptions: {
          format: "webp", options: {
            quality: 85
          }
        }
      },
      {
        name: "small", width: 800, height: undefined, formatOptions: {
          format: "webp", options: {
            quality: 85,
          }
        }
      },
      {
        name: "res1080", width: 1920, height: undefined, formatOptions: {
          format: "webp", options: {
            quality: 85,
          }
        }
      },
      {
        name: "res1440", width: 2560, height: undefined, formatOptions: {
          format: "webp", options: {
            quality: 85,
          }
        }
      },
      {
        name: "res4k", width: 3840, height: undefined, formatOptions: {
          format: "webp", options: {
            quality: 85,
          }
        }
      },
    ],
    formatOptions: {
      format: "webp", options: {
        quality: 85,
      }
    }
  }
}

