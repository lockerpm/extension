<template>
  <el-drawer
    ref="cardDrawer"
    :visible.sync="visible"
    direction="rtl"
    :destroy-on-close="true"
    :wrapper-closable="false"
    :close-on-press-escape="false"
    custom-class="credit-drawer"
    :size="'30%'"
    @close="handleClose"
    @open="beforeOpen"
    @opened="handleOpen"
  >
    <div slot="title" class="" style="overflow: hidden">
      <h4>{{ $t('data.billing.card_title') }}</h4>
    </div>
    <ValidationObserver ref="observer" tag="div" class="p-4 credit-drawer-body">
      <div class="form-group">
        <!--          <h5> {{ $t('data.billing.payment_method') }} </h5>-->
        <div v-html="$t('data.billing.intro')" />
      </div>
      <div class="grid grid-cols-2 cloud-card gap-x-4">
        <div class="form-group col-span-2">
          <ValidationProvider v-slot="{ errors }" rules="required|alpha_spaces|max:100" :name="$t('common.cardholder')">
            <label class="">* {{ $t('common.cardholder') }}</label>
            <input
              v-model="user.name"
              type="text"
              :class="errors.length?'is-invalid':''"
              class="form-control form-control-sm "
              :placeholder="$t('common.cardholder_placeholder')"
              name="cardholder"
            >
            <span class="invalid-feedback">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <div class="form-group col-span-2" :class="eventChangeNumber.error ? 'has-danger':''">
          <label class="">* {{ $t('data.billing.card_number') }}</label>
          <div class="input-group input-group-sm bg-white">
            <div class="input-group-prepend bg-black-200  !rounded-r-none">
              <span class="input-group-text">
                <i v-if="eventChangeNumber.brand === 'visa'" class="fab fa-cc-visa" style="font-size:1.5em" />
                <i v-else-if="eventChangeNumber.brand === 'amex'" class="fab fa-cc-amex" style="font-size:1.5em" />
                <i v-else-if="eventChangeNumber.brand === 'jcb'" class="fab fa-cc-jcb" style="font-size:1.5em" />
                <i v-else-if="eventChangeNumber.brand === 'mastercard'" class="fab fa-cc-mastercard" style="font-size:1.5em" />
                <i v-else-if="eventChangeNumber.brand === 'diners'" class="fab fa-cc-diners-club" style="font-size:1.5em" />
                <i v-else-if="eventChangeNumber.brand === 'discover'" class="fab fa-cc-discover" style="font-size:1.5em" />
                <i v-else class="far fa-credit-card" :class="eventChangeNumber.brand? 'm--font-danger':''" style="font-size:1.5em" />
              </span>
            </div>
            <div id="card-number" ref="cardNumber" />
          </div>
          <div v-if="eventChangeNumber.error" class="invalid-feedback">
            {{ $t(`data.error_code.${eventChangeNumber.error.code}`) }}
          </div>
        </div>
        <div class="form-group" :class="eventChangeExpiry.error ? 'has-danger':''">
          <label class="">* {{ $t('data.billing.expiration') }}</label>
          <div id="card-expiry" ref="cardExpiry" />
          <div v-if="eventChangeExpiry.error" class="invalid-feedback">
            {{ $t(`data.error_code.${eventChangeExpiry.error.code}`) }}
          </div>
        </div>
        <div class="form-group" :class="eventChangeCvc.error ? 'has-danger':''">
          <label class="">* {{ $t('data.billing.cvc') }}</label>
          <div id="card-cvc" ref="cardCvc" />
          <div v-if="eventChangeCvc.error" class="invalid-feedback">
            {{ $t(`data.error_code.${eventChangeCvc.error.code}`) }}
          </div>
        </div>
        <div class="form-group col-span-2 text-right">
          <img src="~@/assets/images/logo/stripe.svg" alt="" style="height: 30px">
        </div>
      </div>
      <el-divider />
      <div class="row">
        <div class="form-group col-12">
          <div class="text-lg font-semibold">{{ $t('data.billing.billing_contact') }}</div>
        </div>
        <div class="form-group col-12">
          <ValidationProvider v-slot="{ errors }" rules="required|alpha_spaces|max:100" :name="$t('common.name')">
            <label>* {{ $t('common.name') }}</label>
            <input
              v-model="user.metadata.contact_name"
              name="name"
              :class="errors.length?'is-invalid':''"
              type="text"
              class="form-control form-control-sm"
            >
            <span class="invalid-feedback">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <div class="form-group col-12">
          <ValidationProvider v-slot="{ errors }" rules="email|required|max:100" :name="$t('common.email')">
            <label>* {{ $t('common.email') }}</label>
            <input
              v-model="user.metadata.email"
              :class="errors.length?'is-invalid':''"
              name="email"
              type="text"
              class="form-control form-control-sm"
            >
            <span class="invalid-feedback">{{ errors[0] }}</span>
            <span class="form-text text-muted">{{ $t('data.billing.email_hint') }}</span>
          </ValidationProvider>
        </div>
        <div class="form-group col-12">
          <ValidationProvider v-slot="{ errors }" rules="max:100" :name="$t('common.company')">
            <label>{{ $t('common.company') }}</label>
            <input
              v-model="user.metadata.company"
              name="company"
              :class="errors.length?'is-invalid':''"
              type="text"
              class="form-control form-control-sm"
            >
            <span class="invalid-feedback">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
      </div>
      <el-divider />
      <div class="grid grid-cols-2 gap-x-4">
        <div class="form-group col-span-2">
          <div class="text-lg font-semibold">
            {{ $t('data.billing.billing_address') }}
          </div>
        </div>
        <div class="form-group col-span-2">
          <ValidationProvider v-slot="{ errors }" rules="required|max:250" :name="$t('common.address')">
            <label>* {{ $t('common.address') }}</label>
            <input
              v-model="user.address"
              name="address"
              :class="errors.length?'is-invalid':''"
              type="text"
              class="form-control form-control-sm"
              :placeholder="$t('common.address_placeholder')"
            >
            <span class="invalid-feedback">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <div class="form-group">
          <ValidationProvider v-slot="{ errors }" rules="required|max:100" :name="$t('common.city')">
            <label>* {{ $t('common.city') }}</label>
            <input
              v-model="user.address_city"
              name="city"
              :class="errors.length?'is-invalid':''"
              type="text"
              class="form-control form-control-sm"
            >
            <span class="invalid-feedback">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <div class="form-group">
          <ValidationProvider v-slot="{ errors }" rules="max:100" :name="$t('common.state')">
            <label>{{ $t('common.state') }}</label>
            <input
              v-model="user.address_state"
              type="text"
              :class="errors.length?'is-invalid':''"
              class="form-control form-control-sm"
              name="state"
            >
            <span class="invalid-feedback">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <div class="form-group">
          <ValidationProvider
            v-slot="{ errors }"
            rules="required"
            :name="$t('common.country')"
          >
            <label>* {{ $t('common.country') }}</label>
            <el-select
              v-model="user.address_country"
              placeholder=""
              filterable
              class="w-full"
              size="small"
              :class="errors.length?'is-invalid':''"
              auto-complete="off"
            >
              <el-option
                v-for="country in countries"
                :key="country.country_code"
                :value="country.country_code"
                :label="country.country_name"
              >
                <span>
                  <span :class="`flag flag-${country.country_code.toLowerCase()}`" class="" />
                  {{ country.country_name }}
                </span>
              </el-option>
            </el-select>
            <span class="invalid-feedback">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <div class="form-group">
          <ValidationProvider v-slot="{ errors }" rules="numeric|max:10" :name="$t('common.state')">
            <label>{{ $t('common.zip') }}</label>
            <input
              v-model="user.address_zip"
              type="text"
              :class="errors.length?'is-invalid':''"
              class="form-control form-control-sm "
              name="zip"
            >
            <span class="invalid-feedback">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
      </div>
    </ValidationObserver>
    <div class="credit-drawer-footer">
      <div class="grid grid-cols-2 gap-x-4">
        <button
          class="btn btn-default btn-block w-full"
          :disabled="loading"
          @click="cancel"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          class="btn btn-primary btn-block w-full"
          :disabled="loading"
          @click="save"
        >
          {{ $t('common.save') }}
        </button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import Vue from 'vue'
import { ValidationProvider, ValidationObserver } from 'vee-validate'

import cystackPlatformAPI from '@/api/cystack_platform'
import resourceAPI from '@/api/resource'

export default Vue.extend({
  components: {
    ValidationProvider, ValidationObserver
  },
  props: {
    userInfo: {
      type: Object,
      default () {
        return {
          country: 'VN',
          metadata: {}
        }
      }
    }
  },
  data () {
    return {
      visible: false,
      eventChangeNumber: {},
      eventChangeExpiry: {},
      eventChangeCvc: {},
      stripe: null,
      elements: null,
      cardNumber: null,
      cardExpiry: null,
      cardCvc: null,
      card: {
      },
      countries: [],
      loading: false,
      user: {
        country: 'VN',
        metadata: {}
      }
    }
  },
  created () {
    this.getCountries()
  },
  methods: {
    openDrawer (user) {
      this.visible = true
      this.user = { ...user }
    },
    beforeOpen () {
      // eslint-disable-next-line no-undef
      this.stripe = Stripe(process.env.stripeKey)
      this.elements = this.stripe.elements({})
    },
    handleOpen () {
      this.$nextTick(() => {
        this.cardNumber = this.elements.create('cardNumber', { classes: { base: 'form-control form-control-sm !py-[10px]' } })
        this.cardNumber.mount(this.$refs.cardNumber)
        this.cardExpiry = this.elements.create('cardExpiry', { classes: { base: 'form-control form-control-sm bg-white !py-[10px]' } })
        this.cardExpiry.mount(this.$refs.cardExpiry)
        this.cardCvc = this.elements.create('cardCvc', { classes: { base: 'form-control form-control-sm bg-white !py-[10px]' } })
        this.cardCvc.mount(this.$refs.cardCvc)
        this.cardNumber.on('change', event => {
          this.eventChangeNumber = event
        })
        this.cardExpiry.on('change', event => {
          this.eventChangeExpiry = event
        })
        this.cardCvc.on('change', event => {
          this.eventChangeCvc = event
        })
      })
    },
    handleClose () {
      this.cardNumber.destroy()
      this.cardExpiry.destroy()
      this.cardCvc.destroy()
      this.eventChangeNumber = {}
      this.eventChangeExpiry = {}
      this.eventChangeCvc = {}
    },
    cancel () {
      this.$emit('handle-cancel')
      this.$refs.cardDrawer.closeDrawer()
    },
    async save () {
      const isValid = await this.$refs.observer.validate()
      if (isValid) {
        this.loading = true
        const tokenData = {
          name: this.user.name,
          address_line1: this.user.address,
          address_country: this.user.address_country,
          address_line2: this.user.address_country,
          address_city: this.user.address_city,
          address_state: this.user.address_state || '',
          address_zip: this.user.address_zip || '',
          metadata: {
            email: this.user.metadata.email,
            contact_name: this.user.metadata.contact_name,
            company: this.user.metadata.company
          }
        }
        this.stripe.createToken(this.cardNumber, tokenData).then(result => {
          if (result.token) {
            cystackPlatformAPI.create_payments_card({
              token_card: result.token.id,
              metadata: {
                email: this.user.metadata.email,
                contact_name: this.user.metadata.contact_name,
                company: this.user.metadata.company
              }
            }).then(res => {
              this.notify(this.$t('data.billing.add_card_success'), 'success')
              this.$emit('handle-done', res)
              this.$refs.cardDrawer.closeDrawer()
            })
              .catch(() => {
                this.notify(this.$t('data.billing.card_decline.generic_decline'), 'warning')
              })
              .then(() => {
                this.loading = false
              })
          } else {
            this.loading = false
          }
        })
      }
    },
    async getCountries () {
      const res = await resourceAPI.countries()
      this.countries = res
    }
  }
})
</script>

<style>

</style>
