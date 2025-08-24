'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Database, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { testSupabaseConnection, checkTablesExist, isSupabaseAvailable } from '../lib/supabase';

interface SupabaseStatusProps {
  onStatusChange: (status: 'checking' | 'connected' | 'offline') => void;
}

const SupabaseStatus: React.FC<SupabaseStatusProps> = ({ onStatusChange }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'offline' | 'setup_needed'>('checking');
  const [tableStatus, setTableStatus] = useState<{ [key: string]: boolean }>({});
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const checkConnection = useCallback(async () => {
    if (!isSupabaseAvailable()) {
      setStatus('offline');
      onStatusChange('offline');
      return;
    }

    setStatus('checking');
    onStatusChange('checking');

    const isConnected = await testSupabaseConnection();
    
    if (isConnected) {
      const tables = await checkTablesExist();
      setTableStatus(tables);
      
      const allTablesExist = Object.values(tables).every(exists => exists);
      
      if (allTablesExist) {
        setStatus('connected');
        onStatusChange('connected');
      } else {
        setStatus('setup_needed');
        onStatusChange('offline');
      }
    } else {
      setStatus('offline');
      onStatusChange('offline');
    }
  }, [onStatusChange]);

  const retryConnection = async () => {
    setIsRetrying(true);
    await checkConnection();
    setIsRetrying(false);
  };

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'checking':
        return {
          color: 'yellow',
          icon: RefreshCw,
          text: '연결 확인 중...',
          animate: true
        };
      case 'connected':
        return {
          color: 'green',
          icon: CheckCircle,
          text: '클라우드 동기화 활성화',
          animate: false
        };
      case 'setup_needed':
        return {
          color: 'red',
          icon: AlertCircle,
          text: '테이블 설정 필요',
          animate: false
        };
      case 'offline':
      default:
        return {
          color: 'orange',
          icon: Database,
          text: '로컬 저장 모드',
          animate: false
        };
    }
  };

  const statusInfo = getStatusDisplay();
  const StatusIcon = statusInfo.icon;

  const getStatusClasses = () => {
    switch (status) {
      case 'checking':
        return 'bg-yellow-100 text-yellow-800';
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'setup_needed':
        return 'bg-red-100 text-red-800';
      case 'offline':
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer transition-all hover:scale-105 ${getStatusClasses()}`}
      >
        <StatusIcon 
          className={`w-4 h-4 ${statusInfo.animate ? 'animate-spin' : ''}`} 
        />
        {statusInfo.text}
      </button>

      {showDetails && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-lg border max-w-md mx-auto">
          <div className="text-left space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">연결 상태</h3>
              <button
                onClick={retryConnection}
                disabled={isRetrying}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                재시도
              </button>
            </div>

            {status === 'setup_needed' && (
              <div className="bg-red-50 p-3 rounded text-sm">
                <div className="font-medium text-red-800 mb-2">테이블 설정이 필요합니다</div>
                <div className="text-red-600 space-y-1 text-xs">
                  <div>1. Supabase 대시보드 → SQL Editor</div>
                  <div>2. supabase/schema.sql 파일 내용 실행</div>
                  <div>3. 페이지 새로고침</div>
                </div>
                <div className="mt-2">
                  <div className="text-xs text-red-600">테이블 상태:</div>
                  {Object.entries(tableStatus).map(([table, exists]) => (
                    <div key={table} className="flex items-center gap-1 text-xs">
                      <div className={`w-2 h-2 rounded-full ${exists ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      {table}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status === 'offline' && !isSupabaseAvailable() && (
              <div className="bg-orange-50 p-3 rounded text-sm">
                <div className="font-medium text-orange-800 mb-1">환경 변수 미설정</div>
                <div className="text-orange-600 text-xs">
                  .env.local 파일에 Supabase URL과 키를 설정하면 클라우드 동기화를 사용할 수 있습니다.
                </div>
              </div>
            )}

            {status === 'connected' && (
              <div className="bg-green-50 p-3 rounded text-sm">
                <div className="font-medium text-green-800 mb-1">정상 연결됨</div>
                <div className="text-green-600 text-xs">
                  데이터가 클라우드에 자동으로 동기화됩니다.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseStatus;