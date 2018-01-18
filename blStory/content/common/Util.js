
/**
 * 屏幕工具类 以及一些常用的工具类封装
 * ui设计基准,iphone 6
 * width:750px
 * height:1334px
 */

import {
    PixelRatio,
    Dimensions,
    Platform,
    Alert,
    NetInfo,
} from 'react-native';
import { Api } from "./Api";
import DeviceInfo from 'react-native-device-info';

export let screenW = Dimensions.get('window').width;
export let screenH = Dimensions.get('window').height;
const fontScale = PixelRatio.getFontScale();
export let pixelRatio = PixelRatio.get();

//像素密度
export const DEFAULT_DENSITY = 2;

//px转换成dp
//以iphone6为基准,如果以其他尺寸为基准的话,请修改下面的750和1334为对应尺寸即可.
const w2 = 750 / DEFAULT_DENSITY;
//px转换成dp
const h2 = 1334 / DEFAULT_DENSITY;

// iPhoneX
const X_WIDTH = 375;
const X_HEIGHT = 812;

/**
 * 设置字体的size（单位px）
 * @param size 传入设计稿上的px
 * @returns {Number} 返回实际sp
 */
export function setSpText(size: Number) {
    let scaleWidth = screenW / w2;
    let scaleHeight = screenH / h2;
    let scale = Math.min(scaleWidth, scaleHeight);
    size = Math.round((size * scale + 0.5));
    return size / DEFAULT_DENSITY;
}

/**
 * 屏幕适配,缩放size
 * @param size
 * @returns {Number}
 */
export function scaleSize(size: Number) {
    let scaleWidth = screenW / w2;
    let scaleHeight = screenH / h2;
    let scale = Math.min(scaleWidth, scaleHeight);
    size = Math.round((size * scale + 0.5));
    return size / DEFAULT_DENSITY;
}

/**
 * 判断是否为iphoneX
 * @returns {boolean}
 */
export function isIphoneX() {
    return (
        Platform.OS === 'ios' &&
        ((screenH === X_HEIGHT && screenW === X_WIDTH) || (screenH === X_WIDTH && screenW === X_HEIGHT))
    )
}

/**
 * 根据是否是iPhoneX返回不同的样式
 * @param iphoneXStyle
 * @param iosStyle
 * @param androidStyle
 * @returns {*}
 */
export function ifIphoneX(iphoneXStyle, iosStyle, androidStyle) {
    if (isIphoneX()) {
        return iphoneXStyle;
    } else if (Platform.OS === 'ios') {
        return iosStyle
    } else {
        if (androidStyle) return androidStyle;
        return iosStyle
    }
}

// 获取设备信息
export async function getDevicesInfo(){
    return {
        uniqueID: DeviceInfo.getUniqueID(),
        manufacturer: DeviceInfo.getManufacturer(),
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        deviceId: DeviceInfo.getDeviceId(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
    };
}

// 设置user-agent
export async function makeUserAgent() {
    let info = await NetInfo.getConnectionInfo();

    // ur'\(Linux; (?P<sys>Android|iOS) (?P<sys_ver>\d+\.\d+(?:\.\d+)*); (?P<mobile>[^)]+)\) GoApp/(?P<app_ver>\d+\.\d+) NetType/(?P<net_type>\w+) Language/(?P<lang>zh_CN)
    return '(Linux; ' +
        DeviceInfo.getSystemName() + ' ' + DeviceInfo.getSystemVersion() + '; ' +
        DeviceInfo.getModel() + ') GoApp/' + DeviceInfo.getVersion() + ' NetType/' + info.type + ' Language/zh_CN)';
}

// 启动app
export async function launchApp(sessionID: string,userAgent: any,deviceInfo: any){
    let url = Api.common + Api.category.appLaunch_v2 + '?device_info=' + deviceInfo,
        headers = {
            'SESSION-ID': sessionID,
            'User-Agent': userAgent,
        };

    try {
        let response = await fetch(url,{
            method: 'GET',
            headers: headers,
        });
        let responseJson = await response.json();

        return responseJson;
    }
    catch (err){
        return takeError(err);
    }
}

/**
 * 提取错误
 * @param err
 * @returns {{code: number, message: string}}
 */
export const takeError = (err) => {
    // 默认错误码
    let code = 500, message = 'Something bad happended';

    if (typeof err.message === 'object') {
        // 服务端返回的错误（不是异常）, err.message 是一个对象 {code, message}
        code = err.message.code;
        message = err.message.message;
    } else if (typeof err.message === 'string') {
        // 系统抛出的异常
        // err.message 是一个字符串
        message = err.message;

    } else if (typeof err === 'string') {
        // 其他情况
        message = err;
    }
    return {
        code, message,
    };
};

// 错误显示
export function errorShow(err: any,callback: Function){
    let error = new takeError(err);

    if(error.code === 500){
        Alert.alert('系统提示','服务器繁忙,请稍后再试！',[
            {
                text: '关闭',onPress: () => {callback && callback()}
            }
        ]);
    }
    else{
        Alert.alert('系统提示','服务器繁忙,请稍后再试！',[
            {
                text: '关闭',onPress: () => {callback && callback()}
            }
        ]);
    }
}

// 从服务器获取ios或者android升级地址
export async function getUpdateInfo (channelID: string){
    let type = Platform.OS === 'android' ? Api.category.checkUpgradeAndroid : Api.category.checkUpgradeIos;
    let url = Api.common + type,
        params = '?channel_id=' + channelID;
    let str = url + params;

    return str;
}

// 字母转化为大写
export function ToUpperCase(str){
    let new_str = '';

    new_str = str && str.toUpperCase();
    return new_str;
}

// 网络检测
export function networkCheck(success: Function,fail: Function){
    NetInfo.isConnected.fetch().done((isConnected) => {
        isConnected ? (success && success(isConnected)) : (fail && fail(isConnected));
    });
}

// 数组相同元素个数抓取
export function SameArrElementCount(arrData: Array) {
    let arr = [],reslut;

    for(let i=0;i<arrData.length;){
        let count = 0;
        for(let j=i;j<arrData.length;j++){
            if(arrData[i] === arrData[j]){
                count++;
            }
        }
        arr.push({
            item: arrData[i],
            count: count
        });

        i += count;
    }

    for(let k=0;k<arr.length;k++){
        reslut = arr[k];
    }

    return reslut;
}





























