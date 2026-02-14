'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useForm, useConfig, useListDrawer, toast } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import styles from './styles.module.css'

type StagedFile = {
  id: string
  file: File
  previewUrl: string
  alt: string
  status: 'staged' | 'uploading' | 'done' | 'error'
  error?: string
}

const BulkImageUpload: UIFieldClientComponent = () => {
  const [files, setFiles] = useState<StagedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { addFieldRow } = useForm()
  const { config } = useConfig()

  const apiRoute = config.routes?.api || '/api'
  const mediaUploadUrl = `${apiRoute}/media`

  // ListDrawer for picking existing Media
  const [ListDrawer, , { openDrawer, closeDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
    selectedCollection: 'media',
  })

  const handleMediaSelect = useCallback(
    ({ doc }: { collectionSlug: string; doc: Record<string, unknown> }) => {
      addFieldRow({
        path: 'images',
        schemaPath: 'images',
        subFieldState: {
          image: { value: doc.id as string, initialValue: doc.id as string, valid: true },
          isThumbnail: { value: false, initialValue: false, valid: true },
        },
      })
      toast.success(`Added: ${(doc.filename as string) || doc.id}`)
      closeDrawer()
    },
    [addFieldRow, closeDrawer],
  )

  const handleMediaBulkSelect = useCallback(
    (selected: Map<number | string, boolean>) => {
      let count = 0
      for (const [id, isSelected] of selected) {
        if (isSelected) {
          addFieldRow({
            path: 'images',
            schemaPath: 'images',
            subFieldState: {
              image: {
                value: id as string,
                initialValue: id as string,
                valid: true,
              },
              isThumbnail: { value: false, initialValue: false, valid: true },
            },
          })
          count++
        }
      }
      if (count > 0) toast.success(`Added ${count} image${count !== 1 ? 's' : ''} from Media`)
      closeDrawer()
    },
    [addFieldRow, closeDrawer],
  )

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.previewUrl))
    }
  }, [])

  const stageFiles = useCallback((incoming: File[]) => {
    const imageFiles = incoming.filter((f) => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return

    const staged: StagedFile[] = imageFiles.map((file, i) => ({
      id: `file-${Date.now()}-${i}`,
      file,
      previewUrl: URL.createObjectURL(file),
      alt: '',
      status: 'staged' as const,
    }))

    setFiles((prev) => [...prev, ...staged])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) URL.revokeObjectURL(file.previewUrl)
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const updateAlt = useCallback((id: string, alt: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, alt } : f)))
  }, [])

  const uploadAll = useCallback(async () => {
    const staged = files.filter((f) => f.status === 'staged')
    if (staged.length === 0) return

    setIsUploading(true)

    for (const item of staged) {
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading' as const } : f)),
      )

      try {
        // Upload to Media
        const formData = new FormData()
        formData.append('file', item.file)
        formData.append('_payload', JSON.stringify({ alt: item.alt }))

        const response = await fetch(mediaUploadUrl, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body?.errors?.[0]?.message || `Upload failed (${response.status})`)
        }

        const data = await response.json()
        const mediaId = data.doc.id

        // Add row to images array
        addFieldRow({
          path: 'images',
          schemaPath: 'images',
          subFieldState: {
            image: { value: mediaId, initialValue: mediaId, valid: true },
            isThumbnail: { value: false, initialValue: false, valid: true },
          },
        })

        setFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'done' as const } : f)),
        )
        toast.success(`Uploaded: ${item.file.name}`)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: 'error' as const, error: message } : f,
          ),
        )
        toast.error(`Failed: ${item.file.name} — ${message}`)
      }
    }

    setIsUploading(false)
  }, [files, mediaUploadUrl, addFieldRow])

  const clearDone = useCallback(() => {
    setFiles((prev) => {
      prev.filter((f) => f.status === 'done').forEach((f) => URL.revokeObjectURL(f.previewUrl))
      return prev.filter((f) => f.status !== 'done')
    })
  }, [])

  // Drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      stageFiles(Array.from(e.dataTransfer.files))
    },
    [stageFiles],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      stageFiles(Array.from(e.target.files || []))
      e.target.value = ''
    },
    [stageFiles],
  )

  const staged = files.filter((f) => f.status === 'staged')
  const stagedCount = staged.length
  const missingAlt = staged.some((f) => !f.alt.trim())
  const doneCount = files.filter((f) => f.status === 'done').length

  return (
    <div className={styles.wrapper}>
      {/* Dropzone */}
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        <p className={styles.dropzoneLabel}>Drag & drop images here, or click to browse</p>
        <p className={styles.hint}>Add your images, fill in alt text, then upload them all at once</p>
        <button
          type="button"
          className={styles.chooseBtn}
          onClick={(e) => {
            e.stopPropagation()
            openDrawer()
          }}
        >
          Choose from existing Media
        </button>
      </div>

      <ListDrawer
        onSelect={handleMediaSelect}
        onBulkSelect={handleMediaBulkSelect}
        enableRowSelections
        collectionSlugs={['media']}
        allowCreate={false}
      />

      {/* Staged files list */}
      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((item) => (
            <div
              key={item.id}
              className={`${styles.fileRow} ${item.status === 'done' ? styles.fileRowDone : ''} ${item.status === 'error' ? styles.fileRowError : ''}`}
            >
              <img src={item.previewUrl} alt="" className={styles.thumb} />
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{item.file.name}</span>
                {item.status === 'staged' ? (
                  <input
                    type="text"
                    className={`${styles.altInput} ${!item.alt.trim() ? styles.altInputEmpty : ''}`}
                    placeholder="Alt text (required)"
                    value={item.alt}
                    onChange={(e) => updateAlt(item.id, e.target.value)}
                  />
                ) : (
                  <span className={styles.altText}>{item.alt}</span>
                )}
              </div>
              <div className={styles.fileActions}>
                {item.status === 'staged' && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeFile(item.id)}
                    title="Remove"
                  >
                    &times;
                  </button>
                )}
                {item.status === 'uploading' && (
                  <span className={styles.statusUploading}>Uploading...</span>
                )}
                {item.status === 'done' && <span className={styles.statusDone}>Done</span>}
                {item.status === 'error' && (
                  <span className={styles.statusError}>{item.error}</span>
                )}
              </div>
            </div>
          ))}

          {/* Action buttons */}
          <div className={styles.actions}>
            {stagedCount > 0 && (
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={uploadAll}
                disabled={isUploading || missingAlt}
                title={missingAlt ? 'All images need alt text' : undefined}
              >
                {isUploading
                  ? 'Uploading...'
                  : `Upload ${stagedCount} image${stagedCount !== 1 ? 's' : ''}`}
              </button>
            )}
            {doneCount > 0 && !isUploading && (
              <button type="button" className={styles.clearBtn} onClick={clearDone}>
                Clear completed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BulkImageUpload
