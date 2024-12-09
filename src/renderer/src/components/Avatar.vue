<template>
  <div>
    <AvatarBase
      :userId="userId"
      :width="width"
      :borderRadius="borderRadius"
      :showDetail="false"
      v-if="userId == 'Urobot' || contactType == 1"
    ></AvatarBase>
    <el-popover
      v-else
      :width="280"
      placement="right-start"
      :show-arrow="false"
      trigger="click"
      transition="none"
      :hide-after="0"
      @show="getContactInfo"
      ref="popoverRef"
    >
      <!-- element ui 内部提供的两个插槽-->
      <!--用于点击之前显示-->
      <template #reference>
        <AvatarBase
          :userId="userId"
          :width="width"
          :borderRadius="borderRadius"
          :showDetail="false"
        ></AvatarBase>
      </template>
      <template #default>
        <div class="popover-user-panel">
          <UserBaseInfo :userInfo="userInfo"></UserBaseInfo>
          <div class="op-btn" v-if="userId !== userInfoStore.getUserInfo().userId">
            <el-button v-if="userInfo.contactStatus == 1" type="primary" @click="sendMessage">
              发送消息
            </el-button>
            <el-button v-else type="primary" @click="addContact">加为好友</el-button>
          </div>
        </div>
      </template>
    </el-popover>

  </div>
</template>

<script setup>
import AvatarBase from './AvatarBase.vue'
import UserBaseInfo from './UserBaseInfo.vue'
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from 'vue'
const { proxy } = getCurrentInstance()

import { useUserInfoStore } from '@/stores/UserInfoStore'
const userInfoStore = useUserInfoStore()

const props = defineProps({
  userId: {
    type: String
  },
  width: {
    type: Number,
    default: 40
  },
  borderRadius: {
    type: Number,
    default: 0
  },
  groupId: {
    type: String
  },
  contactType: {
    type: Number,
    default: 0
  }
})

const userInfo = ref({})
const getContactInfo = async () => {
  userInfo.value.userId = props.userId
  if (userInfoStore.getUserInfo().userId == props.userId) {
    userInfo.value = userInfoStore.getUserInfo()
  } else {
    const result = await proxy.Request({
      url: proxy.Api.getContactInfo,
      params: {
        contactId: props.userId
      },
      showLoading: false
    })
    if (!result) {
      return
    }
    userInfo.value = Object.assign({}, result.data)
  }
}
//添加好友
// const popoverRef = ref()
// const searchAddRef = ref()
// const addContact = () => {
//   popoverRef.value.hide()
//   searchAddRef.value.show({
//     contactId: props.userId,
//     contactType: 'USER'
//   })
// }

//发送消息
// const emit = defineEmits(['closeDrawer'])
const sendMessage = () => {

}

const addContact = () => {


}
</script>
<style lang="scss" scoped>
.op-btn {
  text-align: center;
  border-top: 1px solid #eaeaea;
  padding-top: 10px;
}
</style>
