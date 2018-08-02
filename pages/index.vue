<template lang="pug">
  .container
    .form
      el-form(ref='form', :model='form', label-width='80px')
        el-form-item(label='Title')
          el-input(v-model='form.issue')
        el-form-item(label='Option I')
          el-input(v-model='form.option1')
        el-form-item(label='Option II')
          el-input(v-model='form.option2')
        el-form-item(label='Option III')
          el-input(v-model='form.option3')
        el-form-item(label='Option IV')
          el-input(v-model='form.option4')
        el-form-item(label='Answer')
          el-input(v-model='form.answer')
        el-form-item(label='Level')
          el-input(v-model='form.level')
        el-form-item
          el-button(type='primary', @click='onSubmit') 立即创建
          el-button 取消

</template>
<script>
  export default {
    data() {
      return {
        form: {

        }
      }
    },
    async onShow() {
      await this.$store.dispatch('getQuestion')
    },
    methods: {
      // notification
      notification(title, message, type) {
        this.$notify({
          title: `${title}`,
          message: `${message}`,
          type: `${type}`
        })
      },
      onSubmit: async function () {
        let data = {
          issue: null,
          options: [],
          answer: null,
          level: null
        }
        data.issue = this.form.issue
        data.options.push(this.form.option1, this.form.option2, this.form.option3, this.form.option4)
        data.answer = parseInt(this.form.answer)
        data.level = parseInt(this.form.level)
        const callback = await this.$store.dispatch('newQuestion', data)

        if (callback.success) {
          this.notification('成功', callback.data, 'success')
          this.form = {}
        } else {
          this.notification('失败', callback.data, 'error')
          this.form = {}
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .container {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .form{
      width: 50%;
    }
  }
</style>
