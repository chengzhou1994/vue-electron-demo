import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axiosOrigin from 'axios' // 原生axios
Vue.config.productionTip = false

function getServerConfig() {
  return new Promise((resolve, reject) => {
    axiosOrigin
      .get('./serverConfig.json')
      .then((result) => {
        let config = result.data
        for (let key in config) {
          console.log(config[key])
          Vue.prototype[`$${key}`] = config[key]
        }
        resolve()
      })
      .catch(() => {
        reject()
      })
  })
}

async function main() {
  await getServerConfig()
  // axios.defaults.baseURL = Vue.prototype.$baseUrl
  new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount('#app')
}

main()
