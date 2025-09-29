import { useEffect, useState } from 'react';
import useCheckAuthTokenExistance from './useCheckAuthTokenExistance';

const useInitialRouting = () => {
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const { isAuthChecked, isAuthenticated } = useCheckAuthTokenExistance();

  useEffect(() => {
    if (isAuthChecked) {
      // Route to main app if authenticated, otherwise to welcome screen
      setTargetPath(isAuthenticated ? '/(main)/(tabs)/Home' : '/(auth)/welcome');
    }
  }, [isAuthChecked, isAuthenticated]);

  return { targetPath };
};

export default useInitialRouting;
