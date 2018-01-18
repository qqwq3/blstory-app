
// 签到

import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
} from 'react-native';
import Toast from 'react-native-easy-toast';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import Icon from '../common/Icon';
import { Devices,Api } from "../common/Api";
import Fecth from '../common/Fecth';
import Loading from '../common/Loading';
import { errorShow } from '../common/Util';

class SignIn extends Component{
    constructor(props){
        super(props);
        this.state = {
            popStatus: false,
            sigInArr:[1,2,3,4,5,6],
            isSignIn: null,
            signInDays:0,
            totalRewards:0,
            showLoading: true,
        };
        this.authorized_key = this.props.navigation.state.params.authorized_key;
    }
    componentWillMount() {
        this._signInCheck();
    }
    _signInRules(){
        this.setState({popStatus: true});
    }
    _closeSignInPop(){
        this.setState({popStatus: false});
    }
    _signInCheck(){
        let authorized_key = this.authorized_key;
        let url = Api.common + Api.category.signInCheck,
            headers = {"Authorized-Key":authorized_key,"SESSION-ID": launchConfig.sessionID};

        Fecth.get(url,'',res => {
            if(res.code === 0){
                if(res.data.singed === true){
                    this.setState({
                        isSignIn: true,
                    });
                }

                this.setState({
                    showLoading:false,
                    totalRewards: res.data.total_rewards,
                    signInDays: res.data.cycle_days + 1,
                });
            }
            else{
                console.log(res);
            }
        },err => {
            errorShow(err);
        },headers);
    }
    _signIn() {
        let authorized_key = this.props.navigation.state.params.authorized_key;
        let url = Api.common + Api.category.signIn,
            params = Fecth.dictToFormData({}),
            headers = {"Authorized-Key":authorized_key,"SESSION-ID": launchConfig.sessionID};

        Fecth.post(url, params, headers, res => {
            if(res.code === 0){
                this.refs.toast.show(res.data.text,1000);
                this.setState({
                    signInDays: res.data.cycle_days + 1,
                    totalRewards: res.data.total_rewards,
                    isSignIn: true,
                });
            }
        },err => {
            errorShow(err);
        });
    }
    _returnHome(){
        return this.props.navigation.goBack();
    }
    render(){
        return (
            <View style={{backgroundColor:'#ffffff',flex:1}}>
                <LinearGradient colors={['#ff5a5a','#f3916b']} style={{flex:1}}>
                    <View style={styles.signInContent}>
                        <TouchableOpacity onPress={() => this._returnHome()} style={styles.signInReturn} activeOpacity={1}>
                            <Image tintColor={'#ffffff'} source={Icon.iconBlackArrowLeft} style={styles.iconBlackArrowLeft} />
                        </TouchableOpacity>
                        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                            <Text style={styles.titleText}>签到</Text>
                        </View>
                        <TouchableOpacity onPress={() => this._signInRules()} style={styles.rules} activeOpacity={1}>
                            <Image source={Icon.iconCheckInfo} style={{width:20,height:20}} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.titleImage}>
                        <Image source={Icon.iconCheckTitle} resizeMode={'contain'}/>
                    </View>

                    <View style={styles.rewardImage}>
                        <Image source={Icon.iconCheckCoin} resizeMode={'contain'} style={{alignSelf:'center',marginLeft:-12}}/>
                        <View style={styles.rewardBox}>
                            <View style={{alignItems:'center',marginTop:70}}>
                                <Text style={{fontSize:15,color:"#ffffff"}}>累计获得</Text>
                            </View>
                            <View style={{alignItems:'center',marginTop:25}}>
                                <Text style={{fontSize:36,color:'#ffffff'}}>{this.state.totalRewards}</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                <View style={{height:210,justifyContent:'center',alignItems:'center'}}>
                    <View style={styles.signInQd}>
                        <View style={styles.signInCircleCollection}>
                            {
                                this.state.sigInArr.map((item,index) => {
                                    let backgroundColor = this.state.signInDays <= index ? "#cbcbcb" : '#F8AD54';
                                    return (
                                        <View key={index} style={styles.signInBox}>
                                            <View style={[{width:30,height:30,backgroundColor:backgroundColor},styles.signInCircle]}>
                                                {
                                                    this.state.signInDays <= index ? (<Text style={{fontSize:14,color:'#ffffff'}}>{item}</Text>) : (<Image source={Icon.iconCheckTic} />)
                                                }
                                            </View>
                                            <View style={{flex:1,height:2,backgroundColor:backgroundColor}} />
                                        </View>
                                    )
                                })
                            }
                        </View>
                        <View style={[{width:40,height:40,backgroundColor:this.state.signInDays === 7 ? '#F8AD54' : '#cbcbcb'},styles.signInCircle]}>
                            {
                                this.state.signInDays === 7 ? (<Image source={Icon.iconCheckTic} />) : (<Image source={Icon.iconCheckGift}/>)
                            }
                        </View>
                    </View>

                    <View style={{alignItems:'center',marginTop:15,}}>
                        <Text style={{fontSize:15,color:'#f3916b'}}>已连续签到 <Text style={{fontSize:24,fontWeight:'bold'}}>{this.state.signInDays}</Text> 天</Text>
                    </View>

                    <View style={{alignItems:'center'}}>
                        {
                            this.state.isSignIn ? (
                                <View style={[styles.signInButton,{backgroundColor:'#cbcbcb'}]}>
                                    <Text style={{fontSize:20,color:'#ffffff'}}>已签到</Text>
                                </View>
                            ) : (
                                <TouchableOpacity onPress={() => this._signIn()} style={styles.signInButton} activeOpacity={0.75}>
                                    <Text style={{fontSize:20,color:'#ffffff'}}>签到</Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                </View>
                {
                    this.state.popStatus ? <SignInPop closeSignInPop={() => this._closeSignInPop()}/> : null
                }
                <Toast
                    ref="toast"
                    position={'center'}
                    fadeInDuration={750}
                    fadeOutDuration={1000}
                    opacity={0.8}
                    style={{backgroundColor:'#000000'}}
                    textStyle={{fontSize:14,color:'#fff'}}
                />
                <Loading show={this.state.showLoading}/>
            </View>
        );
    }
}

// 弹出层
class SignInPop extends Component{
    static propTypes = {
        closeSignInPop: PropTypes.func,
    };
    render(){
        return (
            <View style={styles.signInPop}>
                <View style={styles.signInPopContent}>
                    <TouchableOpacity
                        onPress={() => this.props.closeSignInPop()}
                        activeOpacity={0.75}
                        style={styles.signInPopColse}
                    >
                        <Image source={Icon.iconRuleClose} style={{width:12,height:12}}/>
                    </TouchableOpacity>
                    <View style={{alignItems:'center'}}>
                        <Text style={[{fontSize:20,fontWeight:'bold',color:'#4d4d4d'},styles.textShadow]}>签到规则</Text>
                    </View>
                    <View style={{padding:15, overflow:'hidden',marginTop:5}}>
                        <Text includeFontPadding={false} style={{fontSize:14,color:'#4d4d4d',paddingLeft:5,lineHeight:20}}>
                            {'        '}签到每次可以获取到金币的奖励，连续签到第<Text style={{color:'#ff5a5a'}}> 7 </Text>天可以获取大礼包奖励。
                        </Text>
                        <Text style={{fontSize:14,color:'#4d4d4d',marginTop:15,paddingLeft:5,lineHeight:20}}>
                            {'        '}签到<Text style={{color:'#ff5a5a'}}> 7 </Text>天为一个循环，从第一次签到开始，连续签到第<Text style={{color:'#ff5a5a'}}> 7 </Text>天即可获取到大礼包。
                        </Text>
                        <Text includeFontPadding={false} style={{fontSize:14,color:'#4d4d4d',marginTop:15,paddingLeft:5,lineHeight:20}}>
                            {'        '}中途漏签不累计，再次签到后重新开始累计连续签到天数。
                        </Text>
                        <Text includeFontPadding={false} style={{fontSize:14,color:'#4d4d4d',marginTop:15,paddingLeft:5,lineHeight:20}}>
                            {'        '}签到每天一次，凌晨<Text style={{color:'#ff5a5a'}}> 00:00 </Text>后即可开始新一天的签到。
                        </Text>
                    </View>
                </View>
            </View>
        )
    }
}

export default SignIn;

const styles = StyleSheet.create({
    textShadow: {
        textShadowColor: '#cccccc',
        textShadowOffset: {width: 2,height: 1.5},
        textShadowRadius: 4,
    },
    signInPopColse:{
        height:30,
        paddingTop:15,
        paddingRight:15,
        flexDirection:'row',
        justifyContent:'flex-end',
    },
    signInPop:{
        position:'absolute',
        left:0,
        right:0,
        top:0,
        bottom:0,
        backgroundColor:'rgba(0,0,0,0.75)',
        zIndex:500,
        justifyContent:'center',
        alignItems:'center',
    },
    signInPopContent:{
        width: Devices.width - 80,
        backgroundColor:'#ffffff',
        borderRadius:6,
        overflow:'hidden',
    },
    signInButton:{
        backgroundColor:'#f3916b',
        height: 40,
        width: 190,
        borderRadius:20,
        overflow:'hidden',
        justifyContent:'center',
        alignItems:'center',
        marginTop: 30,
    },
    signInBox:{
        flex:1,
        height:40,
        flexDirection:'row',
        alignItems:'center',
    },
    signInCircleCollection:{
        flex:1,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
    },
    signInCircle: {
        borderRadius: 40,
        overflow: 'hidden',
        justifyContent:'center',
        alignItems: 'center',
    },
    signInQd:{
        flexDirection: 'row',
        paddingLeft:15,
        paddingRight:15,
        //marginTop: 20,
    },
    rewardBox:{
        backgroundColor:'transparent',
        position:'absolute',
        left:0,
        top:0,
        bottom:0,
        right:0,
        zIndex:200,
    },
    rewardImage:{
        overflow:'hidden',
        position:'relative',
    },
    titleImage:{
        flexDirection:'row',
        overflow:"hidden",
        justifyContent:'center',
        alignItems:'center',
        marginTop:34,
        marginBottom:20,
    },
    rules:{
        position:'absolute',
        zIndex:100,
        right:0,
        top:0,
        height:64,
        width: 120,
        paddingRight:15,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-end',
    },
    signInContent:{
        flexDirection:"row",
        height:64,
    },
    signInReturn:{
        position: 'absolute',
        left:0,
        top:0,
        height: 64,
        width: 120,
        zIndex:100,
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:15,
        justifyContent:'flex-start',
    },
    iconBlackArrowLeft: {
        width: 10,
        height: 17,
        resizeMode: 'contain',
    },
    titleText: {
        alignSelf: 'center',
        fontSize: 17,
        fontWeight: 'bold',
        color: '#ffffff'
    }
});











































