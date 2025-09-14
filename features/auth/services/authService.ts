import { supabase } from '../../shared/services/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at?: string;
}

// Google OAuth로 로그인
export const signInWithGoogle = async (): Promise<{ data?: any; error?: any }> => {
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      },
    });

    return { data, error };
  } catch (error) {
    console.error('Google 로그인 실패:', error);
    return { error };
  }
};

// 로그아웃
export const signOut = async (): Promise<{ error?: any }> => {
  if (!supabase) {
    return { error: new Error('Supabase가 설정되지 않았습니다.') };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('로그아웃 실패:', error);
    return { error };
  }
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = async (): Promise<{ user?: AuthUser; error?: any }> => {
  if (!supabase) {
    return { error: new Error('Supabase가 설정되지 않았습니다.') };
  }

  try {
    // getSession을 먼저 호출해서 세션이 있는지 확인
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      // 세션이 없거나 사용자가 없으면 undefined 반환 (에러가 아님)
      return { user: undefined };
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return { error };
    }

    if (!user) {
      return { user: undefined };
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || '',
      avatar_url: user.user_metadata?.avatar_url,
      created_at: user.created_at,
    };

    return { user: authUser };
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    return { error };
  }
};

// 현재 세션 가져오기
export const getCurrentSession = async (): Promise<{ session?: Session | null; error?: any }> => {
  if (!supabase) {
    return { error: new Error('Supabase가 설정되지 않았습니다.') };
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  } catch (error) {
    console.error('세션 가져오기 실패:', error);
    return { error };
  }
};

// 인증 상태 변경 리스너
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  if (!supabase) {
    return { unsubscribe: () => {} };
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || 
                session.user.user_metadata?.name || 
                session.user.email || '',
          avatar_url: session.user.user_metadata?.avatar_url,
          created_at: session.user.created_at,
        };
        callback(authUser);
      } else {
        callback(null);
      }
    }
  );

  return {
    unsubscribe: () => subscription?.unsubscribe()
  };
};

// 로컬스토리지에서 기존 데이터를 인증된 사용자의 데이터로 마이그레이션
export const migrateLocalDataToUser = async (userId: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !supabase) {
    return false;
  }

  try {
    const localData = localStorage.getItem('push-myself-data');
    if (!localData) {
      return true; // 마이그레이션할 데이터가 없음
    }

    const data = JSON.parse(localData);
    console.log('로컬 데이터를 사용자 계정으로 마이그레이션 중...');

    // 기존 로직과 동일하지만 user_id 필드 추가
    for (const [date, dayData] of Object.entries(data)) {
      if (typeof dayData === 'object' && dayData !== null) {
        const typedDayData = dayData as any;

        // Todos 마이그레이션
        if (typedDayData.todos && Array.isArray(typedDayData.todos)) {
          for (const todo of typedDayData.todos) {
            await supabase.from('todos').upsert({
              ...todo,
              user_id: userId,
              date: date
            });
          }
        }

        // Thoughts 마이그레이션
        if (typedDayData.thoughts && Array.isArray(typedDayData.thoughts)) {
          for (const thought of typedDayData.thoughts) {
            await supabase.from('thoughts').upsert({
              ...thought,
              user_id: userId,
              date: date
            });
          }
        }

        // Daily Report 마이그레이션
        if (typedDayData.dailyReport) {
          await supabase.from('daily_reports').upsert({
            ...typedDayData.dailyReport,
            user_id: userId,
            date: date
          });
        }
      }
    }

    // 마이그레이션 완료 후 로컬스토리지 백업 생성
    localStorage.setItem('push-myself-data-backup', localData);
    localStorage.removeItem('push-myself-data');
    
    console.log('✅ 로컬 데이터 마이그레이션 완료');
    return true;
  } catch (error) {
    console.error('데이터 마이그레이션 실패:', error);
    return false;
  }
};