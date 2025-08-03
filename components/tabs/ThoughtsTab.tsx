import React, { useState } from 'react';
import { Coffee, Lightbulb, Plus, X } from 'lucide-react';
import { DayData, ThoughtItem } from '../../data';

interface ThoughtsTabProps {
  dayData: DayData;
  updateCurrentDayData: (updates: Partial<DayData>) => void;
}

const ThoughtsTab: React.FC<ThoughtsTabProps> = ({
  dayData,
  updateCurrentDayData
}) => {
  const [newMorningThought, setNewMorningThought] = useState('');
  const [newDailyIdea, setNewDailyIdea] = useState('');

  const addMorningThought = () => {
    if (newMorningThought.trim()) {
      const newThought: ThoughtItem = {
        id: Date.now(),
        text: newMorningThought.trim(),
        timestamp: new Date().toISOString()
      };
      updateCurrentDayData({
        morningThoughts: [...(dayData.morningThoughts || []), newThought]
      });
      setNewMorningThought('');
    }
  };

  const removeMorningThought = (id: number) => {
    updateCurrentDayData({
      morningThoughts: (dayData.morningThoughts || []).filter(thought => thought.id !== id)
    });
  };

  const addDailyIdea = () => {
    if (newDailyIdea.trim()) {
      const newIdea: ThoughtItem = {
        id: Date.now(),
        text: newDailyIdea.trim(),
        timestamp: new Date().toISOString()
      };
      updateCurrentDayData({
        dailyIdeas: [...(dayData.dailyIdeas || []), newIdea]
      });
      setNewDailyIdea('');
    }
  };

  const removeDailyIdea = (id: number) => {
    updateCurrentDayData({
      dailyIdeas: (dayData.dailyIdeas || []).filter(idea => idea.id !== id)
    });
  };

  return (
    <div className="space-y-2 lg:space-y-4">
      <div className="bg-white p-8 lg:p-10 rounded-2xl border">
        <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
          <Coffee className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-amber-600" />
          아침 생각
        </h3>
        
        {/* 새로운 아침 생각 추가 */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMorningThought}
              onChange={(e) => setNewMorningThought(e.target.value)}
              placeholder="새로운 아침 생각을 입력하세요"
              className="flex-1 p-3 lg:p-4 border rounded-xl focus:ring-2 focus:ring-amber-500 text-lg lg:text-xl"
              onKeyPress={(e) => e.key === 'Enter' && addMorningThought()}
            />
            <button
              onClick={addMorningThought}
              className="px-4 lg:px-6 py-3 lg:py-4 bg-amber-500 text-white rounded-xl hover:bg-amber-600 flex items-center"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 아침 생각 목록 */}
        <div className="space-y-3">
          {(dayData.morningThoughts || []).map((thought) => (
            <div key={thought.id} className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex-1">
                <p className="text-lg lg:text-xl text-gray-800">{thought.text}</p>
              </div>
              <button
                onClick={() => removeMorningThought(thought.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          {(dayData.morningThoughts || []).length === 0 && (
            <p className="text-gray-500 text-center py-4">아직 아침 생각이 없습니다. 위에서 추가해보세요!</p>
          )}
        </div>
      </div>

      <div className="bg-white p-8 lg:p-10 rounded-2xl border">
        <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
          <Lightbulb className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-yellow-600" />
          하루 생각
        </h3>
        
        {/* 새로운 아이디어 추가 */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newDailyIdea}
              onChange={(e) => setNewDailyIdea(e.target.value)}
              placeholder="새로운 아이디어를 입력하세요"
              className="flex-1 p-3 lg:p-4 border rounded-xl focus:ring-2 focus:ring-yellow-500 text-lg lg:text-xl"
              onKeyPress={(e) => e.key === 'Enter' && addDailyIdea()}
            />
            <button
              onClick={addDailyIdea}
              className="px-4 lg:px-6 py-3 lg:py-4 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 flex items-center"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 아이디어 목록 */}
        <div className="space-y-3">
          {(dayData.dailyIdeas || []).map((idea) => (
            <div key={idea.id} className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex-1">
                <p className="text-lg lg:text-xl text-gray-800">{idea.text}</p>
              </div>
              <button
                onClick={() => removeDailyIdea(idea.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          {(dayData.dailyIdeas || []).length === 0 && (
            <p className="text-gray-500 text-center py-4">아직 아이디어가 없습니다. 위에서 추가해보세요!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThoughtsTab; 