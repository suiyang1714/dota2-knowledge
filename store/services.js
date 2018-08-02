import axios from 'axios'
// const baseUrl = 'http://127.0.0.1:7278/'
const baseUrl = 'https://dota2.adityasui.com'
class Services {
  newQuestion(issue) {
    return axios.post(`${baseUrl}/api/question/new`, issue)
  }
  login(userMsg) {
    return axios.post(`${baseUrl}/api/login`, userMsg)
  }
}
export default new Services()
