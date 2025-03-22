'use client';

import { useRef, useState, useEffect } from 'react';
import { Group, Object3D, Vector3 } from 'three';
import { useEditorStore } from '@/store/editorStore';
import Room from './Room';
import ModelLoader from './ModelLoader';
import ModelControls from './ModelControls';

export default function InteriorScene() {
const {
    scene,
    availableModels,
    selectedModelId,
    editMode,
    selectModel,
    updateModelInstance
  } = useEditorStore();
  
  // 선택된 객체 ref
  const [selectedObject, setSelectedObject] = useState<Object3D | null>(null);
  const objectRefs = useRef<Map<string, Group>>(new Map());
  
  // 변형(transform) 완료 처리 핸들러
  const handleTransformComplete = (position: Vector3, rotation: Vector3, scale: Vector3) => {
    if (selectedModelId) {
      updateModelInstance(selectedModelId, { position, rotation, scale });
    }
  };
  
  // 객체 선택 처리
  const handleModelClick = (instanceId: string) => {
    // 이미 선택된 객체를 다시 클릭한 경우 선택 해제
    if (selectedModelId === instanceId) {
      selectModel(null);
      setSelectedObject(null);
    } else {
      selectModel(instanceId);
      
      // 선택된 객체의 ref를 찾음
      const obj = objectRefs.current.get(instanceId);
      if (obj) {
        setSelectedObject(obj);
      }
    }
  };
  
  // 선택 상태가 변경될 때 선택된 객체 업데이트
  useEffect(() => {
    if (!selectedModelId) {
      setSelectedObject(null);
      return;
    }
    
    // selectedModelId가 변경되었지만 해당 ref가
    // 아직 설정되지 않았을 가능성이 있으므로
    // 현재 저장된 ref에서 확인
    const obj = objectRefs.current.get(selectedModelId);
    if (obj) {
      setSelectedObject(obj);
    }
  }, [selectedModelId]);
  
  // 바탕 클릭 시 선택 해제
  const handleBackgroundClick = () => {
    selectModel(null);
    setSelectedObject(null);
  };
  
  // 모델 로드 콜백
  const handleModelLoaded = (instanceId: string, modelObj: Group) => {
    objectRefs.current.set(instanceId, modelObj);
    
    // 현재 선택된 모델이 로드된 경우 ref 업데이트
    if (selectedModelId === instanceId) {
      setSelectedObject(modelObj);
    }
  };

  return (
    <>
      {/* 방 컴포넌트 */}
      <Room
        width={scene.roomDimensions.width}
        height={scene.roomDimensions.height}
        length={scene.roomDimensions.length}
        wallColor={scene.wallColor}
        floorColor={scene.floorColor}
        ceilingColor={scene.ceilingColor}
      />
      
      {/* 바탕 클릭 처리를 위한 투명 평면 */}
      <mesh 
        position={[0, 0.01, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        onClick={handleBackgroundClick}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0.0} />
      </mesh>
      
      {/* 모델 인스턴스 렌더링 */}
      {scene.modelInstances.map((instance) => {
        // 해당 모델 데이터 찾기
        const modelData = availableModels.find((m) => m.id === instance.modelId);
        if (!modelData) return null;
        
        return (
          <ModelLoader
            key={instance.id}
            modelPath={modelData.modelPath}
            position={[
              instance.position.x,
              instance.position.y,
              instance.position.z
            ]}
            rotation={[
              instance.rotation.x,
              instance.rotation.y,
              instance.rotation.z
            ]}
            scale={[
              instance.scale.x,
              instance.scale.y,
              instance.scale.z
            ]}
            isDraggable={false}
            isSelected={instance.id === selectedModelId}
            onClick={() => handleModelClick(instance.id)}
            onLoad={(model) => handleModelLoaded(instance.id, model)}
          />
        );
      })}
      
      {/* 선택된 객체에 대한 transform 컨트롤 */}
      {selectedObject && (
        <ModelControls
          object={selectedObject}
          mode={editMode}
          onTransformComplete={handleTransformComplete}
        />
      )}
    </>
  );
} 