<template>
  <div class="mt-10">
    <template v-if="step===1">
      <div v-if="currentPlan.alias === 'pm_free'" class="border border-black-200 rounded p-5 md:px-5 md:py-7 relative bg-gradient-to-r from-[#05A49F] to-[#1AB0AC] mb-6">
        <div class="flex items-center justify-between text-white">
          <div class="">
            <div class="text-lg font-semibold mb-2">
              Upgrade to Premium to unlock more features
            </div>
            <div class="flex items-center">
              <Check />
              <div class="ml-2">Check your overall passwords score</div>
            </div>
            <div class="flex items-center">
              <Check />
              <div class="ml-2">Detect if your password were in a breach</div>
            </div>
          </div>
          <div class="mr-10">
            <img src="@/assets/images/icons/callout-upgrade.svg" alt="">
          </div>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-x-6">
        <div
          v-for="item in plans"
          :key="item.id"
          class="p-8 border border-black-200 rounded"
        >
          <div class="h-full flex flex-col">
            <div class="flex items-center">
              <div class="label label-black tracking-[1px] font-semibold uppercase !text-xs">
                {{ getPlanName(item.name).name }}
              </div>
              <div class="text-black-600 ml-2">
                {{ getPlanName(item.name).tag }}
              </div>
            </div>
            <div class="mt-2.5 mb-6 flex items-center">
              <span class="text-head-3 font-semibold mr-2">
                <span v-if="language==='vi'">đ{{ item.price.vnd | formatNumber }}</span>
                <span v-if="language==='en'">${{ item.price.usd | formatNumber }}</span>
              </span>
              <span class="text-black-600">/ mo</span>
              <span v-if="item.max_number" class="ml-2 text-black-600">/ {{ item.max_number }} members </span>
              <span v-else-if="item.alias === 'pm_business_premium'" class="ml-2 text-black-600">/ 1 member </span>
            </div>
            <div class="mb-8 flex-grow">
              <div
                v-for="feature in features[item.alias]"
                :key="feature"
                class="flex items-center"
              >
                <Check class="text-primary" />
                <div class="ml-2">{{ $t(`data.plans.features.${feature}`) }}</div>
              </div>
            </div>
            <div v-if="item.alias !== 'pm_free'">
              <button
                v-if="currentPlan.alias === item.alias"
                class="btn btn-default w-full"
              >
                Hiện tại
              </button>
              <button
                v-else
                class="btn btn-outline-primary w-full"
                @click="selectPlan(item)"
              >
                Lựa chọn
              </button>
            </div>
            <div v-else-if="currentPlan.alias === 'pm_free'">
              <button class="btn btn-primary w-full">
                Hiện tại
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-if="step===2">
      <div class="text-head-4 font-semibold mb-6 flex items-center">
        <button
          class="btn btn-icon btn-clean w-10 h-10 rounded-full -ml-4"
          @click="step = 1"
        >
          <i class="fa fa-chevron-left" />
        </button> Get rid of password
      </div>
      <div class="text-black-600 mb-12">
        Securely store, organize, and access your passwords from anywhere.
      </div>
      <div class="grid grid-cols-4 gap-x-20 mb-12">
        <div class="col-span-3">
          <div class="mb-10">
            <div class="text-[20px] font-semibold mb-6">
              Choose subscription period
            </div>
            <div class="grid grid-cols-3 gap-x-6">
              <div
                v-for="(item) in periods"
                :key="item.value"
                class="transition-card py-5 px-3 border border-black-200 rounded text-center cursor-pointer"
                :class="{'border-primary': selectedPeriod.label===item.label}"
                @click="selectPeriod(item)"
              >
                <div class="font-semibold text-[1rem] mb-2.5">{{ $t(`data.plans.price.${item.label}`) }}</div>
                <template v-if="selectedPlan[item.label]">
                  <div class="font-semibold mb-8">
                    <span>
                      <span class="text-head-1">{{ symbol }}{{ selectedPlan[item.label][currency]/item.value | formatNumber }}</span>
                      <span> / Mo </span>
                      <span v-if="selectedPlan.max_number" class="text-black-600">/ {{ selectedPlan.max_number }} members </span>
                      <span v-else-if="selectedPlan.alias === 'pm_business_premium'" class="text-black-600">/ 1 member </span>
                    </span>
                  </div>
                  <div v-if="item.value !== 1">
                    <span class="text-danger line-through">
                      {{ symbol }}{{ selectedPlan.price[currency]*item.value |formatNumber }}</span>
                    <span class="text-black-600">
                      {{ symbol }}{{ selectedPlan[item.label][currency] |formatNumber }}
                      <span v-if="item.value===6"> for the first 6 months</span>
                      <span v-if="item.value===12"> for the first year</span>
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div v-if="selectedPlan.alias === 'pm_business_premium'" class="mb-10">
            <div class="text-[20px] font-semibold mb-6">
              Choose number of members
            </div>
            <el-input-number
              v-model="number_members"
              controls-position="right"
              :min="1"
              :max="1000"
              @change="calcPrice"
            />
          </div>
          <div>
            <div class="text-[20px] font-semibold mb-6">
              Select a payment method
            </div>
            <div class="grid grid-cols-3 gap-6">
              <div
                class="transition-card border rounded px-5 py-4 hover:border-primary cursor-pointer"
                :class="{
                  'border-primary': paymentMethod === 'card',
                  'border-black-200': paymentMethod !== 'card'
                }"
                @click="selectMethod('card')"
              >
                <div class="text-lg font-semibold mb-2">Credits Cards</div>
                <div class="flex">
                  <img src="@/assets/images/icons/cards/visa.svg" alt="">
                  <img src="@/assets/images/icons/cards/master.svg" class="mx-2">
                  <img src="@/assets/images/icons/cards/amex.svg" alt="">
                </div>
              </div>
              <div
                class="transition-card border rounded px-5 py-4 hover:border-primary cursor-pointer"
                :class="{
                  'border-primary': paymentMethod === 'wallet',
                  'border-black-200': paymentMethod !== 'wallet'
                }"
                @click="selectMethod('wallet')"
              >
                <div class="text-lg  mb-2 flex items-center justify-between">
                  <span class="font-semibold">CyStack Wallet**</span>
                  <span class="">{{ balance | formatNumber }} VND</span>
                </div>
                <div class=" flex items-center justify-between">
                  &nbsp;
                </div>
                <a
                  href="https://id.cystack.net/wallet/vnd"
                  target="_blank"
                >
                  <button class="btn rounded-full btn-xs hover:no-underline w-full mt-auto !font-normal">
                    <i class="fa fa-plus" /> Topup
                  </button>
                </a>
              </div>
              <div
                class="transition-card border rounded px-5 py-4 hover:border-primary cursor-pointer"
                :class="{
                  'border-primary': paymentMethod === 'banking',
                  'border-black-200': paymentMethod !== 'banking'
                }"
                @click="selectMethod('banking')"
              >
                <div class="text-lg  mb-2 flex items-center justify-between">
                  <span class="font-semibold">Internet Banking**</span>
                </div>
                <div class=" flex items-center justify-between">
                  <span class="italic">&nbsp;</span>
                </div>
                <el-select
                  v-model="bank"
                  placeholder=""
                  value-key="id"
                  class="w-full"
                  @focus="selectMethod('banking')"
                >
                  <el-option
                    v-for="item in banks"
                    :key="item.id"
                    :label="item.bank_name"
                    :value="item"
                  />
                </el-select>
              </div>
              <div
                v-if="paymentMethod==='card'"
                class="border rounded p-5 border-black-200 cursor-pointer col-span-2"
              >
                <div class="">
                  <el-radio-group v-model="selectedCard" class="w-full">
                    <el-radio
                      v-for="item in cards"
                      :key="item.id_card"
                      :label="item.id_card"
                      class="!flex mb-4 items-center"
                    >
                      <div class="flex items-center w-[200px]">
                        <div class="bg-[#f5f8fa] w-10 h-10 rounded flex items-center justify-center p-1 mr-4">
                          <img v-if="item.card_type === 'Visa'" src="@/assets/images/icons/cards/visa.svg" alt="">
                          <img v-else-if="item.card_type === 'MasterCard'" src="@/assets/images/icons/cards/master.svg" alt="">
                          <img v-else-if="item.card_type === 'American Express'" src="@/assets/images/icons/cards/amex.svg" alt="">
                          <img v-else-if="item.card_type === 'Discover'" src="@/assets/images/icons/cards/discover.svg" alt="">
                          <img v-else-if="item.card_type === 'JCB'" src="@/assets/images/icons/cards/jcb.svg" alt="">
                          <img v-else src="@/assets/images/icons/cards/card.svg" alt="">
                        </div>
                        <div class="">
                          <div class="text-black font-bold mb-2">{{ item.card_type }}</div>
                          <div class="flex items-center justify-between">
                            <div class="text-black-500 mr-10">{{ item.expire }}</div>
                            <div class="text-black-500 flex items-center">
                              <span class="bg-black-500 w-[4px] h-[4px] rounded-full mr-0.5" />
                              <span class="bg-black-500 w-[4px] h-[4px] rounded-full mr-0.5" />
                              <span class="bg-black-500 w-[4px] h-[4px] rounded-full mr-0.5" />
                              <span class="bg-black-500 w-[4px] h-[4px] rounded-full mr-0.5" />
                              <span>{{ item.last4 }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </el-radio>
                  </el-radio-group>
                  <button
                    class="btn btn-default btn-xs"
                    @click="editBilling"
                  >
                    {{ $t('data.billing.add_btn') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-span-1">
          <div
            class="pl-6 py-7 rounded"
            style="background: linear-gradient(90deg, rgba(219,223,225,0.16) 0%, rgba(219,223,225,0) 100%);"
          >
            <div class="text-[20px] font-semibold mb-6">
              {{ $t('data.billing.upgrade_summary') }}
            </div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="flex items-center">
                  <div class="label label-black tracking-[1px] font-semibold uppercase !text-xs">
                    {{ getPlanName(selectedPlan.name).name }}
                  </div>
                  <div class="text-black-600 ml-2">
                    {{ getPlanName(selectedPlan.name).tag }}
                  </div>
                </div>
                <div>
                  <span>{{ $t(`data.plans.price.${selectedPeriod.label}`) }}</span>
                  <span v-if="selectedPlan.id === 4"> x {{ $tc('data.plans.members', number_members, { count: number_members }) }}</span>
                </div>
              </div>
              <div>
                {{ result.price | formatNumber }} {{ result.currency }}
              </div>
            </div>
            <div v-if="result.immediate_payment" class="flex items-center justify-between">
              <div>
                {{ $t('data.billing.charged_today') }}
              </div>
              <div>
                {{ result.immediate_payment | formatNumber }} {{ result.currency }}
              </div>
            </div>
            <div class="my-8 h-[1px] bg-[#E8EAED]" />
            <div class="flex items-center justify-between text-[20px] font-semibold">
              <div>{{ $t('data.billing.total') }}</div>
              <div>
                {{ result.total_price | formatNumber }} {{ result.currency }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <button
          class="btn btn-primary !px-20"
          :disabled="shouldDisableBtn"
          @click="confirmPlan"
        >
          Upgrade
        </button>
      </div>
    </template>
    <CardDrawer ref="drawer" @handle-done="handleDone" />
    <el-dialog
      :visible.sync="dialogChange"
      width="675px"
      destroy-on-close
      top="15vh"
      custom-class="locker-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div slot="title">
        <div class="text-head-5 text-black-700 font-semibold truncate">
          Thay đổi gói đăng ký
        </div>
      </div>
      <div class="text-left text-black">
        <div class="flex items-center justify-between mb-5">
          <div class="text-head-6 text-black font-semibold">Gói hiện tại:</div>
          <div class="flex items-center">
            <div class="label label-black tracking-[1px] font-semibold uppercase !text-xs">
              {{ getPlanName(currentPlan.name).name }}
            </div>
            <div class="text-black-600 ml-2">
              {{ getPlanName(currentPlan.name).tag }}
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mb-5">
          <div class="text-head-6 text-black font-semibold">Gói đăng ký mới:</div>
          <div class="flex items-center">
            <div class="label label-black tracking-[1px] font-semibold uppercase !text-xs">
              {{ getPlanName(selectedPlan.name).name }}
            </div>
            <div class="text-black-600 ml-2">
              {{ getPlanName(selectedPlan.name).tag }}
            </div>
          </div>
        </div>
        <div class="my-4 h-[1px] bg-[#E8EAED]" />
        <div class="mb-5">
          <div class="font-semibold mb-6">
            Choose subscription period
          </div>
          <div class="grid grid-cols-3 gap-x-6">
            <div
              v-for="(item) in periods"
              :key="item.value"
              class="transition-card py-5 px-3 border border-black-200 rounded text-center cursor-pointer"
              :class="{'border-primary': selectedPeriod.label===item.label}"
              @click="selectPeriod(item)"
            >
              <div class="font-semibold text-[1rem] mb-2.5">{{ $t(`data.plans.price.${item.label}`) }}</div>
              <template v-if="selectedPlan[item.label]">
                <div class="font-semibold">
                  <span>
                    <span class="text-head-5">{{ symbol }}{{ selectedPlan[item.label][currency]/item.value | formatNumber }}</span>
                    <span> / Mo </span>
                    <div v-if="selectedPlan.max_number" class="text-black-600">/ {{ selectedPlan.max_number }} members </div>
                    <div v-else-if="selectedPlan.alias === 'pm_business_premium'" class="text-black-600">/ 1 member </div>
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div v-if="selectedPlan.alias === 'pm_business_premium'" class="mb-5">
          <div class="font-semibold mb-6">
            Choose number of members
          </div>
          <el-input-number
            v-model="number_members"
            controls-position="right"
            :min="currentPlan.max_number ? currentPlan.max_number : 1"
            :max="1000"
            @change="calcPrice"
          />
        </div>
        <div class="mb-5">
          <div class="font-semibold mb-5">
            Select a payment method
          </div>
          <div class="grid gap-5">
            <div
              v-if="currentPlan.payment_method ==='wallet' || currentPlan.payment_method ==='banking'"
              class="border rounded px-5 py-4 hover:border-primary cursor-pointer"
              :class="{
                'border-primary': paymentMethod === 'wallet',
                'border-black-200': paymentMethod !== 'wallet'
              }"
              @click="selectMethod('wallet')"
            >
              <div class="text-lg  mb-2 flex items-center justify-between">
                <span class="font-semibold">CyStack Wallet</span>
                <span class="">{{ balance | formatNumber }} VND</span>
              </div>
              <div class=" flex items-center justify-between">
                <span class="italic">*This is a payment method only for Vietnamese</span>
                <a
                  href="https://id.cystack.net/wallet/vnd"
                  target="_blank"
                  class="btn btn-outline-primary rounded-full btn-xs hover:no-underline"
                >
                  <i class="fa fa-plus" /> Topup
                </a>
              </div>
            </div>
            <div
              v-if="currentPlan.payment_method==='card'"
              class="border rounded p-5 border-black-200 cursor-pointer col-span-2"
            >
              <div class="">
                <el-radio-group v-model="selectedCard" class="w-full">
                  <el-radio
                    v-for="item in cards"
                    :key="item.id_card"
                    :label="item.id_card"
                    class="!flex mb-4 items-center"
                  >
                    <div class="flex items-center w-[200px]">
                      <div class="bg-[#f5f8fa] w-10 h-10 rounded flex items-center justify-center p-1 mr-4">
                        <img v-if="item.card_type === 'Visa'" src="@/assets/images/icons/cards/visa.svg" alt="">
                        <img v-else-if="item.card_type === 'MasterCard'" src="@/assets/images/icons/cards/master.svg" alt="">
                        <img v-else-if="item.card_type === 'American Express'" src="@/assets/images/icons/cards/amex.svg" alt="">
                        <img v-else-if="item.card_type === 'Discover'" src="@/assets/images/icons/cards/discover.svg" alt="">
                        <img v-else-if="item.card_type === 'JCB'" src="@/assets/images/icons/cards/jcb.svg" alt="">
                        <img v-else src="@/assets/images/icons/cards/card.svg" alt="">
                      </div>
                      <div class="">
                        <div class="text-black font-bold mb-2">{{ item.card_type }}</div>
                        <div class="flex items-center justify-between">
                          <div class="text-black-500 mr-10">{{ item.expire }}</div>
                          <div class="text-black-500 flex items-center">
                            <span class="bg-black-500 w-[4px] h-[4px] rounded-full mr-0.5" />
                            <span class="bg-black-500 w-[4px] h-[4px] rounded-full mr-0.5" />
                            <span class="bg-black-500 w-[4px] h-[4px] rounded-full mr-0.5" />
                            <span class="bg-black-500 w-[4px] h-[4px] rounded-full mr-0.5" />
                            <span>{{ item.last4 }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-radio>
                </el-radio-group>
                <button
                  class="btn btn-default btn-xs"
                  @click="editBilling"
                >
                  Thêm thẻ mới
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="text-lg">
          <div class="font-semibold mb-6">
            Summary
          </div>
          <div v-if="result.next_billing_time" class="flex items-center justify-between">
            <div>
              {{ $t('data.billing.next_billing') }}:
              <span class="font-semibold">{{ $moment(result.next_billing_time*1000).format('LL') }}</span>
            </div>
            <div>
              {{ result.price | formatNumber }} {{ result.currency }}
            </div>
          </div>
          <div v-if="result.immediate_payment" class="flex items-center justify-between">
            <div>
              {{ $t('data.billing.charged_today') }}
            </div>
            <div>
              {{ result.immediate_payment | formatNumber }} {{ result.currency }}
            </div>
          </div>
          <div class="my-4 h-[1px] bg-[#E8EAED]" />
          <div class="flex items-center justify-between text-[20px] font-semibold">
            <div>Total</div>
            <div>
              {{ result.total_price | formatNumber }} {{ result.currency }}
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer flex items-center text-left">
        <div class="flex-grow" />
        <div>
          <button
            class="btn btn-default"
            :disabled="loading || loadingCalc"
            @click="dialogChange = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            class="btn btn-primary"
            :disabled="loading || loadingCalc"
            @click="confirmPlan"
          >
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="dialogTopup"
      width="430px"
      destroy-on-close
      top="15vh"
      custom-class="locker-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div slot="title">
        <div class="text-head-5 text-black-700 font-semibold truncate">
          Giao dịch không thành công
        </div>
      </div>
      <div class="text-left ">
        Số dư trong tài khoản CyStack của bạn không đủ để thực hiện thanh toán.
        Vui lòng nạp thêm để tiếp tục giao dịch.
      </div>
      <div slot="footer" class="dialog-footer flex items-center text-left">
        <div class="flex-grow" />
        <div>
          <button
            class="btn btn-default"
            @click="dialogTopup = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <a
            href="https://id.cystack.net/wallet/vnd"
            target="_blank"
            class="btn btn-outline-primary hover:no-underline"
          >
            Topup
          </a>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="dialogTransfer"
      width="500px"
      custom-class="locker-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape=" false"
    >
      <div slot="title">
        <div class="text-head-5 text-black-700 font-semibold truncate">
          {{ $t('data.billing.transfer_information') }}
        </div>
      </div>
      <div class="text-black-700">
        <div class="text-lg font-semibold mb-5">
          {{ $t('data.billing.transfer_detail') }}
        </div>
        <div class="flex justify-between mb-3">
          <div class="flex-grow w-50">
            {{ $t('data.billing.transfer_bank') }}
          </div>
          <div class="flex-grow w-1/2 text-right font-semibold">
            {{ order.bank && order.bank.bank_name }}
          </div>
        </div>
        <div class="flex justify-between mb-3">
          <div class="flex-grow-1 w-50">
            {{ $t('data.billing.transfer_branch') }}
          </div>
          <div class="flex-grow-1 w-1/2 text-right font-semibold text-right">
            {{ order.bank && order.bank.bank_branch }}
          </div>
        </div>
        <div class="flex justify-between mb-3">
          <div class="flex-grow-1 w-50">
            {{ $t('data.billing.transfer_account') }}
          </div>
          <div class="flex-grow-1 w-1/2 text-right font-semibold text-right">
            {{ order.bank && order.bank.account_name }}
          </div>
        </div>
        <div class="flex justify-between mb-3">
          <div class="">
            {{ $t('data.billing.transfer_account_number') }}
          </div>
          <div class="flex-grow-1 w-1/2 text-right font-semibold text-right">
            {{ order.bank && order.bank.account_number }}
            <i
              v-clipboard:copy="order.bank && order.bank.account_number"
              v-clipboard:success="clipboardSuccessHandler"
              class="fa fa-clone cursor-pointer"
            />
          </div>
        </div>
        <div class="flex justify-between mb-3">
          <div class="">
            {{ $t('data.billing.transfer_amount') }}
          </div>
          <div class="flex-grow-1 w-1/2 text-right font-semibold text-right">
            {{ order.total_price | formatNumber }} VND
            <i
              v-clipboard:copy="order.total_price"
              v-clipboard:success="clipboardSuccessHandler"
              class="fa fa-clone cursor-pointer"
            />
          </div>
        </div>
        <div class="flex justify-between mb-3">
          <div class="">
            {{ $t('data.billing.transfer_content') }}
          </div>
          <div class="flex-grow-1 w-1/2 text-right font-semibold text-right">
            {{ order.code }}
            <i
              v-clipboard:copy="order.code"
              v-clipboard:success="clipboardSuccessHandler"
              class="fa fa-clone cursor-pointer"
            />
          </div>
        </div>
        <div class="italic">
          {{ $t('data.billing.transfer_note') }}
        </div>
      </div>
      <div slot="footer">
        <div class="">
          <button
            v-if="order.status === 'pending'"
            class="btn btn-outline-primary w-full mb-2"
            :disabled="loadingDeposited"
            @click="postDeposit(order)"
          >
            {{ $t('data.billing.transfer_already') }}
          </button>
          <button class="btn btn-default w-full" @click="dialogTransfer = false">
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="dialogThank"
      width="500px"
      custom-class="locker-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape=" false"
    >
      <div slot="title">
        <div class="text-head-5 text-black-700 font-semibold truncate">
          {{ $t('data.billing.transfer_thank') }}
        </div>
      </div>
      <div class="text-black-700">
        <div class="text-lg mb-3">
          {{ $t('data.billing.transfer_thank_content', {plan: selectedPlan.name}) }}
        </div>
        <div class="text-lg">
          {{ $t('data.billing.transfer_thank_content_1') }}
        </div>
      </div>
      <div slot="footer">
        <div class="">
          <button class="btn btn-default w-full" @click="dialogThank = false">
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import debounce from 'lodash/debounce'
import find from 'lodash/find'
import CardDrawer from '@/components/upgrade/CardDrawer'
import Check from '@/components/icons/check'

export default Vue.extend({
  components: { Check, CardDrawer },
  data () {
    return {
      step: 1,
      plans: [],
      features: {
        pm_free: [
          'store_password',
          'cards_and_notes',
          'password_generator',
          'sync_devices'
        ],
        pm_personal_premium: [
          'store_password',
          'cards_and_notes',
          'password_generator',
          'sync_devices',
          'password_health',
          'data_breach'
        ],
        pm_family_discount: [
          'store_password',
          'cards_and_notes',
          'password_generator',
          'sync_devices',
          'password_health',
          'data_breach'
        ],
        pm_business_premium: [
          'store_password',
          'cards_and_notes',
          'password_generator',
          'sync_devices',
          'password_health',
          'data_breach',
          'shares_passwords',
          'admin_panel',
          'activity_logs'
        ]
      },
      selectedPlan: {
        half_yearly_price: {},
        price: {},
        yearly_price: {},
        name: ''
      },
      periods: [
        {
          label: 'yearly_price',
          value: 12,
          duration: 'yearly'
        }, {
          label: 'half_yearly_price',
          value: 6,
          duration: 'half_yearly'
        }, {
          label: 'price',
          value: 1,
          duration: 'monthly'
        }],
      cards: [],
      type: 'yearly_price',
      paymentMethod: 'card',
      selectedCard: '',
      duration: 'yearly',
      promo_code: '',
      selectedPeriod: {
        label: 'yearly_price',
        value: 12,
        duration: 'yearly'
      },
      number_members: 1,
      result: {},
      balance: 0,
      dialogChange: false,
      loadingChange: false,
      loading: false,
      dialogTopup: false,
      loadingCalc: false,
      intervalBalance: null,
      banks: [],
      bank: '',
      dialogTransfer: false,
      order: {
        bank: {}
      },
      loadingDeposited: false,
      dialogThank: false
    }
  },
  computed: {
    currency () {
      return this.language === 'vi' ? 'vnd' : 'usd'
    },
    symbol () {
      return this.currency === 'vnd' ? 'đ' : '$'
    },
    shouldDisableBtn () {
      if (this.loading || this.loadingCalc) return true
      if (this.paymentMethod === 'card' && this.cards.length === 0) return true
      return false
    },
    currentPlan () {
      return this.$store.state.currentPlan
    }
  },
  beforeDestroy () {
    clearInterval(this.intervalBalance)
  },
  mounted () {
    this.getPlans()
    this.getCards()
    this.getBalance()
    this.getBanks()
    this.intervalBalance = setTimeout(() => {
      this.getBalance()
    }, 10000)
    this.$store.dispatch('LoadCurrentPlan')
  },
  methods: {
    async getPlans () {
      this.plans = await this.axios.get('resources/cystack_platform/pm/plans')
    },
    async getPlan () {
      this.plan = await this.axios.get('cystack_platform/pm/payments/plan')
    },
    getPlanName (text) {
      if (text) {
        const [name, tag] = text.split(' ')
        return { name, tag }
      }
      return { name: '', tag: '' }
    },
    editBilling () {
      this.$refs.drawer.openDrawer({
        country: 'VN',
        metadata: {}
      })
    },
    handleDone (card) {
      this.getCards()
      this.$nextTick(() => {
        this.selectedCard = card.id_card
      })
    },
    async genOrgKey () {
      const shareKey = await this.$cryptoService.makeShareKey()
      const orgKey = shareKey[0].encryptedString
      const collection = await this.$cryptoService.encrypt('defaultCollection', shareKey[1])
      const collectionName = collection.encryptedString
      console.log('orgKey', orgKey)
      console.log('collectionName', collectionName)
    },
    async getCards () {
      this.cards = await this.axios.get('cystack_platform/payments/cards')
    },
    calcPrice: debounce(function () {
      const currency = this.paymentMethod === 'card' ? 'USD' : 'VND'
      this.loadingCalc = true
      const url = 'cystack_platform/pm/payments/calc'
      this.axios.post(url, {
        plan_alias: this.selectedPlan.alias,
        promo_code: this.promo_code,
        duration: this.selectedPeriod.duration,
        number_members: this.number_members,
        currency
      }).then(res => {
        this.result = res
      })
        .catch(error => {
          if (error.response && error.response.data && error.response.code === '7009') {
            this.notify(this.$t('data.error_code.7009'))
          }
        })
        .then(() => {
          this.loadingCalc = false
        })
    }, 300),
    selectPeriod (period) {
      this.selectedPeriod = period
      if (this.currentPlan.alias !== 'pm_free') {
        this.selectMethod(this.currentPlan.payment_method === 'banking' ? 'wallet' : this.currentPlan.payment_method)
      } else {
        this.number_members = 1
        this.selectMethod('card')
      }
      this.calcPrice()
    },
    selectPlan (plan) {
      this.selectedPlan = plan
      if (this.currentPlan.alias !== 'pm_free') {
        this.dialogChange = true
        this.selectPeriod(find(this.periods, e => e.duration === this.currentPlan.duration))
        if (this.currentPlan.alias === 'pm_family_discount') {
          this.number_members = 5
        }
      } else {
        this.number_members = 1
        this.step = 2
        this.selectPeriod({
          label: 'yearly_price',
          value: 12,
          duration: 'yearly'
        })
      }
      this.calcPrice()
    },
    selectMethod (method) {
      this.paymentMethod = method
      if (method === 'card' && this.cards.length) {
        const card = find(this.cards, e => e.default) || {}
        this.selectedCard = card.id_card
      }
      this.calcPrice()
    },
    async confirmPlan () {
      if (this.paymentMethod === 'wallet' && this.result.total_price < this.balance) {
        this.dialogTopup = true
        return
      }
      try {
        this.loading = true
        const shareKey = await this.$cryptoService.makeShareKey()
        const orgKey = shareKey[0].encryptedString
        const collection = await this.$cryptoService.encrypt('defaultCollection', shareKey[1])
        const collectionName = collection.encryptedString

        const data = await this.axios.post('cystack_platform/pm/payments/plan', {
          plan_alias: this.selectedPlan.alias,
          duration: this.selectedPeriod.duration,
          payment_method: this.paymentMethod,
          id_card: this.selectedCard,
          promo_code: this.promo_code,
          number_members: this.number_members,
          key: orgKey,
          collection_name: collectionName,
          bank_id: this.bank.id
        })
        this.$store.dispatch('LoadCurrentPlan')
        this.step = 1
        this.dialogChange = false
        if (this.paymentMethod === 'banking') {
          this.order = data
          this.dialogTransfer = true
        } else {
          this.notify('Nâng cấp thành công', 'success')
        }
      } catch {
        this.notify('Có lỗi xảy ra. Vui lòng thử lại', 'warning')
      } finally {
        this.loading = false
      }
    },
    async getBalance () {
      const { balance } = await this.axios.get('sso/me/wallet/VND')
      this.balance = balance
    },
    getBanks () {
      this.axios.get('resources/wallet/banks')
        .then(res => {
          this.banks = res
          if (res && res.length) {
            this.bank = res[0]
          }
        })
    },
    postDeposit (order) {
      this.axios.post(`cystack_platform/pm/payments/invoices/${order.payment_id}/processing`)
        .then(res => {
          this.dialogTransfer = false
          this.dialogThank = true
        })
    }
  }
})
</script>
