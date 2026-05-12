import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import type { Profile } from '../../types/api';

interface Props {
  allow: Profile['role'][];
  children: ReactNode;
}

export function RoleRoute({ allow, children }: Props) {
  const role = useAuthStore((s) => s.profile?.role);
  if (!role || !allow.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
