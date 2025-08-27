// 푸시 알림 관리 유틸리티

export interface NotificationSettings {
  enabled: boolean;
  morningTime: string; // "08:00" 형태
  message: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  morningTime: '08:00',
  message: '오늘도 파이팅! 💪 새로운 하루를 시작해보세요.'
};

// 알림 설정 저장/로드
export const saveNotificationSettings = (settings: NotificationSettings): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pushMyself_notifications', JSON.stringify(settings));
  }
};

export const loadNotificationSettings = (): NotificationSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }
  
  const saved = localStorage.getItem('pushMyself_notifications');
  if (saved) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (error) {
      console.error('알림 설정 로드 실패:', error);
    }
  }
  return DEFAULT_SETTINGS;
};

// 푸시 알림 권한 요청
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('이 브라우저는 알림을 지원하지 않습니다.');
    return false;
  }

  if (!('serviceWorker' in navigator)) {
    console.warn('이 브라우저는 Service Worker를 지원하지 않습니다.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('알림 권한 요청 실패:', error);
    return false;
  }
};

// 알림 권한 상태 확인
export const checkNotificationPermission = (): string => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

// 다음 8시까지의 시간 계산 (밀리초)
export const getTimeUntilNextMorning = (targetTime: string = '08:00'): number => {
  const now = new Date();
  const [hours, minutes] = targetTime.split(':').map(Number);
  
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  
  // 이미 오늘의 목표 시간이 지났다면 다음 날로 설정
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  
  return target.getTime() - now.getTime();
};

// 일일 알림 스케줄링
export const scheduleDailyNotification = async (settings: NotificationSettings): Promise<void> => {
  if (!settings.enabled) {
    cancelDailyNotification();
    return;
  }

  const permission = checkNotificationPermission();
  if (permission !== 'granted') {
    console.warn('알림 권한이 없습니다.');
    return;
  }

  try {
    // 기존 알림 취소
    cancelDailyNotification();
    
    // Service Worker 등록 확인 
    await navigator.serviceWorker.ready;
    
    // 다음 알림까지의 시간 계산
    const delay = getTimeUntilNextMorning(settings.morningTime);
    
    // 스케줄링 정보 저장
    const scheduleInfo = {
      nextNotification: Date.now() + delay,
      settings: settings
    };
    localStorage.setItem('pushMyself_schedule', JSON.stringify(scheduleInfo));
    
    // 타이머 설정
    const timerId = setTimeout(() => {
      showMorningNotification(settings);
      // 다음 날을 위해 다시 스케줄링
      scheduleDailyNotification(settings);
    }, delay);
    
    // 타이머 ID 저장 (페이지 새로고침시 복원용)
    sessionStorage.setItem('pushMyself_timerId', timerId.toString());
    
    console.log(`다음 알림: ${new Date(Date.now() + delay).toLocaleString('ko-KR')}`);
    
  } catch (error) {
    console.error('알림 스케줄링 실패:', error);
  }
};

// 알림 취소
export const cancelDailyNotification = (): void => {
  const timerId = sessionStorage.getItem('pushMyself_timerId');
  if (timerId) {
    clearTimeout(Number(timerId));
    sessionStorage.removeItem('pushMyself_timerId');
  }
  localStorage.removeItem('pushMyself_schedule');
};

// 아침 알림 표시
export const showMorningNotification = (settings: NotificationSettings): void => {
  if (checkNotificationPermission() !== 'granted') {
    return;
  }

  const notification = new Notification('Push Myself - 나를 넘어라', {
    body: settings.message,
    icon: '/icon.svg',
    badge: '/apple-touch-icon.svg',
    tag: 'daily-motivation',
    requireInteraction: false,
    silent: false,
    data: {
      timestamp: Date.now(),
      type: 'daily-motivation'
    }
  });

  // 클릭시 앱 열기
  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // 10초 후 자동 닫기
  setTimeout(() => {
    notification.close();
  }, 10000);
};

// 앱 시작시 스케줄 복원
export const restoreNotificationSchedule = (): void => {
  const scheduleInfo = localStorage.getItem('pushMyself_schedule');
  if (!scheduleInfo) {
    return;
  }

  try {
    const { nextNotification, settings } = JSON.parse(scheduleInfo);
    const now = Date.now();
    
    if (nextNotification <= now) {
      // 놓친 알림이 있으면 새로 스케줄링
      scheduleDailyNotification(settings);
    } else {
      // 남은 시간으로 타이머 재설정
      const remainingTime = nextNotification - now;
      const timerId = setTimeout(() => {
        showMorningNotification(settings);
        scheduleDailyNotification(settings);
      }, remainingTime);
      
      sessionStorage.setItem('pushMyself_timerId', timerId.toString());
      console.log(`알림 스케줄 복원: ${new Date(nextNotification).toLocaleString('ko-KR')}`);
    }
  } catch (error) {
    console.error('알림 스케줄 복원 실패:', error);
  }
};

// 테스트용 즉시 알림
export const showTestNotification = (message: string = '테스트 알림입니다!'): void => {
  if (checkNotificationPermission() !== 'granted') {
    alert('알림 권한이 필요합니다.');
    return;
  }
  
  const notification = new Notification('Push Myself - 테스트', {
    body: message,
    icon: '/icon.svg',
    tag: 'test-notification'
  });
  
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
  
  setTimeout(() => notification.close(), 5000);
};