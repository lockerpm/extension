import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Layout from '@/popup/components/layout/index.vue'
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
        component: () =>
          import("../popup/views/home/index.vue")
      },
      {
        path: "home/:id",
        name: "home-id",
        component: () =>
          import("../popup/views/home/_id.vue")
      }
    ]
  },
  {
    path: "/login",
    name: "login",
    component: () =>
      import("../popup/views/login.vue")
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () =>
      import("../popup/views/forgot-password.vue")
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
    component: () =>
      import("../popup/views/lock.vue")
  },
  {
    path: "/pwl-unlock",
    name: "pwl-unlock",
    component: () =>
      import("../popup/views/pwl-unlock.vue")
  },
  {
    path: "/vault",
    component: Layout,
    children: [
      {
        path: "",
        name: "vault",
        component: () =>
          import(
            "../popup/views/vault/index.vue"
          )
      },
      {
        path: ":id",
        name: "vault-id",
        component: () =>
          import("../popup/views/vault/_id.vue")
      }
    ]
  },
  {
    path: "/passwords",
    component: Layout,
    children: [
      {
        path: "",
        name: "passwords",
        component: () =>
          import(
            "../popup/views/passwords/index.vue"
          )
      },
      {
        path: ":id",
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
    component: Layout,
    children: [
      {
        path: "",
        name: "notes",
        component: () =>
          import(
            "../popup/views/notes/index.vue"
          )
      },
      {
        path: ":id",
        name: "notes-id",
        component: () =>
          import("../popup/views/notes/_id.vue")
      }
    ]
  },
  {
    path: "/cards",
    component: Layout,
    children: [
      {
        path: "",
        name: "cards",
        component: () =>
          import(
            "../popup/views/cards/index.vue"
          )
      },
      {
        path: ":id",
        name: "cards-id",
        component: () =>
          import("../popup/views/cards/_id.vue")
      }
    ]
  },
  {
    path: "/identities",
    component: Layout,
    children: [
      {
        path: "",
        name: "identities",
        component: () =>
          import(
            "../popup/views/identities/index.vue"
          )
      },
      {
        path: ":id",
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
    component: Layout,
    children: [
      {
        path: "",
        name: "crypto-backups",
        component: () =>
          import(
            "../popup/views/crypto-backups/index.vue"
          )
      },
      {
        path: ":id",
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
    component: Layout,
    children: [
      {
        path: "",
        name: "folders",
        component: () =>
          import(
            "../popup/views/folders/index.vue"
          )
      },
      {
        path: ":folderId",
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
    component: () =>
      import(
        "../popup/views/folders/_folderId/_id.vue"
      )
  },
  {
    path: "/vault/folders/:folderId",
    name: "vault-folders-folderId",
    component: () =>
      import(
        "../popup/views/vault/folders/_folderId/index.vue"
      )
  },
  {
    path: "/vault/folders/:folderId/:id",
    name: "vault-folders-folderId-id",
    component: () =>
      import(
        "../popup/views/vault/folders/_folderId/_id.vue"
      )
  },
  {
    path: "/vault/teams/:teamId?/tfolders/:tfolderId",
    name: "vault-teams-teamId-tfolders-tfolderId",
    component: () =>
      import(
        "../popup/views/vault/teams/_teamId/tfolders/_tfolderId/index.vue"
      )
  },
  {
    path: "/vault/teams/:teamId?/tfolders/:tfolderId/:id",
    name: "vault-teams-teamId-tfolders-tfolderId-id",
    component: () =>
      import(
        "../popup/views/vault/teams/_teamId/tfolders/_tfolderId/_id.vue"
      )
  },
  {
    path: "/add_item",
    component: Layout,
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
    children: [
      {
        path: "",
        name: "otp",
        component: () =>
          import("../popup/views/otp/index.vue")
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
export default router
