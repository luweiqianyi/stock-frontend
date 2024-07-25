<template>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="股票代号">
            <el-input v-model="form.stock_code" />
        </el-form-item>
        <el-form-item label="股票名称">
            <el-input v-model="form.stock_name" />
        </el-form-item>
        <el-form-item label="买入价格">
            <el-input v-model="form.buy_price" />
        </el-form-item>
        <el-form-item label="买入数量">
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
</template>

<style>
.button-container {
    display: flex;
    justify-content: center;
}

.calculate-button {
    width: 20%;
}
</style>

<script lang="ts" setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
const router = useRouter()

// do not use same name with ref
const form = reactive({
    stock_code: '',
    stock_name: '',
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
        // console.error('Error fetching zones:', error);
    }
}
</script>