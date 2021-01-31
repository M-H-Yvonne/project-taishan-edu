import http from '../utils/http.js';

export default {
        namespaced: true,
        state:{
                list: [],
                isInit: false
        },
        getters:{
                listToTree(state){
                        let result=[];
                        let recursionNode=(node)=>{
                                let children = state.list.filter(item => item.func_fid===node.func_id);
                                if(children.length>0){
                                        node.children=[];
                                        children.forEach(item =>{
                                                let childNode =recursionNode(JSON.parse(JSON.stringify(item)));
                                                node.children.push(childNode);
                                        })
                                }
                                return node;
                        };
                        state.list.filter(item => item.func_fid ===0).forEach(item =>{
                                let node2 = recursionNode(JSON.parse(JSON.stringify(item)));
                                result.push(node2);
                        });
                        return result;
                }
        },
        mutations:{
                _init(state,list){
                        state.list = list;
                        state.isInit=true;
                },
                _removeFunc(state,func_id){
                        let i= state.list.findIndex(item => item.func_id===func_id);
                        state.list.splice(i,1);
                },
                _addFunc(state, func){
                        state.list.push(func)
                },
                _updateFunc(state, func){
                        let i = state.list.findIndex(item => item.func_id === func.func_id)
                        state.list.splice(i, 1, func);
                }
        },
        actions:{
                async init(context){
                        if(context.state.isInit) return;
                        let list= await http({ url: '/function/all' });
                        context.commit('_init',list);
                },
                async removeFunc(context,func_id){
                        await http({url: '/function/remove/'+func_id, method:'post'});
                        context.commit("_removeFunc", func_id);
                },
                async addFunc(context, func){
                        func.func_id = await http({
                                url: '/function/add',
                                method: 'post',
                                data: func
                        });
                        context.commit('_addFunc', func);
                },
                async updateFunc(context, func){
                        await http({
                                url: '/function/update',
                                method: 'post',
                                data: func
                        });
                        context.commit('_updateFunc', func);
                },
        }
}


