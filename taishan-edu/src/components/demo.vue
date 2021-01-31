<template>
	<div>
		<button @click="$emit('update:a',100)">修改a</button>
		<button @click="$emit('abc',100)">修改bb</button>

		<!-- 默认插槽 -->
		<slot></slot>

		<!-- 内容分发，具名插槽 -->
		<div>
			<slot name="n1" name1="张三" :age="20"></slot>
		</div>
	</div>
</template>

<script type="text/ecmascript-6">
        export default {
                name: "Demo",
	        prop: ['a','b'],
	        model:{
                        prop:"b",
		        event:"abc"
	        }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>