<template>
  <div class="min-h-full pb-8">
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="text-white text-2xl" @click="router.back()">←</button>
      <h1 class="text-white text-xl font-bold">Career Advisors</h1>
    </div>

    <div class="px-4 py-5">
      <PaywallGate plan="premium" title="Career Advisors" message="Upgrade to Premium to book 1-to-1 sessions with NHS career specialists.">
        <div class="space-y-4">
          <!-- Advisor list -->
          <div v-if="!selectedAdvisor">
            <p class="text-sm text-gray-500 mb-3">Choose an advisor to book a session with.</p>
            <div v-if="loading" class="space-y-3">
              <SkeletonCard v-for="i in 3" :key="i" />
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="advisor in advisors"
                :key="advisor.id"
                class="card flex items-center gap-4 cursor-pointer active:scale-98 transition-transform"
                @click="selectAdvisor(advisor)"
              >
                <div class="w-14 h-14 rounded-full bg-nhs-blue flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {{ initials(advisor.name) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-900">{{ advisor.name }}</p>
                  <p class="text-sm text-gray-500 truncate">{{ advisor.specialty }}</p>
                  <div class="flex gap-1 mt-1 flex-wrap">
                    <span v-for="tag in advisor.tags" :key="tag" class="badge-blue text-xs">{{ tag }}</span>
                  </div>
                </div>
                <span class="text-gray-300 text-xl">›</span>
              </div>
            </div>
          </div>

          <!-- Availability picker -->
          <div v-else-if="!bookingConfirmed">
            <button class="flex items-center gap-2 text-nhs-blue text-sm mb-4" @click="selectedAdvisor = null; slots = []">
              ← Back to advisors
            </button>

            <div class="card mb-4 flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-nhs-blue flex items-center justify-center text-white font-bold">
                {{ initials(selectedAdvisor.name) }}
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ selectedAdvisor.name }}</p>
                <p class="text-sm text-gray-500">{{ selectedAdvisor.specialty }}</p>
              </div>
            </div>

            <p class="font-semibold text-gray-800 mb-3">Available slots</p>
            <div v-if="loadingSlots" class="text-center py-8 text-gray-400">Loading availability…</div>
            <div v-else-if="slots.length === 0" class="text-center py-8 text-gray-400">
              No slots available at the moment. Check back later.
            </div>
            <div v-else class="grid grid-cols-2 gap-2">
              <button
                v-for="slot in slots"
                :key="slot.id"
                class="border-2 rounded-xl p-3 text-sm text-left transition-all"
                :class="selectedSlot?.id === slot.id
                  ? 'border-nhs-blue bg-blue-50 text-nhs-blue'
                  : 'border-gray-200 text-gray-700'"
                @click="selectedSlot = slot"
              >
                <p class="font-semibold">{{ formatSlotDate(slot.starts_at) }}</p>
                <p class="text-xs mt-0.5 text-gray-500">{{ formatSlotTime(slot.starts_at) }}</p>
              </button>
            </div>

            <div v-if="selectedSlot" class="mt-4 space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Topic / Notes (optional)</label>
                <textarea v-model="bookingNotes" class="input h-20 resize-none" placeholder="What would you like to discuss?" />
              </div>
              <button class="btn-primary" :disabled="booking" @click="book">
                {{ booking ? 'Booking…' : 'Confirm Booking' }}
              </button>
            </div>
          </div>

          <!-- Confirmation -->
          <div v-else class="text-center py-10 space-y-4">
            <div class="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto text-4xl">✓</div>
            <h2 class="text-xl font-bold text-gray-900">Booking Confirmed!</h2>
            <p class="text-gray-500 text-sm">Your session has been scheduled. You'll receive a confirmation notification.</p>
            <button class="btn-primary mt-4" @click="resetBooking">Book Another Session</button>
          </div>

          <!-- My appointments -->
          <div v-if="appointments.length && !selectedAdvisor">
            <p class="font-semibold text-gray-800 mb-2">My Appointments</p>
            <div
              v-for="apt in appointments"
              :key="apt.id"
              class="card flex items-center gap-3 mb-2"
            >
              <span class="text-2xl">📅</span>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 text-sm">{{ apt.advisor_name }}</p>
                <p class="text-xs text-gray-500">{{ formatFull(apt.scheduled_at) }}</p>
              </div>
              <span :class="apt.status === 'confirmed' ? 'badge-green' : 'badge-amber'" class="text-xs capitalize">
                {{ apt.status }}
              </span>
            </div>
          </div>
        </div>
      </PaywallGate>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/client'
import PaywallGate from '@/components/PaywallGate.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'

interface Advisor     { id: number; name: string; specialty: string; tags?: string[] }
interface Slot        { id: number; starts_at: string }
interface Appointment { id: number; advisor_name: string; scheduled_at: string; status: string }

const router           = useRouter()
const advisors         = ref<Advisor[]>([])
const appointments     = ref<Appointment[]>([])
const slots            = ref<Slot[]>([])
const loading          = ref(true)
const loadingSlots     = ref(false)
const booking          = ref(false)
const selectedAdvisor  = ref<Advisor | null>(null)
const selectedSlot     = ref<Slot | null>(null)
const bookingNotes     = ref('')
const bookingConfirmed = ref(false)

const initials = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

const formatSlotDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })
const formatSlotTime = (d: string) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const formatFull     = (d: string) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

async function selectAdvisor(advisor: Advisor) {
  selectedAdvisor.value = advisor
  selectedSlot.value    = null
  loadingSlots.value    = true
  try {
    const res  = await api.get(`/advisor/advisors/${advisor.id}/availability`)
    slots.value = res.data.data
  } finally { loadingSlots.value = false }
}

async function book() {
  if (!selectedSlot.value || !selectedAdvisor.value) return
  booking.value = true
  try {
    await api.post('/advisor/appointments', {
      advisor_id:       selectedAdvisor.value.id,
      availability_id:  selectedSlot.value.id,
      notes:            bookingNotes.value || undefined,
    })
    bookingConfirmed.value = true
    await loadAppointments()
  } finally { booking.value = false }
}

function resetBooking() {
  selectedAdvisor.value  = null
  selectedSlot.value     = null
  bookingNotes.value     = ''
  bookingConfirmed.value = false
  slots.value            = []
}

async function loadAppointments() {
  const res          = await api.get('/advisor/appointments')
  appointments.value = res.data.data
}

onMounted(async () => {
  try {
    const [advRes] = await Promise.all([
      api.get('/advisor/advisors'),
      loadAppointments(),
    ])
    advisors.value = advRes.data.data
  } finally { loading.value = false }
})
</script>
