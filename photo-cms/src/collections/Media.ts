import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!req.file) return data

        try {
          const exifr = (await import('exifr')).default
          const parsed = await exifr.parse(req.file.data, {
            pick: ['Make', 'Model', 'LensModel', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO'],
          })

          if (parsed) {
            data.exif = {
              cameraMake: parsed.Make ?? null,
              cameraModel: parsed.Model ?? null,
              lens: parsed.LensModel ?? null,
              focalLength: parsed.FocalLength ?? null,
              aperture: parsed.FNumber ?? null,
              shutterSpeed: parsed.ExposureTime ?? null,
              iso: parsed.ISO ?? null,
            }
          }
        } catch {
          // Image has no EXIF or parsing failed
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'exif',
      type: 'group',
      admin: {
        description: 'Automatically extracted from uploaded image.',
        condition: (data) =>
          Boolean(data?.exif?.cameraMake || data?.exif?.cameraModel),
      },
      fields: [
        { name: 'cameraMake', type: 'text', admin: { readOnly: true } },
        { name: 'cameraModel', type: 'text', admin: { readOnly: true } },
        { name: 'lens', type: 'text', admin: { readOnly: true } },
        { name: 'focalLength', type: 'number', admin: { readOnly: true } },
        { name: 'aperture', type: 'number', admin: { readOnly: true } },
        { name: 'shutterSpeed', type: 'number', admin: { readOnly: true } },
        { name: 'iso', type: 'number', admin: { readOnly: true } },
      ],
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

