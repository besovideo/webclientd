<template>
  <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">

      <!-- <Row>
        <Col span="18" >
          <FormItem prop="Server">
            <Input v-model="form.Server" :placeholder="$t('Monitor.Server')">
              <span slot="prepend">
                <span>
                  <i  class="fa fa-server" style="font-size: 16px"></i>
                </span>
              </span>
            </Input>
          </FormItem>
        </Col>
        <Col span="5" offset='1'>
          <FormItem prop="Server_Port">
            <Input v-model="form.Server_Port" :placeholder="$t('Monitor.Server_Port')">
            </Input>
          </FormItem>
        </Col>
      </Row>
    </FormItem> -->
    <!-- // -->
    <FormItem class="portSet">
      <Input v-model="form.Server" :placeholder="$t('Server')">
        <span slot="prepend">
          <Icon :size="16" type="logo-codepen"></Icon>
        </span>
      </Input>
      <Input v-model="form.Server_Port" style="margin-left: 20px;width: 70px"/>
      <!-- <el-tag @click="" size="small" style="cursor: pointer;">{{$t('SetPort')}}</el-tag> -->
    </FormItem>
    <FormItem prop="userName">
      <Input v-model="form.userName" :placeholder="$t('login.plzuser')">
        <span slot="prepend">
          <Icon :size="16" type="ios-person"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="password" style="">
      <Input type="password" v-model="form.password" :placeholder="$t('login.plzpasswd')">
        <span slot="prepend">
          <Icon :size="16" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <div style="position: relative;transform: translateY(-10px);height: 20px">

    </div>

    <div id="cb_rember">
      <Checkbox>记住密码</Checkbox>
    </div>
    <FormItem>
      <Button @click="handleSubmit" type="primary" long>{{$t('login.login')}}</Button>
    </FormItem>
  </Form>
</template>
<script>
export default {
  name: 'LoginForm',
  props: {

  },
  data () {
    return {
      form: {
        userName: window.localStorage.getItem('userName'),
        password: '',
        Server: '127.0.0.1',
        Server_Port: '9701'
        // Server: window.localStorage.getItem('Server'),
        // Server_Port: window.localStorage.getItem('Server_Port')
      }
    }
  },
  created() {
    let lastConnect = window.localStorage.getItem("lastConnect") || '{ "Server":"127.0.0.1","Server_Port": "9701"}'
    let {Server,Server_Port} = JSON.parse(lastConnect)
    this.form.Server = Server
    this.form.Server_Port = Server_Port
  },
  computed: {
    rules () {
      return {
        Server:  [
              { required: true, message: this.$t('login.error_noserver'), trigger: 'blur' }
        ],
        Server_Port:  [
              { required: true, message: this.$t('login.error_nopport'), trigger: 'blur' }
        ],
        userName:  [
              { required: true, message: this.$t('login.error_nouser'), trigger: 'blur' }
          ],
        password: [
              { required: true, message: this.$t('login.error_nopasswd'), trigger: 'blur' }
          ]
      }
    }
  },
  methods: {
    handleSubmit () {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.$emit('on-success-valid', {
            // Server: this.form.Server,
            // Server_Port: this.form.Server_Port,
            userName: this.form.userName,
            password: this.form.password,
            Server: this.form.Server,
            Server_Port: this.form.Server_Port
          })
        }
      })
    }
  }
}
</script>

<style lang="less">
#cb_rember{
  display: none;
  margin-bottom:10px
}
.portSet > .ivu-form-item-content {
  display: flex;

}
</style>

