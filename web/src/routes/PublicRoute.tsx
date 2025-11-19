// web/src/routes/PublicRoute.tsx
import { useAuthStore } from '../store/auth';
import { Navigate } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';

export default function PublicRoute({ children }: { children: ReactNode }) {
  const { user, fetchMe, loading } = useAuthStore();

  useEffect(() => {
    // 세션을 한 번만 확인해서 이미 로그인된 사용자는 /app으로 보내고,
    // 그렇지 않으면 로그인 화면을 그대로 보여줍니다.
    fetchMe().catch(() => {
      // 세션 확인 실패 시에는 별도 처리 없이 로그인 화면만 유지합니다.
    });
  }, [fetchMe]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>세션 확인 중...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

