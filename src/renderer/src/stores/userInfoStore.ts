import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useUserInfoStore = defineStore('userInfo', () => {
  const userInfo = ref({});
  const setUserInfo = (userInfoData) => {
    userInfo.value = userInfoData;
    localStorage.setItem("userInfo", JSON.stringify(userInfoData));
  };
  const getUserInfo = () => {
    return userInfo.value;
  };
  return { userInfo, setUserInfo, getUserInfo };
});
