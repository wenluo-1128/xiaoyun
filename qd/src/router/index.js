import { createRouter, createWebHistory } from 'vue-router';
import RoutePlanner from '../components/RoutePlanner.vue';
import TravelPlanView from '../components/TravelPlanView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: RoutePlanner
  },
  {
    path: '/travel-plan-view',
    name: 'TravelPlanView',
    component: TravelPlanView
  },
  {
    path: '/travel-plan-view/:userid/:codeid',
    name: 'TravelPlanViewWithParams',
    component: TravelPlanView,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;