<template>
	<el-container>
		<el-header>
			<el-form>
				<el-row>
					<el-col :span="6">
						<el-form-item label="学生姓名：" label-width="90px">
							<el-input size="mini" prefix-icon="el-icon-search" clearable
							          v-model="search.stu_name" placeholder="请输入搜索内容" @change="searchStuHandler"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="5">
						<el-form-item label="所在班级：" label-width="90px">
							<el-select size="mini" v-model="search.stu_cls_id" @change="searchStuHandler">
								<el-option label="- 全部 -" :value="0"></el-option>
								<el-option label="- 无班级 -" :value="null"></el-option>
								<el-option v-for="item in getAllClass" :key="item.cls_id" :label="item.cls_name" :value="item.cls_id"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="5">
						<el-form-item label="学生学历：" label-width="90px">
							<el-select size="mini" v-model="search.stu_qualification" @change="searchStuHandler">
								<el-option label="- 全部 -" :value="0"></el-option>
								<el-option v-for="item in getGroupByKey('qualification')" :key="item.dic_id" :label="item.dic_name" :value="item.dic_id"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item>
							<el-button type="primary" size="mini" @click="beforeAdd"><i class="el-icon-plus">新增</i></el-button>
							<el-button type="success" size="mini" @click="beforeDivisions"><i class="el-icon-share">批量分班</i></el-button>
							<el-button type="danger" size="mini"><i class="el-icon-download">导出学生信息</i></el-button>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="studentList" border @selection-change="checkTheStudent">
				<el-table-column label="#" type="index" align="center" fixed></el-table-column>
				<el-table-column type="selection" align="center" fixed></el-table-column>
				<el-table-column label="学生名字" prop="stu_name" fixed></el-table-column>
				<el-table-column label="班级" prop="stu_cls_id">
					<template slot-scope="{row}">
						<span v-if="row.stu_cls_id!==null && getAllClass.length>0" v-text="getAllClass.find(item => item.cls_id===row.stu_cls_id).cls_name"></span>
						<span v-else class="no-role">无班级……</span>
					</template>
				</el-table-column>
				<el-table-column label="存档照片" prop="stu_avatar">
					<template slot-scope="{row}">
						<el-popover
							placement="right"
							trigger="click">
							<div>
								<h3 v-text="row.stu_name"></h3>
								<div class="demo-image__preview" v-if=" row.stu_avatar!==null">
									<el-image
										style="width: 150px; height: 150px"
										:src="row.stu_avatar">
									</el-image>
								</div>
								<i v-else>暂无照片……</i>
							</div>
							<el-button slot="reference" type="text">预览</el-button>
						</el-popover>
					</template>
				</el-table-column>
				<el-table-column label="性别">
					<template slot-scope="{row}">
						<span v-text="row.stu_sex?'男':'女'"></span>
					</template>
				</el-table-column>
				<el-table-column label="联系电话" prop="stu_phone" width="120"></el-table-column>
				<el-table-column label="联系电话(备用)" prop="stu_phone2" width="120"></el-table-column>
				<el-table-column label="出生日期" prop="stu_born" width="120"></el-table-column>
				<el-table-column label="学历" width="120">
					<template slot-scope="{row}">
						<span v-text="dictionaryList.length>0 && getGroupByKey('qualification').find(item => item.dic_id===row.stu_qualification).dic_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="毕业院校" prop="stu_school" width="120"></el-table-column>
				<el-table-column label="院校专业" prop="stu_major" width="120"></el-table-column>
				<el-table-column label="家庭住址" prop="stu_address" width="230"></el-table-column>
				<el-table-column label="备注" prop="stu_remark" show-overflow-tooltip></el-table-column>
				<el-table-column label="操作" fixed="right" width="300" align="center">
					<template slot-scope="{row}">
						<el-button type="primary" size="mini" @click="beforeDivision(row)"><i class="el-icon-edit">分班</i></el-button>
						<el-button type="success" size="mini" @click="beforeUpload(row)"><i class="el-icon-edit">照片存档</i></el-button>
						<el-button type="danger " size="mini" @click="beforeUpdate(row)"><i class="el-icon-edit">编辑</i></el-button>
						<el-button type="warning " size="mini"><i class="el-icon-edit">删除</i></el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-main>
		<el-footer>
			<el-pagination background :total="pagination.total" :current-page.sync="pagination.currentPage" :page-size.sync="search.pageSize"
				:page-sizes="[5,8,10,12,14,16]" @size-change="getStudents()" @current-change="getStudents(false)"></el-pagination>
		</el-footer>
		<!-- 新增，修改 -->
		<el-dialog :visible.sync="edit.isEdit" :show-close="false" :modal="false" width="60%">
			<h3 slot="title" v-text="`用户编辑 - ${ edit.mode ? '新增' : '修改' }`"></h3>
			<el-form ref="form" :rules="edit.rules" :model="edit.model" @validate="formValidateHandler">
				<el-form-item label="学生姓名：" label-width="120px" prop="stu_name">
					<el-input placeholder="请输入学生姓名" v-model="edit.model.stu_name"></el-input>
				</el-form-item>
				<el-form-item label="性别：" label-width="120px">
					<el-radio v-model="edit.model.stu_sex" :label="1">男</el-radio>
					<el-radio v-model="edit.model.stu_sex" :label="0">女</el-radio>
				</el-form-item>
				<el-form-item label="联系电话：" label-width="120px" prop="stu_phone">
					<el-input placeholder="请输入手机号" type="text" maxlength="11" show-word-limit  v-model="edit.model.stu_phone"></el-input>
				</el-form-item>
				<el-form-item label="备用电话：" label-width="120px" prop="stu_phone2">
					<el-input placeholder="请输入备用联系电话(手机号/座机号)" v-model="edit.model.stu_phone2">
						<template slot="append">例如：028-88888888</template>
					</el-input>
				</el-form-item>
				<el-form-item label="出生日期：" label-width="120px" prop="stu_born">
					<el-date-picker type="date" :picker-options="edit.pickerOptions" value-format="yyyy-MM-dd" placeholder="请选择出生日期" v-model="edit.model.stu_born"></el-date-picker>
				</el-form-item>
				<el-form-item label="学历：" label-width="120px" prop="stu_qualification">
					<el-select v-model="edit.model.stu_qualification">
						<el-option v-for="item in getGroupByKey('qualification')" :key="item.dic_id" :label="item.dic_name" :value="item.dic_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="在读/毕业院校：" label-width="120px">
					<el-input placeholder="请输入在读/毕业的院校(选填)" v-model="edit.model.stu_school"></el-input>
				</el-form-item>
				<el-form-item label="在校学习专业：" label-width="120px">
					<el-input placeholder="请输入在校学习专业(选填)" v-model="edit.model.stu_major"></el-input>
				</el-form-item>
				<el-form-item label="家庭住址：" label-width="120px" prop="stu_address">
					<el-input placeholder="请输入家庭住址" v-model="edit.model.stu_address"></el-input>
				</el-form-item>
				<el-form-item label="学生备注：" label-width="120px">
					<el-input placeholder="请输入学生备注……" type="textarea" v-model="edit.model.stu_remark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button type="primary" size="medium" @click="save">保存</el-button>
				<el-button @click="edit.isEdit=false">取消</el-button>
			</div>
		</el-dialog>
		<el-dialog :visible.sync="upload.isUpload" :show-close="false" :modal="false">
			<h3 slot="title">照片存档</h3>
			<div>
				<h3>个人照片</h3>
				<div class="demo-image__preview" v-if=" upload.model.stu_avatar_old!==null">
					<el-image
						style="width: 150px; height: 150px"
						:src="upload.model.stu_avatar_old">
					</el-image>
				</div>
				<i v-else>暂无照片……</i>
			</div>
			<el-divider></el-divider>
			<el-upload accept=".jpg,.png" list-type="picture-card" ref="upload"
					name="avatar" :headers="upload.uploadHeaders"
					:before-upload="beforeAvatarUpload"
                                        :on-success="avatarUploadSuccess"
                                        action="/student/avatarupload"
                                        :on-remove="avatarRemove">
				<i class="el-icon-plus"></i>
				<p slot="tip">提示：只能上传jpg或png文件，且大小不超过2MB!</p>
			</el-upload>
			<div slot="footer">
				<el-button :disabled="upload.model.stu_avatar_new===''" type="primary" @click="avatarUpload">确定</el-button>
				<el-button @click="upload.isUpload=false">取消</el-button>
			</div>
		</el-dialog>
		<el-dialog :visible.sync="division.isDivision" :show-close="false" :modal="false">
			<h3 slot="title">分班</h3>
			<el-form>
				<el-form-item>
					<el-select v-model="division.model.stu_cls_id">
						<el-option v-for="item in getAllClass" :key="item.cls_id" :disabled="item.cls_end!==null" :label="item.cls_name" :value="item.cls_id"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button  type="primary" @click="divisionSave">确定</el-button>
				<el-button @click="division.isDivision=false">取消</el-button>
			</div>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
        import {createNamespacedHelpers} from 'vuex';
        let {mapState,mapGetters} =createNamespacedHelpers('dictionary');
        export default {
                name: "Student",
	        data(){
                        return {
                                getAllClass:[],
                                studentWrapper:{},
	                        studentList:[],
				search:{
                                        stu_name: "",
				        stu_cls_id: 0,
				        stu_qualification: 0,
				        begin: 0,
				        pageSize: 5
				},
                                pagination:{
                                        total:0,
                                        currentPage:1,
                                },
	                        edit:{
                                        isEdit:false,
		                        mode:true,
                                        model:{
                                                stu_name: "",
	                                        stu_avatar: null,
	                                        stu_cls_id: null,
	                                        stu_sex: 1,
	                                        stu_phone: "",
	                                        stu_phone2: "",
	                                        stu_born: "",
	                                        stu_qualification: null,
	                                        stu_school: "",
	                                        stu_major: "",
	                                        stu_address: "",
	                                        stu_remark: "",
                                                stu_id:0
                                        },
                                        pickerOptions:{
                                                // 设置禁用状态，参数为当前日期，要求返回 Boolean
                                                disabledDate(time){
                                                        return time.getTime()>Date.now()-3600*1000*24*18*365;
                                                }
                                        },
		                        rules:{
                                                stu_name:[
                                                        { required: true, message: '请输入学生姓名', trigger: 'blur' },
                                                        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
                                                ],
                                                stu_phone:[
                                                        {
                                                                validator:async (rule,value,callback) => {
                                                                        if(value.length===0)
                                                                                callback(new Error('* 号码不能为空'));
                                                                        else if(value.length!==11)
                                                                                callback(new Error('* 号码长度不对，为11位'));
                                                                        else if(!(/^13\d{9}$/.test(value)))
                                                                                callback(new Error('* 号码格式不对'));
                                                                        else if(await this.$http({url: '/student/valid_phone',method:"post",data:{stu_phone:value}}))
                                                                                callback(new Error('* 号码已有重复！！！'));
	                                                                else callback();
                                                                }
                                                        }
                                                ],
                                                stu_phone2:[
	                                                {
	                                                        validator:(rule,value,callback) => {
                                                                        if(value.length===0)
                                                                                callback(new Error('* 备用号码不能为空'));
                                                                        else if(value.length!==11)
                                                                                callback(new Error('* 备用号码长度不对，为11位'));
                                                                        else if(!(/^13\d{9}$/.test(value)))
                                                                                callback(new Error('* 备用号码格式不对'));
                                                                        else callback();
                                                                }
	                                                }
                                                ],
                                                stu_born:[{ required: true, message: '请选择日期', trigger: 'change' }],
                                                stu_qualification:[ { required: true, message: '请选择学生学历', trigger: 'change' }],
                                                stu_address:[
                                                        { required: true, message: '请输入地址', trigger: 'blur' },
                                                        { min: 10, max: 100, message: '长度在 10 到 100 个字符', trigger: 'blur' }
                                                ]
		                        }
	                        },
                                upload: {
                                        uploadHeaders:{ 'Authorization': sessionStorage.getItem('token') },
	                                isUpload:false,
                                        model:{
                                                stu_id:0,
                                                stu_avatar_old: null,
                                                stu_avatar_new:""
                                        }
                                },
				//分班
                                division:{
                                        isDivision:false,
                                        model:{
                                                stu_id: 0,
                                                stu_ids: [],
	                                        stu_cls_id: null
                                        }
                                }
                        };
	        },
	        computed:{
                        ...mapState(['dictionaryList']),
                        ...mapGetters(['getGroupByKey']),
                },
	        methods:{
                       async getStudents(fromPage1=true){
                                if(fromPage1) this.pagination.currentPage=1;
                                this.search.begin = this.search.pageSize*(this.pagination.currentPage-1);
                                this.studentWrapper=await this.$http({
	                                url: "/student/list",
	                                method: "post",
	                                data: this.search
                                });
                                console.log(this.studentWrapper)
                               this.pagination.total=this.studentWrapper.total;
                               this.studentList=this.studentWrapper.list;
                        },
                        async searchStuHandler(){
                                await this.getStudents();
                        },
                        beforeAdd(){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.stu_name = "";
                                this.edit.model.stu_avatar = null;
                                this.edit.model.stu_cls_id =null;
                                this.edit.model.stu_sex = 1;
                                this.edit.model.stu_phone = "";
                                this.edit.model.stu_phone2 = "";
                                this.edit.model. stu_born = "";
                                this.edit.model.stu_qualification = null;
                                this.edit.model.stu_school = "";
                                this.edit.model.stu_major = "";
                                this.edit.model.stu_address = "";
                                this.edit.model.stu_remark = "";
                                this.edit.model.stu_id = 0;
                                this.edit.mode=true;
                                this.edit.isEdit=true;
                        },
		        beforeUpdate(node){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.stu_name =node.stu_name;
                                this.edit.model.stu_avatar = node.stu_avatar;
                                this.edit.model.stu_cls_id =node.stu_cls_id;
                                this.edit.model.stu_sex = node.stu_sex;
                                this.edit.model.stu_phone = node.stu_phone;
                                this.edit.model.stu_phone2 = node.stu_phone2;
                                this.edit.model. stu_born = node.stu_born;
                                this.edit.model.stu_qualification = node.stu_qualification;
                                this.edit.model.stu_school = node.stu_school;
                                this.edit.model.stu_major = node.stu_major;
                                this.edit.model.stu_address = node.stu_address;
                                this.edit.model.stu_remark = node.stu_remark;
                                this.edit.model.stu_id = node.stu_id;
                                this.edit.mode=false;
                                this.edit.isEdit=true;
		        },
                        //监听表单验证
                        formValidateHandler(prop,valid,message){
                                //为了点击确定时用到
                                if(prop === 'stu_phone') this.stuNameValidateResult =valid;
                        },
                        async save(){
                                if(this.stuNameValidateResult === false) return;
                                if(typeof this.stuNameValidateResult === 'undefined'){
                                        await new Promise(resolve => this.$refs.form.validateField('stu_phone',message =>{
                                                if(message === '')resolve();
                                        }))
                                }
                                let i=Object.keys(this.edit.rules).findIndex(item => item==='stu_phone');
                                let rulesKey=Object.keys(this.edit.rules);
                                rulesKey.splice(i,1);
	                        await Promise.all(rulesKey.map(item => {
                                       return new Promise(resolve => this.$refs.form.validateField(item,message =>{
                                                if(message ==="") resolve();
                                        }));
                                }));
		                if(this.edit.mode){                     //新增
                                        let stu_id=await this.$http({
                                                url:'/student/add',
                                                method:'post',
                                                data:this.edit.model
                                        });
                                        this.studentList.push(Object.assign({}, this.edit.model, stu_id));
                                        this.$message({
                                                message: `您已经添加学生“${this.edit.model.stu_name}”，请查看新菜单`,
                                                type: 'success'
                                        })
		                }else{                                          //编辑
                                        await this.$http({
                                                url:'/student/update',
                                                method:'post',
                                                data:this.edit.model
                                        });
                                        let i=this.studentList.findIndex(item => item.stu_id===this.edit.model.stu_id);
                                        this.studentList.splice(i,1,Object.assign({}, this.edit.model));
                                        this.$message({
                                                message: `您已经修改学生“${this.edit.model.stu_name}”，请查看新菜单`,
                                                type: 'success'
                                        })
		                }
                                this.edit.isEdit=false;
                        },
		        //图片上传
                        beforeUpload(node){
                                this.upload.model.stu_id=node.stu_id;
                                this.upload.model.stu_avatar_old=node.stu_avatar;
                                this.upload.isUpload=true;
                        },
                        beforeAvatarUpload(file){
                                const isJPG = file.type === 'image/jpeg';
                                const isPNG = file.type === 'image/png';
                                const isLt2M = file.size / 1024 / 1024 < 2;

                                if ((!isJPG) && (!isPNG)) {
                                        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!');
                                }
                                if (!isLt2M) {
                                        this.$message.error('上传头像图片大小不能超过 2MB!');
                                }
                                return (isJPG || isPNG) && isLt2M;
                        },
                        avatarUploadSuccess({ status, data, message},file,fileList){
                                switch(status){
                                        case 200:
                                                this.upload.model.stu_avatar_new=data;
                                                if(fileList.length>1) fileList.shift();
                                                break;
                                        case 401:
                                        case 404:
                                        case 199:
                                        case 500:
                                                this.$message.error(message);
                                }
                        },
                        avatarRemove(file,fileList){
                                this.upload.model.stu_avatar_new="";
                        },
                        async avatarUpload(){
                                let j= await this.$http({
                                        url: '/student/avatarupdate',
                                        method: "post",
                                        data: this.upload.model
                                });
                                this.$message({ message: "上传成功", type: 'success' });
                                this.studentList.find(item => item.stu_id===this.upload.model.stu_id).stu_avatar=j;
                                this.upload.isUpload=false;
                                this.$refs.upload.clearFiles();          //重置上传控件
                        },
		        // 分班
                        beforeDivision(node){
                                this.division.model.stu_id=node.stu_id;
	                        this.division.model.stu_ids=[];
	                        this.division.model.stu_cls_id=node.stu_cls_id;
                                this.division.isDivision=true;
                        },
		        /* 监听复选框中数据的变化 */
                        checkTheStudent(students){
				// 初始化
                                this.division.model.stu_ids=[];
                                students.forEach(item => this.division.model.stu_ids.push(item.stu_id));
                        },
                        beforeDivisions(){
                                if(this.division.model.stu_ids.length===0){
                                        this.$alert('请勾选要分班的学生','提示：',{type:"warning"})
	                                        .then(()=>{}).catch(()=>{})
                                }else{
                                        this.division.model.stu_cls_id=null;
                                        this.division.model.stu_id=null;
                                        this.division.isDivision=true;
                                }
                        },
                       async divisionSave(){
                                await this.$http({
	                                url: "/student/assignclass",
	                                method: "post",
	                                data: this.division.model
                                });
                                if(this.division.model.stu_ids.length===0){             //是单个学生添加班级
	                                let obj=this.studentList.find(item => item.stu_id===this.division.model.stu_id);
	                                obj.stu_cls_id=this.division.model.stu_cls_id;
                                        let i=this.studentList.findIndex(item => item.stu_id===this.division.model.stu_id);
                                        this.studentList.splice(i,1,Object.assign({}, obj));
                                        this.$message({
                                                message: `您已经给学生添加班级成功，请查看新菜单`,
                                                type: 'success'
                                        })
                                }else{
                                        this.division.model.stu_ids.forEach(item =>{
                                                let obj2=this.studentList.find(item2 => item2.stu_id===item);
                                                obj2.stu_cls_id=this.division.model.stu_cls_id;
                                                let j=this.studentList.findIndex(item2 => item2.stu_id===item);
                                                this.studentList.splice(j,1,Object.assign({}, obj2));
                                        });
                                        this.$message({
                                                message: `您已经给学生添加班级成功，请查看新菜单`,
                                                type: 'success'
                                        })
                                }
                               this.division.isDivision=false;
                        }
	        },
	        created(){
	                this.$http({ url: "/class/all" })
		                .then(data => {
		                        this.getAllClass=data;
//                                        console.log(this.getAllClass)
		                });
			this.getStudents();
	        },

        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.el-container
		position absolute
		left 0
		top 0
		height 100%
		width 100%
		.el-button
			margin-left  10px
			padding 5px
		.el-main
			border-top:1px solid #b0b0b0
			border-bottom 1px solid #b0b0b0
			span.no-role
				color #b0b0b0
			.leave
				color #f00
			.noremark
				color #b0b0b0
			/* 隐藏字体变省略 */
			#ellipsis
				overflow:hidden
				text-overflow: ellipsis
				white-space: nowrap
				display inline-block
				width 80px
		.el-footer
			display flex
			align-items center
			.el-pagination
				flex-grow 1


</style>