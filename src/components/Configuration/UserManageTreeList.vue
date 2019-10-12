<template>
  <div id="TermList">
    <Input class="search"  v-model="filterText"  search clearable placeholder  />
    <div class="TreeList _TreeList">
      <el-tree
        v-loading="TreeLoading"
        :data="UserListData"
        :highlight-current="true"
        node-key="key"
        :indent="8"
        :default-expanded-keys="ExpandedKey"
        :expand-on-click-node='false'
        @node-expand='expandOpen'
        @node-collapse='expandClose'
        :filter-node-method="filterNode"
        ref="tree"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }" rightMenu @dblclick="HandleTreeClick(data,node,$event)">
          <span>
            <img
              v-if="data.target=='group'"
              :src="qun"
              width="15"
              height="15"
              style="display:block;float: left;margin:3px 5px 0 0 ;"
              alt
            />
            <img
              v-if="data.target=='user'"
              :src="yonghu"
              width="15"
              height="15"
              style="display:block;float: left;margin:3px 5px 0 0 ;"
              alt
            />
            <span
              class="unselectable"
            >{{ node.label }}</span>
              <!-- <span
                class="unselectable"
                :style="{paddingLeft:10}"
              >{{ node.label }}</span> -->
          </span>

          <span style="float:right;display:inline-block">
          </span>
          <!-- <span class="pu_id" v-if="data.isMeeting">
            {{ (data.id==undefined) ?"":`(${data.id.slice(5)})` }} 
          </span>-->
        </span>
      </el-tree>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
  data(){
    return {
      qun: require("@/assets/images/qun.png"),
      yonghu: require("@/assets/images/yonghu.png"),
      TreeLoading: true,
      userManager:undefined,
      ExpandedKey:[0],
      UserListData: [
        {
          label: this.$t('Data.yonghuguanli'),
          root: true,
          key: 0,
          children: [
            {

            }
          ]
        }
      ],
      filterText:''
    }
  },
  methods:{
    //搜索过滤
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    //树节点张开关闭事件
    expandOpen(data,node,el){
      this.ExpandedKey.find(el=>el==data.key)==undefined && this.ExpandedKey.push(data.key)
    },
    //树节点张开关闭事件
    expandClose(data,node,el){
      // this.ExpandedKey.push()
      let index;
      (index = this.ExpandedKey.find(el=>el==data.key))!=undefined && this.ExpandedKey.splice(index,1)
    },
    // 树节点 点击 逻辑
    HandleTreeClick(data,node,e){
      if(data.root){
        $('[role="treeitem"]').removeClass('is-current')
        this.$emit('on-all-click',data,node)
        return
      }
      if(data.target=='group'){
        $('[role="treeitem"]').removeClass('is-current')
        this.$emit('on-group-click',data,node,e)
      }else if(data.target=='user'){
        this.$emit('on-user-click',data,node,e)
      }
    },
    // 处理群组列表渲染到TreeList
    SetGroupTree(group_list){
      let temp = []
      group_list.forEach(group=>{
        let children = []
        group._userlist.forEach(user => {
          children.push({
            target: 'user',
            label: user._user.name||user._user.id,
            _user: user._user,
            _group: user._group
          })
        })
        temp.push({
          target: 'group',
          label: group._group.name||group._group.id,
          _group: group._group,
          key: group._group.id,
          children
        })
      })


      let func = (list,child,cb)=>{
        list.forEach( (el,i)=>{
          if( (el.target == 'group' && child._group.parentid!="") && el._group.id == child._group.parentid){
            list[i].children==undefined? list[i].children =[] : ""
            list[i].children.push(child)
            cb()
          }
        })
        if(list.children && list.children.length>0){
          return func(list.children,child,cb)
        }else{
          return
        }
      }
      //处理子父 群组位置
      let target = []
      temp.forEach((group,i) =>{
        if(group._group.parentid!=''){
          func(temp,temp[i],()=>{
            target.push(i)
          })
        }
      })
      target.length>0 && target.forEach((el,i)=>{temp.splice(el-i,1)})

      this.$set(this.UserListData[0],'children',temp)

      console.log(temp);
      this.TreeLoading = false
      
      this.$nextTick(()=>{
        this.$emit('on-getdata',temp)
      })
      // temp.forEach(group=>{
      //   if(group._group.parentid != ""){
      //     let parentGroup = temp.filter(el => {
      //       if(el.children){
      //         el.target == 'group'
      //       }
      //       return el._group.id == group._group.parentid
      //     })
      //     console.log('ParentGroup', parentGroup)
      //   }
      // })
    },
    //获取用户组列表
    GetGroupList(){
      //获取用户组列表
      let code;
      this.$store.state.ErrorCode = code = this.userManager.swGetGroupList({
        callback: (sender, response, data) => {
          this.$store.state.ErrorCode = response.emms.code
          if(response.emms.code!=0){
            this.$Message.error(this.$tools.findErrorCode(response.emms.code))
            return
          }
          console.log(data)
          this.SetGroupTree(data)

        },
      })
    },
    //获取用户组信息
    GetGroupInit(){
      window.UserManageChange = (sender, response, data) => {
        console.log('Change: ',sender, response, data);
        switch(data.cmd){
          case 'addgroup':
          case 'delgroup':
          case 'adduser':
          case 'deluser':
            this.GetGroupList()
            break
        }
      }
      if(!this.UserManageInit){
        this.$store.state.UserManageInit = true
        this.userManager = this.session.swGetUserManager();
        let code;
        this.$store.state.ErrorCode = code = this.userManager.swInit({
          callback: (sender, response, data) => {
            this.$store.state.ErrorCode = response.emms.code
            if(response.emms.code!=0){
              this.$Message.error(this.$tools.findErrorCode(response.emms.code))
            }
            this.$store.state.UserManageInit = true
            //初始化返回值判断
            if(code!=0){
              this.TreeLoading = false
              this.$Message.error(this.$tools.findErrorCode(code))
            }
            this.GetGroupList()
          },
          ondatachanged: window.UserManageChange,
          tag: null
        })
      }else{
        this.userManager = this.session.swGetUserManager();
        this.GetGroupList()
      }

    }
  },
  watch:{
    filterText(val) {
      console.log(this.ExpandedKey)
      this.$refs.tree.filter(val);
    }
  },
  computed:{
    ...mapState({
      session: 'session',
      ErrorCode: 'ErrorCode',
      UserManageInit:'UserManageInit'
    })
  },
  created(){
    this.GetGroupInit()
  }  
}
</script>
<style lang="less">
._TreeList{
  width: 100%;
  height: calc(100% - 38px) !important;
}
</style>