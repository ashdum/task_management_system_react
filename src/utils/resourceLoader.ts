interface ResourceData {
  name: string;
  items: string[];
}

export const loadBackgroundResources = async (): Promise<Record<string, string[]>> => {
  const resources = ['gradients', 'colors', 'images'];
  const backgrounds: Record<string, string[]> = {};

  try {
    await Promise.all(
      resources.map(async (resource) => {
        const response = await fetch(`/src/resources/backgrounds/${resource}.json`);
        const data: ResourceData = await response.json();
        backgrounds[resource] = data.items;
      })
    );
    return backgrounds;
  } catch (error) {
    console.error('Error loading background resources:', error);
    return {
      gradients: [],
      colors: [],
      images: []
    };
  }
};
