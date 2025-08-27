import React, { useState, useEffect } from 'react';
import { Calendar, Save, Edit3, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { WeeklyReport } from '../../shared/types/types';

interface WeeklyReportTabProps {
  weeklyReport: WeeklyReport | null;
  currentWeek: string;
  onSaveWeeklyReport: (report: WeeklyReport) => void;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
}

const WeeklyReportTab: React.FC<WeeklyReportTabProps> = ({
  weeklyReport,
  currentWeek,
  onSaveWeeklyReport,
  onNavigateWeek
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<WeeklyReport>>({
    what_went_well: '',
    what_didnt_go_well: '',
    what_learned: '',
    next_week_goals: '',
    weekly_summary: ''
  });

  useEffect(() => {
    if (weeklyReport) {
      setFormData({
        what_went_well: weeklyReport.what_went_well || '',
        what_didnt_go_well: weeklyReport.what_didnt_go_well || '',
        what_learned: weeklyReport.what_learned || '',
        next_week_goals: weeklyReport.next_week_goals || '',
        weekly_summary: weeklyReport.weekly_summary || ''
      });
    } else {
      setFormData({
        what_went_well: '',
        what_didnt_go_well: '',
        what_learned: '',
        next_week_goals: '',
        weekly_summary: ''
      });
    }
  }, [weeklyReport]);

  const getWeekDateRange = (weekStart: string) => {
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const formatDate = (date: Date) => {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const weekStart = new Date(currentWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const reportData: WeeklyReport = {
      id: weeklyReport?.id,
      week_start_date: currentWeek,
      week_end_date: weekEnd.toISOString().split('T')[0],
      what_went_well: formData.what_went_well || '',
      what_didnt_go_well: formData.what_didnt_go_well || '',
      what_learned: formData.what_learned || '',
      next_week_goals: formData.next_week_goals || '',
      weekly_summary: formData.weekly_summary || '',
      created_at: weeklyReport?.created_at || now,
      updated_at: now
    };

    onSaveWeeklyReport(reportData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (weeklyReport) {
      setFormData({
        what_went_well: weeklyReport.what_went_well || '',
        what_didnt_go_well: weeklyReport.what_didnt_go_well || '',
        what_learned: weeklyReport.what_learned || '',
        next_week_goals: weeklyReport.next_week_goals || '',
        weekly_summary: weeklyReport.weekly_summary || ''
      });
    }
    setIsEditing(false);
  };

  const hasContent = weeklyReport && (
    weeklyReport.what_went_well ||
    weeklyReport.what_didnt_go_well ||
    weeklyReport.what_learned ||
    weeklyReport.next_week_goals ||
    weeklyReport.weekly_summary
  );

  return (
    <div className="space-y-4 lg:space-y-6 max-w-4xl mx-auto">
      {/* 주간 네비게이션 */}
      <div className="bg-white p-4 lg:p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigateWeek('prev')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              <h2 className="text-lg lg:text-xl font-semibold">주간 회고</h2>
            </div>
            <p className="text-sm lg:text-base text-gray-600">
              {getWeekDateRange(currentWeek)}
            </p>
          </div>
          
          <button
            onClick={() => onNavigateWeek('next')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 주간 회고 폼 */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl lg:text-2xl font-semibold flex items-center">
            <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
            주간 회고 작성
          </h3>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {hasContent ? '수정' : '작성'}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                저장
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
              >
                취소
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* 이번 주에 잘한 것 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎉 이번 주에 잘한 것 (What went well)
            </label>
            {isEditing ? (
              <textarea
                value={formData.what_went_well}
                onChange={(e) => handleInputChange('what_went_well', e.target.value)}
                placeholder="이번 주에 성공적으로 완료한 일들, 잘 해낸 것들을 적어보세요..."
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none h-32"
              />
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl min-h-[8rem]">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {formData.what_went_well || '아직 작성되지 않았습니다.'}
                </p>
              </div>
            )}
          </div>

          {/* 아쉬운 점 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              😔 아쉬운 점 (What didn{`'`}t go well)
            </label>
            {isEditing ? (
              <textarea
                value={formData.what_didnt_go_well}
                onChange={(e) => handleInputChange('what_didnt_go_well', e.target.value)}
                placeholder="개선이 필요한 부분, 아쉬웠던 점들을 적어보세요..."
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none h-32"
              />
            ) : (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl min-h-[8rem]">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {formData.what_didnt_go_well || '아직 작성되지 않았습니다.'}
                </p>
              </div>
            )}
          </div>

          {/* 배운 점 / 인사이트 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💡 배운 점 / 인사이트 (What I learned)
            </label>
            {isEditing ? (
              <textarea
                value={formData.what_learned}
                onChange={(e) => handleInputChange('what_learned', e.target.value)}
                placeholder="이번 주에 얻은 깨달음, 새로운 지식, 인사이트를 적어보세요..."
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none h-32"
              />
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl min-h-[8rem]">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {formData.what_learned || '아직 작성되지 않았습니다.'}
                </p>
              </div>
            )}
          </div>

          {/* 다음 주 목표 / 전략 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 다음 주 목표 / 전략 (Plan for next week)
            </label>
            {isEditing ? (
              <textarea
                value={formData.next_week_goals}
                onChange={(e) => handleInputChange('next_week_goals', e.target.value)}
                placeholder="다음 주에 집중할 목표와 실행 전략을 적어보세요..."
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none h-32"
              />
            ) : (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl min-h-[8rem]">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {formData.next_week_goals || '아직 작성되지 않았습니다.'}
                </p>
              </div>
            )}
          </div>

          {/* 한 줄 회고 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 한 줄 회고 (Weekly summary in 1 sentence)
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.weekly_summary}
                onChange={(e) => handleInputChange('weekly_summary', e.target.value)}
                placeholder="이번 주를 한 문장으로 요약해보세요..."
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-gray-700 italic text-lg">
                  {`"${formData.weekly_summary || '아직 작성되지 않았습니다.'}"`}
                </p>
              </div>
            )}
            {isEditing && (
              <div className="text-sm text-gray-500 mt-1 text-right">
                {formData.weekly_summary?.length || 0}/100
              </div>
            )}
          </div>
        </div>
      </div>

      {!isEditing && !hasContent && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-400" />
          <p className="text-blue-700 mb-4">
            이번 주의 회고를 작성해보세요. 
            <br />
            한 주를 돌아보고 다음 주를 계획하는 시간을 가져보세요.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium"
          >
            주간 회고 시작하기
          </button>
        </div>
      )}
    </div>
  );
};

export default WeeklyReportTab;