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
            keepAlive: true,
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
              component: () => import(/* webpackChunkName: "Monitor" */ './views/Monitor/_LivePreview.vue')
            },
            {
              path: 'Locate',
              name: 'Locate',
              meta: {
                title: 'home.Locate',
                keepAlive: true,
                Name: 'Monitor'
              },
              component: () => import(/* webpackChunkName: "Monitor" */ './views/Monitor/Locate.vue')
            },
            {
              path: 'VideoPlayback',
              name: 'VideoPlayback',
              meta: {
                title: 'home.Video_playback',
                Name: 'Monitor'
              },
              component: () => import(/* webpackChunkName: "Monitor" */ './views/Monitor/VideoPlayback.vue')
            },
            {
              path: 'Scheduling',
              name: 'Scheduling',
              meta: {
                title: 'home.Scheduling',
                Name: 'Monitor'
              },
              component: () => import(/* webpackChunkName: "Monitor" */ './views/Monitor/Scheduling.vue')
            }
          ],
          component: () => import(/* webpackChunkName: "Monitor" */ './views/Monitor.vue')
        },
        {
          path: '/Configuration',
          name: 'Configuration',
          redirect: '/Configuration/UserManage',
          meta: {
            title: 'Data.peizhizhongxin',
            keepAlive: true,
            Name: 'Configuration'
          },
          children: [
            {
              path: 'UserManage',
              name: 'UserManage',
              meta: {
                title: 'Data.yonghuguanli',
                keepAlive: true,
                Name: 'Configuration'
              },
              component: () => import(/* webpackChunkName: "Monitor" */ './views/Configuration/UserManage.vue')
            }
          ],
          component: () => import(/* webpackChunkName: "Monitor" */ './views/Configuration.vue')
        }
      ]
    }
  ]
})
