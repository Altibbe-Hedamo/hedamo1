// Shared honey varieties data for all components
export interface HoneyVariety {
  slug: string;
  name: string;
  description: string;
  originRegion: string;
  isOrganic: boolean;
  farmingMethod: string;
  image: string;
}

export const honeyVarieties: HoneyVariety[] = [
  {
    slug: 'raw-unfiltered-honey',
    name: 'Raw Unfiltered Honey',
    description: 'Pure, unprocessed honey from forest bees.',
    originRegion: 'Nilgiris',
    isOrganic: true,
    farmingMethod: 'Forest Bee Honey',
    image: 'https://i.pinimg.com/1200x/5e/d7/6f/5ed76f528589fcad67a1eef5b69111c7.jpg',
  },
  {
    slug: 'jamun-honey',
    name: 'Jamun Honey',
    description: 'Harvested from Jamun flower nectar.',
    originRegion: 'Western Ghats',
    isOrganic: true,
    farmingMethod: 'Organic Bee Farmed',
    image: 'https://i.pinimg.com/736x/9a/a9/74/9aa9748a496662935befdf290cb88d98.jpg',
  },
  {
    slug: 'wild-harvested-honey',
    name: 'Wild Harvested Honey',
    description: 'Collected from wild hives in the forest.',
    originRegion: 'Assam',
    isOrganic: true,
    farmingMethod: 'Wild Harvested',
    image: 'https://i.pinimg.com/1200x/28/8e/85/288e8577a1ca136775ad743e14ccd487.jpg',
  },
]; 