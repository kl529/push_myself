import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 클라이언트 사이드에서 환경 변수 가져오기
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // 브라우저 환경에서만 로그 출력
  if (typeof window !== 'undefined') {
    console.log('Supabase Config:', {
      url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'not found',
      key: supabaseAnonKey ? 'found' : 'not found'
    });
  }
  
  return { url: supabaseUrl, key: supabaseAnonKey };
};

// Supabase 클라이언트 생성
const createSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  
  if (!url || !key) {
    // 브라우저 환경에서만 경고 출력
    if (typeof window !== 'undefined') {
      console.warn('Supabase 환경 변수가 설정되지 않았습니다. 로컬스토리지 모드로 전환합니다.');
    }
    return null;
  }
  
  try {
    const client = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: false, // PWA에서 세션 지속성 문제 방지
      },
      realtime: {
        params: {
          eventsPerSecond: 2
        }
      }
    });
    
    if (typeof window !== 'undefined') {
      console.log('Supabase 클라이언트가 성공적으로 생성되었습니다.');
    }
    return client;
  } catch (error) {
    if (typeof window !== 'undefined') {
      console.error('Supabase 클라이언트 생성 실패:', error);
    }
    return null;
  }
};

export const supabase = createSupabaseClient();

// Supabase가 사용 가능한지 확인하는 함수
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

// Supabase 연결 테스트 함수
export const testSupabaseConnection = async (): Promise<boolean> => {
  if (!supabase) {
    console.log('Supabase 클라이언트가 없습니다.');
    return false;
  }
  
  try {
    // 먼저 간단한 연결 테스트
    const { error } = await supabase
      .from('todos')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase 연결 테스트 실패:', error);
      
      // 테이블이 존재하지 않는 경우 (PGRST116) 사용자에게 알림
      if (error.code === 'PGRST116') {
        console.warn('⚠️ Supabase 테이블이 생성되지 않았습니다.');
        console.log('📋 다음 단계를 따라주세요:');
        console.log('1. Supabase 대시보드로 이동');
        console.log('2. SQL Editor에서 supabase/schema.sql 파일의 내용을 실행');
        console.log('3. 페이지를 새로고침');
      }
      
      return false;
    }
    
    console.log('✅ Supabase 연결 테스트 성공');
    return true;
  } catch (error) {
    console.error('Supabase 연결 테스트 중 오류:', error);
    return false;
  }
};

// 테이블 존재 여부 확인 함수
export const checkTablesExist = async (): Promise<{ [key: string]: boolean }> => {
  if (!supabase) {
    return {};
  }
  
  const tableChecks = await Promise.all([
    supabase.from('todos').select('count', { count: 'exact', head: true }),
    supabase.from('thoughts').select('count', { count: 'exact', head: true }),
    supabase.from('daily_report').select('count', { count: 'exact', head: true }),
    supabase.from('diary').select('count', { count: 'exact', head: true })
  ]);
  
  const tableNames = ['todos', 'thoughts', 'daily_report', 'diary'];
  const results: { [key: string]: boolean } = {};
  
  tableChecks.forEach((check, index) => {
    results[tableNames[index]] = !check.error;
  });
  
  return results;
};

// 데이터베이스 테이블 이름들
export const TABLES = {
  TODOS: 'todos',
  THOUGHTS: 'thoughts',
  DAILY_REPORT: 'daily_report',
  DIARY: 'diary'
} as const;
