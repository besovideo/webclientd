<template>
  <div class="layout">
    <Layout>
      <Header>
        <Menu mode="horizontal" theme="dark" active-name="1">
          <div class="layout-nav">
            <MenuItem name="Home" to="/Home"  :style="{'background':this.Name=='Home'?'rgb(30, 87, 163)':''}" >
              首页
            </MenuItem>
            <MenuItem name="Monitor" :to="{name:'Monitor'}" :style="{'background':this.Name=='Monitor'?'rgb(30, 87, 163)':''}">
              监控中心
            </MenuItem>
            <MenuItem name="3" :style="{'background':this.Name=='123'?'rgb(30, 87, 163)':''}">
              查询中心
            </MenuItem>
            <MenuItem name="4" :style="{'background':this.Name=='334'?'rgb(30, 87, 163)':''}">
              配置中心
            </MenuItem>
            <li style="float:left;font-size:16px;font-weight:700;color:#fff;margin-right:10px">|</li>
            
            <Dropdown style="float:left;">             
              <Icon type="md-person" size='20' style="color:#fff"></Icon><Icon type="ios-arrow-down" size='16' style="color:#fff"></Icon>
              <DropdownMenu slot="list">
                  <DropdownItem>基本信息</DropdownItem>
                  <DropdownItem>密码修改</DropdownItem>
                  <DropdownItem>退出</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown style="float:left;margin:0 10px">             
              <Icon type="md-settings" size='20' style="color:#fff"></Icon><Icon type="ios-arrow-down" size='16' style="color:#fff"></Icon>
              <DropdownMenu slot="list">
                  <DropdownItem>本地配置</DropdownItem>
              </DropdownMenu>
            </Dropdown>

          </div>
        </Menu>
      </Header>
      <router-view></router-view>
      <!-- <Footer class="layout-footer-center">2011-2016 &copy; TalkingData</Footer> -->
    </Layout>
  </div>
</template>
  
<script>
// @ is an alias to /src

export default {
  name: "Home",
  // components: {
  //   HelloWorld
  // }
  data(){
    return {
      Name: ''
    }
  },
  watch: {
    $route(to, from) {
      // to表示的是你要去的那个组件，from 表示的是你从哪个组件过来的，它们是两个对象，你可以把它打印出来，它们也有一个param 属性
      // console.log(to)
      if(to.meta.Name){
        this.Name = to.meta.Name
      }
    }
  },
  created(){
    this.Name = this.$route.meta.Name;
  }
};
</script>

<style lang="less">

.layout{
    height: 100%;
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
}
.ivu-layout{
  height: 100%;
}
.ivu-layout-header{
  background: rgb(43, 100, 176);
  padding: 0 0 0 50px;
}
.ivu-menu {
  background: rgb(43, 100, 176);
  height: 64px;
  line-height: 64px
}
.ivu-menu-dark.ivu-menu-horizontal .ivu-menu-item:hover {
  background: rgb(30, 87, 163);
}
.layout-logo{
    width: 100px;
    height: 30px;
    background: #5b6270;
    border-radius: 3px;
    float: left;
    position: relative;
    top: 15px;
    left: 20px;
}
.layout-nav{
    width: 480px;
    margin: 0 auto;
    margin-right: 2px;
}
.layout-footer-center{
    text-align: center;
}
</style>

