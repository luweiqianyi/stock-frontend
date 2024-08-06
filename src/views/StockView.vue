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
        <el-form-item label="交易数量">
            <el-input v-model="form.number" />
        </el-form-item>
        <el-form-item label="卖出价格">
            <el-input v-model="form.sell_price" />
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
import { useRouter } from 'vue-router'
const router = useRouter()

// do not use same name with ref
const form = reactive({
    stock_code: '',
    stock_name: '',
    market: '',
    buy_price: '',
    number: '',
    sell_price: '',
})

const onCalculate = async () => {
    // 向服务端发起计算请求，显示计算结果
    // 远程服务器验证
    try {
        const response = await fetch('http://localhost:8081/profit_calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                stock_code: form.stock_name,
                stock_name: form.stock_name,
                buy_price: form.buy_price,
                number: form.number,
                sell_price: form.sell_price,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            ElMessage('request success.');
            router.push('/element-ui') // 登录成功，跳转到指定页面
        } else {
            ElMessage(`request failed: ${result.message}`);
        }
    } catch (error) {
        ElMessage(`request failed: ${error.message}`);
    }
}

interface TransactionResult {
    stock_code: string
    stock_name: string
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

const transactionResult: TransactionResult[] = [
    {
        stock_code: '600030',
        stock_name: '中信证券',
        buy_price: 19.49,
        sell_price: 19.60,
        number: 2200,
        buy_cost: 10.522261,
        sell_cost: 32.141648,
        total_cost: 42.663909,
        transaction_rate: '0.56%',
        gain_loss: 231.477739,
        final_profit: 199.336091,
    },
    {
        stock_code: '600250',
        stock_name: '南京商旅',
        buy_price: 8.43,
        sell_price: 9.00,
        number: 14000,
        buy_cost: 28.962108,
        sell_cost: 93.920400,
        total_cost: 122.882508,
        transaction_rate: '6.76%',
        gain_loss: 7951.037892,
        final_profit: 7857.117492,
    },
    {
        stock_code: '603019',
        stock_name: '中科曙光',
        buy_price: 44,
        sell_price: 42.82,
        number: 1800,
        buy_cost: 19.435680,
        sell_cost: 57.452450,
        total_cost: 76.888130,
        transaction_rate: '-2.68%',
        gain_loss: -2143.435680,
        final_profit: -2200.888130,
    },
]

const markets = ref([]);
const loadMarkets = async () => {
    try {
        const requestOptions = {
            method: 'POST', // 设置请求方法为 POST
            headers: {
                'Content-Type': 'application/json', // 设置请求头为 JSON
                // 如果需要授权信息或其他自定义头部，可以在这里添加
            },
            // 如果有请求体数据，在这里添加
            // body: JSON.stringify({ key: 'value' }),
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