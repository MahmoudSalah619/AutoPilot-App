import AsyncStorage from '@react-native-async-storage/async-storage';
import store from '@/redux';
import { logout } from '@/redux/authReducer';

export default function logoutHandler() {
  // Clear the authentication tokens from AsyncStorage
  AsyncStorage.removeItem('token');
  AsyncStorage.removeItem('refreshToken');
  AsyncStorage.removeItem('userInfo');
  AsyncStorage.removeItem('remember_me');

  // Clear the Redux store
  store.dispatch(logout());
}
