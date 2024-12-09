import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// contextBridge.exposeInMainWorld('myIpc', {
//   changeLoginType: (isLogin)=>{
//     ipcRenderer.send('loginOrRegister', isLogin)
//   }
// })

//不安全的做法
window.ipcRenderer = ipcRenderer;

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
