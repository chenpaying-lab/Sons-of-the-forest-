export interface LocationMarker {
  id: string;
  category: 'cave' | 'team' | 'item' | 'bunker';
  title: string;
  shortDescription: string;
  detailGuide: string;
  requirements: string[];
  rewards: string[];
  danger: number;
  x: number;
  y: number;
}

export interface GuideItem {
  id: string;
  title: string;
  category: string;
  location: string;
  requirements: string[];
  rewards: string[];
  steps: string[];
  notes: string;
  storyRelation: string;
}

export interface StoryNode {
  id: string;
  title: string;
  completed: boolean;
}
