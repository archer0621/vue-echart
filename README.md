### Vue封装ECharts组件实现动态复用

####  🍓🍓开发后台管理系统时，经常使用ECharts图表渲染首页信息，在首页使用多个图表时，选择封装ECharts组件复用的方式可以减少代码量，增加开发效率🍓🍓

##### 🍅效果需求：

![image-20230331142041331](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20230331142041331.png)

- 使用组件传递**ECharts**中的 `option` 属性
- 手动/自动设置chart尺寸
- chart自适应宽高
- 动态展示获取到的后端数据

##### 🍑代码实现(   静态图表🍪•ᴥ•🍪   )：

- 首先我们需要导入echarts：` npm i echarts`
- 选择在`main.js`中配置`ECharts`全局变量声明或仅组件内使用

~~~javascript
import * as echarts from 'echarts';
Vue.prototype.$echarts = echarts // 全局声明  写在main.js中

import * as echarts from 'echarts'; // 仅在组件内使用
~~~

- 创建`static_options.js`作为静态options配置项，配置项内对象即`echarts`实例中的源码，🔴[链接在此](https://echarts.apache.org/examples/zh/index.html#chart-type-bar)🔴

~~~javascript
export const barOption =  {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisTick: {
        alignWithLabel: true
      }
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: [
    {
      name: 'Direct',
      type: 'bar',
      barWidth: '60%',
      data: [10, 52, 200, 334, 390, 330, 220]
    }
  ]
}
~~~

- 创建一个 `ECharts.vue` 作为子组件封装

~~~javascript
<template>
    <div :id='uid' :style='style'></div>
</template>
<script>
// 由于echarts是根据id属性选择渲染的，使用Math.random方法随机生成charts的id属性，确保id唯一
const genID = () => {
  let uid = Math.floor(Math.random() * 100);
  return uid;
}
export default {
	name: 'ECharts',
    props: { // 接收父组件传递的options配置项、图表的宽高(width, height)
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
            uid: null, // 设置uid唯一
            myChart: null // 用于设置echart的options
        }
    },
    created() {
        this.uid = genID() // 初始化时赋值ID
    },
    computed:{
        // 计算chart的宽高属性，用于回流div
        style() { 
            return {
                height: this.height,
                width: this.width
            }
        }
    },
    mounted() {
        // 初始化echarts
        this.initChart();
        // 设置chart的resize自适应
        this.resizeChart = () => {
            this.$echarts.init(document.getElementById(this.uid)).resize();
        }
        window.addEventListener('resize', this.resizeChart);

    }, 
    methods: {
        // 生成echarts图表
        initChart() {
            // 判断父组件中的options是否为空
            if (this.options) {
                // 获取唯一标识
                this.myChart = echarts.init(document.getElementById(this.uid));
                // 使用setOption加载父组件传递的options
                this.myChart.setOption(this.options);
            }
        }
    }
}     
</script>
~~~

- 在父组件中引入`ECharts`组件和静态配置项`static_options.js`

~~~javascript
<template>
  <div id="app">
    <ECharts :options="options" />
  </div>
</template>
<script>
import ECharts from '@/components/ECharts.vue';
import { barOption } from './utils/static_options';
export default {
  name: 'App',
  components: { // 引入ECharts子组件
    ECharts
  },
  data() {
    return {
      options: barOption // 向子组件传递option配置项
    }
  }
}
</script>
~~~

- 启动项目，可以看到静态图表加载完成

<img src="C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20230331150511331.png" alt="image-20230331150511331" style="zoom: 50%;" />

##### 🍋代码实现(   动态图表 🍞•̀ □ •́🍞   )：

- 动态图表即将`options`配置项中的`data`数据通过后端获取，只需要在父组件中获取相关信息，其他配置与静态图表代码相同
- 首先创建`dynamic_options.js`作为动态配置文件，与静态图表不同的时，使用函数传递需要渲染的`data`数据

~~~javascript
export function dy_pieOption(data) {
  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data // 此处替换为传入的数据
      }
    ]
  }
}
~~~

- 安装axios：`npm i axios`
- 在父组件中导入axios请求后端接口，获取图表数据

~~~javascript
import ECharts from './components/ECharts.vue';
import { dy_pieOption } from './utils/dynamic_option';
import axios from 'axios';
export default {
  name: 'App',
  components: {
    ECharts
  },
  data() {
    return {
      options: null
    }
  },
  created() {
    this.initChart(); // 在vue created时加载options配置项数据，然后再将options传入子组件
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
          this.options = dy_pieOption(resp); // 将后端数据传给dy_pieOption然后赋值给options
        })
    },
  }
}
~~~

- 启动项目可以看到从后端获取到的统计图表

<img src="C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20230331152444116.png" alt="image-20230331152444116" style="zoom:70%;" />

##### 🥝关于后端接口配置、数据库相关查询 🍳˙О˙🍳：

~~~javascript
// controller
const categorysList = async () => {
    const sql = `select categorys.id ,categorys.name, IFNULL(count(articles.id),0) as count from categorys left join articles 
    on categorys.id=articles.category_id group by categorys.id`
    return await query(sql)
}
// router
category.prefix('/category')

category.get('/catelist', async (ctx) => {
    ctx.body = await Category.categorysList()
})
// mysql
DROP TABLE IF EXISTS `categorys`;
CREATE TABLE `categorys`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '类别id',
  `name` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '类别名称',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 46 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
~~~
