
// 登录

import React,{ Component } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    PixelRatio,
    FlatList,
    TouchableOpacity,
    Platform,
    Alert,
    Button,
} from 'react-native';
import * as wechat from 'react-native-wechat';
import Toast from 'react-native-easy-toast';
import DeviceInfo from 'react-native-device-info';
import { Devices,Api } from "../common/Api";
import Fecth from '../common/Fecth';
import LoginSelect from './LoginSelect';
import { errorShow,loginTimeout,networkCheck } from '../common/Util';

class Login extends Component{
    constructor(props){
        super(props);
        this.state = {
            left: 0,
            scope: null,
            state: null,
            appid: null,
            authorized_key: '',
            hash_id: '',
            id: '',
            name: '',
            appVersion: DeviceInfo.getVersion(),
        }
    }
    componentWillMount(){
        this._getScopeAndState();
    }
    render(){
        const _left = this.state.left;

        return (
            <View style={styles.content}>
                <View style={{flex:1}}>
                    <View style={styles.loginTitle}>
                        <Text style={[styles.comColor,styles.loginTitleText]}>白鹿</Text>
                    </View>
                    <View style={styles.loginMethod}>
                        <View style={styles.loginMethodPropmpt}>
                            <View style={[styles.loginMPLine,styles.comBackground]}/>
                            <View onLayout={this._layout} style={[styles.loginMPView,{left: _left}]}>
                                <Text style={[styles.loginMPText,styles.comColor]}>请选择以下方式快捷方式登录</Text>
                            </View>
                        </View>
                        <LoginSelect
                            scope={this.state.scope}
                            state={this.state.state}
                            navigation={this.props.navigation}
                            toast={this.refs.toast}
                        />
                        <View style={[styles.loginRulePrompt]}>
                            <View style={{paddingTop:10}}>
                                <Text style={[styles.loginRulePrompText,styles.comColor]}>
                                    当前版本：{this.state.appVersion}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <Toast
                    ref="toast"
                    position={'center'}
                    fadeInDuration={750}
                    fadeOutDuration={1000}
                    opacity={0.8}
                    style={{backgroundColor:'#000000'}}
                    textStyle={{fontSize:14,color:'#fff'}}
                />
            </View>
        );
    }
    _layout = (e) =>{
        const _width = e.nativeEvent.layout.width;
        this.setState({
            left: (Devices.width-_width) / 2,
        });
    };
    _getScopeAndState(){
        let url = Api.common + Api.category.weixin,
            params = '',
            headers = {'SESSION-ID': ''};//launchConfig.sessionID};

        networkCheck(() => {
            Fecth.get(url,params,(res) => {
                if(res.code === 0){
                    this.setState({
                        scope: res.data.scope,
                        state: res.data.state,
                        appid: res.data.appid,
                    });
                    this._wechatRegisterApp(res.data.appid);
                }
                else{
                    console.log('login',res);

                    loginTimeout(_ => {
                        this._getScopeAndState();
                    });
                }
            },(err) => {
                errorShow(err);
            },headers);
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    _wechatRegisterApp(appid){
        try{
            wechat.registerApp(appid);
        }
        catch (err){
            errorShow(err);
        }
    }
}

export default Login;

const styles = StyleSheet.create({
    checkBox:{
        height: 60,
        paddingTop: 10,
        paddingLeft:15,
    },
    dialogContentView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    comColor: {
        color: '#304758'
    },
    comBackground: {
        backgroundColor: '#304758'
    },
    content: {
        flex: 1,
        backgroundColor: '#E6E2DE',
        overflow: 'hidden'
    },
    loginTitle: {
        flex: 2,
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginTitleText: {
        fontSize: 50,
        fontWeight: 'bold'
    },
    loginMethod: {
        flex: 1,
    },
    loginMethodPropmpt: {
        flexDirection: 'row'
    },
    loginMPLine: {
        height: 1 / Devices.piexl,
        marginLeft: 20,
        marginRight: 20,
        width: (Devices.width-20*2)
    },
    loginMPView: {
        backgroundColor: '#E6E2DE',
        height: 30,
        flexDirection: 'row',
        paddingLeft: 10,
        paddingRight: 10,
        position: 'absolute',
        overflow: 'hidden',
        top: -15,
        zIndex: 1000,
    },
    loginMPText: {
        fontSize: 12,
        letterSpacing: 0,
        textAlignVertical: 'center'
    },
    loginRulePrompt: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: Devices.width,
        height: 60,
    },
    loginRulePrompText: {
        fontSize: 12,
        textAlign: 'center'
    }
});









