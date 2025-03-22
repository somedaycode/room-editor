'use client';

import { useState } from 'react';
import { Model, Category } from '../../types';
import { useEditorStore } from '../../store/editorStore';

interface ModelsSidebarProps {
  models: Model[];
  onAddModel: (modelId: string) => void;
}

export default function ModelsSidebar({ models, onAddModel }: ModelsSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const isLoading = useEditorStore((state) => state.isLoading);
  
  // 카테고리 및 검색어 필터링
  const filteredModels = models.filter((model) => {
    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory;
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         model.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // 카테고리 목록
  const categories: { id: Category | 'all'; label: string }[] = [
    { id: 'all', label: '전체' },
    { id: Category.FURNITURE, label: '가구' },
    { id: Category.DECORATION, label: '장식' },
    { id: Category.LIGHTING, label: '조명' },
    { id: Category.ELECTRONICS, label: '전자제품' },
    { id: Category.KITCHEN, label: '주방' },
    { id: Category.BATHROOM, label: '욕실' },
    { id: Category.FIXTURES, label: '장치류' },
    { id: Category.OUTDOOR, label: '실외' },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-2">모델 갤러리</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="모델 검색..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      <div className="p-2 border-b border-gray-200 flex overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-3 py-1 mr-1 text-sm rounded-full whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredModels.map((model) => (
              <div
                key={model.id}
                className="border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-28 bg-gray-100 flex items-center justify-center">
                  {/* 실제 이미지 대신 색상 블록과 텍스트 사용 */}
                  <div 
                    className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 font-medium"
                    style={{ 
                      backgroundColor: model.category === Category.FURNITURE ? '#e6f7ff' :
                                       model.category === Category.DECORATION ? '#f6ffed' :
                                       model.category === Category.LIGHTING ? '#fffbe6' :
                                       model.category === Category.ELECTRONICS ? '#fcf4ff' :
                                       model.category === Category.KITCHEN ? '#fff2e8' :
                                       '#f9f0ff'
                    }}
                  >
                    {model.name}
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-medium truncate">{model.name}</h3>
                  <p className="text-xs text-gray-500 h-8 overflow-hidden">
                    {model.description.substring(0, 50)}
                    {model.description.length > 50 ? '...' : ''}
                  </p>
                  <button
                    className="mt-1 w-full text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    onClick={() => onAddModel(model.id)}
                  >
                    추가하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 