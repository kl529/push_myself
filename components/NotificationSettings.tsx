import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, MessageSquare, Play, Settings } from 'lucide-react';
import { 
  NotificationSettings as INotificationSettings,
  loadNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  checkNotificationPermission,
  scheduleDailyNotification,
  cancelDailyNotification,
  showTestNotification
} from '../lib/notifications';
import { useToast } from './Toast';

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<INotificationSettings>(loadNotificationSettings());
  const [permission, setPermission] = useState<string>('default');
  const [isScheduled, setIsScheduled] = useState(false);
  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    setPermission(checkNotificationPermission());
    
    // 스케줄이 활성화되어 있는지 확인
    const scheduleInfo = localStorage.getItem('pushMyself_schedule');
    setIsScheduled(!!scheduleInfo);
  }, []);

  const handlePermissionRequest = async () => {
    const granted = await requestNotificationPermission();
    setPermission(checkNotificationPermission());
    
    if (granted) {
      showSuccess('알림 권한이 허용되었습니다!');
    } else {
      showError('알림 권한이 거부되었습니다. 브라우저 설정에서 변경할 수 있습니다.');
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        showError('알림 권한이 필요합니다.');
        return;
      }
      setPermission('granted');
    }

    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);

    if (enabled) {
      await scheduleDailyNotification(newSettings);
      setIsScheduled(true);
      showSuccess(`매일 ${newSettings.morningTime}에 알림이 설정되었습니다!`);
    } else {
      cancelDailyNotification();
      setIsScheduled(false);
      showSuccess('일일 알림이 비활성화되었습니다.');
    }
  };

  const handleTimeChange = (time: string) => {
    const newSettings = { ...settings, morningTime: time };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);

    if (settings.enabled) {
      scheduleDailyNotification(newSettings);
      showSuccess(`알림 시간이 ${time}로 변경되었습니다.`);
    }
  };

  const handleMessageChange = (message: string) => {
    const newSettings = { ...settings, message };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleTestNotification = () => {
    if (permission !== 'granted') {
      showWarning('알림 권한을 먼저 허용해주세요.');
      return;
    }
    showTestNotification(settings.message);
    showSuccess('테스트 알림을 전송했습니다!');
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: '허용됨', color: 'text-green-600', bg: 'bg-green-100' };
      case 'denied':
        return { text: '거부됨', color: 'text-red-600', bg: 'bg-red-100' };
      case 'unsupported':
        return { text: '지원안함', color: 'text-gray-600', bg: 'bg-gray-100' };
      default:
        return { text: '대기중', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl lg:text-2xl font-semibold flex items-center">
          <Bell className="h-6 w-6 mr-3 text-blue-600" />
          푸시 알림 설정
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${permissionStatus.bg} ${permissionStatus.color}`}>
          {permissionStatus.text}
        </span>
      </div>

      <div className="space-y-6">
        {/* 알림 권한 요청 */}
        {permission !== 'granted' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 mb-2">알림 권한이 필요합니다</h4>
                <p className="text-sm text-blue-700 mb-3">
                  매일 아침 동기부여 메시지를 받으려면 브라우저 알림 권한을 허용해주세요.
                </p>
                <button
                  onClick={handlePermissionRequest}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  알림 권한 요청
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 알림 활성화/비활성화 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            {settings.enabled ? (
              <Bell className="h-5 w-5 text-green-600" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <h4 className="font-medium text-gray-800">일일 동기부여 알림</h4>
              <p className="text-sm text-gray-600">
                {settings.enabled 
                  ? `매일 ${settings.morningTime}에 알림을 보냅니다`
                  : '비활성화됨'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggleNotifications(!settings.enabled)}
            disabled={permission === 'unsupported'}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              settings.enabled ? 'bg-blue-500' : 'bg-gray-300'
            } ${permission === 'unsupported' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 시간 설정 */}
        {settings.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-2" />
                알림 시간
              </label>
              <input
                type="time"
                value={settings.morningTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                매일 설정한 시간에 동기부여 알림을 받습니다
              </p>
            </div>

            {/* 메시지 설정 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="inline h-4 w-4 mr-2" />
                알림 메시지
              </label>
              <textarea
                value={settings.message}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder="동기부여 메시지를 입력하세요..."
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none h-20"
                maxLength={100}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  매일 받고 싶은 동기부여 메시지를 작성하세요
                </p>
                <span className="text-xs text-gray-500">
                  {settings.message.length}/100
                </span>
              </div>
            </div>

            {/* 테스트 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handleTestNotification}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center justify-center font-medium"
              >
                <Play className="h-4 w-4 mr-2" />
                테스트 알림
              </button>
            </div>
          </div>
        )}

        {/* 스케줄 상태 */}
        {settings.enabled && isScheduled && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 text-green-700">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">
                다음 알림: 내일 {settings.morningTime}
              </span>
            </div>
          </div>
        )}

        {/* 안내 문구 */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">알림 사용 팁:</p>
              <ul className="space-y-1 text-yellow-700">
                <li>• PWA로 설치하면 앱이 닫혀있어도 알림을 받을 수 있습니다</li>
                <li>• 브라우저 설정에서 알림을 차단하면 작동하지 않습니다</li>
                <li>• 모바일에서는 배터리 절약 모드일 때 지연될 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;