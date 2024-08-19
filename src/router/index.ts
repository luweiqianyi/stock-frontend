import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/add-one-transaction-record',
      name: 'add-one-transaction-record',
      component: () => import('../views/StockView.vue')
    },
    {
      path: '/show-all-transaction-results',
      name: 'show-all-transaction-results',
      // 交易记录页面：查询所有已成交交易的详细情况
      component: () => import('../views/TransactionView.vue')
    },
    {
      path: '/cal-expected-returns',//注意点：路径不能是“/expectedReturns”这种驼峰式命名法
      name: 'ExpectedReturns',
      // 交易记录页面：查询所有已成交交易的详细情况
      component: () => import('../views/ExpectedProfitView.vue')
    }
  ]
})

export default router
