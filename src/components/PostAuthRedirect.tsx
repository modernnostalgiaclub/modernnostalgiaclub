import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { consumePostAuthPath } from '@/lib/postAuthRedirect';

// After an OAuth round trip the browser lands on the public home page.
// Once the session exists, send the user to the page they were heading to.
export function PostAuthRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;
    const path = consumePostAuthPath();
    if (path) navigate(path, { replace: true });
  }, [user, loading, navigate]);

  return null;
}
