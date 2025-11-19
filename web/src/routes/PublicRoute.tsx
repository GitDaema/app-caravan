// web/src/routes/PublicRoute.tsx
import { useAuthStore } from '../store/auth';
import { Navigate } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';

export default function PublicRoute({ children }: { children: ReactNode }) {
  const { user, fetchMe, loading } = useAuthStore();

  useEffect(() => {
    if (!user) {
      fetchMe().catch(() => {
        // 무시, 공개 페이지에 머무름
      });
    }
  }, [fetchMe, user]);

  if (loading) {
    // 로딩 중에는 아무것도 표시하지 않음
    return <div className="flex justify-center items-center h-screen"><p>세션 확인 중...</p></div>;
  }

  if (user) {
    // 로그인한 사용자는 대시보드로 리디렉션
    return <Navigate to="/app" replace />;
  }

  // 로그인하지 않은 사용자는 공개 페이지를 렌더링
  return <>{children}</>;
}
