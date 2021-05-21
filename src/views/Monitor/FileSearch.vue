<template>
  <div class="lp_content">
    <div class="lp_left">
      <term-tree-list
        @on-term-click="TermdbClick"
        @on-click='TermdbClick'  />
    </div>
    <div class="lp_body">
        <div id="FileListContent">
          <div class="search_filter">
              <el-form :inline="true" label-width="80px" >
                <el-form-item :label="$t('Data.shebei')">
<!--                  <el-input size="medium" :value="filter.name + ' ' + filter.id"  :title="filter.name + ' ' + filter.id" readonly style="cursor: pointer"></el-input>-->
                  <el-tag v-if="filter.id">{{ `${filter.name} (${filter.id})` }}</el-tag>
                  <el-tag v-else>{{ $t('Data.qingshuangjixuanzeshebei') }}</el-tag>
                </el-form-item>
                <el-form-item :label="$t('Data.riqi')">
                  <el-date-picker
                    size="medium"
                    v-model="filter.date"
                    type="datetimerange"
                    range-separator="-"
                    :start-placeholder="$t('Data.kaishiriqi')"
                    :end-placeholder="$t('Data.jieshuriqi')"
                  >
                  </el-date-picker>
                </el-form-item>
                <el-form-item :label="$t('Data.wenjianleixing')">
                  <el-select v-model="filter.fileType">
                    <el-option
                      v-for="(item,key) in FileType"
                      :key="key"
                      :label="item"
                      :value="parseInt(key)">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            <div style="margin-bottom: 5px" v-if="currentSearch !== undefined">
              <span style="display: inline-block;width: 50px;font-size: 14px">{{ $t('Data.leixing') }}</span>
              <el-tag style="margin-bottom: 5px"  >{{ searchType[currentSearch].label }}</el-tag>
            </div>

            <div>
              <el-button type="primary" size="medium" icon="el-icon-search" :loading="searching" @click="search(0, true) ">{{ searchType[0].label }}</el-button>
              <el-button type="primary" size="medium" icon="el-icon-search" :loading="searching" @click="search(1, true) " >{{  searchType[1].label }}</el-button>
            </div>
          </div>
          <div class="info-table" >
<!--            :height="`calc(100% - 150px - ${currentSearch !== undefined?'40px':'0px'})`"-->
            <el-table :data="content" border height="100%"  :loading="searching" >
              <el-table-column :label="$t('Data.xuhao')" type="index" width="50"></el-table-column>
              <!--                <el-table-column label="ID" prop="iRecordID"></el-table-column>-->
              <el-table-column label="ID" prop="szSourceID" v-if="currentSearch === 1"></el-table-column>
              <el-table-column :label="$t('Data.tongdao')" prop="iChannelIndex"  width="50"></el-table-column>
              <el-table-column :label="$t('Data.luxiangleixing')" prop="iRecordType">
                <template slot-scope="{row}">
                  <span>{{ RecordType[row.iRecordType] }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('Data.wenjianleixing')" prop="iFileType">
                <template slot-scope="{row}">
                  <span>{{ FileType[row.iFileType] }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('Data.wenjiandaxiao')" prop="iFileSize">
                <template slot-scope="{row}">
                  <span>{{ $tools.handleUnit(row.iFileSize)}}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('Data.luxiangkaishi')" prop="iTimeBegin">
                <template slot-scope="{row}">
                  <span v-if="row.iTimeBegin">{{ $moment(row.iTimeBegin*1000).local().format('YYYY-MM-DD HH:mm:ss')}}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('Data.luxiangjieshu')" prop="iTimeEnd">
                <template slot-scope="{row}">
                  <span v-if="row.iTimeEnd">{{ $moment(row.iTimeEnd*1000).local().format('YYYY-MM-DD HH:mm:ss')}}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('Data.shijian')" prop="iTimeRecord">
                <template  slot-scope="{row}">
                  <span v-if="row.iTimeRecord">{{ $moment(row.iTimeRecord*1000).local().format('YYYY-MM-DD HH:mm:ss')}}</span>
                  <span v-else>{{ row.iTimeRecord }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('Data.wenjianlujing')" prop="szFilePath"></el-table-column>
            </el-table>
          </div>
          <div class="bottom-pagination" style="padding-top: 5px">
            <el-pagination
              background
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currPage"
              :page-sizes="[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 128]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :page-count="5"
              :total="pageInfo.iTotalCount">
            </el-pagination>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TermTreeList from "@/components/Monitor/TermTreeList.vue"


export default {
  name: "FileSearch",
  components: {
    TermTreeList,
  },
  data() {
    return {
      disabled: undefined,
      searching: false,
      content: [],
      pageSize: 20,
      pageInfo: {
        iCount: 0,
        iPostition: 0,
        iTotalCount: 0,
      },
      searchType: [{ label: this.$t('Data.bendicunchu') , func: 'swSearchFileOnPu' } , { label: this.$t('Data.pingtaicunchu'), func: 'swSearch' }],
      currentSearch: undefined,
      filter: {
        id: '',
        name: '',
        fileType: 0,
        date: [ this.$moment().subtract(1, 'days'), this.$moment()]
      },
      RecordType: {
        0: "All",
        1: this.$t('Data.shoudongcunchu'),
        2: this.$t('Data.dingshicunchu'),
        4: this.$t('Data.baojingcunchu'),
        8: this.$t('Data.zidongcunchu'),
        16: this.$t('Data.shangchuandewenjian')
      },
      FileType: {
        0: "All",
        1: this.$t('Data.luxiangwenjian'),
        2: this.$t('Data.tupianwenjian'),
        4: this.$t('Data.GPSwenjian'),
        8: this.$t('Data.yinpinwenjian'),
        16: this.$t('Data.rizhiwenjian'),
      }
    };
  },
  methods: {
    handleCurrentChange(page) {
      // console.log('handleCurrentChange', args)
      this.pageInfo.iPostition = this.pageSize * (page - 1)
      this.search(this.currentSearch)
    },
    handleSizeChange(size) {
      // console.log('handleSizeChange ', args)
      this.pageSize = size
      this.pageInfo.iPostition = 0
      this.search(this.currentSearch)
    },
    search(index, reSearch) {
      reSearch && (this.pageInfo.iPostition = 0)
      if (!this.filter.id.trim()) {
        this.$Message.warning(this.$t('Data.qingxuanzeyigeshebei'))
        return
      }

      if (!this.filter.date) {
        this.$Message.error(this.$t('Data.shijianfanweibunengweikong'))
        return
      }

      this.currentSearch = index

      let [beginDate = undefined, endDate = undefined] = this.filter.date

      if (!beginDate || !endDate) {
        this.$Message.error(this.$t('Data.shijianfanweibunengweikong'))
        return
      }
      this.searching = true
      this.content = []
        let code = this.$store.state.ErrorCode = this.session[ this.searchType[index].func ]({
        stSearchInfo: {
          iPostition:  this.pageInfo.iPostition || 0,
          iCount: this.pageSize
        },
        stFilter: {
          szPUID: this.filter.id,
          iChannelIndex: -1,
          iFileType: this.filter.fileType || 0,
          iTimeBegin: this.$moment(beginDate).utc().unix(),
          iTimeEnd:  this.$moment(endDate).utc().unix(),
          iFileSizeMin: 0,
          iFileSizeMax: 0,
          iRecordType: 0,
        },
        callback: (options, response ,data)=>{

          this.searching = false
          this.$store.state.ErrorCode = response.getCode()
          if (response.getCode() === window.jSW.RcCode.RC_CODE_S_OK) {
            if (data && data.content) {
              if (data.content.length === 0) {
                this.$Message.warning(this.$t('Data.wuchaxunjieguo'))
              }
              this.content = data.content
              this.pageInfo = { ...this.pageInfo , ...data.info }
            } else {
            }
          } else {
            this.$Message.error(this.$t('Data.lianjieshibai')+ ' ' + this.$tools.findErrorCode(response.emms.code))
            this.pageInfo = {}
            this.content = []
          }
        }
      })
      if (code !== window.jSW.RcCode.RC_CODE_S_OK) {
        this.searching = false
      }


    },
    TermdbClick(channel) {

      this.currentSearch = undefined
      this.content = []
      if (!channel) {
        this.$Message.error(this.$t('Data.lianjieshibai'))
        this.filter.id = this.filter.name = ''
        this.pageInfo = {}

        return
      }
      this.filter.id =  channel._parent._id_pu
      this.filter.name =  channel._parent._name_pu
      this.pageInfo = {}


        // this.$Message.info(this.$t('Data.lianjieshibai'))

      // temp.puid = channel._parent._id_pu;
      // temp.tag = channel._id_chanel;
      // temp.puname = channel._parent._name_pu||channel._parent._id_pu;
      // console.log(channel);
      // this.$nextTick(()=>{
      //   this.$refs['video'+temp.index][0].Play()
      // })

    },
  },
  watch: {
    currentSearch(val) {
      this.pageInfo.iPostition = 0
    }
  },

  computed: {
    ...mapState({
      session: "session"
    }),
    currPage() {
      return Math.ceil((this.pageInfo.iPostition + 1) / this.pageSize)
    }
  },
  activated(){

  },
  deactivated(){

  },
  created() {

  },
  updated() {
  }
};
</script>

<style lang="less" scoped>
.lp_content {
  width: 100%;
  height: calc(100% - 42px);
  display: flex;
  .lp_left{
    width: 255px;
    height: 100%;
  }
  .lp_body{
    flex:1;
    width: 100%;
    margin-left: 5px;
    height: 100%;
    display: block;
    #FileListContent{
      width: 100%;
      display: flex;
      overflow: hidden;
      height: calc(100% - 1px);
      flex-direction: column;
      .info-table {
        flex: 1;
        height: 0;
        padding-top: 5px;
        //overflow-y: hidden;
      }
      //.form_item {
      //  display: inline-block;
      //  margin-right: 10px;
      //  & > span.label {
      //    width: 100px;
      //    font-size: 16px;
      //  }
      //}
    }
  }
}
</style>


