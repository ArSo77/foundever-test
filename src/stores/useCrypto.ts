import {TCryptoData, TCryptoDefaultStates, TEntryCategoryData, TEntryCryptoData} from "@/stores/crypto.types";
import useLocalStorage from "@/composables/useLocalStorage";
import {LOCALSTORAGE_CRYPTO_CURRENCY, LOCALSTORAGE_CRYPTO_FAVORITES} from "@/app.storages";
import {computed, reactive, toRefs} from "vue";
import axios from "axios";

const URL_API = "https://api.coingecko.com/api/v3";

const _loadFavorites = (): Map<string,TCryptoData> => {
    const favorites: [string, TCryptoData][] = useLocalStorage.get(LOCALSTORAGE_CRYPTO_FAVORITES)
    if (favorites && Object.entries(favorites).length)
    {
        const map = new Map<string,TCryptoData>();
        for (const [key, value] of Object.values(favorites)) map.set(key, value);
        return map
    }
    else return new Map();
}

const state: TCryptoDefaultStates = reactive({
    cryptoList: new Map(),
    currenciesList: [],
    categoriesList: [],
    currencyActive: useLocalStorage.get(LOCALSTORAGE_CRYPTO_CURRENCY) || 'eur',
    categoryActive: null,
    cryptoFavorites: _loadFavorites(),
})

const isReadyCategories = computed(()=> !!state.categoriesList.length)
const isReadyCurrencies = computed(()=> !!state.currenciesList.length)
const isReadyCryptoList = computed(()=> !!state.cryptoList.size)

export default function useCrypto() {

    const fetchCurrenciesList = async(): Promise<void> => {
        //DevNote: It's for cache API request for dev and not pay it ...
        if (!isReadyCurrencies.value) {
            const cacheCurrencies = useLocalStorage.get("temp_currencies");
            if (cacheCurrencies && Object.entries(cacheCurrencies).length) {
                state.currenciesList = cacheCurrencies;
            }
            else {
                const response = await axios.get(
                    `${URL_API}/simple/supported_vs_currencies`
                );
                if (response.data.length) state.currenciesList = response.data;
                useLocalStorage.set("temp_currencies", response.data);
            }
        }
    }

    const fetchCategoriesList = async(): Promise<void> => {
        if (!isReadyCategories.value) {
            //DevNote: It's for cache API request for dev and not pay it ...
            const cacheCategories = useLocalStorage.get("temp_categories");

            if (cacheCategories && Object.entries(cacheCategories).length) state.categoriesList = cacheCategories;
            else {
                const response = await axios.get(`${URL_API}/coins/categories/list`);
                if (response.data.length)
                    response.data.forEach((e: TEntryCategoryData) => {
                        state.categoriesList.push({ id: e.category_id, name: e.name });
                    });
                useLocalStorage.set("temp_categories", state.categoriesList);
            }
        }
    }


    const fetchCryptoList = async(): Promise<void> => {
        //DevNote: It's for cache API request for dev and not pay it ...
        if (!isReadyCryptoList.value) {
        const cacheCryptoList = useLocalStorage.get("temp_crypto");
        if (cacheCryptoList && Object.entries(cacheCryptoList).length) {
            cacheCryptoList.forEach(([index, e]:[index: string, e: TCryptoData]) => {
                state.cryptoList.set(e.id, { ...e, pricesByCurrencies: {} });
            });
        } else {
            const response = await axios.get(`${URL_API}/coins/list`);
            if (response.data.length)
                for (let e of response.data) {
                    state.cryptoList.set(e.id, { ...e, pricesByCurrencies: {} });
                }
            useLocalStorage.set("temp_crypto", Array.from(state.cryptoList))
        }
        }
    }


    const fetchCryptosInfos = async(optimizedList: TCryptoData[]): Promise<void> => {
        const requestIds = optimizedList.filter((crypto) =>
            !crypto.pricesByCurrencies[state.currencyActive]
        );
        if (requestIds.length) {
        const ids = requestIds.map((e) => e.id);

        const query = {
            ids: ids.join(","),
            vs_currency: state.currencyActive,
            per_page: 250,
            include_24h_vol: true,
            include_24hr_change: true,
            include_last_updated_at: true,
            sparkline: true,
        };

        const response = await axios.get(`${URL_API}/coins/markets`, {
            params: query,
        });

        if (response.data) {
            const responseArray: TEntryCryptoData[] = Object.values(
                response.data
            );
            if (responseArray.length) {
                responseArray.map((value) => {
                    const key = value.id;
                    const item = state.cryptoList.get(key);
                    if (item) {
                        item.image = value.image;
                        item.sparkline_in_7d = value.sparkline_in_7d.price
                        item.pricesByCurrencies[state.currencyActive] = {
                            current_price: value.current_price,
                            market_cap: value.market_cap,
                            total_volume: value.total_volume,
                            price_change_24h: value.price_change_24h,
                        };
                        state.cryptoList.set(key, item);
                        if (state.cryptoFavorites.get(key)) state.cryptoFavorites.set(key, item);
                    }
                });
            }
        }
    }
    }


    const setCurrencyActive = (currency: string) => {
        state.currencyActive = currency;
        useLocalStorage.set(LOCALSTORAGE_CRYPTO_CURRENCY, state.currencyActive);
    }

    const addFavorite = (crypto: TCryptoData) => {
        state.cryptoFavorites.set(crypto.id, {
            id: crypto.id,
            name: crypto.name,
            symbol: crypto.name,
            pricesByCurrencies: {}
        });
        useLocalStorage.set(LOCALSTORAGE_CRYPTO_FAVORITES, Array.from(state.cryptoFavorites));
    }

    const removeFavorite = (crypto: TCryptoData) => {
        state.cryptoFavorites.delete(crypto.id);
        useLocalStorage.set(LOCALSTORAGE_CRYPTO_FAVORITES, Array.from(state.cryptoFavorites));
    }


    return {
        ...toRefs(state),
        state,
        isReadyCategories,
        isReadyCurrencies,
        isReadyCryptoList,
        fetchCurrenciesList,
        fetchCategoriesList,
        fetchCryptoList,
        fetchCryptosInfos,
        setCurrencyActive,
        addFavorite,
        removeFavorite
    }
}
