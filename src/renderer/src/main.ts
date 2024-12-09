import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
//全局重写样式
import "@/assets/cust-elementplus.scss";
import "@/assets/icon/iconfont.css"
import '@/assets/base.scss';
import { createPinia } from 'pinia'

import App from './App.vue'
import router from '@/router'
import Request from '@/utils/request'
import Message from '@/utils/message'
import Api from '@/utils/api'
import LayOut from './components/LayOut.vue'
import ContentPanel from './components/ContentPanel.vue'
import ShowLocalImage from './components/ShowLocalImage.vue'
import UserBaseInfo from './components/UserBaseInfo.vue'
import Dialog from './components/Dialog.vue'
import Avatar from './components/Avatar.vue'
import Confirm from './utils/confirm'
import Verify from './utils/verify'

const app = createApp(App);
app.use(ElementPlus);
app.use(router);
app.use(createPinia());

app.component('LayOut', LayOut);
app.component('ContentPanel', ContentPanel);
app.component('ShowLocalImage', ShowLocalImage);
app.component('UserBaseInfo', UserBaseInfo);
// eslint-disable-next-line vue/no-reserved-component-names
app.component('Dialog', Dialog);
app.component('Avatar', Avatar);

app.config.globalProperties.Confirm = Confirm;
app.config.globalProperties.Request = Request;
app.config.globalProperties.Message = Message;
app.config.globalProperties.Api = Api;
app.config.globalProperties.Verify = Verify;
app.mount('#app')
