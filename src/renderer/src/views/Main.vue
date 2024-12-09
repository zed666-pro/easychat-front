<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue'

const { proxy } = getCurrentInstance()
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '../stores/userInfoStore'

const userInfoStore = useUserInfoStore()
const router = useRouter()
// 对应与main页面上左侧的三个图标聊天、联系人、系统设置
const menuList = ref([
  {
    name: 'chat',
    icon: 'icon-chat',
    path: '/chat',
    countKey: 'chatCount',
    position: 'top'
  },
  {
    name: 'contact',
    icon: 'icon-user',
    path: '/contact',
    countKey: 'contactApplyCount',
    position: 'top'
  },
  {
    name: 'mysetting',
    icon: 'icon-more2',
    path: '/setting',
    position: 'bottom'
  }
])
//最开始的item是menuList中的第一个
const currentMenu = ref(menuList.value[0])

// 在main页面上切换不同的图标时调用
const changeMenu = (item) => {
  currentMenu.value = item
  // 路由跳转
  router.push(item.path)
}

// 刷新的时候调用getLoginInfo方法，保证userInfoStore中的数据不是undefined
const getLoginInfo = async () => {
  const result = await proxy.Request({
    url: proxy.Api.getUserInfo
  })

  if (!result) {
    return
  }

  userInfoStore.setUserInfo(result.data)
}

// 每次main组件挂载时调用getLoginInfo方法
onMounted(() => {
  getLoginInfo()
})
</script>

<template>
  <div class="main">
    <div class="left-sider">
      <div class="menu-list">
        <template v-for="item in menuList" :key="item.name">
          <div
            :class="['tab-item iconfont', item.icon, item.path == currentMenu.path ? 'active' : '']"
            @click="changeMenu(item)"
            v-if="item.position == 'top'"
          ></div>
        </template>
      </div>
      <div class="menu-list menu-buttom">
        <template v-for="item in menuList" :key="item.name">
          <div
            :class="['tab-item iconfont', item.icon, item.path == currentMenu.path ? 'active' : '']"
            @click="changeMenu(item)"
            v-if="item.position == 'bottom'"
          ></div>
        </template>
      </div>
    </div>
    <div class="right-container">
      <router-view v-slot="{ Component }">
        <keep-alive include="chat">
          <component :is="Component" ref="componentRef" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  background: #ddd;
  display: flex;
  border-radius: 0px 3px 3px 0px;
  overflow: hidden;
  // height: calc(100vh);的作用是使元素高度自适应视口高度，确保元素始终填满整个浏览器窗口可见区域高度
  height: calc(100vh);

  .left-sider {
    width: 55px;
    background: #2e2e2e;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 35px;
    border: 1px solid #2e2e2e;
    border-right: none;
    padding-bottom: 10px;

    .menu-list {
      width: 100%;
      flex: 1;

      .tab-item {
        color: #d3d3d3;
        font-size: 20px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 10px;
        cursor: pointer;
        font-size: 22px;
        position: relative;
      }

      .active {
        color: #07c160;
      }
    }

    .menu-buttom {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
  }

  .right-container {
    flex: 1;
    overflow: hidden;
    border: 1px solid #ddd;
    border-left: none;
  }
}

.popover-user-panel {
  padding: 10px;

  .popover-user {
    display: flex;
    border-bottom: 1px solid #ddd;
    padding-bottom: 20px;
  }

  .send-message {
    margin-top: 10px;
    text-align: center;
    padding: 20px 0px 0px 0px;
  }
}
</style>
