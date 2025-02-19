// src/resources/backgrounds.ts
// Predefined background variants organized by category

export interface BackgroundVariant {
  id: string;
  url: string;
  thumbnail: string;
  name: string;
  category: string;
}

export interface BackgroundConfig {
  gradients: BackgroundVariant[];
  nature: BackgroundVariant[];
  abstract: BackgroundVariant[];
  minimal: BackgroundVariant[];
  patterns: BackgroundVariant[];
}

export const PREDEFINED_BACKGROUNDS: BackgroundConfig = {
  gradients: [
    {
      id: 'gradient-1',
      url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=80',
      name: 'Aurora',
      category: 'Gradients',
    },
    {
      id: 'gradient-2',
      url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=200&q=80',
      name: 'Ocean Breeze',
      category: 'Gradients',
    },
    {
      id: 'gradient-3',
      url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=200&q=80',
      name: 'Sunset Glow',
      category: 'Gradients',
    },
  ],
  nature: [
    {
      id: 'nature-1',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&q=80',
      name: 'Mountain Lake',
      category: 'Nature',
    },
    {
      id: 'nature-2',
      url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200&q=80',
      name: 'Forest Path',
      category: 'Nature',
    },
    {
      id: 'nature-3',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=80',
      name: 'Sunlit Forest',
      category: 'Nature',
    },
    {
      id: 'nature-4',
      url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&q=80',
      name: 'Twilight',
      category: 'Nature',
    },
  ],
  abstract: [
    {
      id: 'abstract-1',
      url: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=200&q=80',
      name: 'Fluid Art',
      category: 'Abstract',
    },
    {
      id: 'abstract-2',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80',
      name: 'Geometric Shapes',
      category: 'Abstract',
    },
    {
      id: 'abstract-3',
      url: 'https://images.unsplash.com/photo-1507908708918-778587c9e563?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1507908708918-778587c9e563?w=200&q=80',
      name: 'Color Burst',
      category: 'Abstract',
    },
  ],
  minimal: [
    {
      id: 'minimal-1',
      url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=200&q=80',
      name: 'Simple Geometry',
      category: 'Minimal',
    },
    {
      id: 'minimal-2',
      url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&q=80',
      name: 'Minimalist Pattern',
      category: 'Minimal',
    },
  ],
  patterns: [
    {
      id: 'pattern-1',
      url: 'https://images.unsplash.com/photo-1554755229-ca4470e07232?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1554755229-ca4470e07232?w=200&q=80',
      name: 'Geometric Pattern',
      category: 'Patterns',
    },
    {
      id: 'pattern-2',
      url: 'https://images.unsplash.com/photo-1550537687-c91072c4792d?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1550537687-c91072c4792d?w=200&q=80',
      name: 'Wave Pattern',
      category: 'Patterns',
    },
    {
      id: 'pattern-3',
      url: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?auto=format&fit=crop&w=1350&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=200&q=80',
      name: 'Grid Pattern',
      category: 'Patterns',
    },
  ],
};
