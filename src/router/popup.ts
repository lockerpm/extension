import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import storePromise from "../store/index";
import Home from '../popup/views/home/index.vue'
import Layout from '@/popup/components/layout/default.vue'
import i18n from '@/locales/i18n';
import sentryConfig from './index'

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
    path: "/home/:id",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: "",
        name: "home-id",
        component: () =>
          import("../popup/views/home/_id.vue")
      }
    ]
  },
  {
    path: "/set-master-password",
    name: "set-master-password",
    component: () =>
      import(
        "../popup/views/set-master-password.vue"
      )
  },
  {
    path: "/lock",
    name: "lock",
    beforeEnter: VaultGuard,
    component: () =>
      import("../popup/views/lock.vue")
  },
  {
    path: "/login",
    name: "login",
    component: () =>
      import("../popup/views/login.vue")
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
            "../popup/views/vault/index.vue"
          )
      }
    ]
  },
  {
    path: "/vault/:id",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: "",
        name: "vault-id",
        component: () =>
          import("../popup/views/vault/_id.vue")
      }
    ]
  },
  {
    path: "/passwords",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: "",
        name: "passwords",
        component: () =>
          import(
            "../popup/views/passwords/index.vue"
          )
      }
    ]
  },
  {
    path: "/passwords/:id",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: "",
        name: "passwords-id",
        component: () =>
          import(
            "../popup/views/passwords/_id.vue"
          )
      }
    ]
  },
  {
    path: "/notes",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: "",
        name: "notes",
        component: () =>
          import(
            "../popup/views/notes/index.vue"
          )
      }
    ]
  },
  {
    path: "/notes/:id",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: "",
        name: "notes-id",
        component: () =>
          import("../popup/views/notes/_id.vue")
      }
    ]
  },
  {
    path: "/cards",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: "",
        name: "cards",
        component: () =>
          import(
            "../popup/views/cards/index.vue"
          )
      }
    ]
  },
  {
    path: "/cards/:id",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: "",
        name: "cards-id",
        component: () =>
          import("../popup/views/cards/_id.vue")
      }
    ]
  },
  {
    path: "/identities",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: "",
        name: "identities",
        component: () =>
          import(
            "../popup/views/identities/index.vue"
          )
      }
    ]
  },
  {
    path: "/identities/:id",
    component: Layout,
    children: [
      {
        path: "",
        name: "identities-id",
        component: () =>
          import(
            "../popup/views/identities/_id.vue"
          )
      }
    ]
  },
  {
    path: "/crypto-backups",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: "",
        name: "crypto-backups",
        component: () =>
          import(
            "../popup/views/crypto-backups/index.vue"
          )
      }
    ]
  },
  {
    path: "/crypto-backups/:id",
    component: Layout,
    children: [
      {
        path: "",
        name: "crypto-backups-id",
        component: () =>
          import(
            "../popup/views/crypto-backups/_id.vue"
          )
      }
    ]
  },
  {
    path: "/folders",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: "",
        name: "folders",
        component: () =>
          import(
            "../popup/views/folders/index.vue"
          )
      }
    ]
  },
  {
    path: "/folders/:folderId",
    beforeEnter: VaultGuard,
    component: Layout,
    children: [
      {
        path: "",
        name: "folders-folderId",
        component: () =>
          import(
            "../popup/views/folders/_folderId/index.vue"
          )
      }
    ]
  },
  {
    path: "/folders/:folderId/:id",
    name: "folders-folderId-id",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        "../popup/views/folders/_folderId/_id.vue"
      )
  },
  {
    path: "/vault/folders/:folderId",
    name: "vault-folders-folderId",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        "../popup/views/vault/folders/_folderId/index.vue"
      )
  },
  {
    path: "/vault/folders/:folderId/:id",
    name: "vault-folders-folderId-id",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        "../popup/views/vault/folders/_folderId/_id.vue"
      )
  },
  {
    path: "/vault/teams/:teamId?/tfolders/:tfolderId",
    name: "vault-teams-teamId-tfolders-tfolderId",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        "../popup/views/vault/teams/_teamId/tfolders/_tfolderId/index.vue"
      )
  },
  {
    path: "/vault/teams/:teamId?/tfolders/:tfolderId/:id",
    name: "vault-teams-teamId-tfolders-tfolderId-id",
    beforeEnter: VaultGuard,
    component: () =>
      import(
        "../popup/views/vault/teams/_teamId/tfolders/_tfolderId/_id.vue"
      )
  },
  {
    path: "/add_item",
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: "add_item",
        component: () =>
          import(
            "../popup/views/add_item/index.vue"
          )
      },
      {
        path: "create",
        name: "add-item-create",
        component: () =>
          import(
            "../popup/views/add_item/create.vue"
          )
      }
    ]
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
          import("../popup/views/generator.vue")
      }
    ]
  },
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
            "../popup/views/settings/index.vue"
          )
      },
      {
        path: "excluded-domains",
        name: "settings-excluded-domains",
        component: () =>
          import(
            "../popup/views/settings/excluded-domains.vue"
          )
      },
      {
        path: "vault-timeout",
        name: "settings-vault-timeout",
        component: () =>
          import(
            "../popup/views/settings/vault-timeout.vue"
          )
      },
      {
        path: "info",
        name: "settings-info",
        component: () =>
          import(
            "../popup/views/settings/info.vue"
          )
      }
    ]
  },
  {
    path: "/otp",
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: "otp",
        component: () =>
          import("../popup/views/otp.vue")
      }
    ]
  },
];

const router = new VueRouter({
  mode: 'hash',
  base: '/popup.html',
  routes
})

sentryConfig(router);

async function VaultGuard(to, from, next) {
  console.log(to.path, from.path)
  const store = await storePromise;
  if (store.state.isLoggedIn === true) {
    const res = await store.dispatch("LoadCurrentUser");
    i18n.locale = res.language
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
