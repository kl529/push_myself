import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../shared/services/supabase';

const AuthCallback: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL에서 auth 파라미터들을 처리
        const { data, error } = await supabase?.auth.getSession() ?? { data: null, error: null };

        if (error) {
          console.error('Auth callback error:', error);
          // 에러 시 메인으로 리다이렉트
          router.replace('/');
          return;
        }

        if (data?.session) {
          console.log('✅ 로그인 성공');

          // URL에서 민감한 파라미터들 제거
          const cleanUrl = window.location.pathname;
          router.replace(cleanUrl);
        } else {
          // 세션이 없으면 메인으로 리다이렉트
          router.replace('/');
        }
      } catch (error) {
        console.error('Auth callback processing failed:', error);
        router.replace('/');
      }
    };

    // URL에 auth 관련 파라미터가 있는지 확인
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthParams = urlParams.has('access_token') ||
                         urlParams.has('refresh_token') ||
                         urlParams.has('code');

    if (hasAuthParams) {
      handleAuthCallback();
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default AuthCallback;