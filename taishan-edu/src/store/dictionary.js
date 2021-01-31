export default {
        namespaced: true,
        state: {
                dictionaryList:[],
                isInitDictionary:false
        },
        getters:{
                getGroupByKey(state){
                        //让计算属性返回一个函数，调用的时候需要加( )
                        //state.list改变的时候
                        return function(groupKey){
                                return state.dictionaryList.filter(item => item.dic_group_key === groupKey);
                        };
                }
        },
        mutations: {
                _initDictionary(state,dictionaryList){
                        state.dictionaryList=dictionaryList;
                        state.isInitDictionary=true;
                }
        },
        actions: {
                async initDictionary(context){
                        if(context.state.isInitDictionary) return;
                        let dictionaryList = await context.rootState.http({url: '/dictionary/all'});
                        context.commit('_initDictionary', dictionaryList);
                },
        }
}