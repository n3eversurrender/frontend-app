<template>
  <q-page class="q-pa-md">
    <!-- ===== Title ===== -->
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h6 text-weight-bold">Energy Usage Analytics</div>
      <div class="row items-center q-gutter-xs">
        <q-btn
          outline
          dense
          icon="picture_as_pdf"
          label="Export"
          style="color: #22b07e; border-color: #22b07e; border-radius: 10px; font-size: 12px;"
          size="sm"
          @click="exportDialogOpen = true"
          :disable="allUsages.length === 0"
        />
        <q-btn
          flat
          round
          dense
          icon="refresh"
          color="grey-7"
          size="sm"
          :loading="loading"
          @click="fetchAllData"
        />
      </div>
    </div>

    <!-- ===== Loading Skeleton ===== -->
    <template v-if="loading">
      <q-card flat bordered class="q-mb-md" style="border-radius: 16px">
        <q-card-section>
          <q-skeleton type="rect" height="80px" />
        </q-card-section>
      </q-card>
      <q-card flat bordered class="q-mb-md" style="border-radius: 14px">
        <q-card-section>
          <q-skeleton type="rect" height="180px" />
        </q-card-section>
      </q-card>
    </template>

    <template v-else>
      <!-- ===== Empty State ===== -->
      <div v-if="allUsages.length === 0" class="text-center q-pa-xl">
        <q-icon name="electric_bolt" size="64px" color="grey-4" />
        <div class="text-grey-6 q-mt-sm text-body1 text-weight-medium">No usage data yet</div>
        <div class="text-grey-5 text-caption q-mt-xs">
          Add device usage from the Devices tab to see analytics here.
        </div>
      </div>

      <template v-else>
        <!-- ===== Summary Card ===== -->
        <q-card flat bordered class="summary-card q-mb-md">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <!-- Circular Progress (% of week used vs avg) -->
              <div class="col-auto q-mr-md">
                <div class="circular-progress">
                  <q-circular-progress
                    :value="weekProgressPercent"
                    size="70px"
                    :thickness="0.15"
                    color="green-6"
                    track-color="grey-3"
                    class="text-green-7"
                  >
                    <div class="text-center">
                      <div class="text-caption text-grey-7" style="font-size: 10px">7 days</div>
                      <div class="text-h6 text-weight-bold" style="font-size: 15px">
                        {{ weekProgressPercent }}%
                      </div>
                    </div>
                  </q-circular-progress>
                </div>
              </div>

              <!-- Total kWh -->
              <div class="col">
                <div class="text-caption text-grey-7">Total Consumption</div>
                <div class="text-h5 text-weight-bold text-green-8">
                  {{ totalKwh.toFixed(2) }}
                  <span style="font-size: 14px; font-weight: 400">kWh</span>
                </div>
                <div class="text-caption text-grey-6">{{ allUsages.length }} record(s)</div>
              </div>

              <!-- Est. Cost -->
              <div class="col text-right">
                <div class="text-caption text-grey-7">Est. Cost</div>
                <div class="text-h5 text-weight-bold">Rp {{ formatRupiah(estimatedCost) }}</div>
                <div class="text-caption text-grey-6">
                  {{ avgKwhPerDay.toFixed(2) }} kWh/day avg
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- ===== Week Navigation ===== -->
        <div class="row items-center justify-between q-mb-sm">
          <q-btn flat round dense icon="chevron_left" size="sm" color="grey-7" @click="prevWeek" />
          <div class="text-subtitle2 text-weight-medium">{{ weekLabel }}</div>
          <q-btn
            flat
            round
            dense
            icon="chevron_right"
            size="sm"
            color="primary"
            @click="nextWeek"
            :disable="isCurrentWeek"
          />
        </div>

        <!-- ===== Bar Chart Card ===== -->
        <q-card flat bordered class="chart-card q-mb-md">
          <q-card-section class="q-pa-md">
            <div
              v-if="weeklyChartData.every((d) => d.kwh === 0)"
              class="text-center text-grey-5 text-caption q-py-lg"
            >
              No usage data for this week
            </div>
            <div v-else class="bar-chart">
              <div v-for="day in weeklyChartData" :key="day.label" class="bar-item">
                <div class="bar-container">
                  <div
                    class="bar"
                    :class="{ 'bar-active': selectedDate === day.date }"
                    :style="{
                      height: maxWeeklyKwh > 0 ? `${(day.kwh / maxWeeklyKwh) * 100}%` : '0%',
                      opacity:
                        (selectedDate === null && day.isToday) || selectedDate === day.date
                          ? 1
                          : 0.6,
                      background:
                        (selectedDate === null && day.isToday) || selectedDate === day.date
                          ? 'linear-gradient(180deg, #22b07e, #1a8f65)'
                          : 'linear-gradient(180deg, #6dd5aa, #22b07e)',
                      cursor: 'pointer',
                    }"
                    @click="selectedDate = selectedDate === day.date ? null : (day.date as string)"
                  >
                    <div v-if="day.kwh > 0" class="bar-value-inside">
                      {{ day.kwh.toFixed(1) }}
                    </div>
                  </div>
                  <q-tooltip v-if="day.kwh > 0" anchor="top middle" self="bottom middle">
                    {{ day.kwh.toFixed(2) }} kWh
                  </q-tooltip>
                </div>
                <div
                  class="bar-label text-caption"
                  :class="{
                    'text-green-8 text-weight-bold':
                      (selectedDate === null && day.isToday) || selectedDate === day.date,
                    'text-grey-7':
                      (selectedDate !== null || !day.isToday) && selectedDate !== day.date,
                  }"
                >
                  {{ day.label }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- ===== DSS OPTIMIZATION HUB ===== -->
        <q-card flat bordered class="dss-hub-card q-mb-md">
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center q-gutter-xs">
                <q-icon name="psychology" size="24px" style="color: #22b07e;" />
                <span class="text-subtitle1 text-weight-bold text-grey-9">DSS Optimization Hub</span>
              </div>
              <q-badge class="q-py-xs q-px-sm text-weight-bold text-uppercase" style="letter-spacing: 0.5px; background-color: #22b07e;">
                Engine
              </q-badge>
            </div>
            
            <div class="usage-divider-h q-my-sm"></div>
            
            <q-tabs
              v-model="activeTab"
              dense
              class="text-grey"
              align="justify"
              narrow-indicator
              no-caps
            >
              <q-tab name="ranking" icon="trending_down" label="Conservation Priority" />
              <q-tab name="simulator" icon="speed" label="Eco-Simulator" />
            </q-tabs>
            
            <q-tab-panels v-model="activeTab" animated class="q-mt-sm">
              <!-- Tab 1: SAW Ranking -->
              <q-tab-panel name="ranking" class="q-pa-none">
                <div class="info-banner q-pa-sm q-mb-md rounded-borders row items-start no-wrap q-gutter-sm">
                  <q-icon name="info" size="18px" style="color: #22b07e;" class="q-mt-xs" />
                  <div class="text-caption text-grey-7" style="font-size: 11px; line-height: 1.4;">
                    The SAW (Simple Additive Weighting) method determines the conservation priority of household devices. Criteria: <b>kWh (35%)</b>, <b>Wattage (25%)</b>, <b>Duration (20%)</b>, and <b>Importance (20% - Cost)</b>.
                  </div>
                </div>

                <q-list v-if="sawDeviceRanking.length > 0" class="q-gutter-y-xs">
                  <q-item v-for="(item, index) in sawDeviceRanking" :key="item.id" class="saw-item-card column q-py-sm">
                    <div class="row items-center justify-between no-wrap full-width">
                      <div class="row items-center q-gutter-sm">
                        <div
                          class="flex flex-center text-weight-bolder text-caption rounded-borders"
                          :style="
                            index === 0
                              ? 'width: 22px; height: 22px; background: #fee2e2; color: #b91c1c; font-size: 10px;'
                              : index === 1
                              ? 'width: 22px; height: 22px; background: #fff3c7; color: #d97706; font-size: 10px;'
                              : 'width: 22px; height: 22px; background: #eafaf1; color: #15803d; font-size: 10px;'
                          "
                        >
                          #{{ index + 1 }}
                        </div>
                        <q-avatar :color="getDeviceColor(item.name) + '-1'" :text-color="getDeviceColor(item.name)" size="28px">
                          <q-icon :name="getDeviceIcon(item.name)" size="14px" />
                        </q-avatar>
                        <div class="column">
                          <span class="text-body2 text-weight-bold text-grey-9">{{ item.name }}</span>
                          <span class="text-caption text-grey-5" style="font-size: 9.5px;">Importance: {{ item.importance }} ({{ getImportanceLabel(item.importance) }})</span>
                        </div>
                      </div>
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
                    
                    <div class="full-width q-mt-xs">
                      <div class="row justify-between items-center q-mb-xs" style="font-size: 9px;">
                        <span class="text-grey-6">
                          This month: {{ item.kwh.toFixed(2) }} kWh · {{ item.hours.toFixed(1) }} hrs
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
                        style="height: 5px;"
                      />
                    </div>
                  </q-item>
                </q-list>
                <div v-else class="text-center q-pa-md text-grey-6 text-caption">
                  No device usage data available for analysis.
                </div>

                <div class="row justify-center q-mt-md">
                  <q-btn
                    outline
                    style="color: #22b07e; border-color: #22b07e;"
                    icon="analytics"
                    label="View Calculation Matrix"
                    no-caps
                    @click="calculationDialogOpen = true"
                    :disable="sawDeviceRanking.length === 0"
                  />
                </div>
              </q-tab-panel>

              <!-- Tab 2: Eco Simulator -->
              <q-tab-panel name="simulator" class="q-pa-none">
                <div class="info-banner q-pa-sm q-mb-md rounded-borders row items-start no-wrap q-gutter-sm" style="background: #f0fff8; border: 1px solid #c8eedd;">
                  <q-icon name="info" size="18px" style="color: #22b07e;" class="q-mt-xs" />
                  <div class="text-caption text-grey-7" style="font-size: 11px; line-height: 1.4;">
                    Simulate reducing the daily active hours of your electronic devices to see real-time estimates of monthly energy and cost savings.
                  </div>
                </div>

                <div class="row justify-end q-mb-md q-gutter-x-sm">
                  <q-btn
                    outline
                    dense
                    size="sm"
                    style="color: #22b07e; border-color: #22b07e;"
                    icon="auto_awesome"
                    label="Auto-Optimize (DSS)"
                    no-caps
                    @click="applyRecommendedOptimization"
                    :disable="devices.length === 0"
                  />
                  <q-btn
                    flat
                    dense
                    size="sm"
                    style="color: #616161;"
                    icon="restart_alt"
                    label="Reset to Average"
                    no-caps
                    @click="resetSimulator"
                    :disable="devices.length === 0"
                  />
                </div>

                <div class="q-gutter-y-sm" v-if="devices.length > 0">
                  <div v-for="device in devices" :key="device.id" class="simulator-item-card q-pa-md rounded-borders bg-grey-1">
                    <!-- Device Header -->
                    <div class="row items-center justify-between q-mb-xs">
                      <div class="row items-center q-gutter-sm">
                        <q-avatar :color="getDeviceColor(device.name) + '-1'" :text-color="getDeviceColor(device.name)" size="32px">
                          <q-icon :name="getDeviceIcon(device.name)" size="16px" />
                        </q-avatar>
                        <div>
                          <div class="text-body2 text-weight-bold text-grey-9">{{ device.name }}</div>
                          <div class="text-caption text-grey-6" style="font-size: 10px;">
                            Current average: {{ getDeviceAverageDailyHours(device.id).toFixed(1) }} hrs/day
                          </div>
                        </div>
                      </div>
                      
                      <div class="text-right">
                        <div class="text-body2 text-weight-bold" style="color: #22b07e;">
                          {{ getSimulatedHours(device.id).toFixed(1) }} hrs
                        </div>
                        <div class="text-caption text-grey-6" style="font-size: 10px;">
                          Power: {{ device.wattage }} W
                        </div>
                      </div>
                    </div>
                    
                    <!-- Slider -->
                    <div class="q-px-sm q-pt-xs">
                      <q-slider
                        v-model="simulatedHours[device.id]"
                        :min="0"
                        :max="24"
                        :step="0.5"
                        label
                        label-value=" hrs"
                        color="green-6"
                        track-color="grey-3"
                      />
                    </div>
                  </div>
                </div>
                <div v-else class="text-center q-pa-md text-grey-6 text-caption">
                  No registered devices to simulate.
                </div>

                <!-- Simulation Results Card -->
                <div class="q-mt-lg" v-if="devices.length > 0">
                  <!-- Savings Case -->
                  <q-card
                    v-if="simulationResult.costSaved > 0"
                    flat
                    class="saving-result-card text-white q-pa-md"
                    style="background: linear-gradient(135deg, #15803d 0%, #22c55e 100%); border-radius: 12px;"
                  >
                    <div class="row items-center q-mb-sm no-wrap justify-between">
                      <div class="row items-center q-gutter-sm">
                        <div class="pulsing-green-dot"></div>
                        <span class="text-caption text-weight-bold text-uppercase tracking-wider">Simulated Monthly Savings</span>
                      </div>
                      <q-icon name="check_circle" size="24px" />
                    </div>
                    
                    <div class="row q-col-gutter-sm text-center q-my-xs">
                      <div class="col-6">
                        <div class="text-caption text-white-8" style="font-size: 11px;">Estimated Savings</div>
                        <div class="text-h6 text-weight-bolder text-yellow-3">Rp {{ formatRupiahFull(simulationResult.costSaved) }}</div>
                        <div class="text-caption text-white-7" style="font-size: 9.5px;">per month</div>
                      </div>
                      <div class="col-6" style="border-left: 1px solid rgba(255,255,255,0.2);">
                        <div class="text-caption text-white-8" style="font-size: 11px;">Energy Savings</div>
                        <div class="text-h6 text-weight-bolder text-yellow-3">{{ simulationResult.kwhSaved.toFixed(2) }} kWh</div>
                        <div class="text-caption text-white-7" style="font-size: 9.5px;">per month</div>
                      </div>
                    </div>
                    
                    <div class="usage-divider-h q-my-sm" style="background: rgba(255,255,255,0.2);"></div>
                    
                    <div class="text-caption text-white-9 text-height-base" style="font-size: 11px; line-height: 1.4;">
                      By reducing your daily active hours, you are projected to save monthly electricity bill by <b>Rp {{ formatRupiahFull(simulationResult.costSaved) }}</b>. This conservation habit is great for both the environment and your wallet!
                    </div>
                  </q-card>

                  <!-- Neutral Case -->
                  <q-card
                    v-else-if="Math.abs(simulationResult.costSaved) < 1"
                    flat
                    bordered
                    class="q-pa-md text-center text-grey-7 bg-grey-1"
                    style="border-radius: 12px;"
                  >
                    <q-icon name="tune" size="32px" color="grey-5" class="q-mb-xs" />
                    <div class="text-subtitle2 text-weight-bold text-grey-8">Adjust Usage Sliders</div>
                    <div class="text-caption text-grey-6" style="font-size: 11px; line-height: 1.3;">
                      Reduce device active hours using the sliders above to instantly view your potential monthly electricity savings.
                    </div>
                  </q-card>

                  <!-- Budget Increase Case -->
                  <q-card
                    v-else
                    flat
                    class="saving-result-card text-white q-pa-md"
                    style="background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%); border-radius: 12px;"
                  >
                    <div class="row items-center q-mb-sm no-wrap justify-between">
                      <div class="row items-center q-gutter-sm">
                        <div class="pulsing-red-dot"></div>
                        <span class="text-caption text-weight-bold text-uppercase tracking-wider">Simulated Budget Increase</span>
                      </div>
                      <q-icon name="warning" size="24px" />
                    </div>
                    
                    <div class="row q-col-gutter-sm text-center q-my-xs">
                      <div class="col-6">
                        <div class="text-caption text-white-8" style="font-size: 11px;">Additional Cost</div>
                        <div class="text-h6 text-weight-bolder text-yellow-3">Rp {{ formatRupiahFull(Math.abs(simulationResult.costSaved)) }}</div>
                        <div class="text-caption text-white-7" style="font-size: 9.5px;">per month</div>
                      </div>
                      <div class="col-6" style="border-left: 1px solid rgba(255,255,255,0.2);">
                        <div class="text-caption text-white-8" style="font-size: 11px;">Additional Energy</div>
                        <div class="text-h6 text-weight-bolder text-yellow-3">{{ Math.abs(simulationResult.kwhSaved).toFixed(2) }} kWh</div>
                        <div class="text-caption text-white-7" style="font-size: 9.5px;">per month</div>
                      </div>
                    </div>
                    
                    <div class="usage-divider-h q-my-sm" style="background: rgba(255,255,255,0.2);"></div>
                    
                    <div class="text-caption text-white-9 text-height-base" style="font-size: 11px; line-height: 1.4;">
                      Your simulated usage exceeds your current average. Your monthly electricity bill is projected to increase by <b>Rp {{ formatRupiahFull(Math.abs(simulationResult.costSaved)) }}</b> per month.
                    </div>
                  </q-card>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>
        </q-card>

        <!-- ===== Consumption Summary Cards ===== -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <q-card flat bordered class="consumption-card">
              <q-card-section class="q-pa-md text-center">
                <q-icon name="bolt" size="20px" color="green-6" class="q-mb-xs" />
                <div class="text-caption text-grey-7 q-mb-xs">Total (All Time)</div>
                <div class="text-h6 text-weight-bold text-green-8">{{ totalKwh.toFixed(2) }}</div>
                <div class="text-caption text-grey-6">kWh</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6">
            <q-card flat bordered class="consumption-card">
              <q-card-section class="q-pa-md text-center">
                <q-icon name="trending_up" size="20px" color="orange-6" class="q-mb-xs" />
                <div class="text-caption text-grey-7 q-mb-xs">Daily Average</div>
                <div class="text-h6 text-weight-bold">{{ avgKwhPerDay.toFixed(2) }}</div>
                <div class="text-caption text-grey-6">kWh / day</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- ===== Most Consuming Devices ===== -->
        <div class="text-subtitle1 text-weight-bold q-mb-sm">Most Consuming Devices</div>
        <q-card flat bordered class="devices-card q-mb-lg">
          <q-list padding>
            <q-item
              v-for="(device, index) in topDevices"
              :key="device.deviceId"
              class="device-item"
            >
              <q-item-section avatar>
                <q-avatar
                  :color="deviceAvatarColors[index % deviceAvatarColors.length] + '-1'"
                  :text-color="deviceAvatarColors[index % deviceAvatarColors.length]"
                  size="40px"
                >
                  <q-icon :name="getDeviceIcon(device.deviceName)" size="20px" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-body2 text-weight-medium">{{
                  device.deviceName
                }}</q-item-label>
                <q-item-label caption>
                  <q-linear-progress
                    :value="totalKwh > 0 ? device.totalKwh / totalKwh : 0"
                    color="green-6"
                    track-color="grey-3"
                    rounded
                    style="height: 6px; margin-top: 4px"
                  />
                </q-item-label>
                <q-item-label caption class="text-caption text-grey-7 q-mt-xs">
                  {{ device.totalKwh.toFixed(2) }} kWh · {{ device.records }} record(s)
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="text-body2 text-weight-bold text-green-8">
                  {{ totalKwh > 0 ? ((device.totalKwh / totalKwh) * 100).toFixed(0) : 0 }}%
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- ===== Recent Usage Records ===== -->
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">
            {{ selectedDate ? `Records for ${formatDate(selectedDate)}` : 'Recent Records' }}
          </div>
          <q-btn
            v-if="selectedDate"
            flat
            dense
            no-caps
            label="Clear Filter"
            color="primary"
            size="sm"
            @click="selectedDate = null"
          />
        </div>
        <q-card flat bordered class="devices-card q-mb-lg">
          <q-list padding>
            <q-item v-for="usage in recentUsages" :key="usage.id" class="device-item">
              <q-item-section avatar>
                <q-avatar color="green-1" text-color="green-8" size="38px">
                  <q-icon name="electric_bolt" size="18px" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2 text-weight-medium">{{
                  usage.deviceName
                }}</q-item-label>
                <q-item-label caption class="text-caption text-grey-7">
                  {{ formatDate(usage.usage_date) }} · {{ usage.usage_hours }} hrs
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="column items-end">
                  <div class="text-caption text-weight-bold text-green-8">
                    {{ Number(usage.estimated_kwh).toFixed(2) }} kWh
                  </div>
                  <div class="row q-gutter-xs q-mt-xs">
                    <q-btn
                      flat
                      round
                      dense
                      icon="edit"
                      size="xs"
                      color="grey-6"
                      @click="onEditUsage(usage)"
                    >
                      <q-tooltip>Edit</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      size="xs"
                      color="negative"
                      @click="onDeleteUsage(usage)"
                    >
                      <q-tooltip>Delete</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- ===== Pagination ===== -->
          <div v-if="maxPages > 1" class="row justify-center q-pb-md">
            <q-pagination
              v-model="currentPage"
              :max="maxPages"
              direction-links
              flat
              color="grey-8"
              active-color="green-8"
              size="sm"
            />
          </div>
        </q-card>
      </template>
    </template>

    <!-- ===== Edit Dialog ===== -->
    <AddUsageDialog
      v-if="deviceForEdit"
      v-model="editDialogOpen"
      :device="deviceForEdit"
      :usage-to-edit="usageToEdit"
      @usage-updated="fetchAllData"
    />

    <!-- ===== MATRIKS PERHITUNGAN SPK DIALOG ===== -->
    <q-dialog v-model="calculationDialogOpen">
      <q-card style="border-radius: 16px; max-width: 800px; width: 100%;">
        <q-card-section class="text-white row items-center q-pb-md" style="background-color: #22b07e;">
          <div class="text-h6 text-weight-bold">SAW Decision Matrix Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md scroll" style="max-height: 70vh;">
          <!-- Formula Intro -->
          <div class="q-mb-md">
            <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-xs">Simple Additive Weighting (SAW) Methodology</div>
            <p class="text-caption text-grey-7" style="font-size: 11px; line-height: 1.45; margin-bottom: 0;">
              The basic concept of the SAW method is to find the weighted sum of performance ratings on each alternative (device) across all criteria.
            </p>
          </div>

          <!-- Criteria Table -->
          <div class="q-mb-md">
            <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-xs">1. Criteria Definition & Weights (W)</div>
            <q-markup-table flat bordered dense class="text-grey-9 rounded-borders">
              <thead>
                <tr class="bg-grey-2">
                  <th class="text-left text-weight-bold" style="font-size: 10px;">Code</th>
                  <th class="text-left text-weight-bold" style="font-size: 10px;">Criteria Name</th>
                  <th class="text-left text-weight-bold" style="font-size: 10px;">Type</th>
                  <th class="text-right text-weight-bold" style="font-size: 10px;">Weight</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-left">C1</td>
                  <td class="text-left">Energy Consumption (kWh)</td>
                  <td class="text-left text-positive text-weight-medium" style="font-size: 10px;">Benefit (Higher consumption prioritized for conservation)</td>
                  <td class="text-right text-weight-bold">35% (0.35)</td>
                </tr>
                <tr>
                  <td class="text-left">C2</td>
                  <td class="text-left">Device Power (Watt)</td>
                  <td class="text-left text-positive text-weight-medium" style="font-size: 10px;">Benefit (Higher wattage prioritized for conservation)</td>
                  <td class="text-right text-weight-bold">25% (0.25)</td>
                </tr>
                <tr>
                  <td class="text-left">C3</td>
                  <td class="text-left">Active Duration (Hours)</td>
                  <td class="text-left text-positive text-weight-medium" style="font-size: 10px;">Benefit (Longer duration prioritized for conservation)</td>
                  <td class="text-right text-weight-bold">20% (0.20)</td>
                </tr>
                <tr>
                  <td class="text-left">C4</td>
                  <td class="text-left">Device Importance (Urgency)</td>
                  <td class="text-left text-negative text-weight-medium" style="font-size: 10px;">Cost (More critical devices are protected from conservation)</td>
                  <td class="text-right text-weight-bold">20% (0.20)</td>
                </tr>
              </tbody>
            </q-markup-table>
            <div class="text-caption text-grey-6 q-mt-xs" style="font-size: 9px;">
              *C4 Scale: Fridge (5), Pump/Heater (4), AC/Fan (3), TV/PC (2), Lights/Others (1). Cost criteria is normalized by dividing the minimum value by the device's value (Min / X).
            </div>
          </div>

          <!-- Decision Matrix (X) -->
          <div class="q-mb-md">
            <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-xs">2. Raw Decision Matrix (X)</div>
            <q-markup-table flat bordered dense class="text-grey-9 rounded-borders">
              <thead>
                <tr class="bg-grey-2">
                  <th class="text-left text-weight-bold" style="font-size: 10px;">Alternative</th>
                  <th class="text-right text-weight-bold" style="font-size: 10px;">C1 (kWh)</th>
                  <th class="text-right text-weight-bold" style="font-size: 10px;">C2 (W)</th>
                  <th class="text-right text-weight-bold" style="font-size: 10px;">C3 (Hours)</th>
                  <th class="text-right text-weight-bold" style="font-size: 10px;">C4 (Urgency)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in sawDeviceRanking" :key="item.id">
                  <td class="text-left text-weight-medium">{{ item.name }}</td>
                  <td class="text-right">{{ item.kwh.toFixed(2) }}</td>
                  <td class="text-right">{{ item.wattage }}</td>
                  <td class="text-right">{{ item.hours.toFixed(1) }}</td>
                  <td class="text-right">{{ item.importance }}</td>
                </tr>
                <tr class="font-weight-bold" style="background-color: #eafaf1; color: #15803d;">
                  <td class="text-left text-weight-bold">Reference Values</td>
                  <td class="text-right text-weight-bold">Max: {{ sawMetadata.maxKwh.toFixed(2) }}</td>
                  <td class="text-right text-weight-bold">Max: {{ sawMetadata.maxWatt }}</td>
                  <td class="text-right text-weight-bold">Max: {{ sawMetadata.maxHours.toFixed(1) }}</td>
                  <td class="text-right text-weight-bold">Min: {{ sawMetadata.minImportance }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>

          <!-- Normalized Matrix (R) -->
          <div class="q-mb-md">
            <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-xs">3. Normalized Decision Matrix (R)</div>
            <q-markup-table flat bordered dense class="text-grey-9 rounded-borders">
              <thead>
                <tr class="bg-grey-2">
                  <th class="text-left text-weight-bold" style="font-size: 10px;">Alternative</th>
                  <th class="text-right text-weight-bold" style="font-size: 10px;">r1 (C1)</th>
                  <th class="text-right text-weight-bold" style="font-size: 10px;">r2 (C2)</th>
                  <th class="text-right text-weight-bold" style="font-size: 10px;">r3 (C3)</th>
                  <th class="text-right text-weight-bold" style="font-size: 10px;">r4 (C4)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in sawDeviceRanking" :key="item.id">
                  <td class="text-left text-weight-medium">{{ item.name }}</td>
                  <td class="text-right text-weight-medium text-green-8">{{ item.r1.toFixed(4) }}</td>
                  <td class="text-right text-weight-medium text-green-8">{{ item.r2.toFixed(4) }}</td>
                  <td class="text-right text-weight-medium text-green-8">{{ item.r3.toFixed(4) }}</td>
                  <td class="text-right text-weight-medium text-green-8">{{ item.r4.toFixed(4) }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>

          <!-- Preference Score (V) -->
          <div class="q-mb-sm">
            <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-xs">4. Preference Scores & Priority Ranking (V)</div>
            <div class="text-caption text-grey-6 q-mb-xs" style="font-size: 10px;">
              Formula: <code>Vi = (0.35 * r1) + (0.25 * r2) + (0.20 * r3) + (0.20 * r4)</code>. The highest score represents the top priority for energy conservation.
            </div>
            <q-markup-table flat bordered dense class="text-grey-9 rounded-borders">
              <thead>
                <tr class="bg-grey-2">
                  <th class="text-center text-weight-bold" style="font-size: 10px; width: 50px;">Rank</th>
                  <th class="text-left text-weight-bold" style="font-size: 10px;">Alternative</th>
                  <th class="text-left text-weight-bold" style="font-size: 10px;">Mathematical Equation</th>
                  <th class="text-right text-weight-bold" style="font-size: 10px;">Preference Score (Vi)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in sawDeviceRanking" :key="item.id" :class="index === 0 ? 'bg-red-1 text-weight-bold' : ''">
                  <td class="text-center">
                    <q-badge :color="index === 0 ? 'negative' : index === 1 ? 'warning' : 'positive'" class="text-weight-bold">
                      #{{ index + 1 }}
                    </q-badge>
                  </td>
                  <td class="text-left text-weight-medium">{{ item.name }}</td>
                  <td class="text-left text-caption text-grey-7" style="font-size: 9.5px;">
                    (0.35 &times; {{ item.r1.toFixed(2) }}) + (0.25 &times; {{ item.r2.toFixed(2) }}) + (0.20 &times; {{ item.r3.toFixed(2) }}) + (0.20 &times; {{ item.r4.toFixed(2) }})
                  </td>
                  <td class="text-right text-weight-bold" :class="index === 0 ? 'text-negative' : 'text-grey-9'">
                    {{ item.score.toFixed(6) }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1 q-pa-sm">
          <q-btn flat label="Close" style="color: #22b07e;" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ===== Export Report Dialog ===== -->
    <q-dialog v-model="exportDialogOpen" persistent>
      <q-card style="width: 400px; max-width: 95vw; border-radius: 16px;">
        <q-card-section class="q-pb-none">
          <div class="row items-center q-mb-sm">
            <q-icon name="picture_as_pdf" size="24px" style="color: #22b07e;" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">Export Report</div>
          </div>
          <div class="text-caption text-grey-6">Choose a period to generate your PDF report.</div>
        </q-card-section>

        <q-card-section>
          <q-option-group
            v-model="exportFilterType"
            :options="[
              { label: 'Specific Day', value: 'day' },
              { label: 'Specific Month', value: 'month' },
              { label: 'Custom Date Range', value: 'range' },
            ]"
            color="green"
            dense
            class="q-mb-md"
          />

          <!-- Day Picker -->
          <q-input
            v-if="exportFilterType === 'day'"
            v-model="exportDay"
            type="date"
            label="Select Date"
            outlined
            dense
            style="border-radius: 10px;"
          />

          <!-- Month Picker -->
          <q-input
            v-if="exportFilterType === 'month'"
            v-model="exportMonth"
            label="Select Month"
            outlined
            dense
            readonly
            style="border-radius: 10px;"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer" style="color: #22b07e;">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="exportMonth"
                    default-view="Months"
                    emit-immediately
                    mask="YYYY-MM"
                    years-in-month-view
                    color="green"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- Range Picker -->
          <div v-if="exportFilterType === 'range'" class="column q-gutter-sm">
            <q-input
              v-model="exportRangeStart"
              type="date"
              label="Start Date"
              outlined
              dense
              style="border-radius: 10px;"
            />
            <q-input
              v-model="exportRangeEnd"
              type="date"
              label="End Date"
              outlined
              dense
              style="border-radius: 10px;"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup :disable="exporting" />
          <q-btn
            unelevated
            label="Download PDF"
            icon="download"
            :loading="exporting"
            style="background: #22b07e; color: white; border-radius: 10px;"
            @click="downloadPdf"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import AddUsageDialog, { type Device } from 'src/components/device/AddUsageDialog.vue';
import { useDeviceUsage } from 'src/composables/useDeviceUsage';
import { computed, onMounted, ref, watch } from 'vue';

// ===== Types =====
interface DeviceUsage {
  id: number;
  device_id: number;
  usage_date: string;
  usage_hours: number;
  estimated_kwh: number;
  deviceName: string;
}

interface TariffClass {
  id: number;
  code: string;
  price_per_kwh: number;
}

interface Household {
  id: number;
  tariff_class_id: number;
}

interface SawDeviceItem {
  id: number;
  name: string;
  wattage: number;
  kwh: number;
  hours: number;
  importance: number;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  score: number;
}

// ===== State =====
const loading = ref(true);
const devices = ref<Device[]>([]);
const allUsages = ref<DeviceUsage[]>([]);
const tariffClasses = ref<TariffClass[]>([]);
const households = ref<Household[]>([]);

const $q = useQuasar();
const { deleteUsage } = useDeviceUsage();

// Week navigation
const weekOffset = ref(0);
const selectedDate = ref<string | null>(null);
const currentPage = ref(1);
const itemsPerPage = 5;

// Tabs & dialog logic
const activeTab = ref('ranking');
const calculationDialogOpen = ref(false);
const simulatedHours = ref<Record<number, number>>({});

// Export Report state
const exportDialogOpen = ref(false);
const exportFilterType = ref<'day' | 'month' | 'range'>('month');
const exportDay = ref(new Date().toLocaleDateString('sv').slice(0, 10));
const exportMonth = ref(new Date().toLocaleDateString('sv').slice(0, 7));
const exportRangeStart = ref('');
const exportRangeEnd = ref('');
const exporting = ref(false);

async function downloadPdf() {
  let startDate = '';
  let endDate = '';

  if (exportFilterType.value === 'day') {
    if (!exportDay.value) {
      $q.notify({ type: 'warning', message: 'Please select a date' });
      return;
    }
    startDate = exportDay.value;
    endDate = exportDay.value;
  } else if (exportFilterType.value === 'month') {
    if (!exportMonth.value) {
      $q.notify({ type: 'warning', message: 'Please select a month' });
      return;
    }
    // Compute first and last day of selected month
    const [year, month] = exportMonth.value.split('-').map(Number);
    startDate = `${exportMonth.value}-01`;
    const lastDay = new Date(year as number, month as number, 0).getDate();
    endDate = `${exportMonth.value}-${String(lastDay).padStart(2, '0')}`;
  } else {
    if (!exportRangeStart.value || !exportRangeEnd.value) {
      $q.notify({ type: 'warning', message: 'Please select both start and end dates' });
      return;
    }
    if (exportRangeStart.value > exportRangeEnd.value) {
      $q.notify({ type: 'warning', message: 'Start date must be before end date' });
      return;
    }
    startDate = exportRangeStart.value;
    endDate = exportRangeEnd.value;
  }

  exporting.value = true;
  try {
    const response = await api.get('/export-report/pdf', {
      params: { startDate, endDate },
      responseType: 'blob',
    });

    const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usage_report_${startDate}_to_${endDate}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    exportDialogOpen.value = false;
    $q.notify({
      type: 'positive',
      message: 'Report downloaded successfully!',
      icon: 'check_circle',
    });
  } catch (err) {
    console.error('PDF export failed', err);
    const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
    const errMsg = axiosError.response?.data?.message || axiosError.message || 'Please try again.';
    $q.notify({
      type: 'negative',
      message: `Failed to generate report: ${errMsg}`,
      icon: 'error',
    });
  } finally {
    exporting.value = false;
  }
}

// Edit state
const editDialogOpen = ref(false);
const usageToEdit = ref<DeviceUsage | null>(null);
const deviceForEdit = computed(() => {
  if (!usageToEdit.value) return null;
  return devices.value.find((d) => d.id === usageToEdit.value?.device_id) || null;
});

// ===== Data Fetching =====
async function fetchAllData() {
  loading.value = true;
  try {
    const [devRes, houseRes, tariffRes] = await Promise.all([
      api.get('/devices'),
      api.get('/households'),
      api.get('/tariff-classes'),
    ]);

    devices.value = devRes.data?.data?.devices ?? [];
    households.value = houseRes.data?.data?.households ?? [];

    const rawTariffs = tariffRes.data?.data?.tariff_classes ?? tariffRes.data?.data?.data ?? [];
    tariffClasses.value = rawTariffs;

    if (devices.value.length > 0) {
      const usageResults = await Promise.all(
        devices.value.map((device) =>
          api
            .get(`/devices/${device.id}/device-usages`)
            .then((res) => {
              const rows: DeviceUsage[] = (res.data?.data?.device_usages ?? []).map(
                (u: Omit<DeviceUsage, 'deviceName'>) => ({
                  ...u,
                  deviceName: device.name,
                }),
              );
              return rows;
            })
            .catch(() => [] as DeviceUsage[]),
        ),
      );

      allUsages.value = usageResults
        .flat()
        .sort((a, b) => new Date(b.usage_date).getTime() - new Date(a.usage_date).getTime());
    } else {
      allUsages.value = [];
    }
  } catch (err) {
    console.error('Failed to fetch usage analytics', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => void fetchAllData());

// ===== Shared / DSS Computeds =====
const pricePerKwh = computed(() => {
  const household = households.value[0];
  if (!household) return 1444;
  const tariff = tariffClasses.value.find((t) => t.id === household.tariff_class_id);
  return tariff ? Number(tariff.price_per_kwh) : 1444;
});

const currentMonthPrefix = computed(() => new Date().toLocaleDateString('sv').slice(0, 7));

function deviceKwhThisMonth(deviceId: number): number {
  return allUsages.value
    .filter((u) => u.device_id === deviceId && u.usage_date.startsWith(currentMonthPrefix.value))
    .reduce((sum, u) => sum + Number(u.estimated_kwh), 0);
}

function getDeviceImportance(deviceName: string): number {
  const name = deviceName.toLowerCase();
  if (name.includes('fridge') || name.includes('refrigerator') || name.includes('kulkas')) return 5;
  if (name.includes('pump') || name.includes('pompa') || name.includes('heater') || name.includes('dispenser') || name.includes('water')) return 4;
  if (name.includes('ac') || name.includes('air conditioner') || name.includes('fan') || name.includes('kipas') || name.includes('cooler')) return 3;
  if (name.includes('tv') || name.includes('television') || name.includes('computer') || name.includes('pc') || name.includes('laptop')) return 2;
  return 1; // Lights, charger, others
}

function getImportanceLabel(importance: number): string {
  if (importance === 5) return 'Very High (Refrigerator)';
  if (importance === 4) return 'High (Pump/Heater)';
  if (importance === 3) return 'Medium (AC/Fan)';
  if (importance === 2) return 'Low (TV/PC)';
  return 'Very Low (Lights/Others)';
}

// SAW priority engine
const sawDeviceRanking = computed<SawDeviceItem[]>(() => {
  if (devices.value.length === 0) return [];
  
  const rawItems = devices.value.map((device) => {
    const kwh = deviceKwhThisMonth(device.id);
    const hours = kwh > 0 ? (kwh * 1000) / device.wattage : 0;
    const importance = getDeviceImportance(device.name);
    return {
      id: device.id,
      name: device.name,
      wattage: device.wattage,
      kwh,
      hours,
      importance,
    };
  });

  const maxKwh = Math.max(...rawItems.map((d) => d.kwh), 0.01);
  const maxWatt = Math.max(...rawItems.map((d) => d.wattage), 1);
  const maxHours = Math.max(...rawItems.map((d) => d.hours), 0.01);
  const minImportance = Math.min(...rawItems.map((d) => d.importance), 1);

  const W = [0.35, 0.25, 0.20, 0.20] as const; // Weights for C1, C2, C3, C4

  return rawItems.map((item) => {
    const r1 = item.kwh / maxKwh;
    const r2 = item.wattage / maxWatt;
    const r3 = item.hours / maxHours;
    const r4 = minImportance / item.importance; // Cost criterion

    const score = W[0] * r1 + W[1] * r2 + W[2] * r3 + W[3] * r4;

    return {
      ...item,
      r1,
      r2,
      r3,
      r4,
      score,
    };
  }).sort((a, b) => b.score - a.score);
});

// Metadata for SAW details dialog
const sawMetadata = computed(() => {
  if (devices.value.length === 0) return { maxKwh: 0.01, maxWatt: 1, maxHours: 0.01, minImportance: 1 };
  const rawItems = devices.value.map((device) => {
    const kwh = deviceKwhThisMonth(device.id);
    const hours = kwh > 0 ? (kwh * 1000) / device.wattage : 0;
    const importance = getDeviceImportance(device.name);
    return { kwh, wattage: device.wattage, hours, importance };
  });
  return {
    maxKwh: Math.max(...rawItems.map((d) => d.kwh), 0.01),
    maxWatt: Math.max(...rawItems.map((d) => d.wattage), 1),
    maxHours: Math.max(...rawItems.map((d) => d.hours), 0.01),
    minImportance: Math.min(...rawItems.map((d) => d.importance), 1),
  };
});

// Eco Simulator Calculations
function getDeviceAverageDailyHours(deviceId: number): number {
  const monthUsages = allUsages.value.filter(
    (u) => u.device_id === deviceId && u.usage_date.startsWith(currentMonthPrefix.value)
  );
  if (monthUsages.length === 0) {
    const overallUsages = allUsages.value.filter((u) => u.device_id === deviceId);
    if (overallUsages.length > 0) {
      return overallUsages.reduce((sum, u) => sum + Number(u.usage_hours), 0) / overallUsages.length;
    }
    return 0;
  }
  return monthUsages.reduce((sum, u) => sum + Number(u.usage_hours), 0) / monthUsages.length;
}

function resetSimulator() {
  const newSim: Record<number, number> = {};
  devices.value.forEach((d) => {
    const avg = getDeviceAverageDailyHours(d.id);
    newSim[d.id] = Math.min(24, Math.max(0, Math.round(avg * 10) / 10));
  });
  simulatedHours.value = newSim;
}

function lastMonthPrefixValue(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toLocaleDateString('sv').slice(0, 7);
}

function deviceKwhLastMonth(deviceId: number): number {
  const prefix = lastMonthPrefixValue();
  return allUsages.value
    .filter((u) => u.device_id === deviceId && u.usage_date.startsWith(prefix))
    .reduce((sum, u) => sum + Number(u.estimated_kwh), 0);
}

function applyRecommendedOptimization() {
  const newSim: Record<number, number> = {};
  devices.value.forEach((d) => {
    const avg = getDeviceAverageDailyHours(d.id);
    const importance = getDeviceImportance(d.name);
    
    // Find SAW score
    const rankingItem = sawDeviceRanking.value.find((item) => item.id === d.id);
    const score = rankingItem ? rankingItem.score : 0;
    
    // Check if usage exceeded last month's baseline
    const thisMonthKwh = deviceKwhThisMonth(d.id);
    const lastMonthKwh = deviceKwhLastMonth(d.id);
    const exceededLastMonth = lastMonthKwh > 0 && thisMonthKwh > lastMonthKwh;
    
    let targetHours = avg;
    if (importance < 5 && avg > 0) { // Refrigerator (importance 5) is protected
      let reductionFactor = 0.05; // default 5%
      
      if (score >= 0.7) {
        reductionFactor = exceededLastMonth ? 0.30 : 0.25; // 25-30% reduction
      } else if (score >= 0.4) {
        reductionFactor = exceededLastMonth ? 0.20 : 0.15; // 15-20% reduction
      } else {
        reductionFactor = exceededLastMonth ? 0.10 : 0.05; // 5-10% reduction
      }
      
      targetHours = avg * (1 - reductionFactor);
    }
    
    newSim[d.id] = Math.round(targetHours * 2) / 2;
  });
  
  simulatedHours.value = newSim;
  
  $q.notify({
    type: 'positive',
    message: 'DSS recommended optimization applied!',
    icon: 'auto_awesome',
    position: 'top',
  });
}

function getSimulatedHours(deviceId: number): number {
  return simulatedHours.value[deviceId] ?? getDeviceAverageDailyHours(deviceId);
}

// Watch devices/usages to populate initial slider values once loaded
watch([devices, allUsages], () => {
  if (devices.value.length > 0 && Object.keys(simulatedHours.value).length === 0) {
    resetSimulator();
  }
}, { immediate: true });

const simulationResult = computed(() => {
  let totalKwhSaved = 0;
  
  devices.value.forEach((d) => {
    const avg = getDeviceAverageDailyHours(d.id);
    const sim = simulatedHours.value[d.id] ?? avg;
    const diffHours = avg - sim;
    const kwhSavedPerDay = (d.wattage * diffHours) / 1000;
    totalKwhSaved += kwhSavedPerDay * 30; // monthly projection
  });

  const costSaved = totalKwhSaved * pricePerKwh.value;

  return {
    kwhSaved: totalKwhSaved,
    costSaved: costSaved,
  };
});

// ===== Analytics Computed =====
const totalKwh = computed(() =>
  allUsages.value.reduce((sum, u) => sum + Number(u.estimated_kwh), 0),
);

const uniqueDays = computed(() => {
  const days = new Set(allUsages.value.map((u) => u.usage_date));
  return days.size || 1;
});

const avgKwhPerDay = computed(() => totalKwh.value / uniqueDays.value);

const estimatedCost = computed(() => totalKwh.value * pricePerKwh.value);

const weekLabel = computed(() => {
  const { start, end } = getWeekRange(weekOffset.value);
  const fmt = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)} ${end.getFullYear()}`;
});

const isCurrentWeek = computed(() => weekOffset.value === 0);

const weekProgressPercent = computed(() => {
  const { start, end } = getWeekRange(0);
  const weekUsages = allUsages.value.filter((u) => {
    const d = new Date(u.usage_date);
    return d >= start && d <= end;
  });
  const weekKwh = weekUsages.reduce((s, u) => s + Number(u.estimated_kwh), 0);
  const target = avgKwhPerDay.value * 7;
  if (target === 0) return 0;
  return Math.min(100, Math.round((weekKwh / target) * 100));
});

const weeklyChartData = computed(() => {
  const { start } = getWeekRange(weekOffset.value);
  const today = new Date().toLocaleDateString('sv').slice(0, 10);
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  interface DayData {
    label: string;
    date: string;
    kwh: number;
    isToday: boolean;
  }

  return Array.from({ length: 7 }, (_, i): DayData => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateStr = date.toLocaleDateString('sv').slice(0, 10);

    const kwh = allUsages.value
      .filter((u) => u.usage_date === dateStr)
      .reduce((sum, u) => sum + Number(u.estimated_kwh), 0);

    return {
      label: days[i] as string,
      date: dateStr,
      kwh,
      isToday: dateStr === today,
    };
  });
});

const maxWeeklyKwh = computed(() => Math.max(...weeklyChartData.value.map((d) => d.kwh), 0.01));

const filteredUsages = computed(() => {
  return selectedDate.value
    ? allUsages.value.filter((u) => u.usage_date === selectedDate.value)
    : allUsages.value;
});

const topDevices = computed(() => {
  const source = filteredUsages.value;
  const map = new Map<
    number,
    { deviceId: number; deviceName: string; totalKwh: number; records: number }
  >();

  for (const usage of source) {
    const entry = map.get(usage.device_id) ?? {
      deviceId: usage.device_id,
      deviceName: usage.deviceName,
      totalKwh: 0,
      records: 0,
    };
    entry.totalKwh += Number(usage.estimated_kwh);
    entry.records += 1;
    map.set(usage.device_id, entry);
  }

  return [...map.values()].sort((a, b) => b.totalKwh - a.totalKwh).slice(0, 5);
});

const maxPages = computed(() => Math.ceil(filteredUsages.value.length / itemsPerPage));

const recentUsages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredUsages.value.slice(start, end);
});

watch(selectedDate, () => {
  currentPage.value = 1;
});

// ===== Week Navigation =====
function getWeekRange(offset: number): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = (day === 0 ? -6 : 1 - day) + offset * 7;

  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function prevWeek() {
  weekOffset.value -= 1;
  selectedDate.value = null;
}
function nextWeek() {
  if (!isCurrentWeek.value) {
    weekOffset.value += 1;
    selectedDate.value = null;
  }
}

// ===== Actions =====
function onEditUsage(usage: DeviceUsage) {
  usageToEdit.value = usage;
  editDialogOpen.value = true;
}

function onDeleteUsage(usage: DeviceUsage) {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete this usage record for ${usage.deviceName}?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Delete',
      color: 'negative',
      unelevated: true,
    },
  }).onOk(() => {
    void (async () => {
      const result = await deleteUsage(usage.device_id, usage.id);
      if (result.success) {
        $q.notify({
          type: 'positive',
          message: 'Usage record deleted',
          icon: 'check',
        });
        await fetchAllData();
      } else {
        $q.notify({
          type: 'negative',
          message: result.message,
        });
      }
    })();
  });
}

// ===== Helpers =====
function formatRupiah(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'jt';
  if (value >= 1_000) return (value / 1_000).toFixed(0) + 'rb';
  return value.toFixed(0);
}

function formatRupiahFull(value: number): string {
  return Math.round(value).toLocaleString('id-ID');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDeviceIcon(deviceName: string): string {
  const name = deviceName.toLowerCase();
  if (name.includes('ac') || name.includes('air conditioner')) return 'ac_unit';
  if (name.includes('tv') || name.includes('television')) return 'tv';
  if (name.includes('fridge') || name.includes('refrigerator') || name.includes('kulkas')) return 'kitchen';
  if (name.includes('computer') || name.includes('pc') || name.includes('laptop')) return 'computer';
  if (name.includes('light') || name.includes('lamp')) return 'lightbulb';
  if (name.includes('fan') || name.includes('kipas')) return 'mode_fan';
  if (name.includes('washer') || name.includes('washing')) return 'local_laundry_service';
  if (name.includes('heater') || name.includes('water') || name.includes('pompa')) return 'water_drop';
  return 'power';
}

function getDeviceColor(deviceName: string): string {
  const name = deviceName.toLowerCase();
  if (name.includes('ac')) return 'blue';
  if (name.includes('tv')) return 'purple';
  if (name.includes('fridge') || name.includes('kulkas')) return 'green';
  if (name.includes('computer') || name.includes('pc') || name.includes('laptop')) return 'indigo';
  if (name.includes('light') || name.includes('lamp')) return 'amber';
  return 'teal';
}

const deviceAvatarColors = ['green', 'blue', 'orange', 'purple', 'teal'];
</script>

<style scoped>
/* Summary Card */
.summary-card {
  border-radius: 16px;
  background: linear-gradient(135deg, #f0fff8 0%, #ffffff 100%);
  border-color: #c8eedd;
}

.circular-progress {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Chart Card */
.chart-card {
  border-radius: 14px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 180px;
  gap: 8px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bar-value {
  min-height: 20px;
  font-size: 11px;
  text-align: center;
}

.bar-container {
  height: 120px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 100%;
  max-width: 32px;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  min-height: 4px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 8px;
  overflow: hidden;
}

.bar-value-inside {
  color: white;
  font-size: 10px;
  font-weight: 700;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
}

.bar-active {
  box-shadow: 0 0 12px rgba(34, 176, 126, 0.4);
  transform: scaleX(1.1);
}

.bar-label {
  font-size: 11px;
  margin-top: 4px;
}

/* Consumption Cards */
.consumption-card {
  border-radius: 12px;
}

/* Devices Card */
.devices-card {
  border-radius: 14px;
}

.device-item {
  padding: 10px 8px;
}

/* DSS Optimization Hub styles */
.dss-hub-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03) !important;
}

.usage-divider-h {
  margin-top: 8px;
  height: 1px;
  background: #e0e0e0;
}

.info-banner {
  background: rgba(34, 176, 126, 0.05);
  border: 1px solid rgba(34, 176, 126, 0.15);
  border-radius: 8px;
  padding: 10px;
}

.saw-item-card {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  background: white;
  margin-bottom: 6px;
  transition: all 0.2s ease;
}

.saw-item-card:hover {
  border-color: rgba(34, 176, 126, 0.3);
  box-shadow: 0 2px 8px rgba(34, 176, 126, 0.05);
}

.simulator-item-card {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  margin-bottom: 6px;
  transition: all 0.2s ease;
}

.simulator-item-card:hover {
  border-color: rgba(34, 176, 126, 0.3);
}

.saving-result-card {
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.2) !important;
}

/* Pulsing Dots */
.pulsing-green-dot {
  width: 8px;
  height: 8px;
  background-color: #4ade80;
  border-radius: 50%;
  position: relative;
  display: inline-block;
}
.pulsing-green-dot::after {
  content: '';
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #4ade80;
  animation: pulse-ring 2s infinite ease-in-out;
}

.pulsing-red-dot {
  width: 8px;
  height: 8px;
  background-color: #f87171;
  border-radius: 50%;
  position: relative;
  display: inline-block;
}
.pulsing-red-dot::after {
  content: '';
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #f87171;
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

.dss-hub-card :deep(.q-tab--active) {
  color: #22b07e !important;
}
.dss-hub-card :deep(.q-tab__indicator) {
  background: #22b07e !important;
}

/* Mobile Optimization */
@media (max-width: 599px) {
  .q-page {
    padding: 12px !important;
  }

  .text-h6 {
    font-size: 18px;
  }

  .bar-chart {
    height: 140px;
    gap: 4px;
  }

  .bar {
    max-width: 28px;
  }

  .bar-value {
    font-size: 10px;
  }

  .bar-label {
    font-size: 10px;
  }

  .text-h5 {
    font-size: 18px;
  }
}
</style>
