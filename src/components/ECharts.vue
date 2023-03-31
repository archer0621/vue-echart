<template>
    <div :id='uid' :style='style'></div>
</template>



<script>

import * as echarts from 'echarts';
/*
  生成唯一ID
*/
const genID = () => {
  let uid = Math.floor(Math.random() * 100);
  return uid;
}

export default {
  name: 'ECharts',
  props:{
    options: {
      type: Object,
      default: {}
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '450px'
    }
  },
  data() {
    return {
      uid: null,
      myChart: null
    }
  },
  created() {
    // 初始化时赋值ID
    this.uid = genID()
  },
  watch: {
    options: function (newQuestion, oldQuestion) {
      this.initChart();
    },
  },
  mounted() {
    this.initChart();
    this.resizeChart = () => {
      this.$echarts.init(document.getElementById(this.uid)).resize();
    }
    window.addEventListener('resize', this.resizeChart);
    
  },
  methods: {
    initChart() {
      if (this.options) {
        this.myChart = echarts.init(document.getElementById(this.uid));
        this.myChart.setOption(this.options);
      }
    }

  },
  computed:{
    style() {
      return {
        height: this.height,
        width: this.width
      }
    }
  },
}
</script>

<style>
</style>