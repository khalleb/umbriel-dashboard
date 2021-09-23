import { ReactNode } from 'react';
import { useCan } from '../../hooks/useCan';

interface CanProps {
  children: ReactNode;
  role?: string;
}

export function Can({ children, role }: CanProps) {
  const userCanSeeComponent = useCan({ role });

  if (!userCanSeeComponent) {
    return null;
  }

  return <>{children}</>;
}