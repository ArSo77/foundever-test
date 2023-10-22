<script setup lang="ts">
import { inject, computed, watch, ref, onMounted } from "vue";
import { BaseCardCrypto, BaseLoader } from "@/app.organizer";
import useCrypto from "@/stores/useCrypto";
import { useI18n } from "vue-i18n";
import { TCryptoData } from "@/stores/crypto.types";
import { IAppProvider } from "@/providers/app";
import { useRouter } from "vue-router";
import { ROUTE_CRYPTO_OVERVIEW } from "@/app.routes";


const App = inject<IAppProvider>("App");
const router = useRouter();

const id = router.currentRoute.value.params.id as string;

const item = ref<TCryptoData>()

const {
    fetchCryptosInfos,
    addFavorite,
    cryptoFavorites,
    removeFavorite,
    currencyActive,
    currenciesList,
    setCurrencyActive,
    cryptoList,
    isReadyCurrencies,
    isReadyCryptoList,
    isReadyCategories,
} = useCrypto();

const isReadyCryptoStore = computed(
  () => isReadyCategories && isReadyCurrencies && isReadyCryptoList
);

const { t: print }= useI18n();

watch(isReadyCryptoStore, (newState) => {
  if (newState && id && registerItem()) fetchItemInfos();
});

watch(currencyActive, () => {
  fetchItemInfos()
})


const registerItem = () => {
  const storeItem = cryptoList.value.get(id as string);
  if (storeItem) {
    item.value = storeItem;
    return true
  }
  else {
    router.push({ name: ROUTE_CRYPTO_OVERVIEW.name })
    return false;
  }
}
const fetchItemInfos = () => {
  if (item.value) fetchCryptosInfos([item.value])
}

const isInFavorites = computed(() => {
    if (item.value) return !!cryptoFavorites.value.get(item.value.id)
    return false;
})

onMounted(() => {
  if (isReadyCryptoStore.value) {
    registerItem()
    fetchItemInfos();
  }
})

</script>

<template>
  <div v-if="!isReadyCryptoStore || !item" class="flex flex-1 relative">
    <BaseLoader :text="print('loading_data')" />
    {{  isReadyCryptoStore ?'tru' :'false' }}
  </div>
  <div v-else-if="isReadyCryptoStore && item" class="flex flex-1 relative">
    <BaseCardCrypto
            :item="item"
            :favorite="isInFavorites"
            :currencyActive="currencyActive"
            :currenciesList="currenciesList"
            @removeFavorite="removeFavorite($event)"
            @addFavorite="addFavorite($event)"
            @setCurrencyActive="setCurrencyActive($event)"/>
  </div>
</template>

<style lang="scss"></style>
