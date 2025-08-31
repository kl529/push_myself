import React from 'react';
import { Settings } from 'lucide-react';
import NotificationSettings from '../NotificationSettings';
import SupabaseStatus from '../SupabaseStatus';

const SettingsTab: React.FC = () => {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-white p-4 lg:p-6 rounded-2xl border">
        <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
          <Settings className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-black" />
          설정
        </h3>
        
        {/* 클라우드 동기화 설정 */}
        <div className="mb-6">
          <SupabaseStatus onStatusChange={() => {}} />
        </div>
        
        {/* 알림 설정 */}
        <NotificationSettings />
      </div>
    </div>
  );
};

export default SettingsTab;