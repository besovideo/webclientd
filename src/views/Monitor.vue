<template>
  <Content>
    <Tabs   name='tabs' :animated="false" :value='tabs' @on-click="ChangeTabs">
      <TabPane :label="$t('home.Locate')" name="Locate" tab='tabs'>
      </TabPane>
      <TabPane :label="$t('home.LivePreview')" name="LivePreview" tab='tabs'>
      </TabPane>
      <TabPane :label="$t('home.Scheduling')" name="Scheduling" tab='tabs'>
      </TabPane>
      <TabPane :label="$t('home.FileSearch')" name="FileSearch" tab='tabs'>
      </TabPane>
    </Tabs>

    <!-- <el-tabs v-model="tabs" type="border-card" @tab-click="ChangeTabs">
      <el-tab-pane :label="$t('home.Locate')" name="Locate" ></el-tab-pane>
      <el-tab-pane :label="$t('home.LivePreview')" name="LivePreview"></el-tab-pane>
      <el-tab-pane :label="$t('home.Scheduling')" name="Scheduling"></el-tab-pane>
    </el-tabs> -->
  <!-- <keep-alive> -->
    <router-view></router-view>
  <!-- </keep-alive> -->

  </Content>
</template>
<script>
export default {
  data(){
    return {
      tabs: '',
      session: '',
      // activeName: ''
    }
  },
  methods:{
    ChangeTabs(name){
      this.tabs = name;
      this.$router.push({name:name})
    },

  },
  watch:{
    $route(to,from){
      this.tabs = to.name;
    }
  },
  created(){
    console.log(this)
    this.tabs = this.$route.name;
  },
};
</script>
<style lang="less">
*.unselectable {
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;

  /*
     Introduced in IE 10.
     See http://ie.microsoft.com/testdrive/HTML5/msUserSelect/
   */
  -ms-user-select: none;
  user-select: none;
}
.ivu-tabs-bar{
  padding-left: 20px;
}
.ivu-tabs.ivu-tabs-no-animation{
  width: 100%;
  .ivu-tabs-bar{
    margin-bottom: 6px;
  }
  // flex:1;
  // display: flex;
  // flex-direction: column;

}
.ivu-tabs-content{
  height: 0;
  .ivu-tabs-tabpane{
    height: 100%;
  }
}
</style>

