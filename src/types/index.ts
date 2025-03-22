// 모델 카테고리 정의
export enum Category {
  FURNITURE = 'furniture',
  LIGHTING = 'lighting',
  DECORATION = 'decoration',
  FIXTURES = 'fixtures',
  ELECTRONICS = 'electronics',
  KITCHEN = 'kitchen',
  BATHROOM = 'bathroom',
  OUTDOOR = 'outdoor',
}

// 3D 모델 정의
export interface Model {
  id: string;
  name: string;
  category: Category;
  description: string;
  modelPath: string;
  thumbnailUrl: string;
  defaultScale: [number, number, number];
  created: string;
}

// 모델 인스턴스 정의
export interface ModelInstance {
  id: string;
  modelId: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isVisible: boolean;
  isLocked: boolean;
}

// 인테리어 씬 정의
export interface InteriorScene {
  id: string;
  name: string;
  description?: string;
  instances: ModelInstance[];
  roomDimensions: {
    width: number;
    height: number;
    length: number;
  };
  created: string;
  modified: string;
}

// AI 추천 데이터 정의
export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  modelIds: string[];
  confidence: number;
  imageUrl?: string;
  created: string;
}

// Vector3 타입 지원
export type Vector3 = [number, number, number]; 