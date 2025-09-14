import { supabase, isSupabaseAvailable } from '../../shared/services/supabase';
import { Thought } from '../../shared/types/types';
import { getCurrentUser } from '../../auth/services/authService';

// 생각 추가 (Supabase + 로컬스토리지 백업)
export const addThought = async (date: string, thought: Omit<Thought, 'id' | 'timestamp'>): Promise<void> => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase가 사용 불가능합니다. 로컬스토리지에 저장합니다.');
    addThoughtToLocalStorage(date, thought);
    return;
  }

  try {
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) {
      console.log('사용자 인증이 필요합니다. 로컬스토리지에 저장합니다.');
      addThoughtToLocalStorage(date, thought);
      return;
    }

    const { error } = await supabase!.from('thoughts').insert({
      ...thought,
      user_id: user.id,
      date,
      type: thought.type || 'daily',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('생각 추가 중 오류:', error);
      addThoughtToLocalStorage(date, thought);
    }
  } catch (error) {
    console.error('Supabase 생각 추가 중 오류:', error);
    addThoughtToLocalStorage(date, thought);
  }
};

// 생각 관련 Supabase 업데이트 (날짜별 전체 데이터 업데이트에서 추출)
export const updateThoughtsInSupabase = async (date: string, thoughts: Thought[]): Promise<void> => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase가 사용 불가능합니다.');
    return;
  }

  try {
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) {
      console.log('사용자 인증이 필요합니다.');
      return;
    }

    console.log('🧠 생각 저장 시도:', { date, thoughtsLength: thoughts?.length });

    if (thoughts && thoughts.length > 0) {
      console.log('✅ 생각 데이터가 있음, Supabase에 저장 시작...');

      // 기존 생각 삭제 후 새로 추가 (사용자별 필터링)
      const { error: deleteError } = await supabase!.from('thoughts').delete().eq('date', date).eq('user_id', user.id);
      if (deleteError) {
        console.error('❌ 기존 생각 삭제 중 오류:', deleteError);
      } else {
        console.log('✅ 기존 생각 삭제 완료');
      }

      // 새 생각 추가
      const thoughtsToInsert = thoughts.map(thought => ({
        user_id: user.id,
        date,
        text: thought.text,
        type: thought.type || 'daily',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      console.log('💾 삽입할 생각 데이터:', thoughtsToInsert);
      
      const { data: insertData, error: insertError } = await supabase!.from('thoughts').insert(thoughtsToInsert);
      
      if (insertError) {
        console.error('❌ 생각 추가 중 오류:', insertError);
        console.error('❌ 오류 상세:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        console.error('❌ 삽입 시도 데이터:', thoughtsToInsert);
      } else {
        console.log('✅ 생각 Supabase 저장 성공:', insertData);
      }
    } else {
      console.log('⚠️ 생각 데이터가 없거나 비어있음');
    }
  } catch (error) {
    console.error('Supabase thoughts 업데이트 중 오류:', error);
  }
};

// 로컬스토리지 관련 함수들 (폴백용)
const addThoughtToLocalStorage = (date: string, thought: Omit<Thought, 'id' | 'timestamp'>): void => {
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
          tommorrow_thought: '',
          mood: '보통',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        diary: {
          date,
          summary: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
    
    const newThought: Thought = {
      ...thought,
      type: thought.type || 'daily'
    };
    
    currentData[date].thoughts.push(newThought);
    localStorage.setItem('selfDevelopmentData', JSON.stringify(currentData));
  } catch (error) {
    console.error('로컬스토리지 생각 추가 중 오류:', error);
  }
};