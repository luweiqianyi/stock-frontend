<template>
    <el-button type="primary" @click="queryAllTransactions" class="query-all=transaction-button">查询所有已成交交易</el-button>
    <el-table :data="transactionResult" style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column prop="stock_code" label="股票代号" />
        <el-table-column prop="stock_name" label="股票名称" />
        <el-table-column prop="market" label="证券交易所" />
        <el-table-column prop="buy_price" label="买入价格" />
        <el-table-column prop="sell_price" label="卖出价格" />
        <el-table-column prop="number" label="交易数量" />
        <el-table-column prop="buy_date" label="买入日期" />
        <el-table-column prop="sell_date" label="卖出日期" />
        <el-table-column prop="buy_cost" label="买入成本" />
        <el-table-column prop="sell_cost" label="卖出成本" />
        <el-table-column prop="total_cost" label="总成本" />
        <el-table-column prop="transaction_rate" label="股价变化率" />
        <el-table-column prop="gain_loss" label="持仓盈亏" />
        <el-table-column prop="final_profit" label="清仓收益" />
    </el-table>
</template>

<style>
.el-table .warning-row {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
    --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>

<script lang="ts" setup>
import { ref } from 'vue'

interface TransactionResult {
    stock_code: string
    stock_name: string
    market: string
    buy_price: number
    sell_price: number
    number: number
    buy_date: string
    sell_date: string
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
const queryAllTransactions = async () => {
    try {
        const requestOptions = {
            method: 'POST', // 设置请求方法为 POST
        };

        const response = await fetch('http://127.0.0.1:8888/listAllTransactionRecords', requestOptions);

        // 检查响应状态码
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 确保响应的内容类型是 JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("data is not json format");
        }
        const result = await response.json();
        if (result.result == 0) {
            const newData = result.data.map((item: any) => ({
                ...item,
                transaction_rate: (item.rate * 100).toFixed(2) + '%'
            }));
            transactionResult.value = newData
        } else {
            console.log("empty data.")
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}
</script>