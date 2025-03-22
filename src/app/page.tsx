'use client';

import { useState } from 'react';
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
    setModels,
    setInstances,
    addInstance,
    selectInstance,
    updateInstanceProperty,
    deleteInstance,
    duplicateInstance
  } = useEditorStore();

  // 첫 렌더링 시 데모 데이터 설정
  useState(() => {
    setModels(demoModels);
    setInstances(initialInstances);
  });

  // 선택된 인스턴스 찾기
  const selectedInstance = instances.find(inst => inst.id === selectedInstanceId);
  
  // 선택된 인스턴스의 모델 찾기
  const selectedModel = selectedInstance 
    ? models.find(model => model.id === selectedInstance.modelId) 
    : undefined;

  return (
    <div className="flex flex-col h-screen">
      {/* 툴바 */}
      <EditorToolbar
        onDuplicate={() => selectedInstanceId && duplicateInstance(selectedInstanceId)}
        onDelete={() => selectedInstanceId && deleteInstance(selectedInstanceId)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* 모델 사이드바 */}
        <ModelsSidebar 
          models={models} 
          onAddModel={(modelId) => {
            // 선택된 모델 찾기
            const model = models.find(m => m.id === modelId);
            if (model) {
              // 모델 인스턴스 생성 및 추가
              addInstance({
                modelId,
                name: `${model.name} ${instances.filter(i => i.modelId === modelId).length + 1}`,
                position: [0, 0.01, 0],
                rotation: [0, 0, 0],
                scale: model.defaultScale || [1, 1, 1],
                isVisible: true,
                isLocked: false
              });
            }
          }}
        />
        
        {/* 메인 3D 뷰 */}
        <div className="flex-1">
          <XRCanvas
            cameraPosition={[0, 10, 0]}
            environmentPreset="studio"
            showGrid={false}
            showSky={false}
          >
            <Room 
              width={9.1} 
              height={3} 
              length={9.1} 
              wallColor="#6e6e6e" 
              floorColor="#505050" 
              ceilingColor="#7a7a7a" 
              hasCeiling={false} 
            />
            
            {instances.map(instance => {
              const model = models.find(m => m.id === instance.modelId);
              if (!model || !instance.isVisible) return null;
              
              return (
                <ModelLoader
                  key={instance.id}
                  modelPath={model.modelPath}
                  position={instance.position}
                  rotation={instance.rotation}
                  scale={instance.scale}
                  isSelected={instance.id === selectedInstanceId}
                  isLocked={instance.isLocked}
                  isDraggable={true}
                  onClick={() => selectInstance(instance.id)}
                />
              );
            })}
          </XRCanvas>
        </div>
        
        {/* 속성 패널 */}
        {selectedInstance && selectedModel && (
          <PropertiesPanel
            instance={selectedInstance}
            model={selectedModel}
            onUpdateProperty={(property, value) => {
              updateInstanceProperty(selectedInstance.id, property, value);
            }}
          />
        )}
      </div>
    </div>
  );
}
