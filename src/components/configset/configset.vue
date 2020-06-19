<template>
  <el-dialog
    title="设置"
    :visible.sync="$store.state.ConfigSetDialog"
    width="90%"
    center>
    
    <span slot="footer" class="dialog-footer">
      <el-button @click="$store.state.ConfigSetDialog = false">关闭</el-button>
      <el-button type="primary" @click="$store.state.ConfigSetDialog = false">保存</el-button>
      <el-button type="primary" @click="$store.state.ConfigSetDialog = false">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
    }
  },
  methods:{
    show() {
    }
  }
}
</script>

<style>

</style>