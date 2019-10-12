<template>
  <Content>
    <Tabs   name='tabs' :animated="false" :value='tabs' @on-click="ChangeTabs">
      <TabPane :label="$t('Data.yonghuguanli')" name="UserManage" tab='tabs'>
      </TabPane>
      <TabPane :label="$t('Data.shebeiguanli')" name="TermManage" tab='tabs'>
      </TabPane>
    </Tabs>

    <!-- <el-tabs v-model="tabs" type="border-card" @tab-click="ChangeTabs">
      <el-tab-pane :label="$t('home.Locate')" name="Locate" ></el-tab-pane>
      <el-tab-pane :label="$t('home.LivePreview')" name="LivePreview"></el-tab-pane>
      <el-tab-pane :label="$t('home.Scheduling')" name="Scheduling"></el-tab-pane>
    </el-tabs> -->
  <div class="content">
    <!-- <keep-alive> -->
      <router-view></router-view>
    <!-- </keep-alive> -->
  </div>

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
    this.tabs = this.$route.name;
  },
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: calc(100% - 42px);
  display: flex;
}
</style>