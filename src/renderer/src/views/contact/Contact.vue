<script setup lang="ts">
import { ref, reactive, getCurrentInstance, nextTick, onMounted, watch } from 'vue'
const { proxy } = getCurrentInstance()
import { useContactStateStore } from '../../stores/contactStateStore'
const contactStateStore = useContactStateStore()
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
//联系人的子列表
const partList = ref([
  {
    partName: '新朋友',
    children: [
      {
        name: '搜好友',
        icon: 'icon-search',
        iconBgColor: '#fa9d3b',
        path: '/contact/search'
      },
      {
        name: '新的朋友',
        icon: 'icon-plane',
        iconBgColor: '#08bf61',
        path: '/contact/contactNotice',
        showTitle: true,
        countKey: 'contactApplyCount'
      }
    ]
  },
  {
    partName: '我的群聊',
    children: [
      {
        name: '新建群聊',
        icon: 'icon-add-group',
        iconBgColor: '#1485ee',
        path: '/contact/createGroup'
      }
    ],
    contactId: 'groupId',
    contactName: 'groupName',
    showTitle: true,
    contactData: [],
    contactPath: '/contact/groupDetail'
  },
  {
    partName: '我加入的群聊',
    contactId: 'contactId',
    contactName: 'contactName',
    showTitle: true,
    contactData: [],
    contactPath: '/contact/groupDetail',
    emptyMsg: '暂未加入群聊'
  },
  {
    partName: '我的好友',
    children: [],
    contactId: 'contactId',
    contactName: 'contactName',
    contactData: [],
    contactPath: '/contact/userDetail',
    emptyMsg: '暂无好友'
  }
])

// 右侧标题的显示
const rightTitle = ref()
// 子页面的跳转
const partJump = (data) => {
  // 如果需要展示右标题名称
  if (data.showTitle) {
    rightTitle.value = data.name
  } else {
    rightTitle.value = null
  }
  // 路由跳转
  router.push(data.path)
}

// 查找当前用户的联系人
const loadContact = async (contactType) => {
  const result = await proxy.Request({
    url: proxy.Api.loadContact,
    showLoading: false,
    params: {
      contactType
    }
  })
  if (!result) {
    return
  }
  if (contactType === 'GROUP') {
    partList.value[2].contactData = result.data
  } else if (contactType === 'USER') {
    partList.value[3].contactData = result.data
  }
}

loadContact('USER')
loadContact('GROUP')

// 查找当前用户所创建的群组
const loadMyGroup = async () => {
  const result = await proxy.Request({
    url: proxy.Api.loadMyGroup,
    showLoading: false
  })

  if (!result) {
    return
  }
  partList.value[1].contactData = result.data
}
loadMyGroup()


// 监控值的变化，一旦发生改变，调用对应的方法，去更新信息
watch(
  () => contactStateStore.contactReload,
  (newVal, oldVal) => {
    if (!newVal) {
      return
    }

    switch (newVal) {
      case 'MYGROUP':
        loadMyGroup()
        break
      case 'GROUP':
      case 'USER':
        loadContact(newVal)
        break
      case 'DISSOLUTION_GROUP': //解散
        loadMyGroup()
        router.push('/contact/blank')
        rightTitle.value = null
        break
      case 'LEAVE_GROUP':
        loadContact('GROUP')
        router.push('/contact/blank')
        rightTitle.value = null
        break
      case 'REMOVE_USER':
        rightTitle.value = null
        router.push('/contact/blank')
        loadContact('USER')
        break
    }
  },
  { immediate: true, deep: true }
)

// 获取联系人详情
const contactDetail = (contact, part) => {

  if (part.showTitle) {
    rightTitle.value = contact[part.contactName]
  }else{
    rightTitle.value = null
  }
  router.push({
    path: part.contactPath,
    query: {
      contactId: contact[part.contactId]
    }
  })
}
</script>

<template>
  <LayOut>
    <template #left-content>
      <div class="drag-panel drag"></div>
      <div class="top-search">
        <el-input placeholder="搜索" v-model="searchKey" size="small" @keyup="search">
          <!--#suffix 是输入框的后置图标-->
          <template #suffix>
            <span class="iconfont icon-search"></span>
          </template>
        </el-input>
      </div>
      <div class="contact-list" v-show="!searchKey">
        <template v-for="item in partList" :key="item.partName">
          <div class="part-title">{{ item.partName }}</div>
          <div class="part-list">
            <div
              :class="['part-item', sub.path == route.path ? 'active' : '']"
              v-for="sub in item.children"
              @click="partJump(sub)"
              :key="sub.name"
            >
              <div :class="['iconfont', sub.icon]" :style="{ background: sub.iconBgColor }"></div>
              <div class="text">{{ sub.name }}</div>
            </div>
            <!--联系人信息 群组，联系人-->
            <template v-for="contact in item.contactData" :key="contact.contactId">
              <div
                :class="[
                  'part-item',
                   contact[item.contactId] == route.query.contactId ? 'active' : ''
                ]"
                @click="contactDetail(contact, item)">
                <Avatar :userId="contact[item.contactId]" :width="35"></Avatar>
                <div class="text">
                  {{ contact[item.contactName] }}
                </div>
              </div>
            </template>
            <template v-if="item.contactData && item.contactData.length == 0">
              <div class="no-data">{{ item.emptyMsg }}</div>
            </template>
          </div>
        </template>
      </div>
    </template>

    <template #right-content>
      <div class="title-panel drag">{{ rightTitle }}</div>
      <router-view v-slot="{ Component }">
        <component :is="Component" ref="componentRef" />
      </router-view>
    </template>
  </LayOut>
</template>

<style lang="scss" scoped>
.drag-panel {
  height: 25px;
  background: #f7f7f7;
}

.top-search {
  padding: 0px 10px 9px 10px;
  background: #f7f7f7;
  display: flex;
  align-items: center;

  .iconfont {
    font-size: 12px;
  }
}

.contact-list {
  border-top: 1px solid #ddd;
  height: calc(100vh - 62px);
  overflow: hidden;

  &:hover {
    overflow: auto;
  }

  .part-title {
    color: #515151;
    padding-left: 10px;
    margin-top: 10px;
  }

  .part-list {
    border-bottom: 1px solid #d6d6d6;

    .part-item {
      display: flex;
      align-items: center;
      padding: 10px 10px;
      position: relative;

      &:hover {
        cursor: pointer;
        background: #84e384;
      }

      .iconfont {
        width: 35px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: #fff;
      }

      .text {
        flex: 1;
        color: #000000;
        margin-left: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .no-data {
      text-align: center;
      font-size: 12px;
      color: #9d9d9d;
      line-height: 30px;
    }

    .active {
      background: #c4c4c4;

      &:hover {
        background: #c4c4c4;
      }
    }
  }
}

.title-panel {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  font-size: 18px;
  color: #000000;
}
</style>
