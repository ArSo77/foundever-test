<script setup lang="ts">
import { computed, ref } from "vue";
import { TCryptoData } from "@/stores/crypto.types";
import {
  BaseCryptoChart,
  BaseSelectFilter,
  FavoriteStar,
  Spinner,
} from "@/app.organizer";
import useCurrencySymbol from "@/composables/useCurrencySymbol";
import { useI18n } from "vue-i18n";
import useCrypto from "@/stores/useCrypto";

const props = defineProps<{
    item: TCryptoData,
    favorite: boolean,
    currencyActive: string,
    currenciesList: string[],
}>();

const emit = defineEmits<{
    (e: "addFavorite", {}): void;
    (e: "removeFavorite", {}): void;
    (e: "setCurrencyActive", {}): void;
}>();

const {
    currencyActive, currenciesList
} = useCrypto()

const crypto = ref(props.item)
const currencySymbol = computed(() => useCurrencySymbol(currencyActive.value));
const chartElement = ref();

const { t: print } = useI18n();

const currenciesListOptions = computed(() => {
  return currenciesList.value.map((c) => {
    return {
      value: c,
      label: c,
    };
  });
});

const toggleFavorite = () => {
  if (props.favorite && crypto.value) {
    emit('removeFavorite', crypto.value)
  } else if (crypto.value) emit('addFavorite',crypto.value);
};

const calculatedSparkline = computed(() => {
  if (!crypto?.value?.sparkline_in_7d?.length) return [];
  const toReduce = crypto.value.sparkline_in_7d;
  const reduced = toReduce.reduce((acc, val, index) => {
    if (index && index % 23 === 0) acc.push(val);
    return acc;
  }, new Array<number>());

  return reduced.length > 3 ? reduced : [];
});

const orderedSparkLabels = computed(() => {
  if (!calculatedSparkline.value) return [];
  return calculatedSparkline.value.map((_, index: number) => {
    if (calculatedSparkline.value) {
      return "J-" + (index - calculatedSparkline.value.length);
    } else return "";
  });
});
</script>

<template>
  <div v-if="crypto" class="relative mt-20 lg:mt-20 rounded w-full lg:w-5/6 max-w-screen-xl  align-self mx-auto">
    <div class="flex grid grid-cols-1 lg:grid-cols-10 w-full">
      <div class="image flex col-span-2 pl-2 pr-2 items-center a-1 justify-center fadeInLeft">
        <img
          v-if="crypto.image"
          v-lazy="crypto.image"
          class="w-150 h-150 border-round rounded-full"
        />
        <Spinner
          v-else
          color="#DDD"
          size="small"
          class="inline-block mx-auto"
        />
      </div>
      <div
        class="col-span-8 grid grid-cols-1 lg:grid-cols-10 items-center gradient mt-4 lg:mt-0 a-05 fadeInDown rounded-r"
      >
        <div
          class="flex col-span-10 lg:col-span-2 justify-center lg:justify-start items-center lg:p-2 lg:pr-4  font-bold text-5xl stroke-black a-1 d-600 fadeIn"
          style="-webkit-text-stroke: 2px white;"
        >
          {{
            crypto.name.length > 35
              ? crypto.name.slice(0, 35) + "..."
              : crypto.name
          }}
        </div>
        <div class="flex col-span-10 lg:col-span-1 pl-4 pr-4 items-center justify-center lg:justify-start text-gray-400">
          [{{ crypto.symbol }}]
        </div>
        <div class="flex flex-col col-span-10 lg:col-span-3 justify-center lg:justify-start  pl-4 pr-4 text-black">
          <div class="inline text-center lg:text-left">
            <span class="text-sm font-bold">{{ print("current_price") }}</span>
            :
            <template
              v-if="crypto?.pricesByCurrencies[currencyActive]?.current_price"
            >
              {{ crypto.pricesByCurrencies[currencyActive].current_price }}
              {{ currencySymbol }}
            </template>
            <span v-else class="text-sm border-1 text-gray-300">N/A</span>
          </div>
          <div class="inline text-center lg:text-left">
            <span class="text-sm font-bold">{{ print("market_cap") }}</span> :
            <template
              v-if="crypto?.pricesByCurrencies[currencyActive]?.market_cap"
            >
              {{ crypto.pricesByCurrencies[currencyActive].market_cap }}
              {{ currencySymbol }}
            </template>
            <span v-else class="text-sm border-1 text-gray-300">N/A</span>
          </div>
          <div class="inline text-center lg:text-left">
            <span class="text-sm font-bold">{{ print("total_volume") }}</span> :
            <template
              v-if="crypto?.pricesByCurrencies[currencyActive]?.total_volume"
            >
              {{ crypto.pricesByCurrencies[currencyActive].total_volume }}
              {{ currencySymbol }}
            </template>
            <span v-else class="text-sm border-1 text-gray-300">N/A</span>
          </div>
        </div>
        <div class="flex items-center justify-center lg:justify-start">
          <BaseSelectFilter
            index="currency"
            :default="currencyActive"
            :options="currenciesListOptions"
            @onChange="emit('setCurrencyActive', $event)"
            class="lg:rounded-r-full rounded-full h-10 mt-2 mb-2 lg:mt-0 lg:mb-0 shadow uppercase font-bold pl-3 a-08 d-500 fadeInDown"
          />
        </div>
        <div
          class="flex col-span-10 lg:col-span-2 items-center justify-center lg:justify-end pb-4 lg:pr-3 lg:pr-10"
        >
          <div class="flex items-center" @click.prevent.stop="toggleFavorite">
            <FavoriteStar :active="props.favorite" class="pr" />
            <span
              class="pl-1 text-xs cursor-pointer"
              :class="[(props.favorite ? 'text-gray-400 capitalize' : 'hover:underline')]"
            >
              {{ props.favorite ? print('favorite') : print('add_to_favorites')}}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div
      class="flex flex-1 w-200 items-center text-black dark:text-white lg:pr-3 mt-10"
      :ref="(ref) => (chartElement = ref)"
    >
      <template v-if="calculatedSparkline.length > 0">
        <BaseCryptoChart
          :sparkline="calculatedSparkline"
          :labels="orderedSparkLabels"
          :animation="true"
          :tooltip="true"
          :win="
            calculatedSparkline[0] <
            calculatedSparkline[calculatedSparkline.length - 1]
          "
        />
      </template>
      <div
        v-else
        class="flex flex-1 min-h-48 justify-center items-center text-sm border-1 text-gray-300 text-2xl d-2 a-1 fadeIn"
      >
        {{ print("no_graphic_found") }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.image {
  min-width: 50px;
}

.gradient {
  background: rgb(2, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 0) 6%,
    rgba(255, 255, 255, 1) 17%,
    rgba(255, 255, 255, 1) 100%
  );
}
</style>
