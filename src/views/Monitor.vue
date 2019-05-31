<template>
  <Content>
    <Tabs   name='tabs' :animated="false" :value='tabs' @on-click="ChangeTabs">
      <TabPane :label="$t('home.LivePreview')" name="LivePreview" tab='tabs'>
          <router-view name="LivePreview"></router-view>
      </TabPane>
      <TabPane :label="$t('home.Video_playback')" name="VideoPlayback" tab='tabs'>
        <!-- <router-view name="VideoPlayback"></router-view> -->
        {{$t('home.Video_playback')}}
      </TabPane>
      <!-- <TabPane :label="$t('home.location')" name="VideoPlayback">{{$t('home.location')}}</TabPane> -->
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
.ivu-tabs.ivu-tabs-no-animation{
  flex:1;
  display: flex;
  flex-direction: column;
}
.ivu-tabs-content{
  height: 100%;
  .ivu-tabs-tabpane{
    height: 100%;
  }
}
</style>

