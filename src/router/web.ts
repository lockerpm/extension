import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import HomeWeb from '../views/homeWeb.vue'
import storePromise from "../store/web";
import Layout from '@/components/layout/default.vue'
import AdminLayout from '@/components/layout/admin.vue'
Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: HomeWeb
  },
  {
    path: '/authenticate',
    name: 'authenticate',
    component: () => import(/* webpackChunkName: "authenticate" */ '../views/authenticate.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '../views/login.vue')
  },
  {
    path: '/set-master-password',
    name: 'set-master-password',
    component: () => import(/* webpackChunkName: "set-master-password" */ '../views/set-master-password.vue')
  },
  {
    path: '/lock',
    name: 'lock',
    beforeEnter: VaultGuard,
    component: () => import(/* webpackChunkName: "lock" */ '../views/lock.vue')
  },
  {
    path: '/passwords',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'passwords',
        component: () => import(/* webpackChunkName: "passwords" */ '../views/passwords/index.vue')
      },
      {
        path: "passwords/:id",
        name: 'passwords-id',
        component: () => import(/* webpackChunkName: "passwords" */ '../views/passwords/_id.vue')
      }
    ]
  },
  {
    path: '/notes',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'notes',
        component: () => import(/* webpackChunkName: "notes" */ '../views/notes/index.vue')
      },
      {
        path: "notes/:id",
        name: 'notes-id',
        component: () => import(/* webpackChunkName: "notes" */ '../views/notes/_id.vue')
      }
    ]
  },
  {
    path: '/cards',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'cards',
        component: () => import(/* webpackChunkName: "cards" */ '../views/cards/index.vue')
      },
      {
        path: "cards/:id",
        name: 'cards-id',
        component: () => import(/* webpackChunkName: "cards" */ '../views/cards/_id.vue')
      }
    ]
  },
  {
    path: '/identities',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'identities',
        component: () => import(/* webpackChunkName: "identities" */ '../views/identities/index.vue')
      },
      {
        path: "identities/:id",
        name: 'identities-id',
        component: () => import(/* webpackChunkName: "identities" */ '../views/identities/_id.vue')
      }
    ]
  },
  {
    path: '/shares',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'shares',
        component: () => import(/* webpackChunkName: "shares" */ '../views/shares/index.vue')
      }
    ]
  },
  {
    path: '/trash',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'trash',
        component: () => import(/* webpackChunkName: "trash" */ '../views/trash/index.vue')
      }
    ]
  },
  {
    path: '/settings',
    component: () => import(/* webpackChunkName: "settings" */ '../views/settings.vue'),
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'settings',
        component: () => import(/* webpackChunkName: "settings" */ '../views/settings/index.vue')
      },
      {
        path: "download",
        name: 'settings-download',
        component: () => import(/* webpackChunkName: "settings" */ '../views/settings/download.vue')
      },
      {
        path: "excluded-domains",
        name: 'settings-excluded-domains',
        component: () => import(/* webpackChunkName: "settings" */ '../views/settings/excluded-domains.vue')
      },
      {
        path: "family-members",
        name: 'settings-family-members',
        component: () => import(/* webpackChunkName: "settings" */ '../views/settings/family-members.vue')
      },
      {
        path: "import-export",
        name: 'settings-import-export',
        component: () => import(/* webpackChunkName: "settings" */ '../views/settings/import-export.vue')
      }
    ]
  },
  {
    path: '/vault',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'vault',
        component: () => import(/* webpackChunkName: "vault" */ '../views/vault/index.vue')
      },
      {
        path: ":id",
        name: 'vault-id',
        component: () => import(/* webpackChunkName: "vault" */ '../views/vault/_id.vue')
      },
      {
        path: "folders/:folderId",
        name: 'vault-folders-folderId',
        component: () => import(/* webpackChunkName: "vault" */ '../views/vault/folders/_folderId/index.vue')
      },
      {
        path: "folders/:folderId?/:id",
        name: 'vault-folders-folderId-id',
        component: () => import(/* webpackChunkName: "vault" */ '../views/vault/folders/_folderId/_id.vue')
      },
      {
        path: "folders/:folderId",
        name: 'vault-folders-folderId',
        component: () => import(/* webpackChunkName: "vault" */ '../views/vault/folders/_folderId/index.vue')
      },
      {
        path: "teams/:teamId?/tfolders/:tfolderId",
        name: 'vault-teams-teamId-tfolders-tfolderId',
        component: () => import(/* webpackChunkName: "vault" */ '../views/vault/teams/_teamId/tfolders/_tfolderId/index.vue')
      },
      {
        path: "teams/:teamId?/tfolders/:tfolderId?/:id",
        name: 'vault-teams-teamId-tfolders-tfolderId-id',
        component: () => import(/* webpackChunkName: "vault" */ '../views/vault/teams/_teamId/tfolders/_tfolderId/_id.vue')
      }
    ]
  },
  {
    path: '/tools',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'tools',
        component: () => import(/* webpackChunkName: "tools" */ '../views/tools/index.vue')
      },
      {
        path: "breach",
        name: 'tools-breach',
        component: () => import(/* webpackChunkName: "tools" */ '../views/tools/breach.vue')
      },
      {
        path: "password-health",
        name: 'tools-password-health',
        component: () => import(/* webpackChunkName: "tools" */ '../views/tools/password-health.vue'),
        children: [
          {
            path: "exposed",
            name: 'tools-password-health-exposed',
            component: () => import(/* webpackChunkName: "tools" */ '../views/tools/password-health/exposed.vue')
          },
          {
            path: "reused",
            name: 'tools-password-health-reused',
            component: () => import(/* webpackChunkName: "tools" */ '../views/tools/password-health/reused.vue')
          },
          {
            path: "weak",
            name: 'tools-password-health-weak',
            component: () => import(/* webpackChunkName: "tools" */ '../views/tools/password-health/weak.vue')
          },
        ]
      }
    ]
  },
  {
    path: '/upgrade',
    component: () => import(/* webpackChunkName: "upgrade" */ '../views/upgrade.vue'),
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'upgrade',
        component: () => import(/* webpackChunkName: "upgrade" */ '../views/upgrade/index.vue')
      },
      {
        path: "billing",
        name: 'upgrade-billing',
        component: () => import(/* webpackChunkName: "upgrade" */ '../views/upgrade/billing.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: ":teamId",
        name: 'admin-teamId',
        component: () => import(/* webpackChunkName: "vault" */ '../views/admin/_teamId/index.vue')
      },
      {
        path: ":teamId/activity-logs",
        name: 'admin-teamId-activity-logs',
        component: () => import(/* webpackChunkName: "vault" */ '../views/admin/_teamId/activity-logs.vue')
      },
      {
        path: ":teamId/groups",
        name: 'admin-teamId-groups',
        component: () => import(/* webpackChunkName: "vault" */ '../views/admin/_teamId/groups.vue')
      },
      {
        path: ":teamId/settings",
        name: 'admin-teamId-settings',
        component: () => import(/* webpackChunkName: "vault" */ '../views/admin/_teamId/settings.vue'),
        children: [
          {
            path: "",
            name: 'admin-teamId-settings',
            component: () => import(/* webpackChunkName: "vault" */ '../views/admin/_teamId/settings/index.vue')
          },
          {
            path: "import-export",
            name: 'admin-teamId-settings-import-export',
            component: () => import(/* webpackChunkName: "vault" */ '../views/admin/_teamId/settings/import-export.vue')
          },
        ]
      },
      {
        path: ":teamId/shared-folders",
        name: 'admin-teamId-shared-folders',
        component: () => import(/* webpackChunkName: "vault" */ '../views/admin/_teamId/shared-folders.vue')
      },
      {
        path: ":teamId/users",
        name: 'admin-teamId-users',
        component: () => import(/* webpackChunkName: "vault" */ '../views/admin/_teamId/users.vue')
      }
    ]
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: '/popup.html',
  routes
})

async function VaultGuard (to, from, next) {
  const store = await storePromise
  if (store.state.isLoggedIn === true) {
    await store.dispatch('LoadCurrentUser')
    await store.dispatch('LoadCurrentUserPw')
    if (store.state.userPw.is_pwd_manager === false) {
      console.log('Dieu huong set-master-password')
      next({name: 'set-master-password'});
    } else {
      console.log('Dieu huong binh thuong')
      next();
    }
  } else {
    console.log('Dieu huong Login')
    next({name: 'home'});
  }
}

export default router
