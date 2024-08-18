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
            <el-date-picker v-model="form.buy_date" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                placeholder="Select date and time" />
        </el-form-item>
        <el-form-item label="卖出日期">
            <el-date-picker v-model="form.sell_date" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                placeholder="Select date and time" />
        </el-form-item>
        <!-- 默认的el-form-item类型是整个向左排列对其，如果需要居中效果需要自己加样式，比如下面的按钮 -->
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
import { ref } from 'vue'; // 需要使用ref组件来保证渲染是响应式的渲染。
import { useTransactionStore } from '@/stores/transaction';
import type { TransactionResult } from '@/stores/transaction';

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

const store = useTransactionStore();

const form = store.form
const markets = ref<string[]>(store.markets)
const loadMarkets = async () => {
    await store.loadMarkets();
    markets.value = store.markets;
}

// 界面中的函数需要去引用store中定义的函数，完成程序的功能
const handleMarketChange = store.handleMarketChange

const transactionResult = ref(store.transactionResult);
const onCalculate = async () => {
    await store.onCalculate();
    transactionResult.value = store.transactionResult
}

</script>