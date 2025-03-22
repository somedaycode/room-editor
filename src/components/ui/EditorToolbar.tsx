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
  
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isRotateMenuOpen, setIsRotateMenuOpen] = useState(false);
  
  // 모델 회전 핸들러 (지정된 각도만큼 회전)
  const handleRotate = (degrees: number) => {
    if (!selectedInstanceId) return;
    
    const { instances, updateInstanceProperty } = useEditorStore.getState();
    const instance = instances.find(i => i.id === selectedInstanceId);
    
    if (instance) {
      const currentRotation = [...instance.rotation];
      // 라디안으로 변환 (PI/180 * degrees)
      currentRotation[1] = currentRotation[1] + (Math.PI / 180 * degrees);
      updateInstanceProperty(selectedInstanceId, 'rotation', currentRotation);
    }
    
    // 회전 메뉴 닫기
    setIsRotateMenuOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200">
      {/* 로고 및 프로젝트 정보 */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold mr-4">AI XR 인테리어 에디터</h1>
      </div>
      
      {/* 에디팅 도구 */}
      <div className="flex items-center space-x-2">
        {/* 편집 모드 드롭다운 */}
        <div className="relative">
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 flex items-center space-x-1"
            onClick={() => setIsEditMenuOpen(!isEditMenuOpen)}
            title="편집 모드"
          >
            {/* 현재 선택된 모드에 따라 아이콘 표시 */}
            {editMode === 'combined' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            )}
            {editMode === 'translate' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10" />
              </svg>
            )}
            {editMode === 'rotate' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            <span className="text-sm font-medium">
              {editMode === 'combined' && '이동 및 회전'}
              {editMode === 'translate' && '이동'}
              {editMode === 'rotate' && '회전'}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* 편집 모드 드롭다운 메뉴 */}
          {isEditMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 overflow-hidden">
              <div className="py-1">
                <button 
                  className={`w-full px-4 py-2 text-left text-sm ${
                    editMode === 'combined' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  } flex items-center`}
                  onClick={() => {
                    setEditMode('combined');
                    setIsEditMenuOpen(false);
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                  이동 및 회전
                </button>
                <button 
                  className={`w-full px-4 py-2 text-left text-sm ${
                    editMode === 'translate' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  } flex items-center`}
                  onClick={() => {
                    setEditMode('translate');
                    setIsEditMenuOpen(false);
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10" />
                  </svg>
                  이동
                </button>
                <button 
                  className={`w-full px-4 py-2 text-left text-sm ${
                    editMode === 'rotate' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  } flex items-center`}
                  onClick={() => {
                    setEditMode('rotate');
                    setIsEditMenuOpen(false);
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  회전
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* 회전 버튼 및 드롭다운 메뉴 */}
        <div className="relative">
          <button
            className={`px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 flex items-center ${
              !selectedInstanceId ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => selectedInstanceId && setIsRotateMenuOpen(!isRotateMenuOpen)}
            disabled={!selectedInstanceId}
            title="회전 옵션"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* 회전 드롭다운 메뉴 */}
          {isRotateMenuOpen && selectedInstanceId && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 overflow-hidden">
              <div className="py-1">
                <button 
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => handleRotate(-45)}
                >
                  <svg className="w-5 h-5 mr-2 transform -scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  45° 왼쪽으로
                </button>
                <button 
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => handleRotate(45)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  45° 오른쪽으로
                </button>
                <button 
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => handleRotate(-90)}
                >
                  <svg className="w-5 h-5 mr-2 transform -scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  90° 왼쪽으로
                </button>
                <button 
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => handleRotate(90)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  90° 오른쪽으로
                </button>
                <button 
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => handleRotate(180)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17l-4 4m0 0l-4-4m4 4V3" />
                  </svg>
                  180° 회전
                </button>
              </div>
            </div>
          )}
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