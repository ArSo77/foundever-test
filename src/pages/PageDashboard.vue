<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useMeta } from "vue-meta";
import { LayoutDashboard, ViewCryptoList, BaseLineCrypto } from "@/app.organizer";

import { ROUTE_CRYPTO_OVERVIEW, ROUTE_CRYPTO_FAVORITES } from "@/app.routes";
import { useI18n } from "vue-i18n";
import useCrypto from "@/stores/useCrypto";

useMeta({
  title: "Cryptoleet",
  description: "Dashboard",
});

const router = useRouter();
const routeIsHome = computed(
  () => router.currentRoute.value.name === ROUTE_CRYPTO_OVERVIEW.name
);
const routeIsFavorites = computed(
  () => router.currentRoute.value.name === ROUTE_CRYPTO_FAVORITES.name
);

const { t: print } = useI18n();

const {
    cryptoList,
    cryptoFavorites,
    currenciesList,
    isReadyCategories,
    isReadyCurrencies,
    currencyActive,
    isReadyCryptoList,
    state,
} = useCrypto()

const viewProps = computed(() => {
  return {
    title: routeIsHome.value ? print('cryptocurrency_prices') : print('cryptocurrency_favorites'),
    cryptoList: routeIsHome.value ? cryptoList.value : cryptoFavorites.value,
    component: BaseLineCrypto,
  }
})

</script>

<template>
  <LayoutDashboard>
<!--     <hr><br><br><br> list: {{currenciesList}}-->
<!--     <hr> isReadyCategories: {{isReadyCategories}}-->
<!--     <hr> isReadyCurrencies: {{isReadyCurrencies}}-->
<!--     <hr> isReadyCryptoList: {{isReadyCryptoList}}-->
<!--     <hr> currencyActive: {{currencyActive}}-->
<!--      <hr> currencyActive: {{state.currencyActive}}-->
<!--      <hr> cryptoFavorites: {{state.cryptoFavorites.size}}-->
<!--      <hr> cryptoList: {{cryptoList.size}}-->
    <ViewCryptoList
      v-if="routeIsHome || routeIsFavorites"
      v-bind="viewProps"
    />
    <router-view v-else />
  </LayoutDashboard>
</template>

<style lang="scss"></style>
