import { supabase, isSupabaseAvailable } from '../../shared/services/supabase';
import { DailyReport, Diary } from '../../shared/types/types';

// 일일 리포트 업데이트 (Supabase + 로컬스토리지 백업)
export const updateDailyReport = async (date: string, updates: Partial<DailyReport>): Promise<void> => {
  // 항상 로컬스토리지에는 저장
  updateDailyReportInLocalStorage(date, updates);

  if (!isSupabaseAvailable()) {
    console.log('Supabase가 사용 불가능합니다. 로컬스토리지에만 저장합니다.');
    return;
  }

  try {
    const { error } = await supabase!.from('daily_report')
      .upsert({
        date,
        ...updates,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('일일 리포트 업데이트 중 오류:', error);
    }
  } catch (error) {
    console.error('Supabase 일일 리포트 업데이트 중 오류:', error);
  }
};

// 일기 업데이트 (Supabase + 로컬스토리지 백업)
export const updateDiary = async (date: string, updates: Partial<Diary>): Promise<void> => {
  // 항상 로컬스토리지에는 저장
  updateDiaryInLocalStorage(date, updates);

  if (!isSupabaseAvailable()) {
    console.log('Supabase가 사용 불가능합니다. 로컬스토리지에만 저장합니다.');
    return;
  }

  try {
    // daily_report_id가 필요하므로 먼저 daily_report를 찾거나 생성
    const { data: dailyReport, error: reportError } = await supabase!.from('daily_report')
      .select('id')
      .eq('date', date)
      .single();

    if (reportError && reportError.code !== 'PGRST116') { // PGRST116는 "결과가 없음" 에러
      console.error('daily_report 조회 중 오류:', reportError);
      return;
    }

    let dailyReportId: number;
    if (!dailyReport) {
      // daily_report가 없으면 생성
      const { data: newReport, error: createError } = await supabase!.from('daily_report')
        .insert({
          date,
          summary: '',
          gratitude: '',
          lessons_learned: '',
          tomorrow_goals: '',
          mood: '보통'
        })
        .select('id')
        .single();

      if (createError) {
        console.error('daily_report 생성 중 오류:', createError);
        return;
      }
      dailyReportId = newReport.id;
    } else {
      dailyReportId = dailyReport.id;
    }

    const { error } = await supabase!.from('diary')
      .upsert({
        daily_report_id: dailyReportId, // date → daily_report_id
        ...updates,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('일기 업데이트 중 오류:', error);
    }
  } catch (error) {
    console.error('Supabase 일기 업데이트 중 오류:', error);
  }
};

// 로컬스토리지 관련 함수들 (폴백용)
const updateDailyReportInLocalStorage = (date: string, updates: Partial<DailyReport>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const savedData = localStorage.getItem('selfDevelopmentData');
    const currentData = savedData ? JSON.parse(savedData) : {};
    
    if (!currentData[date]) {
      currentData[date] = {
        todos: [],
        thoughts: [],
        completedItems: [],
        dailyReport: {
          date,
          summary: '',
          gratitude: '', // gratitude → gratitude
          lessons_learned: '', // tommorrow_thought → lessons_learned
          tomorrow_goals: '', // 추가
          mood: '보통', // 기본값
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        diary: {
          daily_report_id: 0, // date → daily_report_id
          content: '', // summary → content
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
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

const updateDiaryInLocalStorage = (date: string, updates: Partial<Diary>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const savedData = localStorage.getItem('selfDevelopmentData');
    const currentData = savedData ? JSON.parse(savedData) : {};
    
    if (!currentData[date]) {
      currentData[date] = {
        todos: [],
        thoughts: [],
        completedItems: [],
        dailyReport: {
          date,
          summary: '',
          gratitude: '',
          lessons_learned: '',
          tomorrow_goals: '',
          mood: '보통',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        diary: {
          daily_report_id: 0,
          content: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
    
    currentData[date].diary = {
      ...currentData[date].diary,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('selfDevelopmentData', JSON.stringify(currentData));
  } catch (error) {
    console.error('로컬스토리지 일기 업데이트 중 오류:', error);
  }
};