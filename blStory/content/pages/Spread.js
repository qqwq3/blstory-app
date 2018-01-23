
// 分享、推广

import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    Platform,
    Clipboard,
    Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-easy-toast';
import { Devices,Api } from "../common/Api";
import TextInputModel from '../common/TextInputModel';
import { ToUpperCase } from '../common/Util';
import Fecth from '../common/Fecth';
import Loading from '../common/Loading';
import { errorShow,loginTimeout,networkCheck } from '../common/Util';

class Spread extends Component{
    constructor(props){
        super(props);
        this._icModal = null;
        this._acModal = null;
        this.state = {
            obj: null,
            isLoading: false,
            str: '',
        };
        this.authorized_key = this.props.navigation.state.params.authorized_key;
    }
    componentWillMount() {
        this._spreadGetDevice();
    }
    _spreadGetDevice(){
        let url = Api.common + Api.category.spreadGetDevice,
            params = '',
            headers = {
                'SESSION-ID': launchConfig.sessionID,
                'Authorized-Key': this.authorized_key
            };

        networkCheck(() => {
            Fecth.get(url,params,res => {
                if(res.code === 0){
                    this.setState({
                        obj: res.data,
                        isLoading: false,
                    });
                }
                else{
                    this.setState({
                        isLoading: false,
                    });

                    loginTimeout(_ => {
                        this.props.navigation.navigate("Login");
                    });
                }
            },err =>{
                this.setState({
                    isLoading: false,
                });

                errorShow(err);
            },headers);
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    render(){
        let obj = this.state.obj !== null && this.state.obj;

        return (
            <LinearGradient colors={['#ff5a5a','#f3916b']} style={styles.linearGradient}>
                <View style={styles.header}>
                    {
                        obj.invite_instance_id > 0 ? null : (
                            <TouchableOpacity
                                style={styles.headerBox}
                                activeOpacity={1}
                                onPress={() => this._exchange()}
                            >
                                <Text style={styles.headerBoxText}>兑换</Text>
                            </TouchableOpacity>
                        )
                    }
                    <TouchableOpacity
                        style={styles.headerBox}
                        activeOpacity={1}
                        onPress={() => this._spreadRefresh()}
                    >
                        <Text style={styles.headerBoxText}>刷新</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.lbView}>
                    <Text style={styles.blText}>鹿币</Text>
                </View>
                <View style={styles.lbSumView}>
                    <Text style={styles.lbSumText}>{(obj.play_of_day - obj.today_play + (obj.balance | 0)) || 0}</Text>
                </View>

                <View style={styles.bhControl}>
                    <View style={styles.bhControlMsg}>
                        <View><Text style={{fontSize:14,color:'#fff'}}>账户编码</Text></View>
                        <View style={{marginLeft:10}}>
                            <Text numberOfLines={1} style={{fontSize:12,color:'#fff'}}>{ToUpperCase(obj.instance_code)}</Text>
                        </View>
                    </View>
                    <View style={styles.bhControlBtnGroup}>
                        <TouchableOpacity
                            style={styles.bhControlBtn}
                            activeOpacity={0.75}
                            onPress={this._switch.bind(this)}
                        >
                            <Text style={styles.bhControlBtnText}>切换</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.bhControlBtn}
                            activeOpacity={0.75}
                            onPress={() => this._userCodeCopy(ToUpperCase(obj.instance_code))}
                        >
                            <Text style={styles.bhControlBtnText}>复制</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.tgBox}>
                    <Text style={{fontSize:15,color:'#fff',fontWeight:'bold'}}>分享成功：可得海量鹿币、无限畅通免费阅读</Text>
                </View>

                <View style={styles.tgContent}>
                    <View style={styles.flBox}>
                        <View style={[styles.flInderBox,{justifyContent:'flex-start',}]}>
                            <Text style={{fontSize:14,color:'#666666'}}>- 分享 -</Text>
                        </View>
                        <View style={[styles.flInderBox,{justifyContent:'flex-start',}]}>
                            <Text style={{fontSize:14,color:'#666666'}}>- 福利 -</Text>
                        </View>
                        <View style={[styles.flInderBox,{justifyContent:'flex-end',flex: 0.8}]}>
                            <Text style={{fontSize:14,color:'#666666'}}>- 统计 -</Text>
                        </View>
                    </View>

                    <View style={styles.flBox}>
                        <View style={[styles.flInderBox,{justifyContent:'flex-start',}]}>
                            <Text style={{fontSize:13,color:'#fff'}}>分享给1个好友</Text>
                        </View>
                        <View style={[styles.flInderBox,{justifyContent:'flex-start',}]}>
                            <Text style={{fontSize:13,color:'#fff'}}>鹿币上限增加100</Text>
                        </View>
                        <View style={[styles.flInderBox,{justifyContent:'flex-end',flex: 0.8}]}>
                            <Text style={{fontSize:13,color:'#fff'}}>({obj.total_invites >= 1 ? 1 : 0}/1)</Text>
                        </View>
                    </View>

                    <View style={styles.flBox}>
                        <View style={[styles.flInderBox,{justifyContent:'flex-start',}]}>
                            <Text style={{fontSize:13,color:'#fff'}}>分享给12个好友</Text>
                        </View>
                        <View style={[styles.flInderBox,{justifyContent:'flex-start',}]}>
                            <Text style={{fontSize:13,color:'#fff'}}>可无限阅读有广告</Text>
                        </View>
                        <View style={[styles.flInderBox,{justifyContent:'flex-end',flex: 0.8}]}>
                            <Text style={{fontSize:13,color:'#fff'}}>({obj.total_invites >= 12 ? 12 : obj.total_invites}/12)</Text>
                        </View>
                    </View>

                    <View style={styles.flBox}>
                        <View style={[styles.flInderBox,{justifyContent:'flex-start',}]}>
                            <Text style={{fontSize:13,color:'#fff'}}>分享给20个好友</Text>
                        </View>
                        <View style={[styles.flInderBox,{justifyContent:'flex-start',}]}>
                            <Text style={{fontSize:13,color:'#fff'}}>可无限阅读且无广告</Text>
                        </View>
                        <View style={[styles.flInderBox,{justifyContent:'flex-end',flex: 0.8}]}>
                            <Text style={{fontSize:13,color:'#fff'}}>({obj.total_invites >= 20 ? 20 : obj.total_invites}/20)</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.ftBoxBtnGroup}>
                    <View style={styles.ftBox}>
                        <TouchableOpacity
                            style={styles.ftBoxBtn}
                            activeOpacity={0.75}
                            onPress={() => this._shareToFriends(obj.unique_id)}
                        >
                            <Text style={{fontSize: 15,color:'#fff'}}>分享给好友</Text>
                        </TouchableOpacity>
                        <View style={{justifyContent:'center',alignItems:'center',paddingHorizontal:15}}>
                            <Text style={{fontSize:15,color:'#fff',fontWeight:'bold'}}>OR</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.ftBoxBtn}
                            activeOpacity={0.75}
                            onPress={() => this._copyInviteLink(obj.unique_id)}
                        >
                            <Text style={{fontSize: 15,color:'#fff'}}>复制邀请链接</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TextInputModel
                    ref={(ref) => this._icModal = ref}
                    title={"请输入兑换码"}
                    placeholder={"兑换码"}
                    onSubmit={this._exchangeSubmit.bind(this)}
                />

                <TextInputModel
                    ref={(ref) => this._acModal = ref}
                    title={"请输入要切换账户编码"}
                    placeholder={"长按可粘贴账户编码"}
                    onSubmit={this._switchSubmit.bind(this)}
                />

                <Toast
                    ref="toast"
                    position={'top'}
                    fadeInDuration={750}
                    fadeOutDuration={1000}
                    opacity={0.8}
                    style={{backgroundColor:'#000000'}}
                    textStyle={{fontSize:14,color:'#fff'}}
                />
                <Loading
                    opacity={0.60}
                    show={this.state.isLoading}
                />
            </LinearGradient>
        );
    }
    // 分享给你好友
    _shareToFriends(uniqueID){
        this._comShareInfo(uniqueID,message => {
            // IOS - Share
            if(Platform.OS === 'ios'){
                Share.share({
                    message: message,
                }, {
                    excludedActivityTypes: ['com.apple.UIKit.activity.PostToTwitter']
                })
                .then(this._showResult.bind(this))
                .catch((error) => {
                    this.refs['toast'].show(error.message,600);
                });
            }

            // Android - Share
            if(Platform.OS === 'android'){
                Share.share({
                    message: message,
                })
                .then(this._showResult.bind(this))
                .catch((error) => {
                    this.refs['toast'].show(error.message,600);
                });
            }
        });
    }
    _showResult(result) {
        // android
        if (result.action === Share.sharedAction) {
            if (result.activityType) {
                console.log('android',result.activityType);
            } else {
                console.log('android','分享关闭');
            }
        }

        // ios
        else if(result.action === Share.dismissedAction) {
            console.log('ios','分享关闭');
        }
    }
    // 复制邀请链接
    _copyInviteLink(uniqueID){
        this._comShareInfo(uniqueID,str => {
            this.refs['toast'].show('复制成功',600);
            Clipboard.setString(str);
        });
    }
    // 公共方法
    _comShareInfo(uniqueID: string,callback: Function){
        let inviteDomain = launchConfig.inviteDomain;
        let str = inviteDomain.replace('%(code)s',uniqueID);

        callback && callback(str);
    }
    // 刷新
    _spreadRefresh(){
        this.setState({isLoading: true});
        this._spreadGetDevice();
    }
    // 账户编码复制
    _userCodeCopy (code){
        this.refs['toast'].show('复制成功',600);
        return Clipboard.setString(code);
    }
    // 兑换
    _exchange(){
        this._icModal && this._icModal.show();
    }
    // 切换
    _switch(code){
        if (typeof code !== 'string') {
            code = '';
        }

        this._acModal && this._acModal.show(code);
    }
    // 提交兑换
    _exchangeSubmit(code){
        let urlSuffix = Api.category.spreadExchange;
        let successPrompt = '兑换成功';
        let failPrompt = '请输入有效的兑换码';

        this._comFunction(code,urlSuffix,successPrompt,failPrompt,() => {
            this._icModal && this._icModal.close();
        });
    }
    //  提交切换
    _switchSubmit(code){ console.log('switch',code);
        let urlSuffix = Api.category.spreadSwitch;
        let successPrompt = '切换成功';
        let failPrompt = '请输入有效的账户编码';

        this._comFunction(code,urlSuffix,successPrompt,failPrompt,() => {
            this._acModal && this._acModal.close();
        });
    }
    // 公共方法
    _comFunction(code,urlSuffix,successPrompt,failPrompt,callback){
        if(code){
            let url = Api.common + urlSuffix,
                params = Fecth.dictToFormData({code: code}),
                headers = {'SESSION-ID': launchConfig.sessionID};

            // 提交请求
            Fecth.post(url,params,headers,res => {
                if(res.code === 0){
                    this.refs['toast'].show(successPrompt,600);
                }
                else{
                    this.refs['toast'].show(res.message,600);
                }

                callback && callback();
            },err =>{
                callback && callback();
                errorShow(err);
            });
        }
        else{
            callback && callback();
            this.refs['toast'].show(failPrompt,600);
        }
    }
}

export default Spread;

const styles = StyleSheet.create({
    ftBox:{
        flexDirection: 'row',
        paddingHorizontal:15,

    },
    ftBoxBtn:{
        backgroundColor: '#666666',
        height: 40,
        elevation: 3,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        shadowColor: '#999',
        shadowOffset: {width:3,height:3},
        shadowOpacity: 0.8,
        shadowRadius: 3,
    },
    ftBoxBtnGroup:{
        flex: 1,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tgContent:{
        borderBottomWidth: 1 / Devices.piexl,
        borderBottomColor: '#ffffff',
        borderStyle: 'solid',
        marginHorizontal: 15,
        paddingBottom: 15,
    },
    flBox:{
        overflow: 'hidden',
        flexDirection: 'row',
        marginTop: 15,
    },
    flInderBox:{
        flexDirection: 'row',
        alignItems: 'center',
        flex:1,
    },
    tgBox:{
        flexDirection:'row',
        overflow:'hidden',
        paddingHorizontal: 15,
        marginTop: 30,
        marginBottom: 15,
    },
    bhControlBtnGroup:{
        width: 100,
        height: 50,
        overflow:'hidden',
        flexDirection: 'row',
    },
    bhControlBtnText:{
        color: '#666666',
        fontSize: 15,
    },
    bhControlBtn:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    bhControlMsg:{
        flex:1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    bhControl:{
        borderBottomWidth: 1 / Devices.piexl,
        borderBottomColor: '#ffffff',
        borderStyle: 'solid',
        height: 50,
        overflow: 'hidden',
        marginHorizontal: 15,
        flexDirection:'row',
        marginTop: 15,
    },
    lbSumView:{
        justifyContent:'center',
        alignItems:'center',
    },
    lbSumText:{
        fontSize: 50,
        color:'#ffffff',
    },
    lbView:{
        justifyContent:"center",
        alignItems:'center',
        marginTop: 15,
    },
    blText:{
        fontSize: 14,
        color:'#ffffff'
    },
    headerBoxText:{
        fontSize: 15,
        color: '#FFFFFF'
    },
    headerBox:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header:{
        height: 60,
        overflow:"hidden",
        flexDirection: 'row',
    },
    linearGradient:{
        flex: 1,
        overflow: 'hidden',
    },
});
























































