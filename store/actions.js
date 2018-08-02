import Services from './services'
import axios from 'axios'

export default {
  nuxtServerInit({ commit }, { req, res }) {
    if (req.session && req.session.user) {
      const { username, nickname } = req.session.user
      const user = {
        username,
        nickname
      }

      commit('SET_USER', user)
    }
  },
  async login({ commit }, userMsg) {
    try {
      let res = await await Services.login(userMsg)

      let { data } = res
      if (data.success) {
        commit('SET_USER', data.data)
      } else {
        commit('SET_USER', null)
      }

      return data
    } catch (e) {
      if (e.response.status === 401) {
        throw new Error('You can\'t do it')
      }
    }
  },

  async logout({ commit }) {
    await axios.post('/admin/logout')
    commit('SET_USER', null)
  },
  // 新建文章
  async newQuestion({state}, issue) {
    const res = await Services.newQuestion(issue)

    return res.data
  }
}
