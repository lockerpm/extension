import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import storePromise from "../store/index";
import Home from '../popup/views/home.vue'
import Layout from '@/popup/components/layout/default.vue'
Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: '',
        name: 'home',
        component: Home
      }
    ]
  },
  {
    path: "/set-master-password",
    name: "set-master-password",
    component: () =>
      import(/* webpackChunkName: "vault" */ "../popup/views/set-master-password.vue")
  },
  {
    path: "/lock",
    name: "lock",
    beforeEnter: VaultGuard,
    component: () =>
      import(/* webpackChunkName: "vault" */ "../popup/views/lock.vue")
  },
  // {
  //   path: "/vault",
  //   name: "vault",
  //   beforeEnter: VaultGuard,
  //   component: () =>
  //     import(/* webpackChunkName: "vault" */ "../popup/views/vault/index.vue")
  // },
  {
    path: "/vault",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: '',
        name: 'vault',
        component: () =>
          import(/* webpackChunkName: "vault" */ "../popup/views/vault/index.vue")
      }
    ]
    
  },
  {
    path: "/vault/passwords",
    name: "vault-passwords",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/vault/passwords.vue"
      )
  },
  {
    path: "/vault/notes",
    name: "vault-notes",
    beforeEnter: VaultGuard,
    component: () =>
      import(/* webpackChunkName: "vault" */ "../popup/views/vault/notes.vue")
  },
  {
    path: "/vault/cards",
    name: "vault-cards",
    beforeEnter: VaultGuard,
    component: () =>
      import(/* webpackChunkName: "vault" */ "../popup/views/vault/cards.vue")
  },
  {
    path: "/vault/identities",
    name: "vault-identities",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/vault/identities.vue"
      )
  },
  {
    path: "vault/folders/:folderId",
    name: "vault-folders-folderId",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/vault/folders/_folderId/index.vue"
      )
  },
  {
    path: "vault/teams/:teamId?/tfolders/:tfolderId",
    name: "vault-teams-teamId-tfolders-tfolderId",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/vault/teams/_teamId/tfolders/_tfolderId/index.vue"
      )
  },
  {
    path: "/add_item/create",
    name: "add-item-create",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/add_item/create.vue"
      )
  },
  {
    path: "/add_item",
    name: "add-item",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/add_item/index.vue"
      )
  },
  // {
  //   path: "/generator",
  //   name: "generator",
  //   beforeEnter: VaultGuard,
  //   component: () =>
  //     import(/* webpackChunkName: "vault" */ "../popup/views/generator.vue")
  // },
  {
    path: "/generator",
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        name: "generator",
        path: '',
        component: () =>
          import(/* webpackChunkName: "vault" */ "../popup/views/generator.vue")
      }
    ]
  },
  // {
  //   path: "/settings",
  //   name: "settings",
  //   beforeEnter: VaultGuard,
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "vault" */ "../popup/views/settings/index.vue"
  //     )
  // }
  {
    path: "/settings",
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: '',
        name: "settings",
        component: () =>
          import(
            /* webpackChunkName: "vault" */ "../popup/views/settings/index.vue"
          )
      }
    ]
  }
];

const router = new VueRouter({
  mode: 'hash',
  base: '/popup.html',
  routes
})
async function VaultGuard(to, from, next) {
  const store = await storePromise;
  if (store.state.isLoggedIn === true) {
    await store.dispatch("LoadCurrentUser");
    await store.dispatch("LoadCurrentUserPw");
    if (store.state.userPw.is_pwd_manager === false) {
      console.log("Dieu huong set-master-password");
      next({ name: "set-master-password" });
    } else {
      console.log("Dieu huong binh thuong");
      next();
    }
  } else {
    console.log("Dieu huong Login");
    next({ name: "home" });
  }
}
export default router
