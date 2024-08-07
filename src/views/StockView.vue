<template>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="股票代号">
            <el-input v-model="form.stock_code" />
        </el-form-item>
        <el-form-item label="股票名称">
            <el-input v-model="form.stock_name" />
        </el-form-item>
        <el-form-item label="证券交易所">
            <!-- focus: 用户点击并打开下拉菜单时会触发加载数据的动作, change: 设置选择之后的回调函数，比如可以查看选中的value值 -->
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
        <el-form-item label="交易数量">
            <el-input v-model="form.number" />
        </el-form-item>
        <el-form-item label="买入日期">
            <el-input v-model="form.buy_date" />
        </el-form-item>
        <el-form-item label="卖出日期">
            <el-input v-model="form.sell_date" />
        </el-form-item>
        <!-- 默认的el-form-item类型是整个向左排列对其，如果需要居中效果需要自己加样式 -->
        <!-- <el-form-item>
            <el-button type="primary" @click="onCalculate">计算</el-button>
        </el-form-item> -->
        <div class="button-container">
            <el-button type="primary" @click="onCalculate" class="calculate-button">计算</el-button>
        </div>
    </el-form>

    <el-table :data="transactionResult" style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column prop="stock_code" label="股票代号" />
        <el-table-column prop="stock_name" label="股票名称" />
        <el-table-column prop="market" label="证券交易所" />
        <el-table-column prop="buy_price" label="买入价格" />
        <el-table-column prop="sell_price" label="卖出价格" />
        <el-table-column prop="number" label="交易数量" />
        <el-table-column prop="buy_cost" label="买入成本" />
        <el-table-column prop="sell_cost" label="卖出成本" />
        <el-table-column prop="total_cost" label="总成本" />
        <el-table-column prop="transaction_rate" label="股价变化率" />
        <el-table-column prop="gain_loss" label="持仓盈亏" />
        <el-table-column prop="final_profit" label="清仓收益" />
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

// do not use same name with ref
const form = reactive({
    stock_code: '',
    stock_name: '',
    market: '',
    buy_price: '',
    number: '',
    sell_price: '',
    buy_date: '',
    sell_date: '',
})

interface TransactionResult {
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

const tableRowClassName = ({
    row,
}: {
    row: TransactionResult
}) => {
    if (row.final_profit < 0) {
        return 'warning-row'
    } else {
        return 'success-row'
    }
}

const transactionResult = ref<TransactionResult[]>([]);
const onCalculate = async () => {
    // 向服务端发起计算请求，显示计算结果
    // 远程服务器验证
    try {
        const formData = new FormData();
        formData.append('stock_code', form.stock_code);
        formData.append('stock_name', form.stock_name);
        formData.append('market', form.market);
        formData.append('buy_price', form.buy_price);
        formData.append('number', form.number);
        formData.append('sell_price', form.sell_price);
        formData.append('buy_date', form.buy_date);
        formData.append('sell_date', form.sell_date);
        // 传输方式：Content-Type: multipart/form-data; boundary=--------------------------117476911423769713475413\r\n
        const requestOptions = {
            method: 'POST', // 设置请求方法为 POST
            body: formData,
        };
        const response = await fetch('http://127.0.0.1:8888/calculateTransactionProfit', requestOptions);

        const result = await response.json();

        if (response.ok) {
            ElMessage('request success.');
            // console.log(result) // 控制台查看返回的数据
            const filteredResult: TransactionResult = {
                stock_code: result.stock_code,
                stock_name: result.stock_name,
                market: result.market,
                buy_price: result.buy_price,
                sell_price: result.sell_price,
                number: result.number,
                buy_cost: result.buy_cost,
                sell_cost: result.sell_cost,
                total_cost: result.total_cost,
                transaction_rate: (result.rate * 100).toFixed(2) + '%',
                gain_loss: result.gain_loss,
                final_profit: result.final_profit,
            };
            // 服务端返回的数据不是显示想要的数据，只摘取需要显示的数据
            transactionResult.value = [filteredResult];
        } else {
            ElMessage(`request failed: ${result.message}`);
        }
    } catch (error) {
        ElMessage(`request failed: ${error.message}`);
    }
}

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
</script>