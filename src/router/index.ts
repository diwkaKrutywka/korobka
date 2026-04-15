import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',           name: 'welcome',     component: () => import('@/views/WelcomeView.vue') },
    { path: '/lang',       name: 'lang',        component: () => import('@/views/LangSelectView.vue') },
    { path: '/home',       name: 'home',        component: () => import('@/views/HomeView.vue') },
    { path: '/book',       name: 'book',        component: () => import('@/views/booking/BookingIinView.vue') },
    { path: '/book/depts', name: 'depts',       component: () => import('@/views/booking/DepartmentsView.vue') },
    { path: '/departments', name: 'departments', component: () => import('@/views/booking/DepartmentsView.vue') },
    { path: '/book/services', name: 'services',  component: () => import('@/views/booking/ServicesView.vue') },
    { path: '/book/docs',  name: 'docs',        component: () => import('@/views/booking/DoctorsView.vue') },
    { path: '/book/ok',    name: 'book-ok',     component: () => import('@/views/booking/BookingSuccessView.vue') },
    { path: '/osms',       name: 'osms',        component: () => import('@/views/OsmsView.vue') },
    { path: '/osms/check', name: 'osms-check',  component: () => import('@/views/OsmsCheckView.vue') },
    { path: '/info',       name: 'info',        component: () => import('@/views/info/InfoView.vue') },
    { path: '/info/faq',   name: 'info-faq',    component: () => import('@/views/info/FaqView.vue') },
    { path: '/info/sched', name: 'info-sched',  component: () => import('@/views/info/ScheduleView.vue') },
    { path: '/info/nav',   name: 'info-nav',    component: () => import('@/views/info/NavigationView.vue') },
    { path: '/info/npa',   name: 'info-npa',    component: () => import('@/views/info/NpaView.vue') },
    { path: '/queue',      name: 'queue',       component: () => import('@/views/QueueView.vue') },
    { path: '/profile',    name: 'profile',     component: () => import('@/views/ProfileView.vue') },
    { path: '/ai',         name: 'ai',          component: () => import('@/views/AiView.vue') },
  ],
})

export default router
