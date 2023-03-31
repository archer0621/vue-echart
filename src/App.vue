<template>
  <div id="app">
    <ECharts :options="st_options" :width="'450px'" :height="'550px'"/>
    <ECharts :options="dy_options" :width="'450px'" :height="'550px'"/>
  </div>
</template>

<script>
import ECharts from './components/ECharts.vue';
import { barOption } from './utils/static_options';
import { dy_pieOption } from './utils/dynamic_option';
import axios from 'axios';
export default {
  name: 'App',
  components: {
    ECharts
  },
  data() {
    return {
      dy_options: null,
      st_options: barOption
    }
  },
  created() {
    this.initChart();
  },
  methods: {
    initChart() {
      axios
        .get('/category/catelist')
        .then(resp=>{
          resp = resp.data.map(item => (
            {
              value: item.count,
              name: item.name
            }
          ));
          
          this.dy_options = dy_pieOption(resp);
        })
    },
  }
}
</script>

<style lang="less">
#app {
  display: flex;
  justify-content: center;
  div {
    margin: 0 auto;
  }
}
</style>
