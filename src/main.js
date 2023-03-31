import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import * as echarts from 'echarts';
Vue.prototype.$echarts = echarts

new Vue({
  render: h => h(App),
}).$mount('#app')
