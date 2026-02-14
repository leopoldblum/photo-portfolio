'use client'

import React, { useEffect, useState } from 'react'
import { useConfig } from '@payloadcms/ui'
import type { DefaultCellComponentProps } from 'payload'
import styles from './styles.module.css'

type ImageEntry = {
  image?: string | { thumbnailURL?: string | null; url?: string | null }
  isThumbnail?: boolean
}

const ThumbnailCell: React.FC<DefaultCellComponentProps> = ({ rowData }) => {
  const [src, setSrc] = useState<string | null>(null)
  const { config } = useConfig()
  const apiRoute = config.routes?.api || '/api'

  useEffect(() => {
    if (!rowData?.id) return

    fetch(`${apiRoute}/photo-projects/${rowData.id}?depth=1&select[images]=true`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((doc) => {
        const images = doc?.images as ImageEntry[] | undefined
        if (!images?.length) return

        const thumb = images.find((img) => img.isThumbnail) ?? images[0]
        const media = thumb?.image
        if (!media || typeof media === 'string') return

        setSrc(media.thumbnailURL ?? media.url ?? null)
      })
      .catch(() => {})
  }, [rowData?.id, apiRoute])

  if (!src) return <span className={styles.empty}>—</span>

  return <img src={src} alt="" className={styles.thumb} />
}

export default ThumbnailCell
