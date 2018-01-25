
import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    FlatList,
    Image,
    Alert,
    AlertIOS,
    Platform,
} from 'react-native';
import * as wechat from 'react-native-wechat';
import Fecth from '../common/Fecth';
import { Api } from "../common/Api";
import Icon from '../common/Icon';
import StorageUtil from '../common/StorageUtil';
import { errorShow,networkCheck } from '../common/Util';

class LoginSelect extends Component{
    constructor(props){
        super(props);
        this.state = {
            data: [
                {key: "qq", icon: Icon.iconQQ},
                {key: "wx", icon: Icon.iconWX},
                {key: "wb", icon: Icon.iconWB},
            ],
            user: {},
        }
    }
    render(){
        return (
            <View style={styles.loginSelectBox}>
                <FlatList
                    data={this.state.data}
                    renderItem={this._renderItem}
                    contentContainerStyle={styles.loginSelectBoxFlatList}
                />
            </View>
        );
    }
    _renderItem = ({item}) => {
        return (
            <TouchableOpacity
                activeOpacity={0.75}
                style={[styles.loginSelectBoxItem,styles.comBackground]}
                onPress={() => this._login(item.key)}
            >
                <Image style={{width: 45,height: 45,resizeMode: 'contain'}} source={item.icon} />
            </TouchableOpacity>
        );
    };
    _login(key){
        const { navigate } = this.props.navigation;

        networkCheck(() => {
            switch(key){
                case 'qq': // QQ登录
                    Alert.alert('系统提示','此登录方式暂未开发',[{text: '确定'}]);
                    break;
                case 'wx': // 微信登录
                    this._wxLogin();
                    break;
                case 'wb': // 微博登录
                    Alert.alert('系统提示','此登录方式暂未开发',[{text: '确定'}]);
                    break;
            }
        },() => {
            navigate("NetWork");
        });
    }
    _wxLogin(){
        let scope = this.props.scope,
            state = this.props.state;
        let user = this.state.user;

        //判断微信是否安装
        wechat.isWXAppInstalled().then((isInstalled) => {
            if (isInstalled) {
                //发送授权请求
                wechat.sendAuthRequest(scope, state)
                    .then(responseCode => {
                        //返回code码，通过code获取access_token
                        this._getAccessToken(responseCode.code,state);
                    })
                    .catch(err => {
                        Alert.alert('登录授权发生错误：', err.message, [
                            {text: '确定'}
                    ]);
                });
            } else {
                Alert.alert('提示',`请先安装微信软件`,[
                    {text: '确定'}
                ]);
            }
        });
    }
    _getAccessToken(code,state){
        let url = Api.common + Api.category.weiXinCallback,
            params = JSON.stringify({code:code,state:state}),
            headers = {};

        Fecth.post(url,params,headers,(res) => { //console.log('loginSelect',headers,launchConfig);
            if(res.code === 0){
                StorageUtil.save("user",res.data,null);

                this.props.navigation.navigate('Home',{
                    user:{
                        id: res.data.id,
                        name: res.data.name,
                        authorized_key: res.data.authorized_key,
                        hex_id: res.data.hash_id,
                    }
                });
            }
            else{
                console.log('loginSelect',res);

                Alert.alert('系统提示','系统繁忙，请稍后再试！',[
                    {
                        text: '关闭',
                    }
                ]);
            }
        },(err) => {
            errorShow(err);
        });
    }
}

export default LoginSelect;

const styles = StyleSheet.create({
    loginSelectBox: {
        flexDirection: 'row',
        overflow: 'hidden',
        marginTop: 60,
        paddingLeft: 30,
        paddingRight: 30
    },
    loginSelectBoxItem: {
        width:45,
        height:45,
        borderRadius: 45
    },
    comBackground: {
        backgroundColor: '#304758'
    },
    loginSelectBoxFlatList: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
});






































