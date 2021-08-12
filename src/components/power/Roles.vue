<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 添加角色按钮 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addRolesVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表 -->
            <el-table :data="rolesList" stripe border>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template v-slot="scope">
                        <!-- 一级权限列表 -->
                        <el-row :class="['botbottom',i1 == 0?'bottop':'','vcenter']"
                            v-for="(item1,i1) in scope.row.children" :key="item1.id">
                            <el-col :span="5">
                                <el-tag type="primary" closable @close="delRightsById(scope.row,item1.id)">
                                    {{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19">
                                <!-- 二级权限列表 -->
                                <el-row :class="[i2==0?'':'bottop','vcenter']" v-for="(item2,i2) in item1.children"
                                    :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="delRightsById(scope.row,item2.id)">
                                            {{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <!-- 三级权限列表 -->
                                        <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id"
                                            closable @close="delRightsById(scope.row,item3.id)">{{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作">
                    <template v-slot="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRoles(scope.row.id)">编辑
                        </el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="delRolesById·(scope.row.id)">
                            删除
                        </el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightsDialog(scope.row)">分配权限
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 添加角色对话框 -->
        <el-dialog title="添加角色" :visible.sync="addRolesVisible" width="50%" @close="addRolesFormReset">
            <el-form ref="addRolesRef" :model="addRolesForm" label-width="80px" :rules="addRolesFormRules">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addRolesForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addRolesForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addRolesVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRoles">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="编辑角色" :visible.sync="editRolesVisible" width="50%">
            <el-form :model="editRolesForm">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editRolesForm.roleName" disabled></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editRolesForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRolesVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRolesSubmit(editRolesForm.roleId)">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="分配权限" :visible.sync="setRightsDialogVisible" width="50%">
            <el-tree :data="rightTree" :props="rightsProps" 
            show-checkbox node-key="id" :default-checked-keys="defKeys" default-expand-all ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                // 角色列表数据,查询
                rolesList: [],
                // 控制添加角色对话框的显隐
                addRolesVisible: false,
                // 控制编辑角色对话框的显隐
                editRolesVisible: false,
                // 添加角色表单数据
                addRolesForm: {},
                // 添加角色规则验证
                addRolesFormRules: {
                    roleName: [{
                        required: true,
                        message: '请输入角色名称',
                        trigger: 'blur'
                    }]
                },
                editRolesForm: {},
                setRightsDialogVisible: false,
                rightTree:{},
                rightsProps:{
                    children:'children',
                    label:'authName'
                },
                defKeys:[],
                // 当前角色id
                roleId:''

            }
        },
        methods: {
            // 获取角色列表
            async getRolesList() {
                const {
                    data: res
                } = await this.$http.get('roles')
                if (res.meta.status != 200) return this.$message.error('获取列表失败！')
                this.rolesList = res.data
            },
            async addRoles() {
                const {
                    data: res
                } = await this.$http.post('roles', this.addRolesForm)
                if (res.meta.status != 201) return this.$message.error('添加角色失败！')
                this.$message.success('成功添加角色！')
                this.addRolesVisible = false
                this.getRolesList()
            },
            addRolesFormReset() {
                this.$refs.addRolesRef.resetFields()
            },
            // 获取要编辑的角色数据
            async editRoles(id) {
                this.editRolesVisible = true
                // console.log(id)
                const {
                    data: res
                } = await this.$http.get('roles/' + id) //$http是请求的接口
                if (res.meta.status != 200) return this.$message.error('获取数据失败！ ')
                this.editRolesForm = res.data
                console.log(this.editRolesForm);

            },
            // 编辑角色
            async editRolesSubmit(id) {
                const {
                    data: res
                } = await this.$http.put('roles/' + id, this.editRolesForm) //$http是请求的接口
                if (res.meta.status != 200) return this.$message.error('操作失败！')
                this.$message.success('操作成功！')
                this.editRolesVisible = false
                this.getRolesList()
            },
            async delRolesById(id) {
                const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                if (confirmResult == 'confirm') {
                    const {
                        data: res
                    } = await this.$http.delete('roles/' + id)
                    if (res.meta.status != 200) {
                        return this.$message.error('操作失败！')
                    }
                    this.getRolesList()
                    return this.$message.success('删除成功！')

                }
            },
            async delRightsById(role, rightId) {
                const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                if (confirmResult != 'confirm') return this.$message.info('取消了删除！')
                const {
                    data: res
                } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                if (res.meta.status != 200) return this.$message.error('操作失败！')
                this.$message.success('删除权限成功！')
                role.children = res.data
            },
            // 分配权限对话框
            async showSetRightsDialog(role) {
                const {data:res} = await this.$http.get('rights/tree')
                if(res.meta.status!=200) return this.$message.error('操作失败！')
                
                this.rightTree = res.data
                this.defKeys=[] 
                this.getLeafKeys(role,this.defKeys)
                this.setRightsDialogVisible = true
                this.roleId=role.id
            },
            getLeafKeys(node,arr){
                if(!node.children){
                    return arr.push(node.id)
                }
                node.children.forEach(item => 
                    this.getLeafKeys(item,arr)
                )
            },
            // 点击为角色分配权限
            async allotRights(){
                const keys=[
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()
                ]
                const idStr=keys.join(',')
                console.log(idStr)
                const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
                if(res.meta.status!=200) return this.$message.error('操作失败！')
                
                this.$message.success('操作成功！')
                this.getRolesList()
                this.setRightsDialogVisible = false
            }

        },

        created() {
            this.getRolesList()
        },
    }
</script>
<style Lang="less" scoped>
    .el-tag {
        margin: 7px;
    }

    .bottop {
        border-top: 2px solid #eee;
    }

    .botbottom {
        border-bottom: 2px solid #eee;
    }

    .vcenter {
        display: flex;
        align-items: center;
    }
</style>