import { supabase, isSupabaseAvailable } from '../../shared/services/supabase';
import { DailyReport } from '../../shared/types/types';
import { getCurrentUser } from '../../auth/services/authService';

// 일일 리포트 업데이트 (Supabase + 로컬스토리지 백업)
export const updateDailyReport = async (date: string, updates: Partial<DailyReport>): Promise<void> => {
  console.log('updateDailyReport 호출됨:', { date, updates: JSON.stringify(updates) });

  // 빈 객체인 경우 업데이트하지 않음 (불필요한 DB 호출 방지)
  if (!updates || Object.keys(updates).length === 0) {
    console.log('📝 업데이트할 dailyReport 데이터가 없음, 건너뜀');
    return;
  }

  // 항상 로컬스토리지에는 저장
  updateDailyReportInLocalStorage(date, updates);

  if (!isSupabaseAvailable()) {
    console.log('Supabase가 사용 불가능합니다. 로컬스토리지에만 저장합니다.');
    return;
  }

  try {
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) {
      console.log('사용자 인증이 필요합니다. 로컬스토리지에만 저장합니다.');
      return;
    }

    // lessons_learned 필드 제거 (데이터베이스에서 삭제됨)
    const { lessons_learned, ...validUpdates } = updates as any;

    console.log('Supabase에 저장 시도 중:', { user_id: user.id, date, validUpdates });

    const { error } = await supabase!.from('daily_reports')
      .upsert({
        user_id: user.id,
        date,
        ...validUpdates,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'date,user_id'
      });

    if (error) {
      console.error('일일 리포트 업데이트 중 오류:', error);
      console.error('오류 상세 정보:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error('업데이트 시도 데이터:', { user_id: user.id, date, ...updates });
    }
  } catch (error) {
    console.error('Supabase 일일 리포트 업데이트 중 오류:', error);
  }
};


// 로컬스토리지 관련 함수들 (3-3-3 시스템 최적화)
const updateDailyReportInLocalStorage = (date: string, updates: Partial<DailyReport>): void => {
  if (typeof window === 'undefined') return;

  try {
    const savedData = localStorage.getItem('selfDevelopmentData');
    const currentData = savedData ? JSON.parse(savedData) : {};

    if (!currentData[date]) {
      currentData[date] = {
        todos: [], // DO: 최대 3개
        thoughts: [], // THINK: 최대 3개
        dailyReport: {
          date,
          summary: '', // 오늘 한줄
          gratitude: '', // 감사일기
          tomorrow_goals: '', // 내일 집중
          mood: '보통',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        diary: [] // 호환성을 위한 필드
      };
    }

    currentData[date].dailyReport = {
      ...currentData[date].dailyReport,
      ...updates,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem('selfDevelopmentData', JSON.stringify(currentData));
  } catch (error) {
    console.error('로컬스토리지 일일 리포트 업데이트 중 오류:', error);
  }
};