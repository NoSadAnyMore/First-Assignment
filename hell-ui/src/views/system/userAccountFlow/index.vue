<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
			<el-form-item label="用户名称" prop="userId">
				<el-input v-model="queryParams.userId" placeholder="请输入操作数量" clearable @keyup.enter.native="handleQuery" />
			</el-form-item>
			<el-form-item label="操作数量" prop="operateNum">
				<el-input v-model="queryParams.operateNum" placeholder="请输入操作数量" clearable @keyup.enter.native="handleQuery" />
			</el-form-item>
			<el-form-item label="操作时间" prop="operateTime">
				<el-date-picker clearable v-model="queryParams.operateTime" type="date" value-format="yyyy-MM-dd" placeholder="请选择操作时间">
				</el-date-picker>
			</el-form-item>
			<el-form-item label="来源" prop="source">
				<el-input v-model="queryParams.source" placeholder="请输入来源" clearable @keyup.enter.native="handleQuery" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
				<el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<el-row :gutter="10" class="mb8">
			<el-col :span="1.5">
				<el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:userAccountFlow:add']">新增</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['system:userAccountFlow:edit']">修改</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
				 v-hasPermi="['system:userAccountFlow:remove']">删除</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['system:userAccountFlow:export']">导出</el-button>
			</el-col>
			<right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
		</el-row>

		<el-table v-loading="loading" :data="userAccountFlowList" @selection-change="handleSelectionChange">
			<el-table-column type="selection" width="55" align="center" />
			<el-table-column label="用户名称" align="center" prop="userName" />
			<el-table-column label="操作数量" align="center" prop="operateNum" />
			<el-table-column label="操作时间" align="center" prop="operateTime" width="180">
				<template slot-scope="scope">
					<span>{{ parseTime(scope.row.operateTime, '{y}-{m}-{d}') }}</span>
				</template>
			</el-table-column>
			<el-table-column label="来源" align="center" prop="source" />
			<el-table-column label="删除标注" align="center" prop="deleteFlag" />
			<el-table-column label="操作" align="center" class-name="small-padding fixed-width">
				<template slot-scope="scope">
					<el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:userAccountFlow:edit']">修改</el-button>
					<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['system:userAccountFlow:remove']">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
		 @pagination="getList" />

		<!-- 添加或修改用户金币流水记录对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-form-item label="用户名称" prop="userId">
					<el-select v-model="form.userId" filterable clearable remote reserve-keyword placeholder="请输入用户名查找" :remote-method="remoteMethod"
					 @change="handleSelectChange">
						<el-option v-for="item in userOption" :key="item.id" :label="item.userName" :value="item.userId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="操作数量" prop="operateNum">
					<el-input v-model="form.operateNum" placeholder="请输入操作数量" />
				</el-form-item>
				<!-- <el-form-item label="操作时间" prop="operateTime">
					<el-date-picker clearable v-model="form.operateTime" type="date" value-format="yyyy-MM-dd" placeholder="请选择操作时间">
					</el-date-picker>
				</el-form-item>
				<el-form-item label="来源" prop="source">
					<el-input v-model="form.source" placeholder="请输入来源" />
				</el-form-item>
				<el-form-item label="删除标注" prop="deleteFlag">
					<el-input v-model="form.deleteFlag" placeholder="请输入删除标注" />
				</el-form-item> -->
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitForm">确 定</el-button>
				<el-button @click="cancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import {
		listUserAccountFlow,
		getUserAccountFlow,
		delUserAccountFlow,
		addUserAccountFlow,
		updateUserAccountFlow
	} from "@/api/system/userAccountFlow";
	import {
		listUser
	} from "@/api/system/user";
	export default {
		name: "UserAccountFlow",
		data() {
			return {
				// 遮罩层
				loading: true,
				// 选中数组
				ids: [],
				// 非单个禁用
				single: true,
				// 非多个禁用
				multiple: true,
				// 显示搜索条件
				showSearch: true,
				// 总条数
				total: 0,
				// 用户金币流水记录表格数据
				userAccountFlowList: [],
				// 弹出层标题
				title: "",
				// 是否显示弹出层
				open: false,
				// 查询参数
				queryParams: {
					pageNum: 1,
					pageSize: 10,
					userId: null,
					operateNum: null,
					operateTime: null,
					source: null,
				},
				// 表单参数
				form: {},
				// 表单校验
				rules: {
					userId: [{
						required: true,
						message: "用户ID不能为空",
						trigger: "blur"
					}],
					operateNum: [{
						required: true,
						message: "操作数量不能为空",
						trigger: "blur"
					}],
				},
				userOption: []
			};
		},
		created() {
			this.getList();
		},
		methods: {
			/** 查询用户金币流水记录列表 */
			getList() {
				this.loading = true;
				listUserAccountFlow(this.queryParams).then(response => {
					this.userAccountFlowList = response.rows;
					this.total = response.total;
					this.loading = false;
				});
			},
			// 取消按钮
			cancel() {
				this.open = false;
				this.reset();
			},
			// 表单重置
			reset() {
				this.form = {
					id: null,
					userId: null,
					operateNum: null,
					operateTime: null,
					source: null,
					deleteFlag: null
				};
				this.resetForm("form");
			},
			/** 搜索按钮操作 */
			handleQuery() {
				this.queryParams.pageNum = 1;
				this.getList();
			},
			/** 重置按钮操作 */
			resetQuery() {
				this.resetForm("queryForm");
				this.handleQuery();
			},
			// 多选框选中数据
			handleSelectionChange(selection) {
				this.ids = selection.map(item => item.id)
				this.single = selection.length !== 1
				this.multiple = !selection.length
			},
			/** 新增按钮操作 */
			handleAdd() {
				this.reset();
				this.open = true;
				this.title = "添加用户金币流水记录";
			},
			/** 修改按钮操作 */
			handleUpdate(row) {
				this.reset();
				const id = row.id || this.ids
				getUserAccountFlow(id).then(response => {
					this.form = response.data;
					this.open = true;
					this.title = "修改用户金币流水记录";
				});
			},
			/** 提交按钮 */
			submitForm() {
				this.form.source = "后台管理添加"
				this.$refs["form"].validate(valid => {
					if (valid) {
						if (this.form.id != null) {
							updateUserAccountFlow(this.form).then(response => {
								this.$modal.msgSuccess("修改成功");
								this.open = false;
								this.getList();
							});
						} else {

							addUserAccountFlow(this.form).then(response => {
								this.$modal.msgSuccess("新增成功");
								this.open = false;
								this.getList();
							});
						}
					}
				});
			},
			/** 删除按钮操作 */
			handleDelete(row) {
				const ids = row.id || this.ids;
				this.$modal.confirm('是否确认删除用户金币流水记录编号为"' + ids + '"的数据项？').then(function() {
					return delUserAccountFlow(ids);
				}).then(() => {
					this.getList();
					this.$modal.msgSuccess("删除成功");
				}).catch(() => {});
			},
			/** 导出按钮操作 */
			handleExport() {
				this.download('system/userAccountFlow/export', {
					...this.queryParams
				}, `userAccountFlow_${new Date().getTime()}.xlsx`)
			},
			remoteMethod(query) {
				if (query !== '') {
					let params = {
						pageSize: 100,
						pageNum: 1,
						name: query
					}
					listUser(params).then(res => {
						this.userOption = res.rows
					})
				} else {
					this.options = [];
				}
			},
			handleSelectChange(selectedId) {
				const selectedItem = this.userOption.find(item => item.userId === selectedId);
				if (selectedItem) {
					this.form.userName = selectedItem.userName;
				} else {
					this.form.userId = ''
					this.form.userName = ''; // 没有找到时清空名称
				}
			}
		}
	};
</script>
