<template>
  <el-dialog title="外层 Dialog" width="800px" :visible.sync="outer">
    <el-dialog width="30%" title="内层 Dialog" :visible.sync="inner" append-to-body></el-dialog>

    <div slot="footer" class="dialog-footer">
      <el-button @click="outer = false">取 消</el-button>
      <el-button type="primary" @click="inner = true">打开内层 Dialog</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
export default {
  props: ["value"],
  data() {
    return {
      outer: this.value,
      inner: false,
      userManager:undefined
    };
  },
  watch: {
    outer(val) {
      this.$emit("input", val);
    },
    value(val) {
      this.outer = val;
    }
  },
  computed: {
    ...mapState({
      session: "session",
      UserManageInit: "UserManageInit"
    })
  },
  created() {
    window.UserManageChange = ()=>{}
    let code;
    this.userManager = this.session.swGetUserManager();
    if(!this.UserManageInit){
      this.$store.state.UserManageInit = true
      this.$store.state.ErrorCode = code = this.userManager.swInit({
        callback: (sender, response, data) => {
          this.$store.state.ErrorCode = response.emms.code;
          if (response.emms.code != 0) {
            this.$Message.error(this.$tools.findErrorCode(response.emms.code));
          }
          //初始化返回值判断
          if (code != 0) {
            this.$Message.error(this.$tools.findErrorCode(code));
          }

          let id = this.userManager.swGetCurrentUserId()
          console.log('id:',id)
        },
        ondatachanged: window.UserManageChange,
        tag: null
      });
    }else{
      let id = this.userManager.swGetCurrentUserId()
      console.log('id:',id)
    }
  }
};
</script>
<style lang="less">
</style>