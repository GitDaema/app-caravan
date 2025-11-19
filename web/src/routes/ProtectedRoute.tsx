// web/src/routes/ProtectedRoute.tsx
import { useAuthStore } from '../store/auth';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, fetchMe, loading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // 세션 복원 시도
    if (!user) {
      fetchMe().catch(() => {
        // 무시, 로그인 페이지로 리디렉션됨
      });
    }
  }, [fetchMe, user]);

  if (loading) {
    // 로딩 중에는 아무것도 표시하지 않거나 로딩 스피너를 표시
    return <div className="flex justify-center items-center h-screen"><p>세션 확인 중...</p></div>;
  }

  if (!user) {
    // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
    // 현재 경로를 state로 저장하여 로그인 후 돌아올 수 있도록 함
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 로그인한 사용자는 요청된 페이지를 렌더링
  return <>{children}</>;
}
