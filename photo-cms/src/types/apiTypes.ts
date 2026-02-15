/**
 * API response types derived from Payload's auto-generated types.
 *
 * These represent the shape of REST API responses when relationships are
 * fully populated (?depth=N). Run `npm run generate:types` after changing
 * any collection schema — these types will update automatically.
 */
import type {
  Media as PayloadMedia,
  PhotoProject as PayloadPhotoProject,
  WebsiteLayout as PayloadWebsiteLayout,
} from '../payload-types'

/** Make every property required and strip `| null`. */
type Strict<T> = {
  [K in keyof T]-?: NonNullable<T[K]>
}

// -- Image sizes --

type PayloadSizes = NonNullable<PayloadMedia['sizes']>

export type ImageSize = Strict<NonNullable<PayloadSizes[keyof PayloadSizes]>>

export type AvailableSizes = { [K in keyof PayloadSizes]-?: ImageSize }

// -- Image (populated Media with all sizes present) --

export type Image = Strict<Omit<PayloadMedia, 'sizes' | 'thumbnailURL'>> & {
  thumbnailURL: string | null
  sizes: AvailableSizes
}

// -- Image entry within a PhotoProject --

export type ImageWrapper = {
  image: Image
  isThumbnail: boolean
  id: string
}

// -- PhotoProject (with populated images) --

export type PhotoProject = Strict<Omit<PayloadPhotoProject, 'images' | 'description'>> & {
  description?: string
  images: ImageWrapper[]
}

// -- WebsiteLayout wrappers --

export type PhotoProjectWrapper = {
  photoProject: PhotoProject
  id: string
}

export type SiteMetadata = {
  siteName?: string | null
  siteDescription?: string | null
}

export type WebsiteLayout = Strict<Omit<PayloadWebsiteLayout, 'photoProjects' | 'siteMetadata'>> & {
  globalType: string
  siteMetadata?: SiteMetadata
  photoProjects: PhotoProjectWrapper[]
}
