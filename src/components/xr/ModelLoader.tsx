'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { DRACOLoader } from 'three-stdlib';
import { useBox } from '@react-three/cannon';
import { Mesh, Group, Vector3 as ThreeVector3 } from 'three';
import { ModelInstance, Vector3 } from '../../types';
import { TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

interface ModelLoaderProps {
  modelPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onLoad?: (model: Group) => void;
  isDraggable?: boolean;
  isSelected?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
  onDragEnd?: (position: [number, number, number], rotation: [number, number, number], scale?: [number, number, number]) => void;
  transformMode?: 'translate' | 'rotate' | 'scale';
}

function ModelLoader({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onLoad,
  isDraggable = false,
  isSelected = false,
  isLocked = false,
  onClick,
  onDragEnd,
  transformMode = 'translate',
}: ModelLoaderProps) {
  // Three.js 상태 훅
  const { camera } = useThree();
  
  // 실제 모델 로딩
  const gltf = useLoader(GLTFLoader, modelPath, (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);
  });

  const modelRef = useRef<Group>(null);
  const rootRef = useRef<Group>(null);
  const [modelBoundingBox, setModelBoundingBox] = useState<[number, number, number]>([1, 1, 1]);
  const [isDragging, setIsDragging] = useState(false);
  
  // 물리 효과 적용 (isDraggable이 false인 경우만 물리 효과 적용)
  const [physicsRef] = useBox(() => ({
    args: modelBoundingBox,
    mass: 1,
    position,
    rotation,
    type: 'Static', // 물리 시스템에 의한 드래그는 비활성화
  }));
  
  // 모델 로드 후 효과
  useEffect(() => {
    if (gltf && modelRef.current) {
      // 모델의 바운딩 박스 계산
      let maxSize = { x: 0, y: 0, z: 0 };
      
      modelRef.current.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry.computeBoundingBox();
          const box = child.geometry.boundingBox;
          if (box) {
            const size = box.getSize(new ThreeVector3());
            maxSize.x = Math.max(maxSize.x, size.x);
            maxSize.y = Math.max(maxSize.y, size.y);
            maxSize.z = Math.max(maxSize.z, size.z);
          }
          
          // 그림자 설정
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // 물리 충돌 영역 크기 업데이트
      setModelBoundingBox([
        maxSize.x * scale[0],
        maxSize.y * scale[1],
        maxSize.z * scale[2]
      ]);
      
      // 초기 위치 및 회전 설정
      if (rootRef.current) {
        rootRef.current.position.set(position[0], position[1], position[2]);
        rootRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
      }
      
      // 모델 로드 콜백
      if (onLoad) {
        onLoad(modelRef.current);
      }
    }
  }, [gltf, scale, onLoad, position, rotation]);
  
  // 선택 효과 (하이라이트)
  useEffect(() => {
    if (modelRef.current && isSelected) {
      modelRef.current.traverse((child) => {
        if (child instanceof Mesh && child.material) {
          // 다중 재질인 경우 처리
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.emissive?.set(0x222222);
            });
          } else {
            child.material.emissive?.set(0x222222);
          }
        }
      });
    } else if (modelRef.current && !isSelected) {
      modelRef.current.traverse((child) => {
        if (child instanceof Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.emissive?.set(0x000000);
            });
          } else {
            child.material.emissive?.set(0x000000);
          }
        }
      });
    }
  }, [isSelected]);
  
  // TransformControls 이벤트 처리
  useEffect(() => {
    if (isSelected && isDraggable && !isLocked && rootRef.current) {
      const handleDragStart = () => {
        setIsDragging(true);
      };
      
      const handleDragEnd = () => {
        setIsDragging(false);
        
        if (rootRef.current && onDragEnd) {
          const newPosition: [number, number, number] = [
            rootRef.current.position.x,
            rootRef.current.position.y,
            rootRef.current.position.z
          ];
          
          const newRotation: [number, number, number] = [
            rootRef.current.rotation.x,
            rootRef.current.rotation.y,
            rootRef.current.rotation.z
          ];
          
          const newScale: [number, number, number] = [
            modelRef.current?.scale.x ?? scale[0],
            modelRef.current?.scale.y ?? scale[1],
            modelRef.current?.scale.z ?? scale[2]
          ];
          
          onDragEnd(newPosition, newRotation, newScale);
        }
      };
      
      // 이벤트 리스너는 주로 TransformControls 내부에서 처리됨
      
      return () => {
        // 이벤트 리스너 제거
      };
    }
  }, [isSelected, isDraggable, isLocked, onDragEnd, scale]);
  
  // 모델 복제
  const modelClone = gltf.scene.clone();
  
  // 변환 모드에 따른 설정 구성
  const getTransformControlsConfig = () => {
    switch (transformMode) {
      case 'translate':
        return { 
          showX: true, 
          showY: false, // Y축(높이)은 비활성화하면 바닥에 붙인 상태로 드래그 가능 
          showZ: true 
        };
      case 'rotate':
        return { 
          showX: false, 
          showY: true, // 회전은 Y축만 사용하는 것이 가구 배치에 자연스러움
          showZ: false 
        };
      case 'scale':
        return { 
          showX: true, 
          showY: true, 
          showZ: true 
        };
      default:
        return { 
          showX: true, 
          showY: false, 
          showZ: true 
        };
    }
  };
  
  const controlConfig = getTransformControlsConfig();
  
  return (
    <>
      <group 
        ref={rootRef}
        position={position}
        rotation={rotation}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
      >
        <primitive 
          ref={modelRef}
          object={modelClone} 
          scale={scale}
        />
      </group>
      
      {/* 선택되고 드래그 가능하며 잠금 상태가 아닌 경우에만 TransformControls 표시 */}
      {isSelected && isDraggable && !isLocked && rootRef.current && (
        <TransformControls
          object={transformMode === 'scale' && modelRef.current ? modelRef.current : rootRef.current}
          mode={transformMode}
          size={0.75}
          showX={controlConfig.showX}
          showY={controlConfig.showY}
          showZ={controlConfig.showZ}
          camera={camera}
          onMouseUp={() => {
            if (rootRef.current && onDragEnd) {
              const newPosition: [number, number, number] = [
                rootRef.current.position.x,
                rootRef.current.position.y,
                rootRef.current.position.z
              ];
              
              const newRotation: [number, number, number] = [
                rootRef.current.rotation.x,
                rootRef.current.rotation.y,
                rootRef.current.rotation.z
              ];
              
              const newScale: [number, number, number] = [
                modelRef.current?.scale.x ?? scale[0],
                modelRef.current?.scale.y ?? scale[1],
                modelRef.current?.scale.z ?? scale[2]
              ];
              
              onDragEnd(newPosition, newRotation, newScale);
            }
          }}
        />
      )}
    </>
  );
}

// React.memo를 사용하여 불필요한 리렌더링 방지
export default memo(ModelLoader); 