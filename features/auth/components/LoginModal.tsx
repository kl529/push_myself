import React from 'react';
import { X, LogIn } from 'lucide-react';
import { signInWithGoogle } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
        console.error('Google 로그인 오류:', error);
      } else {
        // 성공 시 모달 닫기 (인증 상태 변경은 onAuthStateChange에서 처리)
        onSuccess?.();
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error('로그인 처리 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 lg:p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
            🚀 Push Myself 로그인
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 설명 */}
        <div className="mb-6 text-center">
          <p className="text-gray-600 mb-4">
            Google 계정으로 로그인하고<br />
            모든 기기에서 데이터를 동기화하세요
          </p>
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-blue-700">
              ✨ <strong>혜택</strong><br />
              • 모든 기기에서 데이터 동기화<br />
              • 안전한 클라우드 백업<br />
              • 데이터 손실 방지
            </p>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          ) : (
            <>
              {/* Google 아이콘 */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">Google로 로그인</span>
            </>
          )}
        </button>

        {/* 안내 메시지 */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          로그인하면 <a href="#" className="text-blue-500 hover:underline">서비스 약관</a> 및{' '}
          <a href="#" className="text-blue-500 hover:underline">개인정보 처리방침</a>에 동의하는 것으로 간주됩니다.
        </p>

        {/* 로컬 모드 안내 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 text-center">
            💾 <strong>로컬 모드로 계속 사용</strong><br />
            로그인하지 않고도 이 기기에서만 데이터를 저장할 수 있습니다.
          </p>
          <button
            onClick={onClose}
            className="w-full mt-3 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            로컬 모드로 계속
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;