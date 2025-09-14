import React, { useState, useEffect } from 'react';
import { List, Moon, Plus, Trash2, Heart, Smile, MessageSquare } from 'lucide-react';
import { DayData, Diary } from '../../data/types';

// 카테고리 설정
const itemCategories = [
  '업무', '학습', '운동', '취미', '사람들', '기타'
];

const categoryIcons: { [key: string]: string } = {
  '업무': '💼',
  '학습': '📚',
  '운동': '💪',
  '취미': '🎨',
  '사람들': '👥',
  '기타': '📝'
};

interface DiaryTabProps {
  dayData: DayData;
  updateCurrentDayData: (updates: Partial<DayData>) => void;
  addCompletedItem: (text: string, category: string) => void;
  deleteCompletedItem: (id: number) => void;
}

const DiaryTab: React.FC<DiaryTabProps> = ({
  dayData,
  updateCurrentDayData,
  addCompletedItem,
  deleteCompletedItem
}) => {
  const [newCompletedItem, setNewCompletedItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [summary, setSummary] = useState('');
  const [thankDiary, setThankDiary] = useState('');
  const [tomorrowGoals, setTomorrowGoals] = useState('');

  // 컴포넌트 마운트 시에만 초기값 설정
  useEffect(() => {
    setSummary(dayData.dailyReport?.summary || '');
    setThankDiary(dayData.dailyReport?.gratitude || '');
    setTomorrowGoals(dayData.dailyReport?.tomorrow_goals || '');
  }, [dayData.dailyReport?.summary, dayData.dailyReport?.gratitude, dayData.dailyReport?.tomorrow_goals]);

  const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSummary(value);
  };

  const handleThankDiaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setThankDiary(value);
  };


  const handleTomorrowGoalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTomorrowGoals(value);
  };

  // 포커스가 벗어날 때만 부모 상태 업데이트
  const handleSummaryBlur = () => {
    updateCurrentDayData({ 
      dailyReport: { 
        ...dayData.dailyReport, 
        summary: summary,
        updated_at: new Date().toISOString() 
      } 
    });
  };

  const handleThankDiaryBlur = () => {
    updateCurrentDayData({ 
      dailyReport: { 
        ...dayData.dailyReport, 
        gratitude: thankDiary,
        updated_at: new Date().toISOString() 
      } 
    });
  };


  const handleTomorrowGoalsBlur = () => {
    updateCurrentDayData({ 
      dailyReport: { 
        ...dayData.dailyReport, 
        tomorrow_goals: tomorrowGoals,
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
    <div className="space-y-2 lg:space-y-4">
      <div className="bg-white p-4 lg:p-6 rounded-2xl border">
        <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
          <List className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-purple-600" />
          있었던 일들
        </h3>
       
        {/* 완료된 일 추가 폼 */}
        <div className="mb-6 space-y-4">
          {/* 모바일에서는 세로 배치, 데스크탑에서는 가로 배치 */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <input
              type="text"
              value={newCompletedItem}
              onChange={(e) => setNewCompletedItem(e.target.value)}
              placeholder="오늘 했던 일을 입력하세요"
              className="flex-1 p-3 sm:p-4 lg:p-5 border rounded-xl focus:ring-2 focus:ring-purple-500 text-base sm:text-lg lg:text-xl"
              onKeyDown={(e) => e.key === 'Enter' && (addCompletedItem(newCompletedItem, selectedCategory), setNewCompletedItem(''))}
            />
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 sm:flex-none p-3 sm:p-4 lg:p-5 border rounded-xl focus:ring-2 focus:ring-purple-500 text-base sm:text-lg lg:text-xl bg-white min-w-[120px]"
              >
                {itemCategories.map(category => (
                  <option key={category} value={category}>
                    {categoryIcons[category]} {category}
                  </option>
                ))}
              </select>
              <button
                onClick={() => (addCompletedItem(newCompletedItem, selectedCategory), setNewCompletedItem(''))}
                className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 flex items-center text-base sm:text-lg lg:text-xl"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* 완료된 일 목록 */}
        <div className="space-y-3 lg:space-y-4">
          {!Array.isArray(dayData.diary) || dayData.diary.length === 0 ? (
            <div className="text-center py-8 lg:py-12 text-black">
              <List className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-4 text-black" />
              <p className="text-lg lg:text-xl">아직 완료된 일이 없습니다. 오늘 했던 일들을 추가해보세요!</p>
            </div>
          ) : (
            (Array.isArray(dayData.diary) ? dayData.diary : []).map((item: Diary) => (
              <div key={item.daily_report_id} className={`flex items-start sm:items-center justify-between p-3 sm:p-4 lg:p-6 rounded-xl border gap-3`}>
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
                  <span className="text-xl sm:text-2xl lg:text-3xl flex-shrink-0">{categoryIcons[item.category as keyof typeof categoryIcons]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-base sm:text-lg lg:text-xl font-medium break-words">{item.content}</p>
                    <p className="text-xs sm:text-sm lg:text-base text-black">
                      {new Date(item.created_at).toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteCompletedItem(item.daily_report_id)}
                  className="p-1 sm:p-2 text-red-500 hover:bg-red-100 rounded-lg flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-2xl border">
        <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
          <Moon className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-black" />
          하루 한줄 요약
        </h3>
        <input
          type="text"
          value={summary}
          onChange={handleSummaryChange}
          onBlur={handleSummaryBlur}
          placeholder="오늘 하루를 한 줄로 요약한다면?"
          className="w-full p-4 lg:p-5 border rounded-xl focus:ring-2 focus:ring-gray-500 text-lg lg:text-xl"
        />
      </div>


      <div className="bg-white p-4 lg:p-6 rounded-2xl border">
        <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
          <Heart className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-pink-600" />
          감사일기
        </h3>
        <input
          type="text"
          value={thankDiary}
          onChange={handleThankDiaryChange}
          onBlur={handleThankDiaryBlur}
          placeholder="오늘 감사했던 일을 한 줄로 적어보세요"
          className="w-full p-4 lg:p-5 border rounded-xl focus:ring-2 focus:ring-pink-500 text-lg lg:text-xl"
        />
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-2xl border">
        <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
          <MessageSquare className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-purple-600" />
          내일의 나에게
        </h3>
        <input
          type="text"
          value={tomorrowGoals}
          onChange={handleTomorrowGoalsChange}
          onBlur={handleTomorrowGoalsBlur}
          placeholder="오늘 했던 일들을 돌아보고 내일 할 일을 한 줄로 정리해보세요"
          className="w-full p-4 lg:p-5 border rounded-xl focus:ring-2 focus:ring-purple-500 text-lg lg:text-xl"
        />
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-2xl border">
        <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
          <Smile className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-yellow-600" />
          오늘의 기분
        </h3>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl lg:text-5xl mb-2">{getMoodEmoji(currentMood)}</div>
            <div className="text-lg lg:text-xl font-medium text-black">{currentMood}</div>
          </div>
          <div className="flex justify-center gap-2 lg:gap-3">
            {(['매우나쁨', '나쁨', '보통', '좋음', '매우좋음'] as const).map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodChange(mood)}
                className={`p-3 lg:p-4 rounded-xl text-2xl lg:text-3xl transition-all ${
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