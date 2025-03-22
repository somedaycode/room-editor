'use client';

import { useRef, useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import { Object3D, Group, Mesh, Vector3 } from 'three';

interface ModelControlsProps {
  object: Object3D | Group | Mesh | null;
  mode?: 'translate' | 'rotate' | 'scale';
  size?: number;
  showX?: boolean;
  showY?: boolean;
  showZ?: boolean;
  enabled?: boolean;
  onTransformComplete?: (position: Vector3, rotation: Vector3, scale: Vector3) => void;
}

export default function ModelControls({
  object,
  mode = 'translate',
  size = 1,
  showX = true,
  showY = true,
  showZ = true,
  enabled = true,
  onTransformComplete,
}: ModelControlsProps) {
  const { camera } = useThree();
  const transformRef = useRef<any>(null);
  
  // 드래그 상태 추적
  const [isDragging, setIsDragging] = useState(false);
  
  // 드래그 시작/종료 이벤트 리스너
  useEffect(() => {
    if (transformRef.current) {
      const controls = transformRef.current;
      
      const onDragStart = () => {
        setIsDragging(true);
      };
      
      const onDragEnd = () => {
        setIsDragging(false);
        
        if (object && onTransformComplete) {
          const position = new Vector3().copy(object.position);
          const rotation = new Vector3(
            object.rotation.x,
            object.rotation.y,
            object.rotation.z
          );
          const scale = new Vector3().copy(object.scale);
          
          onTransformComplete(position, rotation, scale);
        }
      };
      
      controls.addEventListener('dragging-changed', (event: { value: boolean }) => {
        if (event.value) {
          onDragStart();
        } else {
          onDragEnd();
        }
      });
      
      return () => {
        controls.removeEventListener('dragging-changed', onDragStart);
        controls.removeEventListener('dragging-changed', onDragEnd);
      };
    }
  }, [object, onTransformComplete]);
  
  if (!object || !enabled) return null;
  
  return (
    <TransformControls
      ref={transformRef}
      object={object}
      mode={mode}
      size={size}
      showX={showX}
      showY={showY}
      showZ={showZ}
      camera={camera}
    />
  );
} 