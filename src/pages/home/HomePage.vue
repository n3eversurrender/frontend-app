<template>
  <q-page class="q-pa-md">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-center" style="min-height: calc(100vh - 120px)">
      <div class="text-center">
        <q-spinner-circle color="primary" size="48px" />
        <div class="text-grey-6 q-mt-sm">Loading dashboard data...</div>
      </div>
    </div>

    <template v-else-if="isUserAdmin">
      <!-- ===== ADMIN HEADER ===== -->
      <div class="header-box q-px-md q-pt-md q-pb-lg">
        <div class="row items-center justify-between text-white q-mb-md">
          <div class="text-h6 text-weight-bold">Admin Dashboard</div>
          <q-btn flat round dense icon="notifications" size="sm" color="white" to="/notifications">
            <q-badge v-if="unreadCount > 0" color="red" floating rounded />
          </q-btn>
        </div>

        <!-- Admin Greeting Card -->
        <q-card flat bordered class="dss-score-card q-mb-sm">
          <q-card-section class="q-pa-md row items-center no-wrap">
            <div class="q-mr-md">
              <q-avatar size="50px" color="primary" text-color="white" icon="admin_panel_settings" />
            </div>
            <div>
              <div class="text-subtitle1 text-weight-bold text-grey-9">Welcome Back, Admin!</div>
              <div class="text-caption text-grey-6" style="font-size: 11px; line-height: 1.3;">You are in System Overview Mode. Monitor and manage application core data.</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ===== ADMIN SYSTEM STATS ===== -->
      <div class="q-mt-md">
        <div class="text-subtitle2 text-weight-bold q-mb-sm">System Overview</div>
        <div class="row q-col-gutter-md">
          <!-- Total Users -->
          <div class="col-6">
            <q-card flat bordered class="power-monitor-card text-center q-pa-md">
              <q-icon name="people" size="32px" color="primary" />
              <div class="text-h5 text-weight-bolder text-grey-9 q-mt-xs">{{ adminStats.users }}</div>
              <div class="text-caption text-grey-6 text-weight-medium" style="font-size: 11px;">Registered Users</div>
            </q-card>
          </div>

          <!-- Total Households -->
          <div class="col-6">
            <q-card flat bordered class="power-monitor-card text-center q-pa-md">
              <q-icon name="home" size="32px" color="green" />
              <div class="text-h5 text-weight-bolder text-grey-9 q-mt-xs">{{ adminStats.households }}</div>
              <div class="text-caption text-grey-6 text-weight-medium" style="font-size: 11px;">Households</div>
            </q-card>
          </div>

          <!-- Total Devices -->
          <div class="col-6">
            <q-card flat bordered class="power-monitor-card text-center q-pa-md">
              <q-icon name="devices" size="32px" color="orange" />
              <div class="text-h5 text-weight-bolder text-grey-9 q-mt-xs">{{ adminStats.devices }}</div>
              <div class="text-caption text-grey-6 text-weight-medium" style="font-size: 11px;">Devices Monitored</div>
            </q-card>
          </div>

          <!-- Total Tariff Classes -->
          <div class="col-6">
            <q-card flat bordered class="power-monitor-card text-center q-pa-md">
              <q-icon name="bolt" size="32px" color="yellow-9" />
              <div class="text-h5 text-weight-bolder text-grey-9 q-mt-xs">{{ adminStats.tariffs }}</div>
              <div class="text-caption text-grey-6 text-weight-medium" style="font-size: 11px;">Tariff Classes</div>
            </q-card>
          </div>
        </div>
      </div>

      <!-- ===== QUICK ACTIONS ===== -->
      <div class="q-mt-lg q-mb-lg">
        <div class="text-subtitle2 text-weight-bold q-mb-sm">Quick Management</div>
        <q-card flat bordered class="top-devices-card q-pa-sm">
          <q-list separator>
            <q-item clickable v-ripple to="/management" class="q-py-md">
              <q-item-section avatar>
                <q-avatar color="green-1" text-color="green-8" icon="settings_suggest" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-body2">Manage Core Data</q-item-label>
                <q-item-label caption>Edit device categories and active tariff classes</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/profile" class="q-py-md">
              <q-item-section avatar>
                <q-avatar color="blue-1" text-color="blue-8" icon="person" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-body2">Admin Profile</q-item-label>
                <q-item-label caption>Change password and manage profile details</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </template>

    <template v-else>
      <!-- ===== HEADER ===== -->
      <div class="header-box q-px-md q-pt-md q-pb-lg">
        <div class="row items-center justify-between text-white q-mb-md">
          <div class="text-h6 text-weight-bold">Dashboard</div>
          <q-btn flat round dense icon="notifications" size="sm" color="white" to="/notifications">
            <q-badge v-if="unreadCount > 0" color="red" floating rounded />
          </q-btn>
        </div>

        <!-- ===== DSS Efficiency Score Card ===== -->
        <q-card flat bordered class="dss-score-card q-mb-sm">
          <q-card-section class="q-pa-sm row items-center no-wrap">
            <div class="q-mr-md">
              <q-circular-progress
                show-value
                :value="dssScore"
                size="64px"
                :thickness="0.16"
                :color="getScoreColor(dssScore)"
                track-color="grey-2"
                class="text-weight-bold"
                :class="`text-${getScoreColor(dssScore)}`"
              >
                {{ dssScore }}
              </q-circular-progress>
            </div>
            <div class="column justify-center" style="flex: 1">
              <div class="text-caption text-grey-7" style="font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase;">
                DSS Efficiency Score
              </div>
              <div class="text-subtitle2 text-weight-bold" :class="`text-${getScoreColor(dssScore)}-9`">
                {{ getScoreLabel(dssScore) }}
              </div>
              <div class="text-caption text-grey-6" style="font-size: 10px; line-height: 1.2;">
                {{ getScoreAdvice(dssScore) }}
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- ===== Total Usage Card ===== -->
        <q-card flat bordered class="usage-card">
          <q-card-section class="q-pa-md">
            <!-- Header -->
            <div class="row justify-between items-center">
              <div class="text-subtitle2 text-weight-bold text-grey-9">Total Usage</div>
              <div class="text-caption text-grey-5 text-weight-medium">Today vs Yesterday</div>
            </div>

            <!-- Horizontal Line -->
            <div class="usage-divider-h q-my-sm"></div>

            <!-- Main Content (Side-by-Side Today vs Yesterday) -->
            <div class="row q-mt-md items-center text-center">
              <!-- Left Side: Today -->
              <div class="col">
                <div class="text-caption text-grey-6 text-uppercase text-weight-bold" style="font-size: 10px; letter-spacing: 0.5px;">
                  Today
                </div>
                <div class="text-h5 text-weight-bolder text-grey-9 q-my-xs">
                  Rp {{ formatRupiah(costToday) }}
                </div>
                <div class="text-caption text-grey-7 text-weight-medium" style="font-size: 11px">
                  {{ kwhToday.toFixed(2) }} kWh
                </div>
              </div>

              <!-- Divider Line -->
              <div class="usage-divider-v"></div>

              <!-- Right Side: Yesterday -->
              <div class="col">
                <div class="text-caption text-grey-6 text-uppercase text-weight-bold" style="font-size: 10px; letter-spacing: 0.5px;">
                  Yesterday
                </div>
                <div class="text-h5 text-weight-bolder text-grey-8 q-my-xs">
                  Rp {{ formatRupiah(costYesterday) }}
                </div>
                <div class="text-caption text-grey-7 text-weight-medium" style="font-size: 11px">
                  {{ kwhYesterday.toFixed(2) }} kWh
                </div>
              </div>
            </div>

          </q-card-section>
        </q-card>

        <!-- ===== DSS Smart Insight Card ===== -->
        <q-card
          flat
          class="insight-card q-mt-sm"
          :class="`insight-card--${currentInsight.status}`"
          @mouseenter="pauseAutoCycle"
          @mouseleave="resumeAutoCycle"
        >
          <q-card-section class="q-pa-md">
            <!-- Header: DSS Badge & Navigation -->
            <div class="row justify-between items-center q-mb-sm">
              <div class="row items-center q-gutter-xs">
                <div class="dss-pulse-dot" :class="`dss-pulse-dot--${currentInsight.status}`"></div>
                <span class="text-caption text-weight-bold text-uppercase tracking-wider dss-header-text">
                  DSS Smart Insight
                </span>
              </div>
              <div class="row items-center q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  size="xs"
                  icon="chevron_left"
                  class="insight-nav-btn"
                  @click.stop="prevInsight"
                />
                <span class="text-caption text-weight-medium insight-pager-text">
                  {{ currentInsightIndex + 1 }}/{{ insights.length }}
                </span>
                <q-btn
                  flat
                  round
                  dense
                  size="xs"
                  icon="chevron_right"
                  class="insight-nav-btn"
                  @click.stop="nextInsight"
                />
              </div>
            </div>

            <!-- Content: Icon + Title & Description -->
            <div class="row items-start no-wrap cursor-pointer" @click="goToUsage">
              <div class="insight-icon-container flex flex-center q-mr-md">
                <q-icon :name="currentInsight.icon" size="20px" />
              </div>

              <div class="column justify-center" style="flex: 1; min-width: 0;">
                <div class="text-body2 text-weight-bold text-grey-9 line-clamp-1">
                  {{ currentInsight.title }}
                </div>
                <div class="text-caption text-grey-8 q-mt-xs text-height-base insight-description">
                  {{ currentInsight.description }}
                </div>
              </div>

              <!-- RIGHT: Action Arrow -->
              <div class="insight-action-arrow flex flex-center q-ml-sm align-self-center">
                <q-icon name="chevron_right" size="18px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ===== MONTHLY BUDGET & DSS ANALYSIS CARD ===== -->
      <div class="q-mt-md">
        <div class="text-subtitle2 text-weight-bold q-mb-sm">Budget Progress & DSS Analysis</div>
        <q-card flat bordered class="power-monitor-card">
          <q-card-section class="q-pa-md">
            <!-- Header Row -->
            <div class="row justify-between items-center q-mb-sm">
              <div class="text-subtitle2 text-weight-bold text-grey-9">Monthly Performance</div>
              <div
                class="q-px-sm q-py-xs rounded-borders text-weight-bold text-uppercase"
                :style="
                  dssMonthlyStatus === 'PENDING'
                    ? 'background: #f5f5f5; color: #757575; border: 1px solid #e0e0e0; font-size: 10px; letter-spacing: 0.5px;'
                    : dssMonthlyStatus === 'EFFICIENT'
                    ? 'background: #eafaf1; color: #15803d; border: 1px solid rgba(34, 197, 94, 0.2); font-size: 10px; letter-spacing: 0.5px;'
                    : dssMonthlyStatus === 'STABLE'
                    ? 'background: #eff6ff; color: #1d4ed8; border: 1px solid rgba(59, 130, 246, 0.2); font-size: 10px; letter-spacing: 0.5px;'
                    : 'background: #fdf2f2; color: #b91c1c; border: 1px solid rgba(239, 68, 68, 0.2); font-size: 10px; letter-spacing: 0.5px;'
                "
              >
                {{ dssMonthlyStatusLabel }}
              </div>
            </div>

            <!-- Divider Line -->
            <div class="usage-divider-h q-my-sm"></div>

            <!-- Content Row (Circular Progress left, Comparison right) -->
            <div class="row q-col-gutter-md items-center q-mt-xs">
              <!-- Left Column: Circular Budget Progress -->
              <div class="col-12 col-sm-5 text-center">
                <div class="text-caption text-weight-bold text-grey-7 text-uppercase q-mb-sm" style="font-size: 10px; letter-spacing: 0.5px;">
                  Budget: {{ formatMonthName(currentMonthPrefix) }}
                </div>
                <q-circular-progress
                  show-value
                  :value="budgetSpentPercentage"
                  size="100px"
                  :thickness="0.12"
                  :color="getBudgetProgressColor()"
                  track-color="grey-2"
                  class="text-weight-bold"
                  :class="`text-${getBudgetProgressColor()}`"
                >
                  <div class="text-center">
                    <div class="text-subtitle2 text-weight-bold" style="font-size: 14px;">{{ budgetSpentPercentage }}%</div>
                    <div class="text-caption text-grey-7" style="font-size: 9px; line-height: 1;">Spent</div>
                  </div>
                </q-circular-progress>
                <div class="text-caption text-weight-bold text-grey-9 q-mt-xs" style="font-size: 11.5px;">
                  Rp {{ formatRupiah(kwhThisMonth * pricePerKwh) }} / Rp {{ formatRupiah(monthlyBudgetLimit) }}
                </div>
                <div class="text-caption text-grey-6" style="font-size: 9.5px; line-height: 1.2;">
                  Limit: Rp {{ formatRupiah(monthlyBudgetLimit) }} (900 kWh)
                </div>
              </div>

              <!-- Right Column: DSS MoM Analysis -->
              <div class="col-12 col-sm-7 q-pl-sm-md">
                <div class="text-caption text-weight-bold text-grey-7 text-uppercase q-mb-sm" style="font-size: 10px; letter-spacing: 0.5px;">
                  Comparison: {{ formatMonthName(currentMonthPrefix) }} vs {{ formatMonthName(lastMonthPrefix) }}
                </div>
                <!-- Status Title -->
                <div class="q-mb-sm">
                  <template v-if="kwhLastMonth === 0">
                    <div class="text-subtitle2 text-weight-bold text-grey-8">Building Baseline...</div>
                    <div class="text-caption text-grey-6" style="font-size: 11px; line-height: 1.2;">
                      Accumulating logs to build comparison baseline.
                    </div>
                  </template>
                  <template v-else-if="monthlyCostDiff < 0">
                    <div class="text-subtitle1 text-weight-bolder text-positive">
                      Saved Rp {{ formatRupiah(Math.abs(monthlyCostDiff)) }}!
                    </div>
                    <div class="text-caption text-grey-7" style="font-size: 11px; line-height: 1.2;">
                      Consumption is {{ monthlyPercentDiff }}% lower than last month.
                    </div>
                  </template>
                  <template v-else-if="monthlyCostDiff === 0">
                    <div class="text-subtitle1 text-weight-bolder text-blue-9">
                      Stable Consumption
                    </div>
                    <div class="text-caption text-grey-7" style="font-size: 11px; line-height: 1.2;">
                      Matching last month's pattern perfectly.
                    </div>
                  </template>
                  <template v-else>
                    <div class="text-subtitle1 text-weight-bolder text-negative">
                      +Rp {{ formatRupiah(Math.abs(monthlyCostDiff)) }} Increase
                    </div>
                    <div class="text-caption text-grey-7" style="font-size: 11px; line-height: 1.2;">
                      Bills increased by {{ monthlyPercentDiff }}% vs last month.
                    </div>
                  </template>
                </div>

                <!-- Progress MoM Comparison Bar -->
                <div class="q-py-xs bg-grey-1 rounded-borders q-px-sm" v-if="kwhLastMonth > 0">
                  <div class="row justify-between items-center text-caption text-grey-7 q-mb-xs" style="font-size: 10px;">
                    <span>MoM Ratio</span>
                    <span class="text-weight-bold text-grey-9">{{ ((costThisMonth / (costLastMonth || 1)) * 100).toFixed(0) }}%</span>
                  </div>
                  <q-linear-progress
                    :value="Math.min(1, costThisMonth / (costLastMonth || 1))"
                    :color="dssMonthlyStatusColor"
                    class="rounded-borders"
                    style="height: 6px;"
                  />
                  <div class="row justify-between text-caption text-grey-6 q-mt-xs" style="font-size: 9px;">
                    <span>{{ formatMonthName(currentMonthPrefix) }}: Rp {{ formatRupiah(costThisMonth) }} vs {{ formatMonthName(lastMonthPrefix) }}: Rp {{ formatRupiah(costLastMonth) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- DSS Recommendation Box -->
            <div class="dss-rec-box q-pa-sm q-mt-md rounded-borders">
              <div class="row items-start no-wrap q-gutter-sm">
                <q-icon name="lightbulb" size="18px" :color="dssMonthlyStatusColor" class="q-mt-xs flex-shrink-0" />
                <div class="column">
                  <span class="text-caption text-weight-bold text-grey-8" style="font-size: 10.5px;">
                    DSS Recommendation
                  </span>
                  <p class="text-caption text-grey-7 q-mt-xs q-mb-none text-height-base" style="font-size: 11px; line-height: 1.4;">
                    {{ dssMonthlyAdvice }}
                  </p>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ===== TOP SAVING PRIORITIES ===== -->
      <div class="q-mt-md q-mb-lg">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle2 text-weight-bold text-grey-9">Top Saving Priorities</div>
          <q-btn flat dense size="sm" label="Details" color="primary" no-caps @click="goToUsage" />
        </div>
        <q-card flat bordered class="top-devices-card">
          <q-list v-if="sawDeviceRanking.length > 0">
            <q-item v-for="(item, index) in sawDeviceRanking.slice(0, 5)" :key="item.id" class="device-item column q-py-md">
              <!-- Top Row: Rank, Icon, Name, Wattage, and SAW Score -->
              <div class="row items-center justify-between no-wrap full-width q-mb-xs">
                <div class="row items-center q-gutter-sm">
                  <!-- Rank Badge -->
                  <div
                    class="flex flex-center text-weight-bolder text-caption rounded-borders"
                    :style="
                      index === 0
                        ? 'width: 24px; height: 24px; background: #fee2e2; color: #b91c1c; font-size: 10px;'
                        : index === 1
                        ? 'width: 24px; height: 24px; background: #fff3c7; color: #d97706; font-size: 10px;'
                        : 'width: 24px; height: 24px; background: #eafaf1; color: #15803d; font-size: 10px;'
                    "
                  >
                    #{{ index + 1 }}
                  </div>
                  <!-- Device Icon with background circle -->
                  <q-avatar :color="getDeviceColor(item.name) + '-1'" :text-color="getDeviceColor(item.name)" size="28px">
                    <q-icon :name="getDeviceIcon(item.name)" size="14px" />
                  </q-avatar>
                  <!-- Device Name & Category -->
                  <div class="column">
                    <span class="text-body2 text-weight-bold text-grey-9">{{ item.name }}</span>
                    <span class="text-caption text-grey-6" style="font-size: 10px;">{{ getCategoryName(item.category_id) }}</span>
                  </div>
                </div>

                <!-- Right Side: Wattage and SAW Preference Score -->
                <div class="text-right column">
                  <span class="text-body2 text-weight-bold text-grey-9">{{ item.wattage }} W</span>
                  <span
                    class="text-weight-bold"
                    style="font-size: 11px;"
                    :class="
                      item.score >= 0.7
                        ? 'text-negative'
                        : item.score >= 0.4
                        ? 'text-warning'
                        : 'text-positive'
                    "
                  >
                    Saving Priority: {{ (item.score * 100).toFixed(0) }}%
                  </span>
                </div>
              </div>

              <!-- Bottom Row: Priority Progress Bar -->
              <div class="full-width q-mt-xs">
                <div class="row justify-between items-center q-mb-xs" style="font-size: 9.5px;">
                  <span class="text-grey-6">
                    This month: {{ item.kwh.toFixed(1) }} kWh · {{ item.hours.toFixed(1) }} hrs
                  </span>
                </div>
                <q-linear-progress
                  :value="item.score"
                  :color="
                    item.score >= 0.7
                      ? 'negative'
                      : item.score >= 0.4
                      ? 'warning'
                      : 'positive'
                  "
                  class="rounded-borders"
                  style="height: 7px;"
                />
              </div>
            </q-item>
          </q-list>
          <div v-else class="text-center q-pa-md text-grey-6 text-caption">
            No device usage data logged yet for analysis.
          </div>
        </q-card>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { useNotification } from 'src/composables/useNotification';
import { useAuth } from 'src/composables/useAuth';

const router = useRouter();
const { unreadCount, fetchUnreadCount } = useNotification();
const { isAdmin } = useAuth();
const isUserAdmin = isAdmin();

const adminStats = ref({
  users: 0,
  households: 0,
  devices: 0,
  tariffs: 0,
});

// Loading state
const loading = ref(true);

// API Interfaces
interface DbDevice {
  id: number;
  name: string;
  wattage: number;
  household_id: number;
  category_id: number;
  is_active: boolean;
}

interface DbHousehold {
  id: number;
  name: string;
  address: string;
  tariff_class_id: number;
}

interface DbTariffClass {
  id: number;
  code: string;
  type: string;
  price_per_kwh: number;
  capacity_va: number;
}

interface DbDeviceUsage {
  id: number;
  device_id: number;
  usage_date: string;
  usage_hours: number;
  estimated_kwh: number;
  deviceName: string;
}

interface DbCategory {
  id: number;
  name: string;
}

interface Insight {
  id: number;
  status: 'normal' | 'warning' | 'danger' | 'recommendation';
  title: string;
  description: string;
  icon: string;
  recommendationId?: number;
}

// Data States
const devices = ref<DbDevice[]>([]);
const households = ref<DbHousehold[]>([]);
const tariffClasses = ref<DbTariffClass[]>([]);
const categories = ref<DbCategory[]>([]);
const allUsages = ref<DbDeviceUsage[]>([]);

// Target limits configuration
const DAILY_GOAL_KWH = 30;
const MONTHLY_GOAL_KWH = 900;

// Get active household information
const activeHousehold = computed(() => households.value[0] || null);
const activeTariff = computed(() => {
  const household = activeHousehold.value;
  if (!household) return null;
  return tariffClasses.value.find((t) => t.id === household.tariff_class_id) || null;
});
const pricePerKwh = computed(() => (activeTariff.value ? Number(activeTariff.value.price_per_kwh) : 1444));
const monthlyBudgetLimit = computed(() => MONTHLY_GOAL_KWH * pricePerKwh.value);

// Date ranges
const todayStr = computed(() => new Date().toLocaleDateString('sv').slice(0, 10)); // YYYY-MM-DD local
const yesterdayStr = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('sv').slice(0, 10);
});

const currentMonthPrefix = computed(() => new Date().toLocaleDateString('sv').slice(0, 7));


// Actual kWh spent per period
const kwhToday = computed(() => {
  return allUsages.value
    .filter((u) => u.usage_date === todayStr.value)
    .reduce((sum, u) => sum + Number(u.estimated_kwh), 0);
});

const kwhYesterday = computed(() => {
  return allUsages.value
    .filter((u) => u.usage_date === yesterdayStr.value)
    .reduce((sum, u) => sum + Number(u.estimated_kwh), 0);
});

const kwhThisMonth = computed(() => {
  return allUsages.value
    .filter((u) => u.usage_date.startsWith(currentMonthPrefix.value))
    .reduce((sum, u) => sum + Number(u.estimated_kwh), 0);
});

const lastMonthPrefix = computed(() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toLocaleDateString('sv').slice(0, 7);
});

const kwhLastMonth = computed(() => {
  return allUsages.value
    .filter((u) => u.usage_date.startsWith(lastMonthPrefix.value))
    .reduce((sum, u) => sum + Number(u.estimated_kwh), 0);
});

// Monthly Comparison calculations
const costThisMonth = computed(() => kwhThisMonth.value * pricePerKwh.value);
const costLastMonth = computed(() => kwhLastMonth.value * pricePerKwh.value);

const monthlyCostDiff = computed(() => costThisMonth.value - costLastMonth.value);

const monthlyPercentDiff = computed(() => {
  if (costLastMonth.value === 0) return 100;
  return Math.round((Math.abs(monthlyCostDiff.value) / costLastMonth.value) * 100);
});

// DSS Monthly Status and Recommendations
const dssMonthlyStatus = computed(() => {
  if (kwhLastMonth.value === 0) return 'PENDING';
  if (monthlyCostDiff.value < 0) return 'EFFICIENT';
  if (monthlyCostDiff.value === 0) return 'STABLE';
  return 'WARNING';
});

const dssMonthlyStatusLabel = computed(() => {
  const status = dssMonthlyStatus.value;
  if (status === 'PENDING') return 'Awaiting Data';
  if (status === 'EFFICIENT') return 'Highly Efficient';
  if (status === 'STABLE') return 'Stable';
  return 'Over Consumption';
});

const dssMonthlyStatusColor = computed(() => {
  const status = dssMonthlyStatus.value;
  if (status === 'PENDING') return 'grey-6';
  if (status === 'EFFICIENT') return 'positive';
  if (status === 'STABLE') return 'blue';
  return 'negative';
});

const dssMonthlyAdvice = computed(() => {
  if (kwhLastMonth.value === 0) {
    return 'We need at least one full month of historical logs to build your consumption baseline. Keep logging daily usage to unlock deep DSS comparison insights!';
  }
  
  const absDiff = Math.abs(monthlyCostDiff.value);
  const percent = monthlyPercentDiff.value;
  
  if (monthlyCostDiff.value < 0) {
    return `Excellent! You saved Rp ${formatRupiah(absDiff)} (${percent}%) compared to last month. Your energy habits are highly optimized. Keep maintaining this pattern to maximize savings.`;
  } else if (monthlyCostDiff.value === 0) {
    return 'Your energy consumption is identical to last month. To start saving, consider setting shorter operation hours for high-power devices like AC and water heaters.';
  } else {
    const topDev = topDevices.value[0];
    const deviceSuggestion = topDev 
      ? `Try reducing the usage hours of your highest power device, the "${topDev.name}" (${topDev.wattage}W).`
      : 'Review your logged devices under the Devices tab to find high-power appliances.';
    return `Warning: You spent Rp ${formatRupiah(absDiff)} (${percent}%) more than last month. ${deviceSuggestion} Reducing usage by 1 hour daily can save up to Rp 150K.`;
  }
});



// Reactively mapped values for Today vs Yesterday side-by-side
const costToday = computed(() => kwhToday.value * pricePerKwh.value);
const costYesterday = computed(() => kwhYesterday.value * pricePerKwh.value);

// Daily comparison logic removed as DSS comparison is now monthly-only

// Budget limit spent percentage
const budgetSpentPercentage = computed(() => {
  if (monthlyBudgetLimit.value === 0) return 0;
  return Math.min(100, Math.round((costThisMonth.value / monthlyBudgetLimit.value) * 100));
});



// Computed properties for lists
const topDevices = computed(() => {
  return [...devices.value].sort((a, b) => b.wattage - a.wattage).slice(0, 5);
});

function getDeviceImportance(deviceName: string): number {
  const name = deviceName.toLowerCase();
  if (name.includes('fridge') || name.includes('refrigerator') || name.includes('kulkas')) return 5;
  if (name.includes('pump') || name.includes('pompa') || name.includes('heater') || name.includes('dispenser') || name.includes('water')) return 4;
  if (name.includes('ac') || name.includes('air conditioner') || name.includes('fan') || name.includes('kipas') || name.includes('cooler')) return 3;
  if (name.includes('tv') || name.includes('television') || name.includes('computer') || name.includes('pc') || name.includes('laptop')) return 2;
  return 1; // Lights, charger, others
}

interface SawDeviceItem {
  id: number;
  name: string;
  wattage: number;
  category_id: number;
  kwh: number;
  hours: number;
  importance: number;
  score: number;
}

const sawDeviceRanking = computed<SawDeviceItem[]>(() => {
  if (devices.value.length === 0) return [];
  
  // 1. Map raw criteria values
  const rawItems = devices.value.map((device) => {
    const kwh = deviceKwhThisMonth(device.id);
    const hours = kwh > 0 ? (kwh * 1000) / device.wattage : 0;
    const importance = getDeviceImportance(device.name);
    return {
      id: device.id,
      name: device.name,
      wattage: device.wattage,
      category_id: device.category_id,
      kwh,
      hours,
      importance,
    };
  });

  // 2. Find max and min values for normalization
  const maxKwh = Math.max(...rawItems.map((d) => d.kwh), 0.01);
  const maxWatt = Math.max(...rawItems.map((d) => d.wattage), 1);
  const maxHours = Math.max(...rawItems.map((d) => d.hours), 0.01);
  const minImportance = Math.min(...rawItems.map((d) => d.importance), 1);

  // 3. Normalization & SAW preference calculations
  // Weights: W1=0.35 (kwh), W2=0.25 (watt), W3=0.20 (hours), W4=0.20 (importance cost)
  const W = [0.35, 0.25, 0.20, 0.20] as const;

  return rawItems.map((item) => {
    const r1 = item.kwh / maxKwh;
    const r2 = item.wattage / maxWatt;
    const r3 = item.hours / maxHours;
    const r4 = minImportance / item.importance; // Cost criterion

    const score = W[0] * r1 + W[1] * r2 + W[2] * r3 + W[3] * r4;

    return {
      ...item,
      score,
    };
  }).sort((a, b) => b.score - a.score);
});

// Per-device monthly kWh maps
const deviceKwhThisMonthMap = computed<Record<number, number>>(() => {
  const map: Record<number, number> = {};
  for (const u of allUsages.value) {
    if (u.usage_date.startsWith(currentMonthPrefix.value)) {
      map[u.device_id] = (map[u.device_id] ?? 0) + Number(u.estimated_kwh);
    }
  }
  return map;
});

const deviceKwhLastMonthMap = computed<Record<number, number>>(() => {
  const map: Record<number, number> = {};
  for (const u of allUsages.value) {
    if (u.usage_date.startsWith(lastMonthPrefix.value)) {
      map[u.device_id] = (map[u.device_id] ?? 0) + Number(u.estimated_kwh);
    }
  }
  return map;
});

function deviceKwhThisMonth(deviceId: number): number {
  return deviceKwhThisMonthMap.value[deviceId] ?? 0;
}

function deviceKwhLastMonth(deviceId: number): number {
  return deviceKwhLastMonthMap.value[deviceId] ?? 0;
}

function deviceUsagePct(deviceId: number): number {
  const last = deviceKwhLastMonth(deviceId);
  if (last === 0) return 0;
  return Math.round((deviceKwhThisMonth(deviceId) / last) * 100);
}

// deviceEfficiencyScore function removed as it is not used.

// DSS Score: 0-100 index representing energy logging efficiency and budget adherence
const dssScore = computed(() => {
  let score = 100;

  // 1. Budget threshold penalty (Up to -50)
  const spentPct = budgetSpentPercentage.value;
  if (spentPct > 100) {
    score -= 50;
  } else if (spentPct > 80) {
    score -= 30;
  } else {
    const todayDate = new Date().getDate();
    if (todayDate <= 15 && spentPct > 50) {
      score -= 15;
    }
  }

  // 2. Daily target limit penalty (Up to -35)
  const todayKwh = kwhToday.value;
  if (todayKwh > 45) {
    score -= 35;
  } else if (todayKwh > DAILY_GOAL_KWH) {
    score -= 20;
  }

  return Math.max(0, score);
});

// Dynamic DSS Insights (Comparisons are monthly-only)
const insights = computed<Insight[]>(() => {
  const list: Insight[] = [];

  // Alert 1: Critical Monthly Budget
  if (budgetSpentPercentage.value > 80) {
    list.push({
      id: 1,
      status: 'danger',
      title: 'Critical Monthly Budget!',
      description: `Your electricity usage has reached ${budgetSpentPercentage.value}% of the monthly limit (Rp ${formatRupiah(kwhThisMonth.value * pricePerKwh.value)} / Rp ${formatRupiah(monthlyBudgetLimit.value)}).`,
      icon: 'warning',
    });
  }

  // Alert 2: Today's target exceeded
  if (kwhToday.value > DAILY_GOAL_KWH) {
    list.push({
      id: 2,
      status: 'danger',
      title: "Today's Usage Over Target!",
      description: `Today's consumption (${kwhToday.value.toFixed(2)} kWh) exceeds the daily limit of ${DAILY_GOAL_KWH} kWh. Try to limit device usage tomorrow.`,
      icon: 'trending_up',
    });
  }

  // Alert: Device approaching or exceeding last month's usage (80% safety net)
  const devicesNearLimit = topDevices.value.filter((d) => {
    const last = deviceKwhLastMonth(d.id);
    return last > 0 && deviceUsagePct(d.id) >= 80;
  });
  if (devicesNearLimit.length > 0) {
    const names = devicesNearLimit.map((d) => `${d.name} (${deviceUsagePct(d.id)}%)`).join(', ');
    const isOver = devicesNearLimit.some((d) => deviceUsagePct(d.id) >= 100);
    list.push({
      id: 7,
      status: isOver ? 'danger' : 'warning',
      title: isOver ? 'Device Exceeded Last Month Usage!' : 'Device Approaching 80% Safety Net',
      description: isOver
        ? `The following device(s) exceeded last month's usage: ${names}. Reduce usage hours immediately to lower your electricity bill.`
        : `The following device(s) have reached 80% of last month's usage: ${names}. Monitor carefully to avoid exceeding last month's consumption.`,
      icon: isOver ? 'warning' : 'device_thermostat',
    });
  }

  // Default Tip
  list.push({
    id: 6,
    status: 'recommendation',
    title: 'Energy Analysis Tip',
    description: 'Compare weekly charts in the Analytics tab to identify days with the highest consumption.',
    icon: 'lightbulb',
  });

  return list;
});

const currentInsightIndex = ref(0);
const currentInsight = computed<Insight>(() => {
  const list = insights.value;
  if (list.length === 0) {
    return {
      id: 0,
      status: 'normal',
      title: 'No insights available',
      description: 'System is loading data...',
      icon: 'hourglass_empty',
    };
  }
  const idx = currentInsightIndex.value >= list.length ? 0 : currentInsightIndex.value;
  return list[idx] || {
    id: 0,
    status: 'normal',
    title: 'No insights available',
    description: 'System is loading data...',
    icon: 'hourglass_empty',
  };
});

watch(insights, (newList) => {
  if (currentInsightIndex.value >= newList.length) {
    currentInsightIndex.value = 0;
  }
}, { immediate: true });

let autoCycleInterval: ReturnType<typeof setInterval> | null = null;
const isHovering = ref(false);

function startAutoCycle() {
  if (autoCycleInterval) return;
  autoCycleInterval = setInterval(() => {
    if (!isHovering.value) {
      nextInsight();
    }
  }, 8000);
}

function stopAutoCycle() {
  if (autoCycleInterval) {
    clearInterval(autoCycleInterval);
    autoCycleInterval = null;
  }
}

function pauseAutoCycle() {
  isHovering.value = true;
}

function resumeAutoCycle() {
  isHovering.value = false;
}

function nextInsight() {
  const list = insights.value;
  if (list.length === 0) return;
  currentInsightIndex.value = (currentInsightIndex.value + 1) % list.length;
}

function prevInsight() {
  const list = insights.value;
  if (list.length === 0) return;
  currentInsightIndex.value = (currentInsightIndex.value - 1 + list.length) % list.length;
}

// Fetch dashboard data
async function fetchDashboardData() {
  try {
    if (isUserAdmin) {
      const [userRes, houseRes, devRes, tariffRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: { data: { count: 0 } } })),
        api.get('/households').catch(() => ({ data: { data: { count: 0 } } })),
        api.get('/devices').catch(() => ({ data: { data: { count: 0 } } })),
        api.get('/tariff-classes').catch(() => ({ data: { data: { count: 0 } } })),
      ]);

      adminStats.value.users = userRes.data?.data?.count ?? userRes.data?.data?.users?.length ?? 0;
      adminStats.value.households = houseRes.data?.data?.count ?? houseRes.data?.data?.households?.length ?? 0;
      adminStats.value.devices = devRes.data?.data?.count ?? devRes.data?.data?.devices?.length ?? 0;
      adminStats.value.tariffs = tariffRes.data?.data?.count ?? tariffRes.data?.data?.tariff_classes?.length ?? 0;
    } else {
      const [devRes, houseRes, tariffRes, catRes] = await Promise.all([
        api.get('/devices'),
        api.get('/households'),
        api.get('/tariff-classes'),
        api.get('/device-categories'),
      ]);

      devices.value = devRes.data?.data?.devices ?? [];
      households.value = houseRes.data?.data?.households ?? [];
      tariffClasses.value = tariffRes.data?.data?.tariff_classes ?? tariffRes.data?.data?.data ?? [];
      categories.value = catRes.data?.data?.device_categories ?? catRes.data?.data?.data ?? [];

      if (devices.value.length > 0) {
        const usageResults = await Promise.all(
          devices.value.map((device) =>
            api
              .get(`/devices/${device.id}/device-usages`)
              .then((res) => {
                const rows = (res.data?.data?.device_usages ?? []).map((u: Omit<DbDeviceUsage, 'deviceName'>) => ({
                  ...u,
                  deviceName: device.name,
                }));
                return rows;
              })
              .catch(() => [] as DbDeviceUsage[])
          )
        );
        allUsages.value = usageResults
          .flat()
          .sort((a, b) => new Date(b.usage_date).getTime() - new Date(a.usage_date).getTime());
      } else {
        allUsages.value = [];
      }
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void fetchDashboardData();
  void fetchUnreadCount();
  startAutoCycle();
});

onBeforeUnmount(() => {
  stopAutoCycle();
});

// (device helper functions defined above before insights)

function goToUsage() {
  void router.push('/usage');
}

// goToDevices function removed as it is not used.

// Budget progress gauge colors
function getBudgetProgressColor(): string {
  const pct = budgetSpentPercentage.value;
  if (pct >= 90) return 'negative';
  if (pct >= 70) return 'orange';
  return 'positive';
}

// DSS Score Color helpers
function getScoreColor(score: number): string {
  if (score >= 80) return 'positive';
  if (score >= 50) return 'warning';
  return 'negative';
}

// DSS Score Label helpers
function getScoreLabel(score: number): string {
  if (score >= 80) return 'Highly Efficient';
  if (score >= 50) return 'Moderately Efficient';
  return 'Inefficient / High Consumption';
}

// DSS Score Advice helpers
function getScoreAdvice(score: number): string {
  if (score >= 80) return 'Energy usage is stable and under control.';
  if (score >= 50) return 'Limit power usage to improve efficiency score.';
  return 'Turn off non-essential devices now!';
}

function getCategoryName(catId: number): string {
  const cat = categories.value.find((c) => c.id === catId);
  return cat ? cat.name : 'Electronics';
}

// Helpers
function formatRupiah(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
  return value.toFixed(0);
}


function formatMonthName(monthPrefix: string | { value: string } | undefined | null): string {
  const val = typeof monthPrefix === 'string' ? monthPrefix : monthPrefix?.value;
  if (!val || typeof val !== 'string') return '';
  const [year, month] = val.split('-');
  if (!year || !month) return '';
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long' });
}

function getDeviceIcon(deviceName: string): string {
  const name = deviceName.toLowerCase();
  if (name.includes('ac') || name.includes('air conditioner')) return 'ac_unit';
  if (name.includes('tv') || name.includes('television')) return 'tv';
  if (name.includes('fridge') || name.includes('refrigerator')) return 'kitchen';
  if (name.includes('computer') || name.includes('pc')) return 'computer';
  if (name.includes('light') || name.includes('lamp')) return 'lightbulb';
  if (name.includes('fan')) return 'mode_fan';
  if (name.includes('washer') || name.includes('washing')) return 'local_laundry_service';
  if (name.includes('heater') || name.includes('water')) return 'water_drop';
  return 'power';
}

function getDeviceColor(deviceName: string): string {
  const name = deviceName.toLowerCase();
  if (name.includes('ac')) return 'blue';
  if (name.includes('tv')) return 'purple';
  if (name.includes('fridge')) return 'green';
  if (name.includes('computer')) return 'indigo';
  if (name.includes('light')) return 'amber';
  return 'teal';
}

</script>

<style scoped>
/* ============================================================
   HEADER AREA
   ============================================================ */
.header-box {
  background: #22b07e;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  margin: -16px -16px 0 -16px;
}

/* ============================================================
   DIVIDER
   ============================================================ */
.usage-divider-h {
  margin-top: 8px;
  height: 1px;
  background: #e0e0e0;
}

.usage-divider-v {
  width: 1px;
  background: #e0e0e0;
  margin: 0 8px;
  align-self: stretch;
}



/* ============================================================
   CARDS
   ============================================================ */
.usage-card {
  border-radius: 16px;
  background: white;
}

.usage-card .text-subtitle1 {
  font-size: 18px;
}

/* ============================================================
   DSS GAUGE CARD
   ============================================================ */
.dss-score-card {
  border-radius: 14px;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03) !important;
}

.text-positive-9 {
  color: #15803d;
}
.text-warning-9 {
  color: #b45309;
}
.text-negative-9 {
  color: #b91c1c;
}

/* ============================================================
   DSS SMART INSIGHT CARD
   ============================================================ */
.insight-card {
  border-radius: 16px;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03) !important;
}

.insight-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06) !important;
  transform: translateY(-1px);
}

.dss-header-text {
  font-size: 10px;
  letter-spacing: 0.8px;
  color: #555;
}

.insight-pager-text {
  font-size: 11px;
  color: #444;
  margin: 0 2px;
}

.insight-nav-btn {
  color: #444;
  transition: transform 0.2s ease;
}
.insight-nav-btn:active {
  transform: scale(0.85);
}

.insight-icon-container {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.insight-description {
  font-size: 11.5px;
  line-height: 1.45;
}

.insight-action-arrow {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  color: #444;
  transition: all 0.2s ease;
  flex-shrink: 0;
  align-self: center;
}

.insight-card:hover .insight-action-arrow {
  background: rgba(0, 0, 0, 0.08);
  transform: translateX(2px);
}

/* Pulsing DSS indicator */
.dss-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  transition: background-color 0.3s ease;
}

.dss-pulse-dot::after {
  content: '';
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  animation: pulse-ring 2s infinite ease-in-out;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}

/* Status variants */
.insight-card--normal {
  background: linear-gradient(135deg, #f0fdf4 0%, #e6f7ec 100%);
  border: 1px solid rgba(34, 197, 94, 0.2) !important;
}
.insight-card--normal .insight-icon-container {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}
.insight-card--normal .dss-pulse-dot,
.insight-card--normal .dss-pulse-dot::after {
  background-color: #22c55e;
}
.insight-card--normal .insight-action-arrow {
  color: #15803d;
  background: rgba(34, 197, 94, 0.06);
}

.insight-card--warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid rgba(245, 158, 11, 0.2) !important;
}
.insight-card--warning .insight-icon-container {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}
.insight-card--warning .dss-pulse-dot,
.insight-card--warning .dss-pulse-dot::after {
  background-color: #f59e0b;
}
.insight-card--warning .insight-action-arrow {
  color: #b45309;
  background: rgba(245, 158, 11, 0.06);
}

.insight-card--danger {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid rgba(239, 68, 68, 0.2) !important;
}
.insight-card--danger .insight-icon-container {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}
.insight-card--danger .dss-pulse-dot,
.insight-card--danger .dss-pulse-dot::after {
  background-color: #ef4444;
}
.insight-card--danger .insight-action-arrow {
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.06);
}

.insight-card--recommendation {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid rgba(14, 165, 233, 0.2) !important;
}
.insight-card--recommendation .insight-icon-container {
  background: rgba(14, 165, 233, 0.12);
  color: #0369a1;
}
.insight-card--recommendation .dss-pulse-dot,
.insight-card--recommendation .dss-pulse-dot::after {
  background-color: #0ea5e9;
}
.insight-card--recommendation .insight-action-arrow {
  color: #0369a1;
  background: rgba(14, 165, 233, 0.06);
}



/* ============================================================
   POWER MONITOR
   ============================================================ */
.power-monitor-card {
  border-radius: 14px;
}

/* ============================================================
   DEVICE & ACTIVITY CARDS
   ============================================================ */
.top-devices-card,
.activities-card {
  border-radius: 14px;
}

.device-item,
.activity-item {
  padding: 12px 16px;
}

/* ============================================================
   QUICK ACTIONS
   ============================================================ */
.quick-action-btn {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px 8px;
  color: #424242;
  transition: all 0.2s ease;
}

.quick-action-btn:hover {
  background: #f5f5f5;
  border-color: #22b07e;
}

.quick-action-btn:active {
  transform: scale(0.98);
}

/* ============================================================
   DSS RECOMMENDATION BOX
   ============================================================ */
.dss-rec-box {
  background: rgba(45, 212, 191, 0.04);
  border: 1px solid rgba(45, 212, 191, 0.12);
  border-radius: 12px;
}

/* ============================================================
   MOBILE OPTIMIZATIONS
   ============================================================ */
@media (max-width: 599px) {
  .q-page {
    padding: 12px !important;
  }

  .text-h6 {
    font-size: 18px;
  }

  .header-box {
    padding-top: 12px !important;
    padding-bottom: 16px !important;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
    margin: -12px -12px 0 -12px;
  }

  .usage-card {
    border-radius: 14px;
  }

  .insight-card {
    border-radius: 14px;
  }



  .insight-icon-container {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }

  .insight-action-arrow {
    width: 24px;
    height: 24px;
  }

  .quick-action-btn {
    padding: 12px 4px;
  }

  .quick-action-btn .text-caption {
    font-size: 10px;
  }
}
</style>
