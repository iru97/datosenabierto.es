<template>
  <div>
    <BOEControls 
      :loading="isLoading"
      @fetch="fetchBoletinData"
    />

    <BOEContent
      :loading="isLoading"
      :error="errorMessage"
      :progress="progress"
      :weekly-data="weeklyData"
    />
  </div>
</template>

<script setup lang="ts">
const { 
  loading: isLoading, 
  error: errorMessage,
  weeklyData,
  progress,
  fetchSumario 
} = useBOE()

const fetchBoletinData = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  fetchSumario({ startDate, endDate })
}
</script>