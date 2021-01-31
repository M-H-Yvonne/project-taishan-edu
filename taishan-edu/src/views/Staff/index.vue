<template>
	<el-container>
		<el-header>
			<el-form>
				<el-col :span="9">
					<!--input中change：失去焦点或回车时触发-->
					<el-form-item label="员工名字" label-width="100px">
						<el-input placeholder="请输入搜索内容" clearable prefix-icon="el-icon-search"
								v-model="search.stf_name" @change="serchStaffNameChangeHandler"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="13">
					<el-form-item label="员工类型" label-width="100px">
						<el-select placeholder="- 请选择 -" v-model="search.stf_category" @change="serchStaffCategoryChangeHandler">
							<el-option label="- 所有类型 -" :value="0"></el-option>
							<el-option
								v-for="item in serchStaffMode"
								:key="item.dic_id"
								:label="item.dic_name"
								:value="item.dic_id"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="1">
					<el-button type="success" @click="beforeAdd"><i class="el-icon-plus">新增</i></el-button>
				</el-col>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="staffList" border>
				<el-table-column type="index" label="#" align="center"></el-table-column>
				<el-table-column prop="stf_name" label="员工名" width="100" align="center"></el-table-column>
				<el-table-column label="职务类型" width="180" align="center">
					<template slot-scope="{ row }">
						<span v-if="row.stf_category!==0"
							v-text="serchStaffMode.find(item => item.dic_id===row.stf_category).dic_name"></span>
						<span v-else class="no-staff">无职务</span>
					</template>
				</el-table-column>
				<el-table-column label="备注">
					<template slot-scope="{ row }">
						<span v-if="row.stf_remark===''" :class="{noremark:row.stf_remark===''}">暂无相关备注……</span>
						<span v-else v-text="row.stf_remark"></span>
					</template>
				</el-table-column>
				<el-table-column label="员工状态" width="80" align="center">
					<template slot-scope="{ row }">
						<span v-if="row.stf_invalid===1">在职</span>
						<span v-if="row.stf_invalid===0" :class="{leave:row.stf_invalid===0}">离职</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="180">
					<template slot-scope="{ row }">
						<el-button size="mini" type="primary" @click="beforeUpdate(row)">编辑</el-button>
						<el-button size="mini" type="success" @click="staffss(row)"  v-if="row.stf_invalid===0">入职</el-button>
						<el-button size="mini" type="warning" @click="staffss(row)"  v-if="row.stf_invalid===1">离职</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-main>
		<el-footer>
			<el-pagination
				background
				:total="staffWrapper.total"
				:page-size.sync="search.pageSize"
				:current-page.sync="pagination.currentPage"
				@size-change="getStaff()"
				@current-change="getStaff(false)"
				layout="prev, pager, next, jumper,->,total, sizes"
				:page-sizes="[6, 8,10, 12, 14, 16]"></el-pagination>
		</el-footer>
		<el-dialog
			:visible.sync="edit.isEdit"
			:show-close="false"
			:modal="false"
			width="500px">
			<h3 slot="title" v-text="`用户编辑 - ${ edit.mode ? '新增' : '修改' }`"></h3>
			<el-form label-width="100px" :model="edit.model" :rules="edit.rules" ref="form" status-icon>
				<el-form-item label="员工名字：" prop="stf_name">
					<el-input v-model="edit.model.stf_name"></el-input>
				</el-form-item>
				<el-form-item label="员工类型" label-width="100px" prop="stf_category">
					<el-select placeholder="- 请选择 -" v-model="edit.model.stf_category">
						<el-option
							v-for="item in serchStaffMode"
							:key="item.dic_id"
							:label="item.dic_name"
							:value="item.dic_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="员工备注：" prop="user_name">
					<el-input v-model="edit.model.stf_remark" type="textarea"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="save">确定</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</span>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import {createNamespacedHelpers} from 'vuex';
//	let {mapState,mapActions}=createNamespacedHelpers('staff');
        let {mapState: mapGettersFromDic}=createNamespacedHelpers('dictionary');


        export default {
                name: "Staff",
                data(){
                        return {
                                staffWrapper:{},
                                staffList:[],
                                search: {
                                        stf_category: 0,
                                        stf_name: "",
                                        begin: 0,
                                        pageSize: 5
                                },
                                pagination: {
                                        total: 0,
                                        currentPage: 1
                                },
                                edit: {
                                        isEdit: false,
                                        mode: true,
                                        model: {
                                                stf_remark: "",
                                                stf_name: "",
                                                stf_category: 0,
                                                stf_invalid: 1,
                                                stf_id: 0
                                        },
	                                rules:{
                                                stf_name:[
                                                        { required: true, message: '请输入员工名称', trigger: 'blur' },
                                                        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
                                                ],
                                                stf_category:[
                                                        { required: true, message: '请选择员工类型', trigger: 'change' }
                                                ]
	                                }
                                },
                        };
                },
                computed: {
//                        ...mapState(['staffWrapper', 'staffList']),
                        ...mapGettersFromDic(['dictionaryList']),
                        serchStaffMode(){
                                let serchStaffModeList = this.dictionaryList.length > 0 && this.dictionaryList.filter(item => item.dic_group_key === 'staff_category');
                                return serchStaffModeList;
                        }
                },
                methods: {
//                        ...mapActions([ 'serchCategory',  'dimissionStaff']),
                        //搜索名字
                        async serchStaffNameChangeHandler(){
                                await this.getStaff();
//                                await this.initStaff(this.search);
                        },
                        //搜索员工类型
                        async serchStaffCategoryChangeHandler(){
                                await this.getStaff();
//                                await this.initStaff(this.search);
//                                await this.serchCategory(this.search.stf_category);
                        },
                        async getStaff(fromPage1 = true){
                                //换一批数据 相当于从第一页开始看
                                //判断是否需要从第一页开始看
                                if(fromPage1) this.pagination.currentPage = 1;
                                this.search.begin = this.search.pageSize * (this.pagination.currentPage - 1);
                                this.staffWrapper = await this.$http({
                                        url: '/staff/list',
	                                method:"post",
	                                data:this.search
                                });
                                this.staffList=this.staffWrapper.list;
//                                await this.initStaff(this.search);
                        },
                        beforeAdd(){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.stf_remark = "";
                                this.edit.model.stf_name = "";
                                this.edit.model.stf_category = null;
                                this.edit.model.stf_invalid = 1;
                                this.edit.mode = true;
                                this.edit.isEdit = true;
                        },
                        beforeUpdate(node){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.stf_remark = node.stf_remark;
                                this.edit.model.stf_name = node.stf_name;
                                this.edit.model.stf_category = node.stf_category;
                                this.edit.model.stf_invalid = node.stf_invalid;
                                this.edit.model.stf_id = node.stf_id;
                                this.edit.mode = false;
                                this.edit.isEdit = true;
                        },
                        save(){
                                this.$refs.form.validate(async valid => {
                                        if(!valid) return;
	                                if(this.edit.mode){          //添加
//	                                        await this.addStaff(Object.assign({}, this.edit.model));
                                                let stf_id = await this.$http({
                                                        url: '/staff/add',
                                                        method: 'post',
                                                        data: this.edit.model
                                                });
                                                this.staffList.push(Object.assign({}, this.edit.model,stf_id));
	                                        this.$message({
	                                                message: `您已经添加“${this.edit.model.stf_name}”老师，请查看新菜单`,
	                                                type: 'success'
	                                        })
	                                }else{                  //编辑
//	                                        await this.updateStaff(Object.assign({}, this.edit.model));
                                                await this.$http({
                                                        url: '/staff/update',
                                                        method: "post",
                                                        data: this.edit.model
                                                });
                                                let i=this.staffList.findIndex(item => item.stf_id===this.edit.model.stf_id);
                                                this.staffList.splice(i,1,Object.assign({}, this.edit.model));
	                                        this.$message({
	                                                message: `您已经修改“${this.edit.model.stf_name}”老师，请查看新菜单`,
	                                                type: 'success'
	                                        });
	                                }
	                                this.edit.isEdit = false;
                                })
                        },
                        //入职&&离职
                        staffss(node){
                                console.log(node);
                                if(node.stf_invalid === 0){               //入职
                                        this.$confirm(`你确定要入职吗？`, '警告', {type: 'warning'})
                                                .then(async() =>{
//                                                        await this.reinstateStaff(node);
                                                        await this.$http({ url: '/staff/reinstate/'+node.stf_id,});
                                                        this.staffList.find(item => item.stf_id===node.stf_id).stf_invalid=1;
                                                        this.$message({
                                                                message: `您已经入职，请查看新菜单`,
                                                                type: 'success'
                                                        })
                                                })
                                                .catch(() =>{
                                                })
                                }else if(node.stf_invalid === 1){         //离职
                                        this.$confirm(`你确定要离职吗？`, '警告', {type: 'warning'})
                                                .then(async() =>{
//                                                        await this.dimissionStaff(node);
                                                        await this.$http({ url: '/staff/dimission/'+node.stf_id,});
                                                        this.staffList.find(item => item.stf_id===node.stf_id).stf_invalid=0;
                                                        this.$message({
                                                                message: `您已经离职，请查看新菜单`,
                                                                type: 'success'
                                                        })
                                                })
                                                .catch(() =>{
                                                })
                                }
                        },
                },
                created(){
                        this.getStaff();
//                        this.initStaff(this.search);
                        console.log(this.staffWrapper);
                        console.log(this.dictionaryList);
                        console.log(this.serchStaffMode);
                }

        }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.el-container
		position absolute
		left 0
		top 0
		height 100%
		width 100%
		.el-main
			border-top:1px solid #b0b0b0
			border-bottom 1px solid #b0b0b0
			span.no-role
				color #b0b0b0
			.leave
				color #f00
			.noremark
				color #b0b0b0
		.el-footer
			display flex
			align-items center
			.el-pagination
				flex-grow 1
</style>