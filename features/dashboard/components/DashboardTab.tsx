import React, { useState, useEffect } from 'react';
import { Star, Settings, Save, X } from 'lucide-react';
import { DayData } from '../../shared/types/types';
import NotificationSettings from '../../../components/NotificationSettings';

interface DashboardTabProps {
  dayData: DayData;
  saveAffirmation: (affirmation: string) => void;
}

// 자기암시 설정 모달 컴포넌트
const AffirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (affirmation: string) => void;
  currentAffirmation: string;
}> = ({ isOpen, onClose, onSave, currentAffirmation }) => {
  const [affirmation, setAffirmation] = useState(currentAffirmation);

  React.useEffect(() => {
    setAffirmation(currentAffirmation);
  }, [currentAffirmation]);

  const handleSave = () => {
    if (affirmation.trim()) {
      onSave(affirmation.trim());
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 lg:p-8 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl lg:text-2xl font-semibold flex items-center">
            <Star className="h-6 w-6 mr-3 text-purple-600" />
            자기암시 설정
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              나만의 자기암시
            </label>
            <textarea
              value={affirmation}
              onChange={(e) => setAffirmation(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="자신에게 힘이 되는 말을 적어보세요. 예: 나는 할 수 있다, 나는 충분히 좋다..."
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-purple-500 text-lg resize-none h-32"
              maxLength={200}
            />
            <div className="text-sm text-gray-500 mt-2 text-right">
              {affirmation.length}/200
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-xl">
            <h4 className="font-medium text-purple-800 mb-2">💡 자기암시 작성 팁</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• 긍정적이고 현재형으로 작성하세요</li>
              <li>• &ldquo;나는 ~할 수 있다&rdquo;, &ldquo;나는 ~이다&rdquo; 형태로</li>
              <li>• 짧고 기억하기 쉬운 문장으로</li>
              <li>• 매일 읽어도 좋은 내용으로</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 flex items-center justify-center font-medium"
          >
            <Save className="h-5 w-5 mr-2" />
            저장
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-medium"
          >
            취소
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-4 text-center">
          Ctrl+Enter (또는 Cmd+Enter)로 빠르게 저장할 수 있습니다
        </div>
      </div>
    </div>
  );
};

const DashboardTab: React.FC<DashboardTabProps> = ({
  saveAffirmation
}) => {
  const [isAffirmationModalOpen, setIsAffirmationModalOpen] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState('');

  // 클라이언트 사이드에서만 localStorage 접근
  useEffect(() => {
    const savedAffirmation = localStorage.getItem('userAffirmation') || '';
    setCurrentAffirmation(savedAffirmation);
  }, []);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* 자기암시 설정 카드 */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl lg:text-2xl font-semibold flex items-center">
            <Star className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-purple-600" />
            자기암시
          </h3>
          <button
            onClick={() => setIsAffirmationModalOpen(true)}
            className="p-2 lg:p-3 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors"
            title="자기암시 설정"
          >
            <Settings className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
          </button>
        </div>
        
        {currentAffirmation ? (
          <div className="bg-purple-50 p-4 lg:p-6 rounded-xl border border-purple-200">
            <p className="text-lg lg:text-xl text-purple-800 italic leading-relaxed whitespace-pre-wrap">
              {currentAffirmation}
            </p>
          </div>
        ) : (
          <div className="text-center py-8 lg:py-12 text-gray-500">
            <Star className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg lg:text-xl mb-4">아직 자기암시가 설정되지 않았습니다</p>
            <button
              onClick={() => setIsAffirmationModalOpen(true)}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 font-medium"
            >
              자기암시 설정하기
            </button>
          </div>
        )}
      </div>

      {/* 푸시 알림 설정 카드 */}
      <NotificationSettings />

      {/* 자기암시 설정 모달 */}
      <AffirmationModal
        isOpen={isAffirmationModalOpen}
        onClose={() => setIsAffirmationModalOpen(false)}
        onSave={(affirmation) => {
          saveAffirmation(affirmation);
          setCurrentAffirmation(affirmation);
        }}
        currentAffirmation={currentAffirmation}
      />
    </div>
  );
};

export default DashboardTab; 