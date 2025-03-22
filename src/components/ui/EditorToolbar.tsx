'use client';

import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';

interface EditorToolbarProps {
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function EditorToolbar({ onDelete, onDuplicate }: EditorToolbarProps) {
  const selectedInstanceId = useEditorStore((state) => state.selectedInstanceId);
  const editMode = useEditorStore((state) => state.editMode);
  const setEditMode = useEditorStore((state) => state.setEditMode);
  
  const [isAIMenuOpen, setIsAIMenuOpen] = useState(false);
  
  // 모델 회전 핸들러 (90도 회전)
  const handleRotate90 = () => {
    if (!selectedInstanceId) return;
    
    const { instances, updateInstanceProperty } = useEditorStore.getState();
    const instance = instances.find(i => i.id === selectedInstanceId);
    
    if (instance) {
      const currentRotation = [...instance.rotation];
      currentRotation[1] = currentRotation[1] + Math.PI / 2; // Y축 기준 90도 회전
      updateInstanceProperty(selectedInstanceId, 'rotation', currentRotation);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200">
      {/* 로고 및 프로젝트 정보 */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold mr-4">AI XR 인테리어 에디터</h1>
      </div>
      
      {/* 에디팅 도구 */}
      <div className="flex items-center space-x-2">
        <div className="flex bg-gray-100 rounded-md">
          <button
            className={`px-3 py-1 rounded-l-md ${
              editMode === 'translate' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
            }`}
            onClick={() => setEditMode('translate')}
            title="이동"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10" />
            </svg>
          </button>
          <button
            className={`px-3 py-1 ${
              editMode === 'rotate' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
            }`}
            onClick={() => setEditMode('rotate')}
            title="회전"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            className={`px-3 py-1 rounded-r-md ${
              editMode === 'scale' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
            }`}
            onClick={() => setEditMode('scale')}
            title="크기 조절"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
        </div>
        
        {/* 복제 및 삭제 버튼 */}
        <button
          className={`px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 ${
            !selectedInstanceId ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={onDuplicate}
          disabled={!selectedInstanceId}
          title="복제"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          className={`px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 ${
            !selectedInstanceId ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={onDelete}
          disabled={!selectedInstanceId}
          title="삭제"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {/* 설정 및 저장 */}
      <div className="flex items-center space-x-2">
        <button
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => window.alert('씬이 저장되었습니다.')}
          title="저장"
        >
          저장
        </button>
      </div>
    </div>
  );
} 