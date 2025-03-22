'use client';

import { useState, useEffect, useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { DRACOLoader } from 'three-stdlib';
import { useBox } from '@react-three/cannon';
import { Mesh, Group, Vector3 as ThreeVector3 } from 'three';
import { ModelInstance } from '../../types';

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
  modelInstance?: ModelInstance;
}

export default function ModelLoader({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onLoad,
  isDraggable = false,
  isSelected = false,
  isLocked = false,
  onClick,
  modelInstance,
}: ModelLoaderProps) {
  // 실제 모델 로딩
  const gltf = useLoader(GLTFLoader, modelPath, (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);
  });

  const modelRef = useRef<Group>(null);
  const [modelBoundingBox, setModelBoundingBox] = useState<[number, number, number]>([1, 1, 1]);
  
  // 물리 효과 적용
  const [physicsRef] = useBox(() => ({
    args: modelBoundingBox,
    mass: 1,
    position,
    rotation,
    type: isDraggable ? 'Dynamic' : 'Static',
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
      
      // 모델 로드 콜백
      if (onLoad) {
        onLoad(modelRef.current);
      }
    }
  }, [gltf, scale, onLoad]);
  
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
  
  // 모델 복제 및 위치 동기화
  const modelClone = gltf.scene.clone();
  
  // 물리 객체와 시각적 모델 동기화
  useFrame(() => {
    if (physicsRef.current && modelRef.current) {
      const position = physicsRef.current.position;
      const quaternion = physicsRef.current.quaternion;
      
      modelRef.current.position.copy(position);
      modelRef.current.quaternion.copy(quaternion);
    }
  });

  return (
    <group 
      ref={physicsRef}
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
  );
} 