import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  mode: 'hash',
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '默认路径',
      redirect: '/login'
    },
    {
      path: '/login',
      name: '登录',
      component: () => import('@/views/Login.vue')
    },

    {
      path: '/main',
      redirect: "/chat",
      name: '主窗口',
      component: () => import('@/views/Main.vue'),
      children: [
        {
          path: '/chat',
          name: '聊天',
          component: () => import('@/views/chat/Chat.vue')
        },
        {
          path: "/contact",
          name: "联系人",
          redirect: "/contact/blank",
          component: () => import('@/views/contact/Contact.vue'),
          children: [
            {
            path: "/contact/blank",
            name: "空白页",
            component: () => import('@/views/contact/BlankPage.vue'),
            },
            {
              path: "/contact/search",
              name: "聊天搜索",
              component: () => import('@/views/contact/Search.vue'),
            },
            {
              path: "/contact/createGroup",
              name: "创建群组",
              component: () => import('@/views/contact/GroupEdit.vue'),
            },
            {
              path: "/contact/userDetail",
              name: "获取联系人详情",
              component: () => import('@/views/contact/UserDetail.vue'),
            },
            {
              path: "/contact/contactNotice",
              name: "新朋友",
              component: () => import('@/views/contact/ContactApply.vue'),
            },
            {
              path: "/contact/groupDetail",
              name: "获取群组详情",
              component: () => import('@/views/contact/GroupDetail.vue'),
            }
          ]
        },
        {
          path: '/setting',
          name: '设置',
          component: () => import('@/views/setting/Setting.vue'),
          children: [
            {
              path: "/setting/userInfo",
              name: "个人信息",
              component: () => import('@/views/setting/UserInfo.vue'),
            },
            {
              path: "/setting/fileManage",
              name: "获取账户详情",
              component: () => import('@/views/setting/FileManage.vue'),
            },
            {
              path: "/setting/about",
              name: "关于easyChat",
              component: () => import('@/views/setting/About.vue'),
            }
          ]
        }
      ]
    }
  ]
})
export default router
