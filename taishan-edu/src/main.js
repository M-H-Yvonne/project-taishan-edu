import Vue from "vue";
import './assets/reset.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router';
import store from './store';
import app from './App.vue';
import http from './utils/http.js';



Vue.use(ElementUI);
Vue.prototype.$http=http;

//创建根实例，并渲染根组件
new Vue({
        //导入
        el:"#app",
        //注册
        components: { app },
        //使用
        template: "<app />",
        router,
        store
});