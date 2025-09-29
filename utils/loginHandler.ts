import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/apis';
import store from '@/redux';
import { login, setUserInfo } from '@/redux/authReducer';
import { User } from '@/apis/@types/auth';

export default function loginHandler({
  token = '',
  refreshToken = '',
  rememberMe = false,
  userInfo = {} as User,
} = {}) {
  // Always set the token and user info for this session
  store.dispatch(api.util.resetApiState());
  store.dispatch(login(token));
  store.dispatch(setUserInfo(userInfo));

  // Handle persistent storage based on remember me preference
  if (rememberMe) {
    // Store credentials persistently when user chooses to be remembered
    if (token) AsyncStorage.setItem('token', token);
    if (refreshToken) AsyncStorage.setItem('refreshToken', refreshToken);
    AsyncStorage.setItem('remember_me', 'true');
    AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
  } else {
    // Don't store credentials persistently, but keep current session
    // Only remove remember_me flag and persistent data, not current session
    AsyncStorage.removeItem('remember_me');
    AsyncStorage.removeItem('token');
    AsyncStorage.removeItem('refreshToken');
    AsyncStorage.removeItem('userInfo');
  }
}
