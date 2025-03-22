'use client';

import { useRef, useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import { Object3D, Group, Mesh, Vector3 } from 'three';

interface CustomTransformControlsProps {
  object: Object3D | Group | Mesh | null;
  mode: 'translate' | 'rotate' | 'scale' | 'combined';
  size?: number;
  showX?: boolean;
  showY?: boolean;
  showZ?: boolean;
  enabled?: boolean;
  camera?: any;
  onMouseDown?: () => void;
  onChange?: () => void;
  onMouseUp?: () => void;
}

export default function CustomTransformControls({
  object,
  mode,
  size = 0.75,
  showX = true,
  showY = true,
  showZ = true,
  enabled = true,
  camera,
  onMouseDown,
  onChange,
  onMouseUp
}: CustomTransformControlsProps) {
  const { camera: defaultCamera } = useThree();
  const translateControlsRef = useRef<any>(null);
  const rotateControlsRef = useRef<any>(null);
  
  // 실제 사용할 카메라
  const usedCamera = camera || defaultCamera;
  
  // 커스텀 이벤트 처리
  useEffect(() => {
    if (mode === 'combined' && translateControlsRef.current && rotateControlsRef.current) {
      // 이벤트 처리
      const handleMouseDown = () => {
        if (onMouseDown) onMouseDown();
      };
      
      const handleChange = () => {
        if (onChange) onChange();
      };
      
      const handleMouseUp = () => {
        if (onMouseUp) onMouseUp();
      };
      
      // 이벤트 리스너 등록
      translateControlsRef.current.addEventListener('mouseDown', handleMouseDown);
      translateControlsRef.current.addEventListener('change', handleChange);
      translateControlsRef.current.addEventListener('mouseUp', handleMouseUp);
      
      rotateControlsRef.current.addEventListener('mouseDown', handleMouseDown);
      rotateControlsRef.current.addEventListener('change', handleChange);
      rotateControlsRef.current.addEventListener('mouseUp', handleMouseUp);
      
      // 클린업 함수
      return () => {
        if (translateControlsRef.current) {
          translateControlsRef.current.removeEventListener('mouseDown', handleMouseDown);
          translateControlsRef.current.removeEventListener('change', handleChange);
          translateControlsRef.current.removeEventListener('mouseUp', handleMouseUp);
        }
        
        if (rotateControlsRef.current) {
          rotateControlsRef.current.removeEventListener('mouseDown', handleMouseDown);
          rotateControlsRef.current.removeEventListener('change', handleChange);
          rotateControlsRef.current.removeEventListener('mouseUp', handleMouseUp);
        }
      };
    }
  }, [mode, onMouseDown, onChange, onMouseUp]);

  if (!object || !enabled) return null;
  
  // 'combined' 모드일 때 이동과 회전 컨트롤을 동시에 표시
  if (mode === 'combined') {
    return (
      <>
        <TransformControls
          ref={translateControlsRef}
          object={object}
          mode="translate"
          size={size}
          showX={showX}
          showY={showY}
          showZ={showZ}
          camera={usedCamera}
          onMouseDown={onMouseDown}
          onChange={onChange}
          onMouseUp={onMouseUp}
        />
        <TransformControls
          ref={rotateControlsRef}
          object={object}
          mode="rotate"
          size={size}
          showX={false}
          showY={true}
          showZ={false}
          camera={usedCamera}
          onMouseDown={onMouseDown}
          onChange={onChange}
          onMouseUp={onMouseUp}
        />
      </>
    );
  }
  
  // 일반 모드일 때는 기본 TransformControls 사용
  return (
    <TransformControls
      object={object}
      mode={mode}
      size={size}
      showX={showX}
      showY={showY}
      showZ={showZ}
      camera={usedCamera}
      onMouseDown={onMouseDown}
      onChange={onChange}
      onMouseUp={onMouseUp}
    />
  );
} 