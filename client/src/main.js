import Vue from 'vue'
import App from './App.vue'
import HighchartsVue from 'highcharts-vue'
import Highcahrts from 'highcharts'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(HighchartsVue)
Highcahrts.setOptions({ global: { useUTC: false } }); 
import ElementUI from 'element-ui';
Vue.use(ElementUI);
import axios from 'axios';

Vue.prototype.$axios = axios


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
