<template>
  <div>
    <el-table
      :data="GroupData"
      wdith
      >
      <el-table-column
        :label="$t('Data.yonghuzuID')"
        width="270">
        <template slot-scope="scope">
          <span >{{ scope.row.data.id }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('Data.yonghuzumingcheng')"
        width="180">
        <template slot-scope="scope">
          <el-tag size="medium">{{ scope.row.data.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('Data.yonghuzumiaoshu')"
        :show-overflow-tooltip="true"
        >
        <template slot-scope="scope">
          <span >{{ scope.row.data.description }}</span>
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
            <el-input v-input-filter:f v-model="Editer.name"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Data.yonghuzumiaoshu')" >
            <el-input v-input-filter:f type="textarea" v-model="Editer.desc"></el-input>
          </el-form-item>
          <!-- <el-form-item :label="$t('Data.ziyuan')" >
            <el-select v-model="Editer.resources" multiple filterable style="width:100%">
              <el-option
                v-for="item in Editer.data.allresources"
                :key="item.puid"
                :label="item.puname"
                :value="JSON.stringify(item)">
                <span style="float: left">{{ item.puname }}</span>
                <span style="float: right; margin-right:15px; color: #8492a6; font-size: 13px">{{ item.puid.slice(3) }}</span>
              </el-option>
            </el-select>
          </el-form-item> -->
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
      GroupData: [],
      userManager: undefined,
      EditerDialog: false,
      Editer:{
        name: '',
        desc: '',
        resources:[],
        data:{}
      }
    }
  },
  computed:{
    ...mapState({
      session:'session',
      lang:'lang'
    }),
    allresources(){
      // return this.Editer.data.allresources.filter(el=>{
      //   this.Editer.resources
      // })
    }
  },
  methods:{
    // 被父组件调用，设置表格信息
    SetGroupData(data){
      let temp = []
      data.forEach(group => {
        this.getInfo(group._group.id,(_data)=>{
          temp.push({
            data:_data
          })
        })
      })
      this.GroupData = temp
    },
    // 根据组ID 获取详细信息
    getInfo(id,cb){
      this.userManager || (this.userManager = this.session.swGetUserManager())
      let group = this.userManager.swGetGroupById(id)
      group.swGetGroupInfo({
        callback: (sender, event, data) => {
          if(data.id=='Admin'){
            console.log('Admin');
            console.log(data)
          }
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
        this.userManager || (this.userManager = this.session.swGetUserManager())

        let group = this.userManager.swGetGroupById(this.Editer.data.id)

        // let resources = []
        // this.Editer.resources.forEach(el=>{
        //   resources.push(JSON.parse(el))
        // })
        this.$store.state.ErrorCode = group.swModGroup({
          info: {
            name: this.Editer.name ,
            description: this.Editer.desc ,
            parentid: this.Editer.data.parentid,
            resources: this.Editer.data.resources
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
            this.Editer.data.description = this.Editer.desc
            this.EditerDialog = false
          }
        })
        return
      }
        console.log('data:',data.data)

      this.EditerDialog = true
      this.Editer = {
        name: data.data.name,
        desc: data.data.description,
        resources:data.data.resources,
        data: data.data
      }
    },
    // 删除 按钮逻辑处理
    handleDelete(i,data){
      this.$confirm(`${this.$t('Data.cicaozuojiangshanchu')} ${data.name} (${data.id}) ${this.$t('Data.qunzu')}`, this.$t('Data.jinggao'), {
          confirmButtonText: this.$t('Data.queren'),
          cancelButtonText: this.$t('Data.quxiao'),
          type: 'warning',
          center: true
        }).then(() => {
          let group = this.userManager.swGetGroupById(data.data.id)
          this.$store.state.ErrorCode = group.swDelGroup({
            callback: (sender, option, data) => {
              this.$store.state.ErrorCode = option.emms.code
              if (option.emms.code != 0) {
                if(option.emms.code == 20114){
                  this.$Message.error(this.$t('Data.yonghuzuzhongyouchengyuan,wufashanchu'))
                }else{
                  this.$Message.error(this.$t('Data.shanchushibai'))
                }
                return
              }
              this.$Message.success(this.$t('Data.shanchuchenggong'))
            },
            tag: data.id
          });
        }).catch(() => {

        });
    }
  }
}
</script>
<style lang="less" scoped>

</style>
