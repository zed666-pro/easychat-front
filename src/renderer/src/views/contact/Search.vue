<script setup lang="ts">
import { ref, reactive, getCurrentInstance, nextTick, computed, watch } from 'vue'
import { useUserInfoStore } from '../../stores/userInfoStore'
import SearchAdd from './SearchAdd.vue'


const userInfoStore = useUserInfoStore();
// 计算contactTypeName的值
const contactTypeName = computed(() => {
  // todo: 这里的userId 和 contactId的值为undefined
  if (userInfoStore.getUserInfo().userId === searchResult.value.contactId) {
    return '自己'
  }
  if (searchResult.value.contactType == 'USER') {
    return '用户'
  }
  if (searchResult.value.contactType == 'GROUP') {
    return '群组'
  }
  return '';
})

const { proxy } = getCurrentInstance();
const contactId = ref();
const searchResult = ref({});
const search = async ()=>{
  if (!contactId.value) {
    proxy.Message.warning("请输入用户ID或者是群组ID");
    return;
  }

  const result = await proxy.Request({
    url: proxy.Api.search,
    params: {
      contactId: contactId.value
    }
  })

  if (!result) {
    return;
  }
  searchResult.value = result.data;
}

const searchAddRef = ref()
const applyContact = () => {
  searchAddRef.value.show(searchResult.value);
}


const resetForm = () =>{
  searchResult.value = {}
  contactId.value = undefined
}

</script>

<template>
  <ContentPanel>
    <div class="search-form">
        <el-input
          clearable
          placeholder="请输入用户ID或群组ID"
          v-model="contactId"
          size="large"
          @keydown.enter="search"
        ></el-input>
        <div class="search-btn iconfont icon-search" @click="search"></div>
    </div>

    <div v-if="searchResult && Object.keys(searchResult).length > 0" class="search-result-panel">
      <div class="search-result">
        <span class="contact-type"> {{ contactTypeName }}</span>
        <UserBaseInfo :userInfo="searchResult" :show-area="searchResult.contactType == 'USER'"></UserBaseInfo>
      </div>
      <!--动态展示按钮信息-->
      <div class="op-btn" v-if="searchResult.contactId != userInfoStore.getUserInfo().userId">
        <el-button
          type="primary"
          v-if="
            searchResult.status == null ||
            searchResult.status == 0 ||
            searchResult.status == 2 ||
            searchResult.status == 3 ||
            searchResult.status == 4 "
          @click="applyContact">
          {{ searchResult.contactType == 'USER' ? '添加到联系人' : '申请加入群组' }}
        </el-button>
        <!--说明已经是好友了-->
        <el-button type="primary" v-if="searchResult.status == 1" @click="sendMessage">发送消息</el-button>
        <span v-if="searchResult.status == 5 || searchResult.status == 6">对方拉黑了你</span>
      </div>
    </div>
    <div class="no-data">未查询到群组或者用户信息</div>
  </ContentPanel>
  <SearchAdd  ref="searchAddRef" @reload="resetForm" ></SearchAdd>

</template>


<style lang="scss" scoped>
.search-form {
  padding-top: 50px;
  display: flex;
  align-items: center;
  :deep(.el-input__wrapper) {
    border-radius: 4px 0px 0px 4px;
    border-right: none;
  }
  .search-btn {
    background: #07c160;
    color: #fff;
    line-height: 40px;
    width: 80px;
    text-align: center;
    border-radius: 0px 5px 5px 0px;
    cursor: pointer;
    &:hover {
      background: #0dd36c;
    }
  }
}
.no-data {
  padding: 30px 0px;
}
.search-result-panel {
  .search-result {
    padding: 30px 20px 20px 20px;
    background: #fff;
    border-radius: 5px;
    margin-top: 10px;
    position: relative;
    .contact-type {
      position: absolute;
      left: 0px;
      top: 0px;
      background: #2cb6fe;
      padding: 2px 5px;
      color: #fff;
      border-radius: 5px 0px 0px 0px;
      font-size: 12px;
    }
  }
  .op-btn {
    border-radius: 5px;
    margin-top: 10px;
    padding: 10px;
    background: #fff;
    text-align: center;
  }
}
</style>
