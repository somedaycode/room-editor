'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import XRCanvas from '../components/xr/XRCanvas';
import Room from '../components/xr/Room';
import ModelLoader from '../components/xr/ModelLoader';
import ModelsSidebar from '../components/ui/ModelsSidebar';
import EditorToolbar from '../components/ui/EditorToolbar';
import PropertiesPanel from '../components/ui/PropertiesPanel';
import { Model, ModelInstance, Category } from '../types';
import { useEditorStore } from '../store/editorStore';

// 데모 모델 데이터
const demoModels: Model[] = [
  {
    id: '1',
    name: '모던 소파',
    category: Category.FURNITURE,
    description: '현대적인 디자인의 3인용 소파',
    modelPath: '/models/sofa.glb',
    thumbnailUrl: '/images/sofa.jpg',
    defaultScale: [1, 1, 1],
    created: new Date().toISOString()
  },
  {
    id: '2',
    name: '식탁',
    category: Category.FURNITURE,
    description: '원목 식탁',
    modelPath: '/models/table.glb',
    thumbnailUrl: '/images/table.jpg',
    defaultScale: [1, 1, 1],
    created: new Date().toISOString()
  },
  {
    id: '3',
    name: '기본 의자',
    category: Category.FURNITURE,
    description: '단순한 디자인의 의자',
    modelPath: '/models/basic_chair.glb',
    thumbnailUrl: '/images/chair.jpg',
    defaultScale: [1, 1, 1],
    created: new Date().toISOString()
  },
  {
    id: '4',
    name: '우드 체어',
    category: Category.FURNITURE,
    description: '원목 의자',
    modelPath: '/models/wooden_chair.glb',
    thumbnailUrl: '/images/wooden_chair.jpg',
    defaultScale: [1, 1, 1],
    created: new Date().toISOString()
  },
  {
    id: '5',
    name: '책장',
    category: Category.FURNITURE,
    description: '책과 장식품을 위한 선반',
    modelPath: '/models/regal.glb',
    thumbnailUrl: '/images/bookshelf.jpg',
    defaultScale: [1, 1, 1],
    created: new Date().toISOString()
  },
  {
    id: '6',
    name: '도어',
    category: Category.FIXTURES,
    description: '실내 도어',
    modelPath: '/models/door.glb',
    thumbnailUrl: '/images/door.jpg',
    defaultScale: [1, 1, 1],
    created: new Date().toISOString()
  },
];

// 초기 모델 인스턴스 데이터
const initialInstances: ModelInstance[] = [];

export default function EditorPage() {
  // 에디터 스토어에서 상태 및 메서드 가져오기
  const {
    models,
    instances,
    selectedInstanceId,
    editMode,
    setModels,
    setInstances,
    addInstance,
    selectInstance,
    updateInstanceProperty,
    deleteInstance,
    duplicateInstance
  } = useEditorStore();

  // 첫 렌더링 시 데모 데이터 설정
  useEffect(() => {
    setModels(demoModels);
    setInstances(initialInstances);
  }, [setModels, setInstances]);

  // 선택된 인스턴스와 모델 찾기 (메모이제이션으로 불필요한 계산 방지)
  const selectedInstance = useMemo(() => {
    return instances.find(inst => inst.id === selectedInstanceId);
  }, [instances, selectedInstanceId]);
  
  const selectedModel = useMemo(() => {
    if (!selectedInstance) return undefined;
    return models.find(model => model.id === selectedInstance.modelId);
  }, [models, selectedInstance]);

  // 콜백 함수 메모이제이션
  const handleAddModel = useCallback((modelId: string) => {
    // 선택된 모델 찾기
    const model = models.find(m => m.id === modelId);
    if (model) {
      // 모델 인스턴스 생성 및 추가
      addInstance({
        modelId,
        name: `${model.name} ${instances.filter(i => i.modelId === modelId).length + 1}`,
        position: [0, 0.2, 0],
        rotation: [0, 0, 0],
        scale: model.defaultScale || [1, 1, 1],
        isVisible: true,
        isLocked: false
      });
    }
  }, [models, instances, addInstance]);

  const handleDuplicate = useCallback(() => {
    if (selectedInstanceId) {
      duplicateInstance(selectedInstanceId);
    }
  }, [selectedInstanceId, duplicateInstance]);

  const handleDelete = useCallback(() => {
    if (selectedInstanceId) {
      deleteInstance(selectedInstanceId);
    }
  }, [selectedInstanceId, deleteInstance]);

  const handleUpdateProperty = useCallback((property: keyof ModelInstance, value: any) => {
    if (selectedInstanceId) {
      updateInstanceProperty(selectedInstanceId, property, value);
    }
  }, [selectedInstanceId, updateInstanceProperty]);

  const handleSelectInstance = useCallback((id: string) => {
    selectInstance(id);
  }, [selectInstance]);

  // 드래그 앤 드롭 완료 핸들러
  const handleDragEnd = useCallback((instanceId: string, position: [number, number, number], rotation: [number, number, number], scale?: [number, number, number]) => {
    // 모델 인스턴스의 위치와 회전 업데이트
    updateInstanceProperty(instanceId, 'position' as keyof ModelInstance, position);
    updateInstanceProperty(instanceId, 'rotation' as keyof ModelInstance, rotation);
    
    // scale이 있으면 업데이트
    if (scale) {
      updateInstanceProperty(instanceId, 'scale' as keyof ModelInstance, scale);
    }
  }, [updateInstanceProperty]);

  // 인스턴스 렌더링을 메모이제이션
  const renderedInstances = useMemo(() => {
    return instances.map(instance => {
      const model = models.find(m => m.id === instance.modelId);
      if (!model || !instance.isVisible) return null;
      
      return (
        <ModelLoader
          key={`model-${instance.id}`}
          modelPath={model.modelPath}
          position={instance.position}
          rotation={instance.rotation}
          scale={instance.scale}
          isSelected={instance.id === selectedInstanceId}
          isLocked={instance.isLocked}
          isDraggable={true}
          onClick={() => handleSelectInstance(instance.id)}
          onDragEnd={(position, rotation, scale) => handleDragEnd(instance.id, position, rotation, scale)}
          transformMode={editMode}
          instanceId={instance.id}
          onUpdateInstance={(id, updates) => {
            const { updateInstance } = useEditorStore.getState();
            updateInstance(id, updates);
          }}
          enableSnapping={true}
          snapThreshold={0.8}
        />
      );
    });
  }, [instances, models, selectedInstanceId, handleSelectInstance, handleDragEnd, editMode]);

  return (
    <div className="flex flex-col h-screen">
      {/* 툴바 */}
      <EditorToolbar
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* 모델 사이드바 */}
        <ModelsSidebar 
          models={models} 
          onAddModel={handleAddModel}
        />
        
        {/* 메인 3D 뷰 */}
        <div className="flex-1">
          <XRCanvas
            cameraPosition={[0, 10, 0]}
            environmentPreset="studio"
            showGrid={false}
            showSky={false}
            enablePhysics={true}
          >
            <Room 
              key="main-room"
              width={9.1} 
              height={3} 
              length={9.1} 
              wallColor="#6e6e6e" 
              floorColor="#505050" 
              ceilingColor="#7a7a7a" 
              hasCeiling={false} 
            />
            
            {renderedInstances}
          </XRCanvas>
        </div>
        
        {/* 속성 패널 */}
        {selectedInstance && selectedModel && (
          <PropertiesPanel
            instance={selectedInstance}
            model={selectedModel}
            onUpdateProperty={handleUpdateProperty}
          />
        )}
      </div>
    </div>
  );
}
