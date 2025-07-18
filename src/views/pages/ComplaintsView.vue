<template>
  <div class="app-management-page">
    <BaseHeader
      :pageIcon="'mdi-headphones'"
      :title="t('customerSupport')"
      :desc="t('manageYourCustomerSupportRequests')"
    />
    <div class="page-content">
      <!-- Loading state for initial page load -->
      <div v-if="initialLoading" class="loading-state">
        <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
        <p>{{ t('loading') }}</p>
      </div>
      
      <!-- Content when loaded -->
      <div v-else>
        <div class="cards">
          <InfoCard class="infoCard" :cardTitle="t('totalIssues')">
            {{ stats.totalComplaints }}
          </InfoCard>
          <InfoCard class="infoCard" :cardTitle="t('openIssues')">
            {{ stats.openComplaints }}
          </InfoCard>
          <InfoCard class="infoCard" :cardTitle="t('solvedIssues')">
            {{ stats.solvedComplaints }}
          </InfoCard>
        </div>
        <hr class="infoHr" />
        <ServerSideTable
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items="items"
          :total-items="totalItems"
          :loading="loading"
        >
          <template #cell-status="{ item }">
            <v-chip :color="statusColor(item.status)" text-color="white" small>
              <span
                :style="{ backgroundColor: statusColor(item.status) }"
                class="status-circle"
              ></span>
              {{ t(item.status ?? 'pending') }}
            </v-chip>
          </template>
          <template #cell-_id="{ item }"> #{{ item._id.substring(0, 10) }} </template>
          <!-- <template #cell-priority="{ item }">
            <v-chip
              :color="
                item.priority === 'urgent'
                  ? 'red'
                  : item.priority === 'high'
                    ? 'orange'
                    : item.priority === 'medium'
                      ? 'blue'
                      : 'grey'
              "
              text-color="white"
              small
            >
              {{ item.priority }}
            </v-chip>
          </template> -->
          <template #cell-createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>
          <template #actions="{ item }">
            <v-menu location="bottom end" offset="4">
              <template #activator="{ props }">
                <v-btn icon v-bind="props" variant="text" density="comfortable">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list class="menu-list pa-0 ma-0">
                <v-list-item class="menu-item" @click="viewDetails(item)">
                  <v-icon class="mr-2">mdi-eye-outline</v-icon>
                  {{ t('seeDetails') }}
                </v-list-item>
                <v-list-item class="menu-item" @click="deleteComplaint(item)">
                  <v-icon class="mr-2">mdi-trash-can-outline</v-icon>
                  {{ t('deleteIssue') }}
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </ServerSideTable>
      </div>
    </div>
    <!-- delete Drawer -->
    <Drawer
      :isOpen="isDeleteComplaintDrawerOpen"
      :title="t('complaint') + ' ' + '#' + selectedComplaint?._id.substring(0, 10)"
      :desc="
        t('employee') +
        ' ' +
        '#' +
        (selectedComplaint?.relatedWorkerId?._id
          ? selectedComplaint.relatedWorkerId._id?.substring(0, 10)
          : 'N/A')
      "
      :drawerStatus="selectedComplaint?.status ? selectedComplaint?.status : 'pending'"
      @close="isDeleteComplaintDrawerOpen = false"
    >
      <div style="max-height: 75vh">
        <form class="form">
          <div>
            <p class="drawer-title">{{ selectedComplaint?.title }}</p>
            <p class="drawer-description">{{ selectedComplaint?.description }}</p>
            <div class="drawer-banner">
              <p>{{ t('information') }}</p>
            </div>
            <div>
              <div class="drawer-info">
                <p class="drawer-key">{{ t('reportedBy') }}</p>
                <p class="drawer-value">{{ selectedComplaint?.userId?.name ?? 'N/A' }}</p>
              </div>
              <div class="drawer-info">
                <p class="drawer-key">{{ t('reporterId') }}</p>
                <p class="drawer-value">
                  {{ selectedComplaint?.userId?._id?.substring(0, 10) ?? 'N/A' }}
                </p>
              </div>
              <div class="drawer-info">
                <p class="drawer-key">{{ t('reporterPhoneNumber') }}</p>
                <p class="drawer-value">{{ selectedComplaint?.userId?.phone ?? 'N/A' }}</p>
              </div>
              <div class="drawer-info">
                <p class="drawer-key">{{ t('reportedOn') }}</p>
                <p class="drawer-value">
                  {{
                    selectedComplaint?.createdAt ? formatDate(selectedComplaint.createdAt) : 'N/A'
                  }}
                </p>
              </div>
              <div class="drawer-info">
                <p class="drawer-key">{{ t('status') }}</p>
                <p class="drawer-value">
                  <v-chip
                    :color="statusColor(selectedComplaint?.status ?? 'pending')"
                    text-color="white"
                    small
                  >
                    <span
                      :style="{
                        backgroundColor: statusColor(selectedComplaint?.status ?? 'pending'),
                      }"
                      class="status-circle"
                    ></span>
                    {{ t(selectedComplaint?.status ?? 'pending') }}
                  </v-chip>
                </p>
              </div>
            </div>
            <div class="action-btns">
              <ActionButton
                :buttonText="t('cancel')"
                buttonColor="white"
                class="action-Btn"
                @button-pressed="() => (isDeleteComplaintDrawerOpen = false)"
              />
              <ActionButton
                button-color="error"
                :buttonText="t('deleteIssue')"
                class="action-Btn"
                @button-pressed="
                  () => {
                    isConfirmDeletePopupVisible = true
                    isDeleteComplaintDrawerOpen = false
                  }
                "
              />
            </div>
          </div>
        </form>
      </div>
    </Drawer>
    <!-- delete Drawer -->

    <!-- Details Drawer -->
    <Drawer
      :isOpen="isDetailsComplaintDrawerOpen && !isLoading"
      :title="
        tab == 'chat'
          ? t('complaint') + ' ' + '#' + selectedComplaint?.userId?._id?.substring(0, 10)
          : t('ticket') + ' ' + '#' + selectedComplaint?._id?.substring(0, 10)
      "
      :desc="
        t('employee') +
        ' ' +
        '#' +
        (selectedComplaint?.relatedWorkerId?._id
          ? selectedComplaint.relatedWorkerId?._id?.substring(0, 10)
          : 'N/A')
      "
      :drawerStatus="selectedComplaint?.status ? selectedComplaint?.status : 'pemding'"
      @close="isDetailsComplaintDrawerOpen = false"
    >
      <div v-if="isLoading" class="d-flex justify-center my-5">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <div style="max-height: 75vh" v-if="!isLoading">
        <div class="drawer-form">
          <div>
            <p class="drawer-title">{{ selectedComplaint?.title }}</p>
            <p class="drawer-description">{{ selectedComplaint?.description }}</p>

            <v-card>
              <v-tabs v-model="tab" align-tabs="start" slider-color="primary">
                <v-tab value="details">{{ t('details') }}</v-tab>
                <v-tab value="chat">{{ t('chat') }}</v-tab>
              </v-tabs>

              <v-tabs-window v-model="tab">
                <v-tabs-window-item value="details">
                  <div>
                    <div class="drawer-info">
                      <p class="drawer-key">{{ t('reportedBy') }}</p>
                      <p class="drawer-value">{{ selectedComplaint?.userId?.name ?? 'N/A' }}</p>
                    </div>
                    <div class="drawer-info">
                      <p class="drawer-key">{{ t('reporterId') }}</p>
                      <p class="drawer-value">
                        {{ selectedComplaint?.userId?._id?.substring(0, 10) ?? 'N/A' }}
                      </p>
                    </div>
                    <div class="drawer-info">
                      <p class="drawer-key">{{ t('reporterPhoneNumber') }}</p>
                      <p class="drawer-value">{{ selectedComplaint?.userId?.phone ?? 'N/A' }}</p>
                    </div>
                    <div class="drawer-info">
                      <p class="drawer-key">{{ t('reportedOn') }}</p>
                      <p class="drawer-value">
                        {{
                          selectedComplaint?.createdAt
                            ? formatDate(selectedComplaint.createdAt)
                            : 'N/A'
                        }}
                      </p>
                    </div>
                    <div class="drawer-info">
                      <p class="drawer-key">{{ t('status') }}</p>

                      <v-menu v-model="menu" :close-on-content-click="false" offset-y>
                        <template #activator="{ props }">
                          <v-btn
                            :style="{
                              backgroundColor: statusBg(editableStatus),
                              color: statusColor(editableStatus),
                            }"
                            v-bind="props"
                            class="status-btn"
                            variant="tonal"
                            rounded
                          >
                            <span
                              class="status-dot"
                              :style="{ backgroundColor: statusColor(editableStatus) }"
                            ></span>
                            {{ t(statusLabel(editableStatus)) }}
                            <v-icon size="18" class="ml-1">mdi-chevron-down</v-icon>
                          </v-btn>
                        </template>

                        <v-list class="status-list">
                          <v-list-item
                            v-for="status in statusOptions"
                            :key="status.label"
                            @click="selectStatus(status.label)"
                            class="status-item"
                            :style="{
                              backgroundColor: statusBg(status.label),
                              color: statusColor(status.label),
                            }"
                          >
                            <template #prepend>
                              <span
                                class="status-dot"
                                :style="{ backgroundColor: statusColor(status.label) }"
                              ></span>
                            </template>
                            <v-list-item-title>{{ t(status.label) }}</v-list-item-title>
                            <template #append>
                              <v-icon v-if="status.label === editableStatus" color="green"
                                >mdi-check-circle</v-icon
                              >
                            </template>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </div>
                  <div class="drawer-banner">
                    <p>{{ t('ticketActivity') }}</p>
                  </div>
                  <div class="status-stepper">
                    <v-timeline>
                      <v-timeline-item
                        v-if="selectedComplaint?.createdAt"
                        dot-color="white"
                        icon="mdi-ticket-confirmation-outline"
                      >
                        <div class="timeline-item-content">
                          <p>{{ t('ticketCreatedAt') }}</p>
                          <span>{{ formatDate(selectedComplaint?.createdAt) }}</span>
                        </div>
                      </v-timeline-item>

                      <v-timeline-item
                        v-slot:opposite
                        dot-color="white"
                        icon="mdi-rotate-3d-variant"
                        icon-color="orange"
                        v-if="selectedComplaint?.updatedAt"
                      >
                        <div class="timeline-item-content">
                          <p>{{ t('statusHasChanged') }}</p>
                          <span>{{ formatDate(selectedComplaint?.updatedAt) }}</span>
                        </div>
                        <p class="status-desc">
                          {{
                            t('statusHasChangedTo', {
                              status: t('in_progress'),
                            })
                          }}
                        </p>
                      </v-timeline-item>

                      <v-timeline-item
                        v-if="selectedComplaint?.status === 'closed' || selectedComplaint?.status === 'resolved'"
                        dot-color="white"
                        icon="mdi-check"
                        icon-color="success"
                      >
                        <div class="timeline-item-content">
                          <p>{{ t('statusHasChanged') }}</p>
                          <span>{{ selectedComplaint?.closedAt ? formatDate(selectedComplaint.closedAt) : 'N/A' }}</span>
                        </div>
                        <p class="status-desc">
                          {{
                            t('statusHasChangedTo', {
                              status: t(selectedComplaint?.status ?? 'completed'),
                            })
                          }}
                        </p>
                      </v-timeline-item>
                    </v-timeline>
                  </div>
                </v-tabs-window-item>

                <v-tabs-window-item value="chat">
                  <div class="chat" ref="chatContainerRef">
                    <div class="chat-complaint">
                      <p class="drawer-title">{{ selectedComplaint?.title }}</p>
                      <p class="drawer-description">{{ selectedComplaint?.description }}</p>
                      <p class="drawer-complaint-date">
                        {{ formatDate(selectedComplaint!.createdAt) }}
                      </p>
                      <v-divider class="divider" />

                      <div class="complaint-chat-message-sender">
                        <span>{{ selectedComplaint?.userId?.name?.substring(0, 1) }}</span>
                        <p>{{ selectedComplaint?.userId?.name }}</p>
                      </div>
                    </div>

                    <!-- Loop throuFgh messages -->
                    <div
                      v-for="message in selectedComplaint?.responses"
                      :key="message._id"
                      :class="{
                        'message-wrapper': true,
                        'align-left': message.responderRole === 'customer',
                        'align-right': message.responderRole === 'admin',
                      }"
                    >
                      <div
                        class="message-bubble"
                        :class="{
                          'message-question': message.responderRole === 'customer',
                          'message-answer': message.responderRole === 'admin',
                        }"
                      >
                        {{ message.message }}
                        <span class="message-date">{{ formatDate(message.createdAt) }}</span>
                      </div>
                    </div>
                  </div>
                </v-tabs-window-item>
              </v-tabs-window>
            </v-card>
          </div>
          <div v-if="tab === 'details'" class="action-btns">
            <ActionButton
              :buttonText="t('cancel')"
              buttonColor="white"
              @button-pressed="() => (isDetailsComplaintDrawerOpen = false)"
              class="action-Btn"
            />
            <ActionButton v-on:button-pressed="()=>saveStatus()" class="action-Btn" :buttonText="t('saveStatus')" buttonType="submit" />
          </div>
          <div v-if="tab === 'chat'" class="chat-action-btns">
            <input
              id="messageInput"
              type="text"
              placeholder="Type your message here..."
              v-model="message"
              required
            />
            <ActionButton
              v-on:button-pressed="() => sendMessage()"
              class="send-button"
              :buttonText="t('send')"
              type="button"
            />
          </div>
        </div>
      </div>
    </Drawer>
    <!-- Details Drawer -->
    <ConfirmPopupDialog
      :isVisible="isConfirmDeletePopupVisible"
      :title="t('deleteConfirmBanner')"
      :message="t('deleteConfirmBannerDescription')"
      :icon="'mdi-trash-can-outline'"
      :iconColor="'error'"
      @cancel="closeDeletePopup"
      @apply="onDeleteButtonPressed(selectedComplaint!._id)"
      :cancelText="t('cancel')"
      :applyText="t('deleteConfirmButton')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import ServerSideTable from '@/components/base/ServerTable.vue'
import { useComplaintsStore } from '@/stores/modules/complaints'
import { useI18n } from 'vue3-i18n'
import { ComplaintStatus, IComplaint } from '@/models/complaint'
import Drawer from '@/components/base/Drawer.vue'
import ActionButton from '@/components/base/ActionButton.vue'
import { toastDeleteMessage, toastSuccessMessage } from '@/utils/helpers/notification'
import ConfirmPopupDialog from '@/components/base/ConfirmPopupDialog.vue'
import { formatDate } from '@/utils/helpers/date-helper'

const { t } = useI18n()
const complaintsStore = useComplaintsStore()
const tab = ref(null)
const message = ref('')

const page = ref(1)
const itemsPerPage = ref(8)
const selectedComplaint = ref<IComplaint | null>(null)
const isDeleteComplaintDrawerOpen = ref(false)
const isDetailsComplaintDrawerOpen = ref(false)
const isConfirmDeletePopupVisible = ref(false)
const isLoading = ref(false)
const chatContainerRef = ref<HTMLElement | null>(null)
const menu = ref(false)

const closeDeletePopup = () => (isConfirmDeletePopupVisible.value = false)

const headers = ref([
  { title: 'ID', key: '_id', sortable: false },
  { title: 'Title', key: 'title', sortable: false },
  { title: 'Category', key: 'category', sortable: false },
  // { title: 'Priority', key: 'priority' , sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Created At', key: 'createdAt', sortable: false },
  { title: t('actions'), key: '', sortable: false },
])

const items = computed(() => complaintsStore.allComplaints)
const totalItems = computed(() => complaintsStore.paginationInfo?.total ?? 0)
const loading = computed(() => complaintsStore.isLoading)

const stats = computed(
  () => complaintsStore.stats ?? { totalComplaints: 0, openComplaints: 0, solvedComplaints: 0 },
)

const initialLoading = ref(true)

const fetchComplaints = async () => {
  await complaintsStore.fetchComplaints({
    page: String(page.value),
    limit: String(itemsPerPage.value),
  })
  if (complaintsStore.paginationInfo && complaintsStore.paginationInfo.page !== page.value) {
    page.value = Number(complaintsStore.paginationInfo.page)
  }
  const totalPages = Math.ceil((complaintsStore.paginationInfo?.total ?? 0) / itemsPerPage.value)
  if (page.value > totalPages && totalPages > 0) {
    page.value = totalPages
  }
}

const statusLabel = (status: string) => {
  return statusOptions.find((s) => s.label === status)?.label ?? status
}

const selectStatus = (status: string) => {
  editableStatus.value = status as ComplaintStatus
  menu.value = false
}

const saveStatus = async () => {
  if (!selectedComplaint.value) return

  try {
    await complaintsStore.updateComplaint(selectedComplaint.value._id, {status: editableStatus.value})
    selectedComplaint.value.status = editableStatus.value // Update local state
    isDetailsComplaintDrawerOpen.value = false 
    toastSuccessMessage(t('toastUpdateStatusTitle'), t('toastUpdateStatusDescription'))
  } catch (error) {
    console.error('Error updating status:', error)
  }
}

function statusColor(status: string): string {
  switch (status) {
    case 'pending':
      return '#f59e0b' // amber
    case 'in_progress':
      return '#3b82f6' // blue
    case 'resolved':
      return '#10b981' // green
    case 'rejected':
      return '#ef4444' // red
    case 'closed':
      return '#6b7280' // gray
    default:
      return '#9ca3af' // fallback gray
  }
}

const statusBg = (status: string) => {
  switch (status) {
    case 'pending':
      return '#eff6ff'
    case 'in_progress':
      return '#dbf4ff' // light blue
    case 'resolved':
      return '#ecfdf5'
    case 'rejected':
      return '#fee2e2' // red
    case 'closed':
      return '#f3f4f6' // gray
    default:
      return '#f3f4f6'
  }
}

function scrollToBottom() {
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

const viewDetails = async (item: any) => {
  console.log('[viewDetails] Called for ID:', item._id)

  selectedComplaint.value = null
  isLoading.value = true
  isDetailsComplaintDrawerOpen.value = true

  try {
    const complaint = await complaintsStore.fetchComplaint(item._id)
    console.log('[viewDetails] Complaint fetched:', complaint)

    selectedComplaint.value = complaint as IComplaint
  } catch (err) {
    console.error('[viewDetails] Error fetching complaint:', err)
  } finally {
    isLoading.value = false
    console.log('[viewDetails] isLoading = false')
    nextTick(() => scrollToBottom()) // scroll after DOM updates
  }
}

function deleteComplaint(item: any) {
  selectedComplaint.value = item as IComplaint
  isDeleteComplaintDrawerOpen.value = true
}

const onDeleteButtonPressed = async (selectedComplaintId: string) => {
  if (!selectedComplaintId) {
    console.error('No complaint selected for deletion')
    return
  }
  await complaintsStore.deleteComplaint(selectedComplaintId)
  toastDeleteMessage(t('toastDeleteComplaintTitle'), t('toastDeleteComplaintDescription'))
  isDeleteComplaintDrawerOpen.value = false
  isConfirmDeletePopupVisible.value = false
}

const fetchStats = async () => {
  await complaintsStore.getComplaintsStatsPage()
}

const sendMessage = async () => {
  if (!selectedComplaint.value || !message.value.trim()) return

  try {
    const res = await complaintsStore.sendResponseToComplaint(
      selectedComplaint.value._id,
      message.value.trim(),
    )
    selectedComplaint.value.responses = res.data.responses
    message.value = '' // Clear the input after sending
    nextTick(() => scrollToBottom()) // Scroll to bottom after sending
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

onMounted(async () => {
  try {
    await Promise.all([fetchComplaints(), fetchStats()])
  } catch (error) {
    console.error('Error loading initial data:', error)
  } finally {
    initialLoading.value = false
  }
})

watch([page, itemsPerPage], fetchComplaints)

watch([isDetailsComplaintDrawerOpen, tab], ([drawerOpen, currentTab]) => {
  if (drawerOpen && currentTab === 'chat') {
    nextTick(() => scrollToBottom())
  }
})
// function statusColor(status: string) {
//   return (
//     {
//       pending: 'orange',
//       in_progress: 'blue',
//       resolved: 'green',
//       rejected: 'red',
//       closed: 'grey',
//     }[status?.toLowerCase()] ?? 'primary'
//   )
// }

const statusOptions = [
  { label: 'pending' },
  { label: 'in_progress' },
  { label: 'resolved' },
  { label: 'rejected' },
  { label: 'closed' },
]

const editableStatus = ref(selectedComplaint.value?.status ?? 'pending')
watch(
  () => selectedComplaint.value?.status,
  (newStatus) => {
    editableStatus.value = newStatus ?? 'pending'
  },
)
</script>
<style scoped lang="scss">
.status-select {
  min-width: 120px;
  max-width: 180px;
  margin-left: 8px;
}
.status-select-menu {
  border-radius: 8px;
  overflow: hidden;
}
.chat-action-btns {
  padding-top: 15px;
  border-top: 1px solid rgb(var(--v-theme-lightGray));
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  margin: 15px 15px;
  gap: 10px;
  width: 370px;
  z-index: 3;

  .send-button {
    width: fit-content;
  }
}

#messageInput {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 10px;
  width: 80%;
}

#messageInput:focus {
  outline: none;
}

.chat {
  padding: 10px;
  background-color: #f7f7f7;
  height: 70dvh !important;
  z-index: 1;
  overflow: scroll;
  overflow-x: hidden;
}

.chat-complaint {
  background-color: #ebf1ff;
  border-radius: 8px;
  width: 70%;
  display: flex;
  justify-content: start;
  flex-direction: column;
}
.drawer-complaint-date {
  color: #5c5c5c;
  margin: 0 15px;
  font-size: 11px;
  font-style: normal;
  font-weight: 500;
}
.complaint-chat-message-sender {
  margin: 0 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  padding-bottom: 10px;

  span {
    font-size: 12px;
    font-weight: 600;
    background-color: #ffecc0;
    display: flex;
    justify-content: center;
    border-radius: 50%;
    padding: 10px;
    width: 25px;
    height: 25px;
    align-items: center;
  }
}

// show the answer in a different color and in the end of the message oppsite to the sender
.answer {
  margin: 10px 0;
  display: flex;
  justify-content: end;
  align-items: center;
  padding-bottom: 10px;
  border-radius: 8px;
  background-color: #ffff;
  width: 70%;
  padding: 10px;
}

.divider {
  margin: 10px;
}

.message-wrapper {
  display: flex;
  width: 100%;
  margin-bottom: 8px;
}

.align-left {
  justify-content: flex-start;
}

.align-right {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  word-wrap: break-word;
}

// Question (customer)
.message-question {
  background-color: #ebf1ff;
  color: #000;
  text-align: left;
  border-top-left-radius: 0;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  display: flex;
  flex-direction: column;
}

// Answer (admin)
.message-answer {
  background-color: #ffffff;
  color: #5c5c5c;
  text-align: left;
  border-top-right-radius: 0;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  display: flex;
  flex-direction: column;
}

.message-date {
  font-size: 10px;
  color: #a1a1a1;
  margin-top: 10px;
}

.status-btn {
  text-transform: none;
  padding: 6px 12px;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
}
.status-dot {
  height: 8px;
  width: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}
.status-list {
  min-width: 200px;
  padding: 8px;
}
.status-item {
  border-radius: 12px;
  margin-bottom: 4px;
  padding: 8px 12px;
}
</style>
