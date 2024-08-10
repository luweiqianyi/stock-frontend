<template>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="证券交易所">
            <el-select v-model="form.market" placeholder="please select your market" @focus="loadMarkets"
                @change="handleMarketChange">
                <el-option v-for="market in markets" :key="market" :label="market" :value="market" />
            </el-select>
        </el-form-item>
        <el-form-item label="买入价格">
            <el-input v-model="form.buy_price" />
        </el-form-item>
        <el-form-item label="卖出价格">
            <el-input v-model="form.sell_price" />
        </el-form-item>
        <el-form-item label="账户余额">
            <el-input v-model="form.balance" />
        </el-form-item>
        <div class="button-container">
            <el-button type="primary" @click="onCalculate" class="calculate-button">计算</el-button>
        </div>
    </el-form>


    <el-table :data="expectedResult" style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column prop="market" label="证券交易所" />
        <el-table-column prop="buy_price" label="买入价格" />
        <el-table-column prop="sell_price" label="卖出价格" />
        <el-table-column prop="number" label="交易数量" />
        <el-table-column prop="invested_captical" label="投入本金" />
        <el-table-column prop="profit" label="最终收益" />
    </el-table>
</template>

<style>
.button-container {
    display: flex;
    justify-content: center;
}

.calculate-button {
    width: 20%;
}

.el-table .warning-row {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
    --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const form = reactive({
    market: '',
    buy_price: '',
    sell_price: '',
    balance: '',
})

// 获取证券交易所下拉框的数据
const markets = ref([]);
const loadMarkets = async () => {
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
        markets.value = data.market_type
    } catch (error) {
        console.error('Error fetching markets:', error);
    }
};
// 查看选择的值具体的值是什么
const handleMarketChange = () => {
    console.log('Selected region:', form.market);
};

interface ExpectedResult {
    market: string
    buy_price: number
    sell_price: number
    number: number
    invested_captical: number
    profit: number
}

const tableRowClassName = ({
    row,
}: {
    row: ExpectedResult
}) => {
    if (row.final_profit < 0) {
        return 'warning-row'
    } else {
        return 'success-row'
    }
}

const expectedResult = ref<ExpectedResult[]>([]);
const onCalculate = async () => {
    // 向服务端发起计算请求，显示计算结果
    // 远程服务器验证
    try {
        const formData = new FormData();
        formData.append('market', form.market);
        formData.append('buy_price', form.buy_price);
        formData.append('sell_price', form.sell_price);
        formData.append('balance', form.balance);
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
                number: data.number,
                invested_captical: data.invested_captical,
                profit: data.profit,
            };
            // 服务端返回的数据不是显示想要的数据，只摘取需要显示的数据
            expectedResult.value = [filteredResult];
        } else {
            ElMessage(`request failed: ${result.message}`);
        }
    } catch (error) {
        ElMessage(`request failed: ${error.message}`);
    }
}
</script>
