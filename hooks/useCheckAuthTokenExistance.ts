import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, setUserInfo } from '@/redux/authReducer';

export default function useCheckAuthTokenExistance() {
  const dispatch = useDispatch();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const rememberMeCheck = async () => {
      try {
        const userToken = await AsyncStorage.getItem('token');
        const userInfo = await AsyncStorage.getItem('userInfo');
        const user = userInfo ? JSON.parse(userInfo) : null;
        const rememberMe = await AsyncStorage.getItem('remember_me');

        // Only restore session if remember me was enabled and we have valid data
        if (rememberMe === 'true' && userToken && user) {
          dispatch(setUserInfo(user));
          dispatch(login(userToken));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth token:', error);
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecked(true);
      }
    };

    rememberMeCheck();
  }, [dispatch]);

  return { isAuthChecked, isAuthenticated };
}
