
<template>
    <div>
    <el-table
      :data="GroupData"
      :loading="loading"
      wdith
      >
      <el-table-column
        :label="$t('Data.leixing')"
        width="100">
        <template slot-scope="scope">
          <el-tag size="medium">{{ scope.row.type=="user"? $t('Data.yonghu'):$t('Data.qunzu')}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="ID"
        width="270">
        <template slot-scope="scope">
          <span >{{ scope.row.data.id }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column
        :label="$t('Data.suoshuyonghuzuID')"
        width="260">
        <template slot-scope="scope">
          <span >{{ scope.row.id }}</span>
        </template>
      </el-table-column> -->
      <el-table-column
        :label="$t('Data.mingcheng')"
        width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.data.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('Data.miaoshu')"
        :show-overflow-tooltip="true"
        >
        <template slot-scope="scope">
          <span >{{ scope.row.data.desc }}</span> 
        </template>
      </el-table-column>
      <el-table-column :label="$t('Data.caozuo')" fixed="right" width="200">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)">{{$t('Data.bianji')}}</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">{{$t('Data.shanchu')}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    

    <!-- 编辑 操作框 -->
      <el-dialog
        :title="$t('Data.bianji')"
        :visible.sync="EditerDialog"
        class="EditerDialog"
        :close-on-click-modal="false"
        width="600px"
        center >
        <el-form :label-width="lang=='en'?'170px':'90px'" size="medium">
          <el-form-item :label="$t('Data.yonghuzumingcheng')" >
            <el-input v-model="Editer.name"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Data.yonghuzumiaoshu')" >
            <el-input type="textarea" v-model="Editer.desc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="EditerDialog = false">{{$t('Data.quxiao')}}</el-button>
          <el-button type="primary" @click="handleEdit('Edit')">{{$t('Data.queren')}}</el-button>
        </span>
      </el-dialog>
    <!-- 编辑 操作框 -->


  </div>  
</template>
<script>
import {mapState} from 'vuex'
export default {
  data(){
    return {
      GetData:undefined,
      GroupData: [],
      userManager: undefined,
      EditerDialog: false,
      Editer:{
        name: '',
        desc: ''
      },
      loading: true
    }
  },
  computed:{
    ...mapState({
      session:'session',
      lang:'lang'
    })
  },
  methods:{
    // 被父组件调用，设置表格信息 
    SetGroupData(data){
      this.loading = true
      let temp = []
      data.children.forEach(children => {
        if(children.target == 'user'){
          this.getInfo([children._group._group.id,children._user.id],(_data)=>{
            temp.push({
              type: 'user',
              data: _data
            })
          })
        }else if(children.target == 'group') {
          temp.push({
            type: 'group',
            data: children._group
          })
        }
      })
      this.GroupData = temp
      this.loading = false
    },
    // 根据组ID 获取详细信息
    getInfo(data,cb){
      this.userManager || (this.userManager = this.session.swGetUserManager())
      let group = this.userManager.swGetGroupById(data[0])
      let user = group.swGetUserById(data[1])
      user.swGetUserInfo({
        callback: (sender, event, data) => {
          cb(data)
        },
        tag: null
      });
    },
    // 编辑 按钮逻辑处理
    handleEdit(i,data){
      if( i == 'Edit' ){
        if(this.Editer.name.trim() == ''){
          this.$Message.error(this.$t('Data.mingchengbunengweikong'))
          return
        }
        let group = this.userManager.swGetGroupById(this.Editer.data.id)
        this.$store.state.ErrorCode = group.swModGroup({
          info: {
            name: this.Editer.name ,
            description: this.Editer.desc ,
            parentid: this.Editer.data._group.parentid,
            resources: []
          },
          callback: (sender,option,data) => {
            this.$store.state.ErrorCode = option.emms.code
            if(option.emms.code!=0){
              // this.$Message.error(this.$tools.findErrorCode(option.emms.code))
              this.$Message.error(this.$t('Data.xiugaishibai'))
              return
            }
            this.$Message.success(this.$t('Data.xiugaichenggong'))
            this.Editer.data.name = this.Editer.name
            this.Editer.data.desc = this.Editer.desc
            this.EditerDialog = false
          }
        })
        return
      }
      this.EditerDialog = true
      this.Editer = {
        name: data.name,
        desc: data.desc,
        data
      }
    },  
    // 删除 按钮逻辑处理
    handleDelete(i,data){
      this.$confirm(`${this.$t('Data.cicaozuojiangshanchu')} ${data.data.name} (${data.data.id}) ${data.type=='group'?this.$t('Data.qunzu'):this.$t('Data.yonghu')}`, this.$t('Data.jinggao'), {
          confirmButtonText: this.$t('Data.queren'),
          cancelButtonText: this.$t('Data.quxiao'),
          type: 'warning',
          center: true
        }).then(() => {
          this.userManager = this.session.swGetUserManager()

          if(data.type=='user'){
            console.log(data.data)
            let user = this.userManager.swGetUserById(data.data.groupid, data.data.id);
            this.$store.state.ErrorCode =  user.swDelUser({
              callback: (sender, option, data) => {
                this.$store.state.ErrorCode = option.emms.code
                if (option.emms.code != 0) {
                  this.$Message.error(this.$t('Data.shanchushibai'))
                  return
                }
                this.$Message.success(this.$t('Data.shanchuchenggong'))
              },
              tag: null
            });
            return
          }
          let group = this.userManager.swGetGroupById(data.data.id)
          this.$store.state.ErrorCode = group.swDelGroup({
            callback: (sender, option, data) => {
              this.$store.state.ErrorCode = option.emms.code
              if (option.emms.code != 0) {
                this.$Message.error(this.$t('Data.shanchushibai'))
                return
              }
              this.$Message.success(this.$t('Data.shanchuchenggong'))
            },
            tag: data.data.id
          });
        }).catch(() => {
          
        });
    }
  }
}
</script>
<style lang="less">

</style>