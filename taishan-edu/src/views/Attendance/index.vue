<template>
	<div>
		<!-- accept引导用户上传文件类型 -->
		<!-- name控制字段名 -->
		<!-- on-success上传成功后的钩子函数 -->
		<el-upload accept=".jpg,.png" :before-upload="beforeAvatarUpload"
				:headers="uploadHeaders" list-type="picture-card"
		           ref="upload"
		           name="avatar" :on-success="avatarUploadSuccess"
		           action="/student/avatarupload"
				:on-remove="avatarRemove">
			<i class="el-icon-plus"></i>
			<p slot="tip">提示：只能上传jpg或png文件，且大小不超过2MB!</p>
		</el-upload>
		<el-button :disabled="upload.model.stu_avatar_new===''" type="primary" @click="avatarUpload">确定</el-button>
	</div>
</template>

<script type="text/ecmascript-6">
        export default {
                name: "Attendance",
	        data(){
                        return {
                                uploadHeaders:{ 'Authorization': sessionStorage.getItem('token') },
                                upload: {
                                        model:{
                                                stu_id:1,
	                                        stu_avatar_old: null,
                                                stu_avatar_new:""
                                        }
                                }
                        };
	        },
	        methods: {
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
                                await this.$http({
	                                url: '/student/avatarupdate',
	                                method: "post",
	                                data: this.upload.model
                                });
                               this.$message({ message: "上传成功", type: 'success' });
                               this.$refs.upload.clearFiles();          //重置上传控件
                        },
	        },
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>