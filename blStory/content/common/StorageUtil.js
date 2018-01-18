
// 本地储存

import Storage from 'react-native-storage';
import { AsyncStorage } from 'react-native';

// storage 初始化
let storage = new Storage({
    // 最大容量，默认值1000条数据循环存储
    size: 10000000,

    // 存储引擎：对于RN使用AsyncStorage，对于web使用window.localStorage
    // 如果不指定则数据只会保存在内存中，重启后即丢失
    storageBackend: AsyncStorage,

    // 数据过期时间，一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
    defaultExpires: null,

    // 读写时在内存中缓存数据。默认启用。
    enableCache: true,

    // 如果storage中没有相应数据，或数据已过期，
    // 则会调用相应的sync方法，无缝返回最新数据。
    // sync方法的具体说明会在后文提到
    // 你可以在构造函数这里就写好sync的方法
    // 或是写到另一个文件里，这里require引入
    // 或是在任何时候，直接对storage.sync进行赋值修改
    sync:{}
});

class StorageUtil{
    //储存
    static save(key,data,expires){
        storage.save({
            key: key,
            data: data,
            expires: expires
        });
    }

    //读取
    static get(key,success,fail){
        storage.load({
            key: key,

            // autoSync(默认为true)意味着在没有找到数据或数据过期时自动调用相应的sync方法
            autoSync: true,

            // syncInBackground(默认为true)意味着如果数据过期，
            // 在调用sync方法的同时先返回已经过期的数据。
            // 设置为false的话，则始终强制返回sync方法提供的最新数据(当然会需要更多等待时间)。
            syncInBackground: true,

            // 你还可以给sync方法传递额外的参数
            syncParams: {
                extraFetchOptions: {
                    // 各种参数
                },
                someFlag: true,
            },
        }).then((ret) => {
            success && success(ret);
        }).catch(err => {
            fail && fail(err);
        });
    }

    //删除
    static remove(key){
        storage.remove({key: key});
    }

    //清除某个key下的所有数据
    static clearMapForKey(key){
        storage.clearMapForKey(key);
    }

    //获取某个key下的所有数据
    static getAllDataForKey(key,success){
        storage.getAllDataForKey(key).then(ret => {
            success && success(ret);
        });
    }

    // 获取某个key下的所有id
    static getIdsForKey(key,success){
        storage.getIdsForKey(key).then(ids => {
            success && success(ids);
        });
    }

    // 读取批量数据
    static getBatchData(arr,callback){
        // 使用和load方法一样的参数读取批量数据，但是参数是以数组的方式提供。
        // 会在需要时分别调用相应的sync方法，最后统一返回一个有序数组。
        storage.getBatchData(arr)
        .then(results => {
            results.forEach( result => {
                callback && callback(result);
            })
        })
    }

    //根据key和一个id数组来读取批量数据
    static getBatchDataWithIds(key,idsArr,callback){
        storage.getBatchDataWithIds({
            key: key,
            ids: idsArr
        })
        .then(result => {
            callback && callback(result);
        })
    }

    // 同步远程数据
    static synchronousRemoteData(url: string,obj: any,sessionID: string,userAgent: any,deviceInfo: any){
        storage.sync = {
            // sync方法的名字必须和所存数据的key完全相同
            // 方法接受的参数为一整个object，所有参数从object中解构取出
            // 这里可以使用promise。或是使用普通回调函数，但需要调用resolve或reject。
            obj(params){
                let { id, resolve, reject, syncParams: { extraFetchOptions, someFlag }} = params;

                fetch(url, {
                    method: 'GET',
                    headers: {
                        'SESSION-ID': sessionID,
                        'User-Agent': userAgent,
                    },
                    ...extraFetchOptions,
                }).then(response => {
                    return response.json();
                }).then(json => {

                    console.log('stroage',json)


                    // if(json && json.user){
                    //     storage.save({
                    //         key: 'user',
                    //         id,
                    //         data: json.user
                    //     });
                    //
                    //     if (someFlag) {
                    //         // 根据syncParams中的额外参数做对应处理
                    //     }
                    //
                    //     // 成功则调用resolve
                    //     resolve && resolve(json.user);
                    // }
                    // else{
                    //     // 失败则调用reject
                    //     reject && reject(new Error('data parse error'));
                    // }
                }).catch(err => {
                    console.warn(err);
                    reject && reject(err);
                });
            }
        };

        // storage.load({
        //     key: 'user',
        //     id: '1002'
        // }).then(...)
    }
}

export default StorageUtil;











