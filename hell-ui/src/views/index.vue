<template>
  <div class="dashboard-editor-container">
    <panel-group v-if="show" :gData="groupData" />
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart v-if="show" :chart-data="lineChartData" />
    </el-row>
    
  </div>
</template>

<script>
import {getData} from '@/api/home.js'
import PanelGroup from './dashboard/PanelGroup'
import LineChart from './dashboard/LineChart'

export default {
  name: 'Index',
  components: {
    PanelGroup,
    LineChart,
  },
  data() {
    return {
      lineChartData: {},
	  groupData:{},
	  show:false
    }
  },
 
  created(){
	this.getHomeData()  
  },
  methods: {
	 async getHomeData(){
	  await	getData().then(res=>{
		   
			this.lineChartData.monthLogin=res.data.monthLogin
			this.lineChartData.monthUser=res.data.monthUser
			this.groupData.todayUser=res.data.todayUser
			this.groupData.todayLogin=res.data.todayLogin
			this.groupData.sevenLogin=res.data.sevenLogin
			this.groupData.sevenUser=res.data.sevenUser
			this.groupData.totalAccount=res.data.totalAccount
			console.log(this.groupData)
			this.show=true
		})  
	  },
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
