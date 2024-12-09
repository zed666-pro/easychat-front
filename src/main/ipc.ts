import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initUserId, setUserData } from './store'
const NODE_ENV = process.env.NODE_ENV



const loginOrRegister = (callback) => {
  ipcMain.on("loginOrRegister", (event, isLogin) => {
    console.log("渲染进程发来的message：" + isLogin);
    callback(isLogin);
  })
}

const onLoginSuccess = (callback)=>{
  ipcMain.on("openChat", (event, config) => {
    console.log("登录成功，切换到聊天界面");
    initUserId(config.userId);
    setUserData("token", config.token);
    //todo 增加用户配置
    //todo ws 连接
    callback(config);
  })
}

// mac系统中自带关闭，放大按钮
const winTitleOp = (callback) => {
  ipcMain.on("winTitleOp", (e, data) => {
    callback(e, data);
  });
}

export {
  loginOrRegister,
  onLoginSuccess,
  winTitleOp
}
