import React, { useState, useRef } from 'react';
import { MessageSquare, Heart, Plus, X, Smile } from 'lucide-react';
import { DayData } from '../../shared/types/types';

interface DiaryTabProps {
  dayData: DayData;
  updateCurrentDayData: (updates: Partial<DayData>) => void;
  addCompletedItem: (text: string, category: string) => void;
  deleteCompletedItem: (id: number) => void;
}

const DiaryTab: React.FC<DiaryTabProps> = ({
  dayData,
  updateCurrentDayData
}) => {
  const [newSummary, setNewSummary] = useState('');
  const [newGratitude, setNewGratitude] = useState('');
  const [newTomorrowGoal, setNewTomorrowGoal] = useState('');
  
  const summaryInputRef = useRef<HTMLInputElement>(null);
  const gratitudeInputRef = useRef<HTMLInputElement>(null);
  const tomorrowGoalInputRef = useRef<HTMLInputElement>(null);

  // 즉시 저장 함수들
  const addSummary = () => {
    if (newSummary.trim()) {
      updateCurrentDayData({
        dailyReport: {
          ...dayData.dailyReport,
          summary: newSummary.trim(),
          updated_at: new Date().toISOString()
        }
      });
      setNewSummary('');
      
      setTimeout(() => {
        if (summaryInputRef.current) {
          summaryInputRef.current.focus();
        }
      }, 200);
    }
  };

  const addGratitude = () => {
    if (newGratitude.trim()) {
      updateCurrentDayData({
        dailyReport: {
          ...dayData.dailyReport,
          gratitude: newGratitude.trim(),
          updated_at: new Date().toISOString()
        }
      });
      setNewGratitude('');
      
      setTimeout(() => {
        if (gratitudeInputRef.current) {
          gratitudeInputRef.current.focus();
        }
      }, 200);
    }
  };

  const addTomorrowGoal = () => {
    if (newTomorrowGoal.trim()) {
      updateCurrentDayData({
        dailyReport: {
          ...dayData.dailyReport,
          tomorrow_goals: newTomorrowGoal.trim(),
          updated_at: new Date().toISOString()
        }
      });
      setNewTomorrowGoal('');
      
      setTimeout(() => {
        if (tomorrowGoalInputRef.current) {
          tomorrowGoalInputRef.current.focus();
        }
      }, 200);
    }
  };

  const clearSummary = () => {
    updateCurrentDayData({
      dailyReport: {
        ...dayData.dailyReport,
        summary: '',
        updated_at: new Date().toISOString()
      }
    });
  };

  const clearGratitude = () => {
    updateCurrentDayData({
      dailyReport: {
        ...dayData.dailyReport,
        gratitude: '',
        updated_at: new Date().toISOString()
      }
    });
  };

  const clearTomorrowGoal = () => {
    updateCurrentDayData({
      dailyReport: {
        ...dayData.dailyReport,
        tomorrow_goals: '',
        updated_at: new Date().toISOString()
      }
    });
  };

  const handleMoodChange = (moodString: '보통' | '좋음' | '매우좋음' | '나쁨' | '매우나쁨') => {
    updateCurrentDayData({ 
      dailyReport: { 
        ...dayData.dailyReport, 
        mood: moodString,
        updated_at: new Date().toISOString() 
      } 
    });
  };

  const getMoodEmoji = (mood: string) => {
    const emojiMap: { [key: string]: string } = {
      '매우나쁨': '😢',
      '나쁨': '😕',
      '보통': '😐',
      '좋음': '🙂',
      '매우좋음': '😊'
    };
    return emojiMap[mood] || '😐';
  };

  const currentMood = dayData.dailyReport?.mood || '보통';

  return (
    <div className="space-y-4">
      {/* 1. 오늘 한 줄 */}
      <div className="bg-white p-6 rounded-2xl border">
        <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-blue-600" />
          1. 오늘 한줄 요약
        </h3>
        
        {dayData.dailyReport?.summary ? (
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-sm font-bold">
              ✓
            </div>
            <div className="flex-1">
              <p className="text-lg text-gray-800">{dayData.dailyReport.summary}</p>
            </div>
            <button
              onClick={clearSummary}
              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              ref={summaryInputRef}
              type="text"
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="오늘 하루를 한 줄로 요약한다면?"
              className="flex-1 p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && addSummary()}
            />
            <button
              onClick={addSummary}
              className="px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. 감사일기 */}
      <div className="bg-white p-6 rounded-2xl border">
        <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
          <Heart className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-pink-600" />
          2. 감사일기
        </h3>
        
        {dayData.dailyReport?.gratitude ? (
          <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl border border-pink-200">
            <div className="flex items-center justify-center w-6 h-6 bg-pink-500 text-white rounded-full text-sm font-bold">
              ✓
            </div>
            <div className="flex-1">
              <p className="text-lg text-gray-800">{dayData.dailyReport.gratitude}</p>
            </div>
            <button
              onClick={clearGratitude}
              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              ref={gratitudeInputRef}
              type="text"
              value={newGratitude}
              onChange={(e) => setNewGratitude(e.target.value)}
              placeholder="오늘 감사했던 일을 한 줄로 적어보세요"
              className="flex-1 p-4 border rounded-xl focus:ring-2 focus:ring-pink-500 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && addGratitude()}
            />
            <button
              onClick={addGratitude}
              className="px-6 py-4 bg-pink-500 text-white rounded-xl hover:bg-pink-600 flex items-center"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. 내일 집중 */}
      <div className="bg-white p-6 rounded-2xl border">
        <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-purple-600" />
          3. 내일 집중 할 일
        </h3>
        
        {dayData.dailyReport?.tomorrow_goals ? (
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center justify-center w-6 h-6 bg-purple-500 text-white rounded-full text-sm font-bold">
              ✓
            </div>
            <div className="flex-1">
              <p className="text-lg text-gray-800">{dayData.dailyReport.tomorrow_goals}</p>
            </div>
            <button
              onClick={clearTomorrowGoal}
              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              ref={tomorrowGoalInputRef}
              type="text"
              value={newTomorrowGoal}
              onChange={(e) => setNewTomorrowGoal(e.target.value)}
              placeholder="내일 가장 집중할 한 가지는?"
              className="flex-1 p-4 border rounded-xl focus:ring-2 focus:ring-purple-500 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && addTomorrowGoal()}
            />
            <button
              onClick={addTomorrowGoal}
              className="px-6 py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 flex items-center"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* 기분 트래킹 */}
      <div className="bg-white p-6 rounded-2xl border">
        <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
          <Smile className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-yellow-600" />
          오늘의 기분
        </h3>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">{getMoodEmoji(currentMood)}</div>
            <div className="text-lg font-medium text-gray-700">{currentMood}</div>
          </div>
          <div className="flex justify-center gap-2">
            {(['매우나쁨', '나쁨', '보통', '좋음', '매우좋음'] as const).map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodChange(mood)}
                className={`p-3 rounded-xl text-2xl transition-all ${
                  currentMood === mood
                    ? 'bg-yellow-100 border-2 border-yellow-500 scale-110'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {getMoodEmoji(mood)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaryTab;