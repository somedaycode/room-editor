'use client';

import { useState } from 'react';
import { Model, ModelInstance } from '../../types';

interface PropertiesPanelProps {
  instance: ModelInstance;
  model: Model;
  onUpdateProperty: (property: keyof ModelInstance, value: any) => void;
}

export default function PropertiesPanel({ 
  instance, 
  model, 
  onUpdateProperty 
}: PropertiesPanelProps) {
  // 상태 관리
  const [tab, setTab] = useState<'transform' | 'appearance'>('transform');
  
  // 숫자 입력 필드 컴포넌트
  const NumberInput = ({ 
    label, 
    value, 
    onChange, 
    step = 0.1, 
    min = -Infinity, 
    max = Infinity 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void;
    step?: number;
    min?: number;
    max?: number;
  }) => (
    <div className="flex flex-col mb-2">
      <label className="text-xs text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        className="px-2 py-1 border border-gray-300 rounded text-sm"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        min={min}
        max={max}
      />
    </div>
  );
  
  // 벡터 입력 필드 (x,y,z)
  const Vector3Input = ({
    label,
    values,
    onChange,
    step = 0.1,
  }: {
    label: string;
    values: [number, number, number];
    onChange: (axis: 0 | 1 | 2, value: number) => void;
    step?: number;
  }) => (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">{label}</h3>
      <div className="grid grid-cols-3 gap-2">
        <NumberInput
          label="X"
          value={values[0]}
          onChange={(value) => onChange(0, value)}
          step={step}
        />
        <NumberInput
          label="Y"
          value={values[1]}
          onChange={(value) => onChange(1, value)}
          step={step}
        />
        <NumberInput
          label="Z"
          value={values[2]}
          onChange={(value) => onChange(2, value)}
          step={step}
        />
      </div>
    </div>
  );
  
  // 위치 업데이트 핸들러
  const handlePositionChange = (axis: 0 | 1 | 2, value: number) => {
    const newPosition: [number, number, number] = [...instance.position];
    newPosition[axis] = value;
    onUpdateProperty('position', newPosition);
  };
  
  // 회전 업데이트 핸들러
  const handleRotationChange = (axis: 0 | 1 | 2, value: number) => {
    const newRotation: [number, number, number] = [...instance.rotation];
    newRotation[axis] = value;
    onUpdateProperty('rotation', newRotation);
  };
  
  // 크기 업데이트 핸들러
  const handleScaleChange = (axis: 0 | 1 | 2, value: number) => {
    const newScale: [number, number, number] = [...instance.scale];
    newScale[axis] = value;
    onUpdateProperty('scale', newScale);
  };
  
  // 가시성 토글 핸들러
  const handleVisibilityToggle = () => {
    onUpdateProperty('isVisible', !instance.isVisible);
  };
  
  // 잠금 토글 핸들러
  const handleLockToggle = () => {
    onUpdateProperty('isLocked', !instance.isLocked);
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4 flex flex-col h-full">
      <div className="mb-4">
        <div className="text-lg font-semibold mb-1">{instance.name}</div>
        <div className="text-xs text-gray-500">{model.description}</div>
      </div>
      
      <div className="flex mb-4 border-b border-gray-200">
        <button
          className={`px-4 py-2 ${
            tab === 'transform'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          }`}
          onClick={() => setTab('transform')}
        >
          변환
        </button>
        <button
          className={`px-4 py-2 ${
            tab === 'appearance'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          }`}
          onClick={() => setTab('appearance')}
        >
          외관
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {tab === 'transform' && (
          <>
            <Vector3Input
              label="위치"
              values={instance.position}
              onChange={handlePositionChange}
            />
            
            <Vector3Input
              label="회전"
              values={instance.rotation}
              onChange={handleRotationChange}
              step={0.1}
            />
            
            <Vector3Input
              label="크기"
              values={instance.scale}
              onChange={handleScaleChange}
              step={0.1}
            />
          </>
        )}
        
        {tab === 'appearance' && (
          <>
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="visibility"
                  className="mr-2"
                  checked={instance.isVisible}
                  onChange={handleVisibilityToggle}
                />
                <label htmlFor="visibility" className="text-sm">가시성</label>
              </div>
              
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="locked"
                  className="mr-2"
                  checked={instance.isLocked}
                  onChange={handleLockToggle}
                />
                <label htmlFor="locked" className="text-sm">변환 잠금</label>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">모델 정보</div>
              <div className="text-xs text-gray-600 mb-1">카테고리: {model.category}</div>
              <div className="text-xs text-gray-600 mb-1">파일 경로: {model.modelPath}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 