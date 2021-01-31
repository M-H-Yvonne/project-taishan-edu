<template>
	<el-container class="page-container">
		<el-header height="80px">
			<h1>泰山学院管理系统 V 1.0</h1>
			<div>
				<span>欢迎<b v-text="user_name"></b>进入系统</span>
				<span @click="exit" class="exit">退出</span>
			</div>
		</el-header>
		<el-container>
			<el-aside width="250px">
				<!--default-active	当前激活菜单的 index-->
				<!--select	菜单激活回调，参数：index: 选中菜单项的 index, indexPath: 选中菜单项的 index path-->
				<el-menu background-color="#b6b4c2" text-color="#333" active-text-color="#f9f043"
						:default-active="activeFuncKey" @select="menuSelectHandler">
					<template v-for="item in menuData">
						<el-menu-item v-if="item.func_key" :index="item.func_key" :key="item.func_id">
							<i class="el-icon-menu"></i>
							<span slot="title" v-text="item.func_name"></span>
						</el-menu-item>
						<el-submenu v-else :index="item.func_id.toString()" :key="item.func_id">
							<template slot="title">
								<i class="el-icon-setting"></i>
								<span v-text="item.func_name"></span>
							</template>
							<template v-if="item.children">
								<el-menu-item v-for="item2 in item.children" :index="item2.func_key" :key="item2.func_id">
									<i class="el-icon-menu"></i>
									<span slot="title" v-text="item2.func_name"></span>
								</el-menu-item>
							</template>
						</el-submenu>
					</template>
				</el-menu>
			</el-aside>
			<el-container>
				<el-main>
					<!--v-model双向绑定，绑定值，选中选项卡的 name	-->
					<!--value双向绑定，绑定值，选中选项卡的 name	-->
					<el-tabs type="card" closable v-model="activeFuncKey" @tab-remove="tabRemoveHandle">
						<el-tab-pane v-for="func_key in activeFuncKeys" :key="func_key"
						        :name="func_key"
							:label="menu.find(item => item.func_key===func_key).func_name">
							<!--利用component中的is动态渲染组件-->
							<!--func_key是变量，取的是变量的值作为views的键-->
							<component :is="views[func_key]"></component>
						</el-tab-pane>
					</el-tabs>
				</el-main>
				<el-footer>
					版权所有&copy;2009H5全体同学，网址：www.kengni.com
				</el-footer>
			</el-container>
		</el-container>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import views from '../../views';
        import {createNamespacedHelpers} from 'vuex';
        let {mapState: mapGettersFromDic, mapActions: mapActionsFromDic}=createNamespacedHelpers('dictionary');

	export default {
	        name: "Home",
		data(){
	                return {
                                //线性结构的数据
                                //func_key为空表示为非叶子节点，func_fid为0表示没有父节点
	                        menu: [],
		                //获取点击的index值
		                activeFuncKey: "",
		                //当前打开的菜单项
                                activeFuncKeys:[],
		                views,
		                user_name:sessionStorage.getItem('user_name')

	                };
		},
		methods:{
                        ...mapActionsFromDic(['initDictionary']),
                        menuSelectHandler(index){
                                this.activeFuncKey=index;
                               if(this.activeFuncKeys.indexOf(index)===-1) this.activeFuncKeys.push(index);

                        },
                        tabRemoveHandle(name){
                                this.activeFuncKeys.splice(this.activeFuncKeys.indexOf(name),1);
                                if(this.activeFuncKeys.indexOf(this.activeFuncKey)===-1){       //刚刚删除的是激活的
                                        this.activeFuncKey=this.activeFuncKeys[0] || "";
                                }
                        },
			exit(){
                                this.$router.replace('/login');
                                sessionStorage.removeItem('token');
                                sessionStorage.removeItem('user_name');
                        }
		},
		computed:{
                        ...mapGettersFromDic(['dictionaryList']),
		        menuData(){
		                let result =[];
		                this.menu.filter(item => item.func_fid === 0).forEach(item => {
		                        let node = Object.assign({},item);
		                        let children = this.menu.filter(item2 => item2.func_fid === item.func_id);
		                        if(children.length > 0){
		                                node.children=[];
		                                children.forEach(item2 => node.children.push(Object.assign({},item2)));
		                        }
		                        result.push(node);
		                });
		                return result;
		        }
		},
		async created(){
                        this.initDictionary();
		        this.menu = await this.$http({
			        url:'/user/getmenu',
			        method:'post'
		        });
		}
	};
</script>

<style lang="stylus" scoped>
	.page-container
		height:100%
		.el-header
			display: flex
			align-items: center
			justify-content space-between
			background-color: #aac9ce
			color: #fff
			h1
				font-size: 30px
			div
				span
					padding 10px
				span.exit
					cursor pointer
		.el-aside
			background-color: #b6b4c2
			width: 200px
			.el-menu
				border-right: 0
				span
					font-size 16px
		.el-footer
			background-color: #c9bbcb
			display: flex
			align-items center
			justify-content center
		.el-main
			position relative
</style>