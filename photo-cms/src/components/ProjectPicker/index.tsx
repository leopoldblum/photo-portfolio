'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useField, useConfig, useAllFormFields, FieldLabel } from '@payloadcms/ui'
import type { RelationshipFieldClientComponent } from 'payload'
import styles from './styles.module.css'

type ProjectOption = {
  id: string
  title: string
  date: string
  thumbnailUrl: string | null
}

const ProjectPicker: RelationshipFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const { config } = useConfig()
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const apiRoute = config.routes?.api || '/api'

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${apiRoute}/photo-projects?depth=1&limit=100`, {
          credentials: 'include',
        })
        const data = await res.json()

        const options: ProjectOption[] = data.docs.map((doc: any) => {
          const thumbEntry = doc.images?.find((img: any) => img.isThumbnail)
          const image = thumbEntry?.image
          const thumbnailUrl = image?.sizes?.small?.url || image?.thumbnailURL || null

          return {
            id: doc.id,
            title: doc.title,
            date: doc.date,
            thumbnailUrl,
          }
        })

        setProjects(options)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [apiRoute])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      return () => document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])

  // Collect IDs selected by sibling pickers in the array
  const [fields] = useAllFormFields()
  const siblingSelectedIds = useMemo(() => {
    const ids = new Set<string>()
    for (const [fieldPath, fieldState] of Object.entries(fields)) {
      if (
        fieldPath !== path &&
        fieldPath.match(/^photoProjects\.\d+\.photoProject$/) &&
        fieldState.value
      ) {
        ids.add(fieldState.value as string)
      }
    }
    return ids
  }, [fields, path])

  const selectedProject = projects.find((p) => p.id === value)

  const handleSelect = useCallback(
    (id: string) => {
      setValue(id)
      setIsOpen(false)
    },
    [setValue],
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setValue(null as any)
    },
    [setValue],
  )

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <FieldLabel label={field.label || field.name} required={field.required} path={path} />

      <div
        className={`${styles.selector} ${isOpen ? styles.selectorOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
        role="combobox"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        {selectedProject ? (
          <div className={styles.selected}>
            {selectedProject.thumbnailUrl && (
              <img src={selectedProject.thumbnailUrl} alt="" className={styles.thumb} />
            )}
            <span className={styles.selectedTitle}>{selectedProject.title}</span>
            <button type="button" className={styles.clearBtn} onClick={handleClear} aria-label="Clear selection">
              &times;
            </button>
          </div>
        ) : (
          <span className={styles.placeholder}>
            {isLoading ? 'Loading projects...' : 'Select a project'}
          </span>
        )}
        <svg className={styles.chevron} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          {projects.length === 0 && !isLoading ? (
            <div className={styles.empty}>No projects found</div>
          ) : (
            projects.map((project) => {
              const isTaken = siblingSelectedIds.has(project.id)
              return (
              <div
                key={project.id}
                className={`${styles.option} ${project.id === value ? styles.optionSelected : ''} ${isTaken ? styles.optionTaken : ''}`}
                onClick={() => !isTaken && handleSelect(project.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isTaken) handleSelect(project.id)
                }}
                role="option"
                aria-selected={project.id === value}
                aria-disabled={isTaken}
                tabIndex={isTaken ? -1 : 0}
              >
                <div className={styles.optionThumbWrap}>
                  {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} alt="" className={styles.optionThumb} />
                  ) : (
                    <div className={styles.optionThumbPlaceholder} />
                  )}
                </div>
                <div className={styles.optionInfo}>
                  <span className={styles.optionTitle}>{project.title}</span>
                  {project.date && (
                    <span className={styles.optionDate}>
                      {new Date(project.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectPicker
