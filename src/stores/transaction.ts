import { defineStore } from "pinia";
import { format } from 'date-fns';
import { ElMessage } from 'element-plus'; // 确保安装了 element-plus


interface FormState {
    stock_code: string;
    stock_name: string;
    market: string;
    buy_price: string;
    sell_price: string;
    number: string;
    buy_date: Date | null;
    sell_date: Date | null;
}

export interface TransactionResult {
    stock_code: string
    stock_name: string
    market: string
    buy_price: number
    sell_price: number
    number: number
    buy_cost: number
    sell_cost: number
    total_cost: number
    transaction_rate: string
    gain_loss: number
    final_profit: number
}

// 定义一个store来存储单次交易的状态，保证在页面切换时，不会发生页面上的数据不会丢失
export const useTransactionStore = defineStore('transaction', {
    state: () => ({
        form: {
            stock_code: '',
            stock_name: '',
            market: '',
            buy_price: '',
            sell_price: '',
            number: '',
            buy_date: null,
            sell_date: null,
        } as FormState,
        markets: [] as string[],
        transactionResult: [] as TransactionResult[],
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
                // markets.value = data.market_type
                this.markets = data.market_type
                console.log(this.markets)
            } catch (error) {
                console.error('Error fetching markets:', error);
            }
        },
        handleMarketChange() {
            console.log('Selected region:', this.form.market);
        },
        async onCalculate() {
            // 向服务端发起计算请求，显示计算结果
            // 远程服务器验证
            try {
                const formData = new FormData();
                formData.append('stock_code', this.form.stock_code);
                formData.append('stock_name', this.form.stock_name);
                formData.append('market', this.form.market);
                formData.append('buy_price', this.form.buy_price.toString());
                formData.append('number', this.form.number.toString());
                formData.append('sell_price', this.form.sell_price.toString());
                // format函数的作用就是将“Wed Jul 31 2024 09:49:19 GMT+0800 (中国标准时间)”类型的时间数据转化成服务器要求的时间格式“yyyy-MM-dd HH:mm:ss”
                formData.append('buy_date', format(new Date(this.form.buy_date!), 'yyyy-MM-dd HH:mm:ss'));
                formData.append('sell_date', format(new Date(this.form.sell_date!), 'yyyy-MM-dd HH:mm:ss'));
                // 传输方式：Content-Type: multipart/form-data; boundary=--------------------------117476911423769713475413\r\n
                const requestOptions = {
                    method: 'POST', // 设置请求方法为 POST
                    body: formData,
                };
                const response = await fetch('http://127.0.0.1:8888/calculateTransactionProfit', requestOptions);

                const result = await response.json();

                if (response.ok) {
                    ElMessage('request success.');
                    const data = result.data // 获取数据
                    console.log(data)
                    const filteredResult: TransactionResult = {
                        stock_code: data.stock_code,
                        stock_name: data.stock_name,
                        market: data.market,
                        buy_price: data.buy_price,
                        sell_price: data.sell_price,
                        number: data.number,
                        buy_cost: data.buy_cost,
                        sell_cost: data.sell_cost,
                        total_cost: data.total_cost,
                        transaction_rate: (data.rate * 100).toFixed(2) + '%',
                        gain_loss: data.gain_loss,
                        final_profit: data.final_profit,
                    };
                    // 服务端返回的数据不是显示想要的数据，只摘取需要显示的数据
                    this.transactionResult = [filteredResult];
                    console.log(this.transactionResult)
                } else {
                    ElMessage(`request failed: ${result.message}`);
                }
            } catch (error) {
                ElMessage(`request failed: ${error.message}`);
            }
        }
    },
})