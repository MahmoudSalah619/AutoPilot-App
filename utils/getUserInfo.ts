// import { useGetUserInfoQuery } from "apis/services/auth";
// import { RootState } from "@reduxjs/toolkit/query";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux';

export default function useGetUserInfo() {
  const userData = useSelector((state: RootState) => state.auth.userData);
  const userType = userData?.user_type;
  return {
    role: userType,
    userInfo: userData.user,
    vehicle: userData?.user.vehicle,
  };
}
