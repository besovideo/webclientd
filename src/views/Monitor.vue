<template>
  <Content>
    <Tabs   name='tabs' :animated="false" :value='tabs' @on-click="ChangeTabs">
      <TabPane label="实时预览" name="LivePreview" tab='tabs'>
        <div>
          <router-view name="LivePreview"></router-view>
        </div>
      </TabPane>
      <TabPane label="录像回放" name="VideoPlayback" tab='tabs'>
        <router-view name="VideoPlayback"></router-view>
      </TabPane>
      <TabPane label="实时定位" name="name3">标签三的内容</TabPane>
    </Tabs>
  </Content>
</template>
<script>
export default {
  data(){
    return {
      tabs: '',
      session: ''
    }
  },
  methods:{
    ChangeTabs(name){
      this.tabs = name;
      this.$router.push({name})
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
<style lang="less">
.ivu-tabs-bar{
  padding-left: 20px;
}
</style>

