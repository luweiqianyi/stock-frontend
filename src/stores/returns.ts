import { defineStore } from "pinia";
import { ElMessage } from 'element-plus';

interface ExpectedReturnsState {
    market: string;
    buy_price: number | null;
    sell_price: number | null;
    balance: number | null;
}

export interface ExpectedResult {
    market: string
    buy_price: number
    sell_price: number
    rate: string
    number: number
    invested_captical: number
    buy_cost: number
    sell_cost: number
    total_cost: number
    profit: number
}

export const useExpectedReturnsStore = defineStore('expected-returns', {
    state: () => ({
        form: {
            market: '',
            buy_price: null,
            sell_price: null,
            balance: null,
        } as ExpectedReturnsState,
        markets: [] as string[],
        expectedResult: [] as ExpectedResult[],
    }),
    actions: {
        async loadMarkets() {
            try {
                const requestOptions = {
                    method: 'POST', // 设置请求方法为 POST
                };

                const response = await fetch('http://127.0.0.1:8887/listMarketType', requestOptions);

                // 检查响应状态码
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // 确保响应的内容类型是 JSON
                const contentType = response.headers.get("content-type");
                console.log(contentType)
                if (!contentType || !contentType.includes("application/json")) {
                    throw new TypeError("Received non-JSON response");
                }

                const data = await response.json();
                this.markets = data.market_type //json返回的就是market_type
                console.log(this.markets)
            } catch (error) {
                console.error('Error fetching markets:', error);
            }
        },
        handleMarketChange() {
            console.log('Selected region:', this.form.market);
        },
        async calculateExpectedReturns() {
            try {
                const formData = new FormData();
                formData.append('market', this.form.market);
                formData.append('buy_price', this.form.buy_price ? this.form.buy_price.toString() : '0');
                formData.append('sell_price', this.form.sell_price ? this.form.sell_price.toString() : '0');
                formData.append('balance', this.form.balance ? this.form.balance.toString() : '0');
                const requestOptions = {
                    method: 'POST', // 设置请求方法为 POST
                    body: formData,
                };
                const response = await fetch('http://127.0.0.1:8888/calExpectedReturns', requestOptions);

                const result = await response.json();

                if (response.ok) {
                    ElMessage('request success.');
                    const data = result.data // 获取数据
                    const filteredResult: ExpectedResult = {
                        market: data.market,
                        buy_price: data.buy_price,
                        sell_price: data.sell_price,
                        rate: (data.rate * 100).toFixed(2) + '%',
                        number: data.number,
                        invested_captical: data.invested_captical,
                        buy_cost: data.buy_cost,
                        sell_cost: data.sell_cost,
                        total_cost: data.total_cost,
                        profit: data.profit,
                    };
                    // 服务端返回的数据不是显示想要的数据，只摘取需要显示的数据
                    this.expectedResult = [filteredResult];
                } else {
                    ElMessage(`request failed: ${result.message}`);
                }
            }
            catch (error) {
                const err = error as Error;
                ElMessage(`request failed: ${err.message}`);
            }
        }
    },
})