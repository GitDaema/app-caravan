// web/src/routes/ProtectedRoute.tsx
import { useAuthStore } from '../store/auth';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, fetchMe, loading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // 보호된 페이지에 진입할 때 한 번만 세션을 확인합니다.
    fetchMe().catch(() => {
      // 세션 확인 실패 시에는 로그인 페이지로 리다이렉트됩니다.
    });
  }, [fetchMe]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>세션 확인 중...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

