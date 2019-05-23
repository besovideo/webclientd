import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        title: 'Login'
      },
      component: () => import(/* webpackChunkName: "Login" */ './views/login/login.vue')
    },
    {
      path: '/Home',
      name: 'Home',
      meta: {
        title: 'tab.Home',
        Name: 'Home'
      },
      component: () => import(/* webpackChunkName: "Home" */ './views/Home.vue'),
      children: [
        {
          path: '',
          name: 'index',
          meta: {
            title: 'tab.Home',
            Name: 'Home'
          },
          component: () => import(/* webpackChunkName: "Home" */ './views/index.vue')
        },
        {
          path: '/Monitor',
          name: 'Monitor',
          redirect: '/Monitor/LivePreview',
          meta: {
            title: 'tab.monitor',
            Name: 'Monitor'
          },
          children: [
            {
              path: 'LivePreview',
              name: 'LivePreview',
              meta: {
                title: 'tab.monitor',
                keepAlive: true,
                Name: 'Monitor'
              },
              components: {
                LivePreview: () => import(/* webpackChunkName: "Monitor" */ './views/Monitor/LivePreview.vue')
              }
            },
            {
              path: 'VideoPlayback',
              name: 'VideoPlayback',
              meta: {
                title: 'home.Video_playback',
                Name: 'Monitor'
              },
              components: {
                VideoPlayback: () => import(/* webpackChunkName: "Monitor" */ './views/Monitor/VideoPlayback.vue')
              }
            }
          ],
          component: () => import(/* webpackChunkName: "Monitor" */ './views/Monitor.vue')
        }
      ]
    }
  ]
})
