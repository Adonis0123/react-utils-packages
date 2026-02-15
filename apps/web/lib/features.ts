export interface FeatureItem {
  key: string
  title: string
  description: string
  href: string
  tags: string[]
}

export const features: FeatureItem[] = [
  {
    key: 'react-layouts',
    title: 'react-layouts',
    description:
      'Runtime-split demo hub for @adonis-kit/react-layouts with dedicated showcase-client and showcase-server pages.',
    href: '/features/react-layouts',
    tags: ['@adonis-kit/react-layouts', 'showcase-client', 'showcase-server'],
  },
  {
    key: 'registry',
    title: 'shadcn Registry',
    description:
      'Public registry endpoints for shadcn CLI downloads, supporting both URL mode and @adonis-kit namespace mode.',
    href: '/registry.json',
    tags: ['shadcn', 'registry', 'distribution'],
  },
]
