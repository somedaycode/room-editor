'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { MeshStandardMaterial } from 'three';

interface RoomProps {
  width: number;
  height: number;
  length: number;
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
  hasCeiling?: boolean;
  wallThickness?: number;
}

interface WallProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  transparent?: boolean;
  opacity?: number;
  roughness?: number;
  metalness?: number;
}

// 벽 구성요소 컴포넌트를 만들어 코드 중복 방지
const Wall = ({ 
  position, 
  size, 
  color, 
  transparent = false, 
  opacity = 1, 
  roughness = 0.9, 
  metalness = 0.05 
}: WallProps) => {
  // 충돌 처리를 위한 박스 생성
  const [ref] = useBox(() => ({
    args: size,
    position,
    type: 'Static',
  }));

  return (
    <mesh
      ref={ref}
      position={position}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent={transparent}
        opacity={opacity}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  );
};

export default function Room({
  width = 9.1, // 약 25평에 해당하는 크기로 조정 (9.1m x 9.1m ≈ 82.8m²)
  height = 3,
  length = 9.1,
  wallColor = '#f0f0f0',
  floorColor = '#cccccc',
  ceilingColor = '#ffffff',
  hasCeiling = false, // 기본값을 false로 설정하여 천장 없음
  wallThickness = 0.15, // 벽 두께
}: RoomProps) {
  // 바닥 물리 충돌 영역 - 위치를 살짝 아래로 내려 충돌 시 겹치지 않도록 함
  const [floorRef] = useBox(() => ({
    args: [width, 0.1, length],
    position: [0, -0.05, 0],
    type: 'Static',
    rotation: [0, 0, 0], // 바닥은 회전하지 않음
  }));

  // 씬 크기에 맞게 카메라 위치 조정
  const { camera } = useThree();
  
  useEffect(() => {
    // 방 크기에 맞게 카메라 위치 조정은 XRCanvas에서 이루어지므로 여기서는 비활성화
    // camera.position.set(width / 2, height / 2 + 1, length);
    // camera.lookAt(0, height / 3, 0);
    
    // 클린업 함수
    return () => {
      // 필요한 경우 클린업 코드 추가
    };
  }, [camera, width, height, length]);

  return (
    <group>
      {/* 바닥 - boxGeometry로 변경하여 더 안정적으로 렌더링 */}
      <mesh 
        ref={floorRef} 
        position={[0, -0.05, 0]} 
        receiveShadow
      >
        <boxGeometry args={[width, 0.1, length]} />
        <meshStandardMaterial 
          color={floorColor} 
          roughness={0.8} 
          metalness={0.1}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* 천장 (hasCeiling이 true일 때만 렌더링) */}
      {hasCeiling && (
        <mesh 
          position={[0, height, 0]} 
          rotation={[Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[width, length]} />
          <meshStandardMaterial color={ceilingColor} />
        </mesh>
      )}

      {/* 뒷벽 */}
      <Wall 
        position={[0, height / 2, -length / 2 - wallThickness / 2]} 
        size={[width + wallThickness * 2, height, wallThickness]} 
        color={wallColor} 
      />
      
      {/* 왼쪽 벽 */}
      <Wall 
        position={[-width / 2 - wallThickness / 2, height / 2, 0]} 
        size={[wallThickness, height, length + wallThickness * 2]} 
        color={wallColor} 
      />
      
      {/* 오른쪽 벽 */}
      <Wall 
        position={[width / 2 + wallThickness / 2, height / 2, 0]} 
        size={[wallThickness, height, length + wallThickness * 2]} 
        color={wallColor} 
      />
      
      {/* 앞벽 */}
      <Wall 
        position={[0, height / 2, length / 2 + wallThickness / 2]} 
        size={[width + wallThickness * 2, height, wallThickness]} 
        color={wallColor}
      />
    </group>
  );
} 