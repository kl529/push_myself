import React, { useState, useRef } from 'react';
import { Lightbulb, Plus, X } from 'lucide-react';
import { DayData, Thought } from '../../shared/types/types';

interface ThoughtsTabProps {
  dayData: DayData;
  updateCurrentDayData: (updates: Partial<DayData>) => void;
  showWarning: (message: string) => void;
}

const ThoughtsTab: React.FC<ThoughtsTabProps> = ({
  dayData,
  updateCurrentDayData,
  showWarning
}) => {
  const [newThought, setNewThought] = useState('');
  const thoughtInputRef = useRef<HTMLInputElement>(null);

  const addThought = () => {
    if (newThought.trim()) {
      // 오늘의 생각&배운점 3개 제한 체크
      const morningThoughts = (dayData.thoughts || []).filter(thought => thought.type === 'morning');
      if (morningThoughts.length >= 3) {
        showWarning('오늘의 생각&배운점은 하루에 3개까지만 작성할 수 있습니다.');
        return;
      }
      
      const newThoughtItem: Thought = {
        id: Date.now(),
        text: newThought.trim(),
        type: 'morning',
        date: new Date().toISOString().split('T')[0]
      };
      updateCurrentDayData({
        thoughts: [...(dayData.thoughts || []), newThoughtItem]
      });
      setNewThought('');
      
      setTimeout(() => {
        if (thoughtInputRef.current) {
          thoughtInputRef.current.focus();
          thoughtInputRef.current.setSelectionRange(0, 0);
        }
      }, 200);
    }
  };

  const removeThought = (id: number) => {
    updateCurrentDayData({
      thoughts: (dayData.thoughts || []).filter(thought => thought.id && thought.id !== id)
    });
  };

  const morningThoughts = (dayData.thoughts || []).filter(thought => thought.type === 'morning' && thought.id);

  return (
    <div className="space-y-3 lg:space-y-4 p-2 sm:p-0">
      {/* 오늘의 생각&배운점 섹션 - 모바일 최적화 */}
      <div className="bg-white p-3 sm:p-4 lg:p-6 xl:p-8 rounded-xl lg:rounded-2xl border">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold flex items-center">
            <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-orange-500" />
            <span>생각 & 배운점</span>
          </h3>
        </div>

        {/* 새 생각 추가 폼 - 모바일 최적화 */}
        <div className="mb-4 lg:mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
            <input
              ref={thoughtInputRef}
              type="text"
              value={newThought}
              onChange={(e) => setNewThought(e.target.value)}
              placeholder="오늘의 생각이나 배운 점을 적어보세요"
              className="flex-1 p-3 sm:p-4 lg:p-5 border rounded-lg lg:rounded-xl focus:ring-2 focus:ring-orange-500 text-sm sm:text-base lg:text-lg xl:text-xl"
              onKeyPress={(e) => e.key === 'Enter' && addThought()}
            />
            <button
              onClick={addThought}
              className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 bg-orange-500 text-white rounded-lg lg:rounded-xl hover:bg-orange-600 active:bg-orange-700 flex items-center justify-center text-sm sm:text-base lg:text-lg xl:text-xl touch-manipulation"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              <span className="hidden sm:inline ml-1 lg:ml-2">추가</span>
            </button>
          </div>
        </div>

        {/* 생각 리스트 - 모바일 최적화 */}
        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
          {morningThoughts.length === 0 ? (
            <div className="text-center py-8 sm:py-12 lg:py-16 text-gray-500">
              <Lightbulb className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 mx-auto mb-3 lg:mb-4 text-gray-300" />
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl px-4">아직 생각이나 배운 점이 없습니다. 오늘의 인사이트를 기록해보세요!</p>
            </div>
          ) : (
            morningThoughts.map((thought, index) => (
              <div key={thought.id} className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6 rounded-lg lg:rounded-xl border bg-orange-50 border-orange-200">
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-orange-500 text-white rounded-full text-xs sm:text-sm lg:text-base font-bold flex-shrink-0 mt-0.5 sm:mt-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-800 break-words">{thought.text}</p>
                </div>
                <button
                  onClick={() => removeThought(thought.id!)}
                  className="p-1.5 sm:p-2 text-red-500 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors touch-manipulation flex-shrink-0"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ThoughtsTab;