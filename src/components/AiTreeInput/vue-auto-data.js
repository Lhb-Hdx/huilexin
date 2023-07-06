import request from "@/utils/request";

// import {tableColumnData} from 'vue-auto-input-search/src/vue-auto-data';
// argument.ids 用于表示不为ids的参数时，选择的另一个参数
export function tableColumnData(obj){ // {url : "" , param : {} , argument : { ids : "detailsIds" }, data : [] , column : {id:"",name:"" / ["","",...]} , field:{id:"",name:"" / ["","",...]} , done (res = > {}) }

    var param = obj.param ? obj.param : {};
    
    if(obj.data && obj.data.length > 0 && obj.column && obj.column.id && obj.column.name && obj.field && obj.field.id && obj.field.name){
        //检验数组的情况
		if(!obj.field) obj.field = obj.column;
		if(!obj.field.id) obj.field.id = obj.column.id;
		if(!obj.field.name) obj.field.name = obj.column.name;
        var columnId = [];
        obj.data.forEach(item=>{
            if(obj.column.id && obj.column.id !== "" && item[obj.column.id] && item[obj.column.id] > 0)columnId.push(item[obj.column.id]);
        });
        
        if(columnId.length > 0){
            if(obj.argument && obj.argument.ids ){
              param[obj.argument.ids] = columnId.join(",");
            }else{
              param.ids = columnId.join(",");
            }
            
        }
        request({
            url : obj.url , data : param
        }).then(res=>{
            obj.data.forEach(item=>{
                res.data.forEach(item2=>{
                    if(parseFloat(item[obj.column.id]) === parseFloat(item2[obj.field.id])){
                        
                        if(typeof obj.field.name === "string"){
                            item[obj.column.name] = item2[obj.field.name];
                        }else if(typeof obj.field.name === "object"){
                            for(var i = 0; i < obj.field.name.length; i++){
                                item[obj.column.name[i]] = item2[obj.field.name[i]];
                            }
                        }
                        
                    }
                });
            });
            if(obj.done && typeof obj.done === "function") obj.done(res);
        });
    }else if(obj.model && obj.column && obj.column.id && obj.column.name && obj.field && obj.field.id && obj.field.name){
        //检验model对像的情况
        if(!obj.field) obj.field = obj.column;
		if(!obj.field.id) obj.field.id = obj.column.id;
		if(!obj.field.name) obj.field.name = obj.column.name;

        param[obj.field.id] = obj.model[obj.column.id];
        request({
            url : obj.url , data : param
        }).then(res=>{
            if(res && res.model){
              if(typeof obj.field.name === "string"){
                  obj.model[obj.column.name] = res.model[obj.field.name];
              }else if(typeof obj.field.name === "object"){
                  for(var i = 0; i < obj.field.name.length; i++){
                    obj.model[obj.column.name[i]] = res.model[obj.field.name[i]];
                  }
              }
            }

            


            if(obj.done && typeof obj.done === "function") obj.done(res);
        });

    }
}


export function listToTree(data,pid,level,fieldId = 'id',fieldPId = 'parentId'){
    if(!pid) pid = 0;
    var tree = [];
    data.forEach(item=>{
      if(!item[fieldPId]) item[fieldPId] = 0;
      if(item[fieldPId] === pid){
        item.level = level;
        var children = listToTree(data,item[fieldId],level + 1,fieldId,fieldPId);
        if(children && children != null && children.length > 0)item.children = children;
        tree.push(item);
      }
    });
    return tree;
}
  
  
export function treeToList(data){
    var list = [];
    data.forEach(item=>{
      list.push(item);
      if(item.children && item.children.length > 0){
        list = list.concat(treeToList(item.children));
      }
    });
    return list;
}



/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
 export function dateFormater(dt, formater = "yyyy-MM-dd") { //author: tyler
    if(!dt) return null;
    if(typeof dt === "string"){
      dt = dt.replace(/-/g , "/");//将-替换成/，避免ie和safari下报错
    }
    var date = new Date(dt);
    var o = {
      "y+": date.getFullYear(),//年
      "M+": date.getMonth() + 1, //月份 
      "d+": date.getDate(), //日 
      "h+": date.getHours(), //小时 
      "m+": date.getMinutes(), //分 
      "s+": date.getSeconds(), //秒 
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
      "S": date.getMilliseconds() //毫秒 
    };
    console.log("o",JSON.stringify(o));
    if (/(y+)/.test(formater))formater = formater.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    console.log("formater",formater);
    for (var k in o){
      if (new RegExp("(" + k + ")").test(formater)){
        formater = formater.replace(RegExp.$1, (parseInt(o[k]) >= 10) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      }
      
    }
    return formater;
}
  

export function dateFormat(date , fmt) {
    let ret;
    const opt = {
        "y+": date.getFullYear().toString(),        // 年
        "M+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "h+": date.getHours().toString(),           // 时
        "m+": date.getMinutes().toString(),         // 分
        "s+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")));
        }
    }
    return fmt;
  }

export function timestampToTime(timestamp) {
  if(!timestamp || timestamp == null) return null;
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1):date.getMonth()+1) + '-';
    var D = (date.getDate()< 10 ? '0'+date.getDate():date.getDate())+ ' ';
    var h = (date.getHours() < 10 ? '0'+date.getHours():date.getHours())+ ':';
    var m = (date.getMinutes() < 10 ? '0'+date.getMinutes():date.getMinutes()) + ':';
    var s = date.getSeconds() < 10 ? '0'+date.getSeconds():date.getSeconds();
    return Y+M+D+h+m+s;
}
