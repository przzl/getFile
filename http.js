const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const {document} = (new JSDOM('<!doctype html><html><body></body></html>')).window;
global.document = document;
const window = document.defaultView;
const $ = require('jquery')(window);

var result;

/**
 * 发送请求
 * @returns {Promise<void>}
 */
async function sendPost(param,url){
    // console.log("请求：",param,url)
    $.ajax({
        url: url, // 目标资源
        cache: false, //true 如果当前请求有缓存的话，直接使用缓存。如果该属性设置为 false，则每次都会向服务器请求
        async: false, //默认是true，即为异步方式
        data: param,
        dataType: "json", // 服务器响应的数据类型
        type: "POST", // 请求方式
        success: function (data) {
            // console.log("获取请求返回：",data)
            result = data;
        },
        error:function(e){
            console.log("错误的处理",e) //错误的处理
        }
    });
    // setTimeout(()=>{
        if (result) {
            // console.log('result',result)
            return result
        }
    // },10000)

}

module.exports = {sendPost:sendPost}