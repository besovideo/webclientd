<!--
 * @Author: Shirtiny
 * @Date: 2021-08-24 14:39:25
 * @LastEditTime: 2021-09-01 09:33:34
 * @Description:
-->
<template>
  <div class="term_list">
    <p class="itemleft">
      <el-tag type="success">{{label}}</el-tag>
    </p>
    <p class="itemright">
      <slot></slot>
      <!-- <el-input v-input-filter:f v-model="value" :disabled="disabled" /> -->
    </p>
  </div>
</template>

<script>
export default {
  props:['label'],
  methods:{

  },
  watch:{
    // value(val){
    //   this.$emit('input',val)
    // }
  }
}
</script>
<style lang="less">
.term_list{
  margin-bottom: 10px;
  width:100%;
  display: flex;
  .itemleft{
    min-width:80px;
    text-align: right;
    // padding-right: 10px;
    margin-right: 10px
  }
  .itemright{
    flex:1;
    &>.el-input>input,textarea{
      height:32px;
      cursor:initial;
    }
    &>.el-select input{
      height: 32px;
    }
    .el-input__icon{
      line-height: 32px;
    }
  }
}
</style>
