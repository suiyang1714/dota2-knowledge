<!--
<template lang="pug">
  main
    .content
      el-table(:data='articles.data', border='', style='width: 100%')
        el-table-column(type="index",)
        el-table-column(prop='title', label='标题')
        el-table-column(prop='category.name', label='分类')
        el-table-column(label='标签')
          template(slot-scope='scope')
            | {{ scope.row.tags | tabSmarty }}
        el-table-column(label='创建时间')
          template(slot-scope='scope')
            | {{ scope.row.meta.createdAt | momentDate }}
        el-table-column(label='更新时间')
          template(slot-scope='scope')
            | {{ scope.row.meta.updatedAt | momentDate }}
        el-table-column(prop='pv', label='浏览量')
        el-table-column(prop='comment', label='回复')
        el-table-column(fixed='right', label='操作', width="100")
          template(slot-scope='scope')
            nuxt-link(:to="'/article/'+scope.row._id", target="_blank", plain, circle, class="linkBtn") 查看
            el-button(@click='navigateToEdit(scope.row._id)', type="primary", icon="el-icon-edit", circle="")
            el-button(@click='deleteArticle(scope.$index, articles.data, scope.row)', type="danger", icon="el-icon-delete", circle="")
      //    分页
      el-pagination(background='', layout='prev, pager, next', :total='articles.count * 10', @current-change="handleCurrentChange")

</template>

<script>
  import { mapState } from 'vuex'
  import moment from 'moment'

  export default {
    layout: 'admin',
    head() {
      return {
        title: '用户列表页 - Dota2 你知多少 后台管理系统'
      }
    },
    data() {
      return {
        activePage: 1
      }
    },
    filters: {
      tabSmarty (arr) {
        let str = ''
        arr.forEach((item) => {
          str += `${item.name} `
        })
        return str
      },
      momentDate (time) {
        return moment(time).format(`YYYY-MM-DD HH:mm:ss`)
      }
    },
    async created() {
      const page = this.$route.query.page
      // 请求数据
      await this.$store.dispatch('fetchArticles', {page: page, device: '1'})
    },
    computed: mapState([
      'articles'
    ]),
    methods: {
      //  分页
      async handleCurrentChange (val) {
        await this.$store.dispatch('fetchArticles', { page: val, device: '1' })
        this.$router.push({path: '/admin/article?page=' + val})
      },
      // 跳转修改
      navigateToEdit (_id) {
        this.$router.push({path: '/admin/article/editArticle?_id=' + _id})
      },
      // 删除文章
      async deleteArticle (index, rows, article) {
        let articleMsg
        if (article.category) {
          articleMsg = {
            _id: article._id,
            categoryId: article.category.source
          }
        } else {
          articleMsg = {
            _id: article._id
          }
        }
        if (article.tags) {
          articleMsg.tagsId = article.tags.map(item => {
            return item.source
          })
        }
        const callback = await this.$store.dispatch('deleteArticle', articleMsg)

        if (callback.success) {
          rows.splice(index, 1)
        }
      }
    }
  }
</script>

<style scoped lang="scss">
.content {
  height: 100%;
  font-family: -apple-system,BlinkMacSystemFont,opensans,Optima,"Microsoft Yahei",sans-serif;
  line-height: 1.8;
  font-size: 16px;
  color: #848484;
  font-weight: 300;
  overflow-x: hidden;
  padding: 30px 15px 18px 15px;
  /*margin: 0 0 15px;*/
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,.1);
  border-radius: 0;
  box-sizing: border-box;
}
  .linkBtn {
    border-radius: 50%;
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    background: #fff;
    border: 1px solid #dcdfe6;
    border-color: #dcdfe6;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    box-sizing: border-box;
    outline: none;
    margin: 0;
    transition: .1s;
    font-weight: 500;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    padding: 12px 20px;
    font-size: 14px;

  }
</style>
-->
