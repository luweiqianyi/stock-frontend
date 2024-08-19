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
            <div class="price-info">
                <span>涨停价格：{{ ceil_price }}</span> |
                <span>跌停价格：{{ floor_price }}</span>
            </div>
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
        <el-table-column prop="rate" label="股价变化率" />
        <el-table-column prop="number" label="交易数量" />
        <el-table-column prop="invested_captical" label="投入本金" />
        <el-table-column prop="buy_cost" label="买入费用" />
        <el-table-column prop="sell_cost" label="卖出费用" />
        <el-table-column prop="total_cost" label="总费用" />
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

import { ref, computed } from 'vue'; // 需要使用ref组件来保证渲染是响应式的渲染。
import { useExpectedReturnsStore } from '@/stores/returns';
import type { ExpectedResult } from '@/stores/returns';

// 表格样式计算
const tableRowClassName = ({
    row,
}: {
    row: ExpectedResult
}) => {
    if (row.profit < 0) {
        return 'warning-row'
    } else {
        return 'success-row'
    }
}

const store = useExpectedReturnsStore();
const form = store.form

// 计算涨停价格和跌停价格
const ceil_price = computed(() => form.buy_price ? (form.buy_price * 1.1).toFixed(2) : '0');
const floor_price = computed(() => form.buy_price ? (form.buy_price * 0.9).toFixed(2) : '0');

// 界面中获取交易所类型
const markets = ref<string[]>(store.markets)
const loadMarkets = async () => {
    await store.loadMarkets();
    markets.value = store.markets;
}

// 控制台输出当前选择的交易所
const handleMarketChange = store.handleMarketChange

// 计算预期收益函数
const expectedResult = ref(store.expectedResult);
const onCalculate = async () => {
    await store.calculateExpectedReturns();
    expectedResult.value = store.expectedResult
}
</script>
