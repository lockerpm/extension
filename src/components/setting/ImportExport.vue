<template>
  <div>
    <div class="text-head-5 font-semibold mb-4">
      {{ $t('data.importFile.import') }}
    </div>
    <div class="setting-wrapper">
      <div class="setting-section">
        <div class="setting-section-header">
          <div>
            <div class="setting-title">{{ $t('data.importFile.import_items') }}</div>
            <div class="setting-description">
              {{ $t('data.importFile.import_items_desc') }}
            </div>
          </div>
          <div />
        </div>
        <div class="setting-section-body">
          <div class="form-group">
            <label>{{ $t('data.importFile.select_file') }}</label>
            <el-select
              v-model="format"
              filterable
            >
              <el-option-group
                label="Popular"
              >
                <el-option
                  v-for="item in cystackOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
                <el-option
                  v-for="item in featuredImportOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-option-group>
              <el-option-group
                label="Others"
              >
                <el-option
                  v-for="item in importOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-option-group>
            </el-select>
            <Instructions
              :format="format"
              :title="getFormatInstructionTitle"
              class="mt-5"
            />
          </div>
          <div class="form-group">
            <label>{{ $t('data.importFile.select_format') }}</label>
            <input
              type="file"
              class="form-control-file form-input mb-4"
              name="file"
              @change="handleFile"
            >

            <label>{{ $t('data.importFile.or_copy') }}</label>
            <el-input type="textarea" :rows="5" />
          </div>
          <div class="form-group">
            <button
              class="btn btn-primary"
              :disabled="disabledExport"
              @click="importData"
            >
              {{ $t('data.importFile.import') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="text-head-5 font-semibold mb-4">
      {{ $t('data.exportFile.export') }}
    </div>
    <div class="setting-wrapper">
      <div class="setting-section">
        <div class="setting-section-header">
          <div>
            <div class="setting-title">
              {{ $t('data.exportFile.export') }}
            </div>
            <div class="setting-description">
              {{ $t('data.exportFile.export_items_desc') }}
            </div>
          </div>
          <div />
        </div>
        <div class="setting-section-body">
          <div class="grid md:grid-cols-2 gap-4">
            <div v-for="(item, index) in exportFormats" :key="index">
              <div
                class="rounded bg-black-300 flex items-center px-4 py-1.5 cursor-pointer"
                @click="selectTypeExport(item)"
              >
                <img
                  :size="30"
                  :src="require(`@/assets/images/icons/files/${item}.svg`)"
                  class="w-[40px] h-[40px] mr-3"
                >
                <div class="flex-grow uppercase">{{ item }}</div>
                <i class="fa fa-chevron-right text-black-600" />
              </div>
            </div>
          </div>
        </div>
        <ReConfirmMasterPassword ref="reConfirmMasterPassword" @done="exportData(selectedType)" />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import * as papa from 'papaparse'
import Instructions from '@/components/import/Instructions'
import ReConfirmMasterPassword from '@/components/password/ReConfirmMasterPassword'
import {CipherType} from "jslib-common/enums/cipherType";
import {Utils} from "jslib-common/misc/utils"
import {ErrorResponse} from "jslib-common/models/response/errorResponse";
import {CipherRequest} from "jslib-common/models/request/cipherRequest";
import {FolderRequest} from "jslib-common/models/request/folderRequest";
import {ImportCiphersRequest} from "jslib-common/models/request/importCiphersRequest";
import {KvpRequest} from "jslib-common/models/request/kvpRequest";
import {CollectionWithId as CollectionExport} from "jslib-common/models/export/collectionWithId";
import {CipherWithIds as CipherExport} from "jslib-common/models/export/cipherWithIds";

import cystackPlatformAPI from '@/api/cystack_platform'

export default Vue.extend({
  components: {
    Instructions,
    ReConfirmMasterPassword
  },
  data () {
    return {
      selectedType: 'csv',
      exportFormats: ['csv', 'json', 'encrypted_json'],
      format: 'cystackjson',
      file: null,
      fileContents: ''
    }
  },
  computed: {
    cystackOptions () {
      return [
        { name: 'CyStack (json)', id: 'cystackjson' },
        { name: 'CyStack (csv)', id: 'cystackcsv' }
      ]
    },
    featuredImportOptions () {
      return this.$importService.featuredImportOptions
    },
    importOptions () {
      const data = this.$importService.regularImportOptions || []
      return data.sort((a, b) => {
        if (a.name == null && b.name != null) {
          return -1
        }
        if (a.name != null && b.name == null) {
          return 1
        }
        if (a.name == null && b.name == null) {
          return 0
        }

        return a.name.localeCompare(b.name)
      })
    },
    getFormatInstructionTitle () {
      if (this.format == null) {
        return null
      }

      const results = this.featuredImportOptions
        .concat(this.importOptions)
        .concat(this.cystackOptions)
        .filter(o => o.id === this.format)
      if (results.length > 0) {
        return this.$t('data.importFile.instructions', { name: results[0].name })
      }
      return null
    },
    disabledExport () {
      return (!this.file && !this.fileContents) || this.loading
    },
    teamId () {
      return this.$route.params.teamId
    }
  },
  methods: {
    selectTypeExport (type) {
      this.selectedType = type
      this.$refs.reConfirmMasterPassword.openDialog()
    },
    async exportData (type) {
      const data = this.teamId ? await this.getOrganizationExport(this.teamId, type) : await this.$exportService.getExport(type)
      this.downloadFile(data)
    },
    getOrganizationExport (organizationId, format) {
      if (format === 'encrypted_json') {
        return this.getOrganizationEncryptedExport(organizationId)
      } else {
        return this.getOrganizationDecryptedExport(organizationId, format)
      }
    },
    async getOrganizationEncryptedExport (organizationId) {
      let collections = []
      let ciphers = []

      collections = await this.$collectionService.getAll()
      collections = collections.filter(c => c.organizationId === organizationId)

      ciphers = await this.$cipherService.getAll()
      ciphers = ciphers.filter(c => c.organizationId === organizationId)

      const jsonDoc = {
        encrypted: true,
        collections: [],
        items: []
      }

      collections.forEach(c => {
        const collection = new CollectionExport()
        collection.build(c)
        jsonDoc.collections.push(collection)
      })

      ciphers.forEach(c => {
        const cipher = new CipherExport()
        cipher.build(c)
        jsonDoc.items.push(cipher)
      })

      return JSON.stringify(jsonDoc, null, '  ')
    },
    async getOrganizationDecryptedExport (organizationId, format) {
      let collections = []
      let ciphers = []

      collections = await this.$collectionService.getAllDecrypted()
      collections = collections.filter(c => c.organizationId === organizationId)
      ciphers = await this.$cipherService.getAllDecrypted()
      ciphers = ciphers.filter(c => c.organizationId === organizationId)

      if (format === 'csv') {
        const collectionsMap = new Map()
        collections.forEach(c => {
          collectionsMap.set(c.id, c)
        })

        const exportCiphers = []
        ciphers.forEach(c => {
          // only export logins and secure notes
          if (c.type !== CipherType.Login && c.type !== CipherType.SecureNote) {
            return
          }

          const cipher = {}
          cipher.collections = []
          if (c.collectionIds != null) {
            cipher.collections = c.collectionIds.filter(id => collectionsMap.has(id))
              .map(id => collectionsMap.get(id).name)
          }
          this.buildCommonCipher(cipher, c)
          exportCiphers.push(cipher)
        })

        return papa.unparse(exportCiphers)
      } else {
        const jsonDoc = {
          encrypted: false,
          collections: [],
          items: []
        }

        collections.forEach(c => {
          const collection = new CollectionExport()
          collection.build(c)
          jsonDoc.collections.push(collection)
        })

        ciphers.forEach(c => {
          const cipher = new CipherExport()
          cipher.build(c)
          jsonDoc.items.push(cipher)
        })
        return JSON.stringify(jsonDoc, null, '  ')
      }
    },
    padNumber (num, width, padCharacter = '0') {
      const numString = num.toString()
      return numString.length >= width
        ? numString
        : new Array(width - numString.length + 1).join(padCharacter) + numString
    },
    buildCommonCipher (cipher, c) {
      cipher.type = null
      cipher.name = c.name
      cipher.notes = c.notes
      cipher.fields = null
      cipher.reprompt = c.reprompt
      // Login props
      cipher.login_uri = null
      cipher.login_username = null
      cipher.login_password = null
      cipher.login_totp = null

      if (c.fields) {
        c.fields.forEach(f => {
          if (!cipher.fields) {
            cipher.fields = ''
          } else {
            cipher.fields += '\n'
          }

          cipher.fields += ((f.name || '') + ': ' + f.value)
        })
      }

      switch (c.type) {
      case CipherType.Login:
        cipher.type = 'login'
        cipher.login_username = c.login.username
        cipher.login_password = c.login.password
        cipher.login_totp = c.login.totp

        if (c.login.uris) {
          cipher.login_uri = []
          c.login.uris.forEach(u => {
            cipher.login_uri.push(u.uri)
          })
        }
        break
      case CipherType.SecureNote:
        cipher.type = 'note'
        break
      default:
        return
      }

      return cipher
    },
    getFileName (prefix = null, extension = 'csv') {
      const now = new Date()
      const dateString =
        now.getFullYear() + '' + this.padNumber(now.getMonth() + 1, 2) + '' + this.padNumber(now.getDate(), 2) +
        this.padNumber(now.getHours(), 2) + '' + this.padNumber(now.getMinutes(), 2) +
        this.padNumber(now.getSeconds(), 2)

      return 'cystack' + (prefix ? ('_' + prefix) : '') + '_export_' + dateString + '.' + extension
    },
    createFileName (prefix) {
      let extension = this.selectedType
      if (this.selectedType === 'encrypted_json') {
        if (prefix == null) {
          prefix = 'encrypted'
        } else {
          prefix = 'encrypted_' + prefix
        }
        extension = 'json'
      }
      return this.getFileName(prefix, extension)
    },
    downloadFile (csv) {
      const fileName = this.createFileName(this.teamId ? 'team' : null)
      this.$platformUtilsService.saveFile(window, csv, { type: 'text/plain' }, fileName)
    },
    handleFile (e) {
      if (e.target && e.target.files && e.target.files.length) {
        this.file = e.target.files[0]
      }
    },
    async importData () {
      this.loading = true
      const format = this.cystackOptions.map(e => e.id).includes(this.format) ? this.format.replace('cystack', 'bitwarden') : this.format
      const importer = this.$importService.getImporter(format, this.teamId)
      let fileContents = this.fileContents
      if (this.file) {
        try {
          const content = await this.getFileContents(this.file)
          if (content != null) {
            fileContents = content
          }
        // eslint-disable-next-line no-empty
        } catch (e) {}
      }
      if (!fileContents) {
        this.notify('Vui lòng chọn File phù hợp', 'warning')
        this.loading = false
        return
      }

      try {
        const importResult = await importer.parse(fileContents)
        if (importResult.success) {
          if (importResult.folders.length === 0 && importResult.ciphers.length === 0) {
            this.notify('Không có dữ liệu', 'warning')
            this.loading = false
            return
          } else if (importResult.ciphers.length > 0) {
            const halfway = Math.floor(importResult.ciphers.length / 2)
            const last = importResult.ciphers.length - 1

            if (this.badData(importResult.ciphers[0]) &&
              this.badData(importResult.ciphers[halfway]) &&
              this.badData(importResult.ciphers[last])) {
              this.notify('Dữ liệu không đúng định dạng', 'warning')
              this.loading = false
              return
            }
          }
          try {
            await this.postImport(importResult)
          } catch (error) {
            if (error.response && error.response.data) {
              const errorResponse = new ErrorResponse(error.response.data, 400)
              this.notify(this.handleServerError(errorResponse, importResult), 'warning')
              this.loading=false
              return
            }
            this.notify('Dữ liệu không đúng định dạng', 'warning')
          }
        } else {
          this.notify('Dữ liệu không đúng định dạng', 'warning')
        }
      } catch {
        this.notify('Nhập dữ liệu thất bại', 'warning')
      }
      this.loading = false
    },
    getFileContents (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsText(file, 'utf-8')
        reader.onload = evt => {
          if (this.format === 'lastpasscsv' && file.type === 'text/html') {
            const parser = new DOMParser()
            const doc = parser.parseFromString(evt.target.result, 'text/html')
            const pre = doc.querySelector('pre')
            if (pre != null) {
              resolve(pre.textContent)
              return
            }
            reject('Error')
            return
          }

          resolve(evt.target.result)
        }
        reader.onerror = () => {
          reject('Error')
        }
      })
    },
    badData (c) {
      return (c.name == null || c.name === '--') &&
        (c.type === CipherType.Login && c.login != null && Utils.isNullOrWhitespace(c.login.password))
    },
    async postImport (importResult) {
      const request = new ImportCiphersRequest()
      for (let i = 0; i < importResult.ciphers.length; i++) {
        const c = await this.$cipherService.encrypt(importResult.ciphers[i])
        request.ciphers.push(new CipherRequest(c))
      }
      if (importResult.folders != null) {
        for (let i = 0; i < importResult.folders.length; i++) {
          const f = await this.$folderService.encrypt(importResult.folders[i])
          request.folders.push(new FolderRequest(f))
        }
      }
      if (importResult.folderRelationships != null) {
        importResult.folderRelationships.forEach(r =>
          request.folderRelationships.push(new KvpRequest(r[0], r[1])))
      }
      await this.teamId ? cystackPlatformAPI.team_import(this.teamId, request) : cystackPlatformAPI.ciphers_import(request)
      this.notify('Nhập dữ liệu thành công', 'success')
      this.$router.push({name: 'vault' })
    },
    handleServerError (errorResponse, importResult) {
      if (errorResponse.validationErrors == null) {
        return new Error(errorResponse.message)
      }

      let errorMessage = ''

      Object.entries(errorResponse.validationErrors).forEach(([key, value], index) => {
        let item
        let itemType
        const i = Number(key.match(/[0-9]+/)[0])

        switch (key.match(/^\w+/)[0]) {
        case 'Ciphers':
          item = importResult.ciphers[i]
          itemType = CipherType[item.type]
          break
        case 'Folders':
          item = importResult.folders[i]
          itemType = 'Folder'
          break
        case 'Collections':
          item = importResult.collections[i]
          itemType = 'Collection'
          break
        default:
          return
        }

        if (index > 0) {
          errorMessage += '\n\n'
        }

        if (itemType !== 'Folder' && itemType !== 'Collection') {
          errorMessage += '[' + (i + 1) + '] '
        }

        errorMessage += '[' + itemType + '] "' + item.name + '": ' + value
      })

      return errorMessage
    }
  }
})
</script>
