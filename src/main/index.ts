import { app, shell, BrowserWindow, Tray, Menu, platform} from 'electron'
// import Tray from 'electron';
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import iconMenu from '../../resources/icon_menu.png?asset'
import { loginOrRegister, onLoginSuccess, winTitleOp } from './ipc'

const NODE_ENV = process.env.NODE_ENV


function createWindow(): BrowserWindow {
  // Create the browser window.
  const login_width = 300;
  const login_height = 410;
  const register_height = 490;
  const mainWindow = new BrowserWindow({
    title: 'you chat',
    icon: icon,
    iconMenu: iconMenu,
    width: login_width,
    height: login_height,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    resizable: false,
    transparent: false,
    frame: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      //如果设置为true，需要在预加热脚本中暴漏方法给渲染进程
      contextIsolation: false,
    }
  })

  //打开控制台
  if (NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({
      mode: 'undocked', // 使用 undocked 模式，使开发者工具在新窗口中打开
      activate: true // 是否将开发者工具窗口置于前台，默认是 true
    })
    // mac系统中自带关闭，放大的按钮
    // winTitleOp((e, { action, data }) => {
    //   const webContents = e.sender
    //   const win = BrowserWindow.fromWebContents(webContents)
    //   switch (action) {
    //     case "close": {
    //       if (data.closeType == 0) {
    //         win.close();
    //       } else {
    //         win.setSkipTaskbar(true) // 使窗口不显示在任务栏中
    //         win.hide()
    //       }
    //       break;
    //     }
    //     case "minimize": {
    //       win.minimize();
    //       break;
    //     }
    //     case "maximize": {
    //       win.maximize();
    //       break;
    //     }
    //     case "unmaximize": {
    //       win.unmaximize();
    //       break;
    //     }
    //     case "top": {
    //       win.setAlwaysOnTop(data.top);
    //     }
    //   };
    // });
  }



  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    mainWindow.setTitle("you chat");
  })



  //创建一个托盘
  const tray = new Tray(iconMenu);
  tray.setToolTip('This is easyChat tray');
  // tray.setTitle('easyChat');

  const contextMenu = [
    { label: 'exit', click:  () =>{
        app.exit();
      } }
  ];

  const menu = Menu.buildFromTemplate(contextMenu);
  tray.setContextMenu(menu);

  tray.on("click", ()=>{
    //不让菜单栏隐藏
    mainWindow.setSkipTaskbar(false);
    mainWindow.show();
  })

  loginOrRegister((isLogin)=>{
    mainWindow.setResizable(true);
    if (isLogin) {
      mainWindow.setSize(login_width, login_height);
    }else{
      mainWindow.setSize(login_width, register_height);
    }
    mainWindow.setResizable(false);
  })


  onLoginSuccess((config) => {
    mainWindow.setResizable(true);
    mainWindow.setSize(850, 800);
    mainWindow.center();
    mainWindow.setMaximizable(true);
    mainWindow.setMaximumSize(800, 600);

    //如果用户是admin需要额外处理
    if (config.admin) {
      console.log()
    }

    //用户登录成功后需要增加用户信息展示
    contextMenu.unshift({
      label: "用户: " + config.nickName, click: ()=>{}
    });

    tray.setContextMenu(Menu.buildFromTemplate(contextMenu));
  })


  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })


  const mainWindow = createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // 阻止窗口关闭时退出应用，而是隐藏窗口
  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });



})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
