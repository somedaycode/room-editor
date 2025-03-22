dimport { AIRecommendation, Model3D, InteriorScene } from '@/types/models';

/**
 * AI 기반 인테리어 추천 서비스
 * (실제 API를 연결하거나 로컬에서 추론하는 로직 구현 필요)
 */
export class AIService {
  /**
   * 현재 인테리어 씬에 기반하여 추천 아이템 가져오기
   */
  static async getRecommendations(
    scene: InteriorScene,
    targetArea: string,
    availableModels: Model3D[]
  ): Promise<AIRecommendation[]> {
    // 실제 구현에서는 AI 모델 API 호출하여 결과 받아오기
    // 여기서는 데모 데이터 반환
    return new Promise((resolve) => {
      setTimeout(() => {
        // 해당 영역에 적합한 모델만 필터링
        const filteredModels = availableModels.filter(
          (model) => model.tags.includes(targetArea)
        );
        
        // 간단한 데모 추천 생성
        const recommendations: AIRecommendation[] = [
          {
            targetArea,
            models: filteredModels.slice(0, 3),
            reason: `${targetArea} 공간에 어울리는 현대적인 디자인의 가구입니다.`,
            score: 0.95,
          },
          {
            targetArea,
            models: filteredModels.slice(3, 6),
            reason: `${targetArea}에 적합한 미니멀한 스타일의 아이템입니다.`,
            score: 0.87,
          },
        ];
        
        resolve(recommendations);
      }, 1000); // 1초 지연 (실제 API 호출 시뮬레이션)
    });
  }
  
  /**
   * 선택된 오브젝트의 최적 배치 위치 제안
   */
  static async suggestOptimalPosition(
    scene: InteriorScene,
    modelId: string
  ): Promise<{ x: number; y: number; z: number }> {
    // 실제 구현에서는 AI 모델을 사용하여 최적 위치 계산
    // 여기서는 간단한 데모 위치 반환
    return new Promise((resolve) => {
      setTimeout(() => {
        // 기본 바닥 위치 (y=0) 및 랜덤한 x, z 좌표 (방 크기 내에서)
        const { width, length } = scene.roomDimensions;
        
        // 방 중앙 근처에 랜덤한 위치 제안
        const position = {
          x: (Math.random() * 0.6 + 0.2) * width - width/2,
          y: 0,
          z: (Math.random() * 0.6 + 0.2) * length - length/2,
        };
        
        resolve(position);
      }, 500);
    });
  }
  
  /**
   * 인테리어 스타일 분석
   */
  static async analyzeInteriorStyle(scene: InteriorScene): Promise<string[]> {
    // 실제 구현에서는 AI 비전 모델을 사용하여 스타일 분석
    return new Promise((resolve) => {
      setTimeout(() => {
        // 간단한 데모 스타일 태그 반환
        const styles = [
          '모던',
          '미니멀리스트',
          '스칸디나비안',
          '세련된'
        ];
        
        resolve(styles);
      }, 800);
    });
  }
} 