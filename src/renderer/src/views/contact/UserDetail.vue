<script setup lang="ts">
import ContentPanel from '../../components/ContentPanel.vue'
import { ref, reactive, getCurrentInstance, nextTick, watch } from 'vue'
const { proxy } = getCurrentInstance()
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

import { useContactStateStore} from '../../stores/contactStateStore'
const contactStateStore = useContactStateStore()

//用户信息
const userInfo = ref({})
//加载用户详情信息
const loadUserDetail = async (contactId) => {
  const result = await proxy.Request({
    url: proxy.Api.getContactUserInfo,
    params: {
     contactId: contactId
    }
  })
  if (!result) {
    return
  }
  userInfo.value = result.data
}

// 加入黑名单
const addContact2BlackList = () =>{
  proxy.Confirm({
    message: '确定要将用户加入黑名单?',
    okfun: async () => {
      proxy.Request({
        url: proxy.Api.addContact2BlackList,
        params: {
          contactId: userInfo.value.contactId
        }
      })
    }
  })
  if (!resutl) {
    return
  }
  // 刷新我的群组列表
  delContactData(userInfo.value.userId)
}


//删除用户
const delContact = () => {
  proxy.Confirm({
    message: '确定要删除联系人？',
    okfun: async () => {
      const result = await proxy.Request({
        url: proxy.Api.delContact,
        params: {
          contactId: userInfo.value.userId
        }
      })
      if (!result) {
        return
      }
      delContactData(userInfo.value.userId)
    }
  })
}

//动态更新用户详情
watch(() => route.query.contactId,
  (newValue, oldValue) => {
        // 如果路径发生了变化，就是contactId的值发生了变化，就重新加载用户详情信息
        if (newValue) {
          loadUserDetail(newValue)
        }
  }, {immediate: true, deep: true})


const delContactData = (contactId) => {
  //刷新我的群组列表
  contactStateStore.setContactReload('REMOVE_USER')
  contactStateStore.delContact(contactId)
}


</script>

<template>
  <ContentPanel>
    <div class="user-info">
      <UserBaseInfo :userInfo="userInfo"></UserBaseInfo>
      <div class="more-op">
        <el-dropdown placement="bottom-end" trigger="click">
          <span class="el-dropdown-link">
            <div class="iconfont icon-more"></div>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="addContact2BlackList">加入黑名单</el-dropdown-item>
              <el-dropdown-item @click="delContact">删除联系人</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="part-item">
      <div class="part-title">个性签名</div>
      <div class="part-content">{{ userInfo.personalSignature || '-' }}</div>
    </div>
    <div class="send-message" @click="sendMessage">
      <div class="iconfont icon-chat2"></div>
      <div class="text">发消息</div>
    </div>
  </ContentPanel>
</template>


<style lang="scss" scoped>
.user-info {
  position: relative;
  .more-op {
    position: absolute;
    right: 0px;
    top: 20px;
    .icon-more {
      color: #9e9e9e;
      &:hover {
        background: #dddddd;
      }
    }
  }
}

.part-item {
  display: flex;
  border-bottom: 1px solid #eaeaea;
  padding: 20px 0px;
  .part-title {
    width: 60px;
    color: #9e9e9e;
  }
  .part-content {
    flex: 1;
    margin-left: 15px;
    color: #161616;
  }
}

.send-message {
  width: 80px;
  margin: 0px auto;
  text-align: center;
  margin-top: 20px;
  color: #7d8cac;
  padding: 5px;
  .icon-chat2 {
    font-size: 23px;
  }
  .text {
    font-size: 12px;
    margin-top: 5px;
  }
  &:hover {
    background: #e9e9e9;
    cursor: pointer;
  }
}
</style>
