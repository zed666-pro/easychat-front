<script setup lang="ts">
import { ref, reactive, getCurrentInstance, nextTick} from 'vue'
const { proxy } = getCurrentInstance()


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
  showDetail: {
    type: Boolean,
    default: false
  }

})
</script>

<!--头像的base组件-->
<template>
  <div class="user-avatar"
    @click="showDetailHandler"
    :style="{width: width + 'px', height: width + 'px', borderRadius: borderRadius + 'px'}"
  >
    <ShowLocalImage
      :width="width"
      :fieldId="userId"
      :partType="avatar"
      :forceGet="true"
    ></ShowLocalImage>
  </div>
</template>

<style lang="scss" scoped>
.user-avatar {
  background: #d3d3d3;
  display: flex;
  overflow: hidden;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}
</style>
