'use client'

import React, { useState, useEffect } from 'react'
import { useRowLabel, useConfig } from '@payloadcms/ui'

type ProjectRow = {
  photoProject?: string | null
}

const ProjectRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<ProjectRow>()
  const { config } = useConfig()
  const [title, setTitle] = useState<string | null>(null)

  const apiRoute = config.routes?.api || '/api'
  const projectId = data?.photoProject

  useEffect(() => {
    if (!projectId) {
      setTitle(null)
      return
    }

    const fetchTitle = async () => {
      try {
        const res = await fetch(`${apiRoute}/photo-projects/${projectId}?depth=0`, {
          credentials: 'include',
        })
        const doc = await res.json()
        setTitle(doc.title || null)
      } catch {
        setTitle(null)
      }
    }

    fetchTitle()
  }, [apiRoute, projectId])

  return <span>{title || `Project ${(rowNumber ?? 0) + 1}`}</span>
}

export default ProjectRowLabel
