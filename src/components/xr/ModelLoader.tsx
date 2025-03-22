'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { DRACOLoader } from 'three-stdlib';
import { useBox } from '@react-three/cannon';
import { Mesh, Group, Vector3 as ThreeVector3, Quaternion, Euler, Raycaster } from 'three';
import { ModelInstance, Vector3 } from '../../types';
import { TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import CustomTransformControls from './CustomTransformControls';

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
  transformMode?: 'translate' | 'rotate' | 'scale' | 'combined';
  onUpdateInstance?: (instanceId: string, updates: Partial<ModelInstance>) => void;
  instanceId?: string;
  enableSnapping?: boolean;
  snapThreshold?: number;
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
  onUpdateInstance,
  instanceId,
  enableSnapping = true,
  snapThreshold = 1.0,
}: ModelLoaderProps) {
  // Three.js 상태 훅
  const { camera, scene } = useThree();
  
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
  const lastValidPosition = useRef<[number, number, number]>(position);
  const lastValidRotation = useRef<[number, number, number]>(rotation);
  
  // 충돌 감지 상태
  const [hasCollision, setHasCollision] = useState(false);
  
  // 물리 효과 적용 (충돌 감지용)
  const [physicsRef, api] = useBox(() => ({
    args: modelBoundingBox,
    mass: 0,
    position,
    rotation,
    type: 'Static',
    collisionFilterGroup: 2, // 모델은 그룹 2에 속함
    collisionFilterMask: 2,  // 같은 그룹(다른 모델)과만 충돌 감지
    onCollideBegin: (e) => {
      // 바닥과의 충돌은 무시
      if (e.body?.name === 'floor-main') {
        return;
      }
      
      // 높이 차이가 충분히 크면 충돌 무시 (Y축으로 충분히 위에 있는 경우)
      if (rootRef.current && e.body?.position) {
        const heightDifference = Math.abs(rootRef.current.position.y - e.body.position.y);
        if (heightDifference > 1.0) {
          console.log('높이 차이로 충돌 무시:', heightDifference);
          return;
        }
      }
      
      console.log('충돌 시작:', e.body?.name, e.target?.name);
      if (isDragging && transformMode === 'translate') {
        setHasCollision(true);
      }
    },
    onCollideEnd: (e) => {
      console.log('충돌 종료');
    },
  }));
  
  // 모델의 고유 ID 생성 (모델 경로 기반)
  const modelId = useRef(`model-${modelPath.split('/').pop()}-${Math.random().toString(36).substr(2, 9)}`);
  
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
        
        // 초기 위치를 유효한 위치로 저장
        lastValidPosition.current = position;
        lastValidRotation.current = rotation;
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
  
  // 변환 모드에 따른 설정 구성
  const getTransformControlsConfig = () => {
    switch (transformMode) {
      case 'translate':
        return { 
          showX: true, 
          showY: true, 
          showZ: true 
        };
      case 'rotate':
        return { 
          showX: false, 
          showY: true, 
          showZ: false 
        };
      case 'scale':
        return { 
          showX: true, 
          showY: true, 
          showZ: true 
        };
      case 'combined':
        return { 
          showX: true, 
          showY: true, 
          showZ: true
        };
      default:
        return { 
          showX: true, 
          showY: true, 
          showZ: true 
        };
    }
  };
  
  // 현재 변환 모드에 따른 설정
  const controlConfig = getTransformControlsConfig();
  
  // TransformControls 이벤트 핸들러
  const handleMouseDown = () => {
    console.log('드래그 시작');
    setIsDragging(true);
    
    // 드래그 시작 시 충돌 상태 초기화
    if (hasCollision) {
      setHasCollision(false);
    }
    
    // 드래그 시작 시 현재 위치를 기억
    if (rootRef.current) {
      lastValidPosition.current = [
        rootRef.current.position.x,
        rootRef.current.position.y,
        rootRef.current.position.z
      ];
      lastValidRotation.current = [
        rootRef.current.rotation.x,
        rootRef.current.rotation.y,
        rootRef.current.rotation.z
      ];
    }
  };
  
  const handleChange = () => {
    // 위치가 변경될 때마다 충돌 감지
    if (transformMode === 'translate' || transformMode === 'combined') {
      checkCollisions();
    }
  };
  
  const handleMouseUp = () => {
    console.log('드래그 종료, 충돌 상태:', hasCollision);

    // 마지막으로 충돌 상태 확인
    const isColliding = checkCollisions();
    
    // 스냅 가이드 라인 숨기기
    hideSnapLine();
    
    if (rootRef.current && onDragEnd) {
      // 충돌이 있는 경우, 마지막 유효 위치로 복원
      if ((hasCollision || isColliding) && (transformMode === 'translate' || transformMode === 'combined')) {
        console.log('충돌로 인해 위치 복원:', lastValidPosition.current);
        rootRef.current.position.set(
          lastValidPosition.current[0],
          lastValidPosition.current[1],
          lastValidPosition.current[2]
        );
        
        // 물리 객체도 업데이트
        api.position.set(
          lastValidPosition.current[0],
          lastValidPosition.current[1],
          lastValidPosition.current[2]
        );
        
        // 업데이트된 정보로 인스턴스 업데이트
        if (onUpdateInstance && instanceId) {
          onUpdateInstance(instanceId, {
            position: lastValidPosition.current,
            rotation: lastValidRotation.current,
            scale: [
              modelRef.current?.scale.x ?? scale[0],
              modelRef.current?.scale.y ?? scale[1],
              modelRef.current?.scale.z ?? scale[2]
            ]
          });
        }
      } else {
        // 충돌이 없는 경우 현재 위치와 회전으로 인스턴스 업데이트
        if (rootRef.current) {
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
          
          if (onUpdateInstance && instanceId) {
            onUpdateInstance(instanceId, {
              position: newPosition,
              rotation: newRotation,
              scale: [
                modelRef.current?.scale.x ?? scale[0],
                modelRef.current?.scale.y ?? scale[1],
                modelRef.current?.scale.z ?? scale[2]
              ] as [number, number, number]
            });
          }
        }
      }
      
      // 드래그 상태 및 충돌 상태 초기화
      setIsDragging(false);
      setHasCollision(false);
    }
  };
  
  // 모델 복제
  const modelClone = gltf.scene.clone();
  
  // 수동 충돌 감지 함수
  const checkCollisions = () => {
    if (!scene || !rootRef.current || !isDragging) return false;
    
    let hasAnyCollision = false;
    
    // 거리 기반 충돌 감지
    scene.traverse((object) => {
      // 다른 모델이거나 벽인 경우만 처리 (바닥은 제외)
      const isWall = object.name && object.name.startsWith('wall-');
      const isOtherModel = object.name && object.name.startsWith('model-') && object.name !== modelId.current;
      
      // floor-main 제외 및 수직 위치에 따른 충돌 감지 제외
      if ((isWall || isOtherModel) && object.position && rootRef.current && object.name !== 'floor-main') {
        // 두 객체 간의 거리 계산
        const distance = new ThreeVector3(
          rootRef.current.position.x - object.position.x,
          0, // Y축(높이)는 무시하고 평면상의 거리만 계산
          rootRef.current.position.z - object.position.z
        ).length();
        
        // 충돌 임계값 설정 (모델 크기에 따라 조정할 수 있음)
        let collisionThreshold = 1.5;
        
        // 벽과의 거리는 더 세밀하게 감지
        if (isWall) {
          collisionThreshold = 2.0;
        }
        
        // Y축 높이에 따른 충돌 검사 추가
        const heightDifference = Math.abs(rootRef.current.position.y - object.position.y);
        const isHeightOverlapping = heightDifference < 1.0; // 높이 차이가 1.0 미만일 때만 충돌로 간주
        
        if (distance < collisionThreshold && isHeightOverlapping) {
          console.log('수동 충돌 감지:', object.name, '거리:', distance, '높이 차이:', heightDifference);
          hasAnyCollision = true;
        }
      }
    });
    
    // 충돌 상태가 변경될 때만 상태 업데이트 및 로깅
    if (hasAnyCollision !== hasCollision) {
      console.log('충돌 상태 변경:', hasAnyCollision ? '충돌 발생' : '충돌 해제');
      setHasCollision(hasAnyCollision);
    }
    
    return hasAnyCollision;
  };
  
  // 스냅 상태 저장
  const [isSnapped, setIsSnapped] = useState(false);
  const [snapAxis, setSnapAxis] = useState<'x' | 'z' | null>(null);
  const snapLineRef = useRef<Mesh | null>(null);
  
  // 스냅 라인 생성 및 표시
  const showSnapLine = (axis: 'x' | 'z', position: ThreeVector3) => {
    setIsSnapped(true);
    setSnapAxis(axis);
    
    // 나중에 스냅 라인 시각적 표시를 추가할 수 있음
  };
  
  // 스냅 라인 숨기기
  const hideSnapLine = () => {
    setIsSnapped(false);
    setSnapAxis(null);
  };

  // 드래그 중 위치 업데이트 및 충돌/스냅 감지
  useFrame(() => {
    if (rootRef.current && physicsRef.current) {
      // 물리 객체에 이름 추가
      if (physicsRef.current.name === '') {
        physicsRef.current.name = modelId.current;
      }

      // 항상 물리 객체의 위치를 시각적 객체와 동기화
      if (transformMode === 'translate' && isDragging) {
        // 현재 위치에서 스냅 적용
        const currentPosition = rootRef.current.position.clone();
        const snappedPosition = snapToNearbyObjects(currentPosition);
        
        // 스냅이 발생했는지 체크
        if (!snappedPosition.equals(currentPosition)) {
          // 스냅된 위치로 업데이트
          rootRef.current.position.copy(snappedPosition);
          
          // 스냅된 축 확인
          if (snappedPosition.x !== currentPosition.x) {
            showSnapLine('x', snappedPosition);
          } else if (snappedPosition.z !== currentPosition.z) {
            showSnapLine('z', snappedPosition);
          }
        } else {
          hideSnapLine();
        }
        
        // 물리 객체 위치 동기화
        physicsRef.current.position.copy(rootRef.current.position);
        api.position.set(
          rootRef.current.position.x,
          rootRef.current.position.y,
          rootRef.current.position.z
        );

        // 주기적으로 충돌 확인
        const isColliding = checkCollisions();
        
        // 충돌 상태 업데이트: 충돌이 없으면 충돌 상태 해제
        if (!isColliding && hasCollision) {
          setHasCollision(false);
        }
      }
      
      // 회전도 동기화
      if (transformMode === 'rotate' && isDragging) {
        physicsRef.current.quaternion.copy(rootRef.current.quaternion);
        api.rotation.set(
          rootRef.current.rotation.x,
          rootRef.current.rotation.y,
          rootRef.current.rotation.z
        );
      }
      
      // 충돌이 감지되면 시각적 표시
      if (hasCollision && modelRef.current && isDragging) {
        modelRef.current.traverse((child) => {
          if (child instanceof Mesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                // 빨간색 하이라이트 (충돌 표시)
                mat.emissive?.set(0xFF0000);
                mat.emissiveIntensity = 1;
                // 반투명화 효과
                mat.transparent = true;
                mat.opacity = 0.7;
              });
            } else {
              // 빨간색 하이라이트 (충돌 표시)
              child.material.emissive?.set(0xFF0000);
              child.material.emissiveIntensity = 1;
              // 반투명화 효과
              child.material.transparent = true;
              child.material.opacity = 0.7;
            }
          }
        });
      } else if (modelRef.current && !hasCollision && isDragging) {
        // 충돌이 없을 때는 원래 색상 유지
        modelRef.current.traverse((child) => {
          if (child instanceof Mesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.transparent = false;
                mat.opacity = 1;
                mat.emissiveIntensity = 0.5;
                mat.emissive?.set(isSelected ? 0x222222 : 0x000000);
              });
            } else {
              child.material.transparent = false;
              child.material.opacity = 1;
              child.material.emissiveIntensity = 0.5;
              child.material.emissive?.set(isSelected ? 0x222222 : 0x000000);
            }
          }
        });
      }
    }
  });
  
  // 스냅 기능 구현 - 가까운 벽이나 다른 가구에 정렬
  const snapToNearbyObjects = (position: ThreeVector3): ThreeVector3 => {
    if (!scene || !isDragging || !enableSnapping) return position;
    
    const snapPositions: {distance: number, position: ThreeVector3, direction: string}[] = [];
    
    // 현재 위치
    const currentPos = new ThreeVector3(position.x, position.y, position.z);
    
    // 씬의 모든 객체를 검사
    scene.traverse((object) => {
      // 벽이거나 다른 모델인 경우만 처리
      const isWall = object.name && object.name.startsWith('wall-');
      const isOtherModel = object.name && object.name.startsWith('model-') && object.name !== modelId.current;
      
      if ((isWall || isOtherModel) && object.position) {
        // 각 축별로 스냅 거리 계산
        const xDistance = Math.abs(currentPos.x - object.position.x);
        const zDistance = Math.abs(currentPos.z - object.position.z);
        
        // X축 스냅 포인트 추가
        if (xDistance < snapThreshold) {
          snapPositions.push({
            distance: xDistance,
            position: new ThreeVector3(object.position.x, currentPos.y, currentPos.z),
            direction: 'x'
          });
        }
        
        // Z축 스냅 포인트 추가
        if (zDistance < snapThreshold) {
          snapPositions.push({
            distance: zDistance,
            position: new ThreeVector3(currentPos.x, currentPos.y, object.position.z),
            direction: 'z'
          });
        }
      }
    });
    
    // 가장 가까운 스냅 포인트 찾기
    if (snapPositions.length > 0) {
      snapPositions.sort((a, b) => a.distance - b.distance);
      const closestSnap = snapPositions[0];
      
      console.log('스냅 적용:', closestSnap.direction, '축, 거리:', closestSnap.distance);
      return closestSnap.position;
    }
    
    return position;
  };
  
  // 스냅 가이드 라인 컴포넌트
  const SnapGuide = () => {
    const { scene } = useThree();
    
    // 씬의 크기에 맞게 가이드 라인 생성
    const roomSize = 10; // 기본 방 크기
    
    if (!isSnapped || !snapAxis) return null;
    
    const position = rootRef.current?.position || new ThreeVector3();
    
    return (
      <>
        {snapAxis === 'x' && (
          <mesh position={[position.x, 0.01, 0]} rotation={[0, 0, 0]}>
            <planeGeometry args={[0.05, roomSize * 2]} />
            <meshBasicMaterial color="#4285f4" transparent opacity={0.6} />
          </mesh>
        )}
        
        {snapAxis === 'z' && (
          <mesh position={[0, 0.01, position.z]} rotation={[0, 0, 0]}>
            <planeGeometry args={[roomSize * 2, 0.05]} />
            <meshBasicMaterial color="#4285f4" transparent opacity={0.6} />
          </mesh>
        )}
      </>
    );
  };

  return (
    <>
      <group 
        ref={physicsRef}
        visible={false} // 물리 객체는 보이지 않게 처리
      />
      
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
        <CustomTransformControls
          object={transformMode === 'scale' && modelRef.current ? modelRef.current : rootRef.current}
          mode={transformMode}
          size={0.75}
          showX={controlConfig.showX}
          showY={controlConfig.showY}
          showZ={controlConfig.showZ}
          camera={camera}
          onMouseDown={handleMouseDown}
          onChange={handleChange}
          onMouseUp={handleMouseUp}
        />
      )}
      
      {/* 스냅 가이드 라인 */}
      {isDragging && <SnapGuide />}
    </>
  );
}

// React.memo를 사용하여 불필요한 리렌더링 방지
export default memo(ModelLoader); 