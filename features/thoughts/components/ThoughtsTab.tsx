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
    <div className="space-y-2 lg:space-y-4">
      {/* 오늘의 생각&배운점 섹션 */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl lg:text-2xl font-semibold flex items-center">
            <Lightbulb className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-orange-500" />
            생각 & 배운점
          </h3>
        </div>
        
        {/* 새 생각 추가 폼 */}
        <div className="mb-6">
          <div className="flex gap-3 lg:gap-4">
            <input
              ref={thoughtInputRef}
              type="text"
              value={newThought}
              onChange={(e) => setNewThought(e.target.value)}
              placeholder="오늘의 생각이나 배운 점을 적어보세요"
              className="flex-1 p-4 lg:p-5 border rounded-xl focus:ring-2 focus:ring-orange-500 text-lg lg:text-xl"
              onKeyPress={(e) => e.key === 'Enter' && addThought()}
            />
            <button
              onClick={addThought}
              className="px-6 lg:px-8 py-4 lg:py-5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 flex items-center text-lg lg:text-xl"
            >
              <Plus className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
          </div>
        </div>

        {/* 생각 리스트 */}
        <div className="space-y-3 lg:space-y-4">
          {morningThoughts.length === 0 ? (
            <div className="text-center py-12 lg:py-16 text-gray-500">
              <Lightbulb className="h-16 w-16 lg:h-20 lg:w-20 mx-auto mb-4 text-gray-300" />
              <p className="text-lg lg:text-xl">아직 생각이나 배운 점이 없습니다. 오늘의 인사이트를 기록해보세요!</p>
            </div>
          ) : (
            morningThoughts.map((thought, index) => (
              <div key={thought.id} className="flex items-center gap-4 p-4 lg:p-6 rounded-xl border bg-orange-50 border-orange-200">
                <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-orange-500 text-white rounded-full text-sm lg:text-base font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-lg lg:text-xl text-gray-800">{thought.text}</p>
                </div>
                <button
                  onClick={() => removeThought(thought.id!)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 lg:h-6 lg:w-6" />
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