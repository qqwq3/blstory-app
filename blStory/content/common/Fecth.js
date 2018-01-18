import React from 'react';
import _ from 'lodash';

// fecth的简单封装
class Fecth extends React.Component{
    /*
     *  get请求
     *  url:请求地址
     *  data:参数
     *  callback:回调函数
     * */
    static get(url,params,success,fail,headers){
        let _url = params !== '' ? url + params : url;

        fetch(_url,{method: 'GET',headers:headers || {}})
        .then((response) => response.json())
        .then((res) => {
            success && typeof success === 'function' && success(res);
        }).catch((err) => {
            fail && typeof fail === 'function' && fail(err);
        })
        .done();
    }
    /*
     *  post请求
     *  url:请求地址
     *  data:参数
     *  callback:回调函数
     * */
    static post(url,params,headers,success,fail){
        fetch(url,{
            method: 'POST',
            headers:headers || {},
            body:params
        })
        .then((response) => response.json())
        .then((res) => {
            success && typeof success === 'function' && success(res);
        })
        .catch((err) => {
            fail && typeof fail === 'function' && fail(err);
        })
        .done();
    }

    // formData格式
    static dictToFormData(data){
        if (_.isEmpty(data) === true) {
            return null;
        }
        let fd = new FormData();
        for (let key in data) {
            if (typeof key !== 'undefined') {
                fd.append(key, data[key]);
            }
        }
        return fd;
    }
}

export default Fecth;