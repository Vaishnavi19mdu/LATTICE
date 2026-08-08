export interface Building {
  id: string;
  name: string;
  buildingId: string;
  floors: number;
  status: 'operational' | 'alert' | 'emergency';
  address?: string;
}

export const BUILDINGS_LIST: Building[] = [
  { id: 'building_A', name: 'Block A', buildingId: 'building_A', floors: 12, status: 'operational' },
  { id: 'building_B', name: 'Block B', buildingId: 'building_B', floors: 16, status: 'operational' },
  { id: 'building_C', name: 'Block C', buildingId: 'building_C', floors: 8, status: 'operational' },
];
