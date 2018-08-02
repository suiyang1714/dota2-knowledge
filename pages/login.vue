<template lang="pug">
  .relative
    el-form.demo-ruleForm(:model='ruleForm', status-icon='', :rules='rules', ref='ruleForm', label-width='100px')
      el-form-item(label='用户名', prop='username')
        el-input(v-model='ruleForm.username')
      el-form-item(label='密码', prop='password')
        el-input(type='password', v-model='ruleForm.password', auto-complete='off')
      el-form-item
        el-button(type='primary', @click="submitForm('ruleForm')") 提交
        el-button(@click="resetForm('ruleForm')") 重置
</template>

<script>

  export default {
    layout: 'login',
    head() {
      return {
        title: `欢迎光临 - Aditya's Blog`
      }
    },
    data() {
      const validateUser = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入用户名'))
        } else {
          callback()
        }
      }
      const validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'))
        } else {
          callback()
        }
      }
      return {
        title: 'login',
        ruleForm: {
          password: '',
          username: ''
        },
        rules: {
          password: [
            { validator: validatePass, trigger: 'blur' }
          ],
          username: [
            { validator: validateUser, trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      submitForm(formName) {
        // const _this = this
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            const loading = this.$loading({
              lock: true,
              text: 'Loading',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            })
            // console.log(this.ruleForm)
            const callback = await this.$store.dispatch('login', this.ruleForm)
            if (callback) {
              loading.close()
              if (callback.success === true) {
                this.$message({
                  message: `欢迎，${callback.data.nickname}`,
                  type: 'success'
                })
                this.$router.push('/')
              } else {
                this.$message({
                  message: callback.data,
                  type: 'error'
                })
              }
            }
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      resetForm(formName) {
        this.$refs[formName].resetFields()
      }
    }
  }
</script>

<style scoped>
  .relative {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .demo-ruleForm {
    width: 400px;
  }
</style>
