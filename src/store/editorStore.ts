'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Model, ModelInstance, InteriorScene, Category, Vector3 } from '../types';

// 기본 씬 생성 함수
const createDefaultScene = (): InteriorScene => ({
  id: uuidv4(),
  name: '새 인테리어',
  instances: [],
  roomDimensions: { width: 10, height: 3, length: 10 },
  created: new Date().toISOString(),
  modified: new Date().toISOString(),
});

// 에디터 스토어 상태 타입 정의
export interface EditorState {
  // 로딩 상태
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  
  // 모델 관련
  models: Model[];
  setModels: (models: Model[]) => void;
  
  // 인스턴스 관련
  instances: ModelInstance[];
  setInstances: (instances: ModelInstance[]) => void;
  addInstance: (instance: Omit<ModelInstance, 'id'>) => string;
  updateInstance: (id: string, updates: Partial<ModelInstance>) => void;
  updateInstanceProperty: (id: string, property: keyof ModelInstance, value: any) => void;
  deleteInstance: (id: string) => void;
  duplicateInstance: (id: string) => string | null;
  
  // 선택 관련
  selectedInstanceId: string | null;
  selectInstance: (id: string | null) => void;
  
  // 편집 모드
  editMode: 'translate' | 'rotate' | 'scale';
  setEditMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  
  // 씬 관련
  roomDimensions: { width: number; height: number; length: number };
  updateRoomDimensions: (dimensions: { width?: number; height?: number; length?: number }) => void;
  
  // 씬 저장/로드
  currentScene: InteriorScene | null;
  saveScene: (name: string, description?: string) => string;
  loadScene: (scene: InteriorScene) => void;
}

// 에디터 스토어 생성
export const useEditorStore = create<EditorState>((set) => ({
  // 로딩 상태
  isLoading: false,
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  // 모델 관련
  models: [],
  setModels: (models: Model[]) => set({ models }),
  
  // 인스턴스 관련
  instances: [],
  setInstances: (instances: ModelInstance[]) => set({ instances }),
  addInstance: (instance: Omit<ModelInstance, 'id'>) => {
    const id = uuidv4();
    set((state: EditorState) => ({
      instances: [...state.instances, { id, ...instance }],
      selectedInstanceId: id, // 새로 추가된 인스턴스 선택
    }));
    return id;
  },
  updateInstance: (id: string, updates: Partial<ModelInstance>) => {
    set((state: EditorState) => ({
      instances: state.instances.map((instance: ModelInstance) => 
        instance.id === id ? { ...instance, ...updates } : instance
      ),
    }));
  },
  updateInstanceProperty: (id: string, property: keyof ModelInstance, value: any) => {
    set((state: EditorState) => ({
      instances: state.instances.map((instance: ModelInstance) => 
        instance.id === id ? { ...instance, [property]: value } : instance
      ),
    }));
  },
  deleteInstance: (id: string) => {
    set((state: EditorState) => ({
      instances: state.instances.filter((instance) => instance.id !== id),
      selectedInstanceId: state.selectedInstanceId === id ? null : state.selectedInstanceId,
    }));
  },
  duplicateInstance: (id: string) => {
    const instanceToDuplicate = useEditorStore.getState().instances.find(
      (instance) => instance.id === id
    );
    
    if (!instanceToDuplicate) return null;
    
    const newId = uuidv4();
    const newPosition: Vector3 = [
      instanceToDuplicate.position[0] + 0.5,
      instanceToDuplicate.position[1],
      instanceToDuplicate.position[2] + 0.5,
    ];
    
    const newInstance: ModelInstance = {
      ...instanceToDuplicate,
      id: newId,
      name: `${instanceToDuplicate.name} (복제)`,
      position: newPosition,
    };
    
    set((state: EditorState) => ({
      instances: [...state.instances, newInstance],
      selectedInstanceId: newId,
    }));
    
    return newId;
  },
  
  // 선택 관련
  selectedInstanceId: null,
  selectInstance: (id: string | null) => set({ selectedInstanceId: id }),
  
  // 편집 모드
  editMode: 'translate',
  setEditMode: (mode: 'translate' | 'rotate' | 'scale') => set({ editMode: mode }),
  
  // 씬 관련
  roomDimensions: { width: 10, height: 3, length: 10 },
  updateRoomDimensions: (dimensions: { width?: number; height?: number; length?: number }) => 
    set((state: EditorState) => ({
      roomDimensions: { ...state.roomDimensions, ...dimensions },
    })),
  
  // 씬 저장/로드
  currentScene: null,
  saveScene: (name: string, description?: string) => {
    const id = uuidv4();
    const scene: InteriorScene = {
      id,
      name,
      description,
      instances: useEditorStore.getState().instances,
      roomDimensions: useEditorStore.getState().roomDimensions,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };
    
    set({ currentScene: scene });
    
    // 여기에 원격 저장 로직 추가 가능
    
    return id;
  },
  loadScene: (scene: InteriorScene) => {
    set({
      instances: scene.instances,
      roomDimensions: scene.roomDimensions,
      currentScene: {
        ...scene,
        modified: new Date().toISOString(),
      },
      selectedInstanceId: null,
    });
  },
})); 