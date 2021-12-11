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
        path: "",
        name: "home",
        component: Home
      }
    ]
  },
  {
    path: "/set-master-password",
    name: "set-master-password",
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/set-master-password.vue"
      )
  },
  {
    path: "/lock",
    name: "lock",
    beforeEnter: VaultGuard,
    component: () =>
      import(/* webpackChunkName: "vault" */ "../popup/views/lock.vue")
  },
  {
    path: "/login",
    name: "login",
    // beforeEnter: VaultGuard,
    component: () =>
      import(/* webpackChunkName: "vault" */ "../popup/views/login.vue")
  },
  {
    path: "/vault",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: "",
        name: "vault",
        component: () =>
          import(
            /* webpackChunkName: "vault" */ "../popup/views/vault/index.vue"
          )
      }
    ]
  },
  {
    path: "/vault/:id",
    name: "vault-id",
    beforeEnter: VaultGuard,
    component: () =>
      import(/* webpackChunkName: "vault" */ "../popup/views/passwords/_id.vue")
  },
  {
    path: "/passwords/:id",
    name: "passwords-id",
    beforeEnter: VaultGuard,
    component: () =>
      import(/* webpackChunkName: "vault" */ "../popup/views/passwords/_id.vue")
  },
  {
    path: "/passwords",
    name: "passwords",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/passwords/index.vue"
      )
  },
  {
    path: "/notes",
    name: "notes",
    beforeEnter: VaultGuard,
    component: () =>
      import(/* webpackChunkName: "vault" */ "../popup/views/notes/index.vue")
  },
  {
    path: "/notes/:id",
    name: "notes-id",
    beforeEnter: VaultGuard,
    component: () =>
      import(/* webpackChunkName: "vault" */ "../popup/views/notes/_id.vue")
  },
  {
    path: "/cards",
    name: "cards",
    beforeEnter: VaultGuard,
    component: () =>
      import(/* webpackChunkName: "vault" */ "../popup/views/cards/index.vue")
  },
  {
    path: "/cards/:id",
    name: "cards-id",
    beforeEnter: VaultGuard,
    component: () =>
      import(/* webpackChunkName: "vault" */ "../popup/views/cards/_id.vue")
  },
  {
    path: "/identities",
    name: "identities",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/identities/index.vue"
      )
  },
  {
    path: "/identities/:id",
    name: "identities-id",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/identities/_id.vue"
      )
  },
  {
    path: "/vault/folders/:folderId",
    name: "vault-folders-folderId",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/vault/folders/_folderId/index.vue"
      )
  },
  {
    path: "/vault/folders/:folderId/:id",
    name: "vault-folders-folderId-id",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/vault/folders/_folderId/_id.vue"
      )
  },
  {
    path: "/vault/teams/:teamId?/tfolders/:tfolderId",
    name: "vault-teams-teamId-tfolders-tfolderId",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/vault/teams/_teamId/tfolders/_tfolderId/index.vue"
      )
  },
  {
    path: "/vault/teams/:teamId?/tfolders/:tfolderId/:id",
    name: "vault-teams-teamId-tfolders-tfolderId-id",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        /* webpackChunkName: "vault" */ "../popup/views/vault/teams/_teamId/tfolders/_tfolderId/_id.vue"
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
  {
    path: "/generator",
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        name: "generator",
        path: "",
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
        path: "",
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
    next({ name: "login" });
  }
}
export default router
