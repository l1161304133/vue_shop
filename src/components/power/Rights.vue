<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 权限列表区域 -->
        <el-card>
            <el-table :data="rightsList" border stripe height="500px"  v-loading="loading">
                <el-table-column type="index">  
                </el-table-column>
                <el-table-column prop="authName" label="权限名称">
                </el-table-column>
                <el-table-column prop="path" label="路径">  
                </el-table-column>
                <el-table-column prop="level" label="权限等级">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.level === '0'">一级</el-tag>
                        <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
                        <el-tag type="danger" v-else>三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                // 从接口获取的列表数据
                rightsList: [],
                loading:true
            }
        },
        methods: {
            async getRightsList() {
                const {
                    data: res
                } = await this.$http.get('rights/list')
                if (res.meta.status != 200) return this.$message.error('获取列表失败！')
                this.rightsList = res.data
                
            }
        },
        created() {
            this.getRightsList()
            setTimeout(()=>this.loading=false,500)
        },
    }
</script>
<style Lang="less" scoped>

</style>