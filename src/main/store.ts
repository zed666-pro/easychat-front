import Store from 'electron-store';

const store = new Store();

let userId = null;
const initUserId = (_userId)=>{
  userId = _userId;
}

const getUserId = ()=>{
  return userId;
}


const getData = (key)=>{
  return store.get(key);
}

const setData = (key, value)=>{
  store.set(key, value);
}

const getUserData = (key)=>{
  return store.get(userId + key);
}

const setUserData = (key, data)=>{
  store.set(userId + key, data);
}

const deleteUserData = (key)=>{
  store.delete(userId + key);
}

export {
  initUserId,
  getUserId,
  setData,
  getUserData,
  setUserData,
  deleteUserData,
}

