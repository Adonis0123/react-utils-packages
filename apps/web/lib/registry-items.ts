import { readFile } from 'node:fs/promises'
import path from 'node:path'

import 'server-only'

export interface RegistryItem {
  name: string
  title: string
  description: string
}

interface RegistryShape {
  items?: unknown
}

let hasLoggedRegistryReadFailure = false

function toRegistryItems(data: unknown): RegistryItem[] | null {
  if (typeof data !== 'object' || data === null) {
    return null
  }

  const { items } = data as RegistryShape
  if (!Array.isArray(items)) {
    return null
  }

  const normalized = items
    .map((item) => {
      if (typeof item !== 'object' || item === null) {
        return null
      }

      const maybeItem = item as Partial<RegistryItem>
      if (
        typeof maybeItem.name !== 'string'
        || typeof maybeItem.title !== 'string'
        || typeof maybeItem.description !== 'string'
      ) {
        return null
      }

      return {
        name: maybeItem.name,
        title: maybeItem.title,
        description: maybeItem.description,
      } satisfies RegistryItem
    })
    .filter((item): item is RegistryItem => item !== null)

  return normalized.length > 0 ? normalized : null
}

export async function getRegistryItems(): Promise<RegistryItem[]> {
  const cwd = process.cwd()
  const candidates = [
    path.resolve(cwd, '../../registry.json'),
    path.resolve(cwd, 'registry.json'),
    path.resolve(cwd, './registry.json'),
  ]

  const readErrors: string[] = []

  for (const filePath of candidates) {
    try {
      const raw = await readFile(filePath, 'utf-8')
      const parsed = JSON.parse(raw) as unknown
      const items = toRegistryItems(parsed)

      if (items) {
        return items
      }

      readErrors.push(`invalid schema: ${filePath}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      readErrors.push(`${filePath} -> ${message}`)
    }
  }

  if (!hasLoggedRegistryReadFailure) {
    hasLoggedRegistryReadFailure = true
    console.error('[registry-items] Failed to load registry items from all candidates.', {
      cwd,
      candidates,
      readErrors,
    })
  }

  return []
}
