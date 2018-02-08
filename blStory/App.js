
import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    Dimensions,
    Image,
    TouchableOpacity,
    Alert,
    AlertIOS,
    NetInfo,
    Linking,
    Animated,
    Easing,
    BackHandler,
    ToastAndroid
} from 'react-native';
import Toast from 'react-native-easy-toast';
import CodePush from 'react-native-code-push';
import AppUpdate from 'react-native-appupdate';
import * as DeviceInfo from 'react-native-device-info';
import * as Progress from 'react-native-progress';
import SplashScreen from 'react-native-smart-splash-screen';

import Router from './content/pages/Router';
import { launchApp,makeUserAgent,getDevicesInfo,exitApp } from './content/common/Util';
import { getUpdateInfo,getSessionID } from './content/common/Util';
import { Devices,DEPLOYMENT_KEYS } from "./content/common/Api";

class App extends Component<{}>{
    constructor(props){
        super(props);
        this.state = {
            isCheck: false,
            AppVersion: DeviceInfo.getVersion(),
            AppVersionPrompt: '当前版本',
            status: null,
            remoteLaunchData: null,
            progress: 0,
            checkStatus: false
        };
        this.lastBackPressed = Date.now();
    }
    componentWillMount(){
        // 页面加载的禁止重启，在加载完了可以允许重启
        CodePush.disallowRestart();

        this.timer = setTimeout(() => {
            // 初始化
            this.initialize();
        },1300);

        // 关闭启动屏幕
        SplashScreen.close({
            animationType: SplashScreen.animationType.scale,
            duration: 800,
            delay: 500,
        });

        this._addEventListener();
    }
    componentDidMount() {
        // 在加载完了可以允许重启
        CodePush.allowRestart();
    }
    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
        this._removeEventListener();
    }
    _addEventListener(){
        if(Platform.OS === 'android'){
            BackHandler.addEventListener('hardwareBackPress', this._handleBack);
        }
        else{
            // ios
        }
    }
    _removeEventListener(){
        if(Platform.OS === 'android'){
            BackHandler.removeEventListener('hardwareBackPress', this._handleBack);
        }
        else{
            // ios
        }
    }
    _handleBack = () => {
        // 最近2秒内按过back键，可以退出应用。
        if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()){
            return exitApp();
        }

        this.lastBackPressed = Date.now();
        ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
        return true;
    };
    async initialize(){
        // 启动app调的方法
        let launch = await this._launch();

        global.launchConfig = {
            // 获取渠道
            channelID: 'staging',//
            // 分享信息
            inviteDomain: launch.data.invite_domain || '',
            // sessionID
            sessionID: launch.data.session_id || DeviceInfo.getUniqueID(),
            // 初始化信息
            initialMessages: launch.data.initial_messages || {},
            // 是否是安卓设备
            isAndroid: Platform.OS === 'android',
            // 是否是苹果设备
            isIOS: Platform.OS === 'ios',
            // app当前版本
            appVersion: DeviceInfo.getVersion() || '0.0.1',
            // nav
            navigator: this.navigator || {},
        };

        // app版本更新
        this._checkUpdate();
    }
    async _checkUpdate(){
        if(Platform.OS === 'android'){
            this._checkAndroid();
        }

        if(Platform.OS === 'ios'){
            this._checkIOS();
        }
    }
    async _launch(){
        let sessionID = DeviceInfo.getUniqueID(),
            userAgent = await makeUserAgent(),
            deviceInfo = await getDevicesInfo(),
            launchMsg = await launchApp(sessionID,userAgent,JSON.stringify(deviceInfo));

        return launchMsg;
    }
    async _checkIOS(){
        try{
            let ipaVersionUrl = await getUpdateInfo(launchConfig.channelID);
            let response = await fetch(ipaVersionUrl);
            let responseJson = response.json();
            let currentVersion = DeviceInfo.getVersion();

            if(responseJson && responseJson.code === 0 && responseJson.data.versionName > currentVersion){
                AlertIOS.alert(
                    '升级提示',
                    '发现最新包, 你要现在升级吗？',
                    [
                        {
                            text: '忽略', onPress: () => {}
                        },
                        {
                            text: '升级', onPress: () => {}
                        }
                    ]
                );
            }

            //Linking.openURL(responseJson.data.downUrl)
        }
        catch (err){
            console.log('_checkIOS',err);
        }
    }
    async _checkAndroid(){
        let apkVersionUrl = await getUpdateInfo(launchConfig.channelID);

        const appUpdate = new AppUpdate({
            apkVersionUrl: apkVersionUrl,
            needUpdateApp: (needUpdate) => {
                Alert.alert(
                    '升级提示',
                    '发现最新包, 你要现在升级吗？',
                    [
                        {
                            text:'忽略',onPress: () => {this.setState({checkStatus: false})}
                        },
                        // {text: '版本升级', onPress: () => {
                        //     //this.setState({checkStatus: false});
                        //     this._checkCodeUpdate();
                        // }},
                        {text: '升级', onPress: () => needUpdate(true)}
                    ]
                );
            },
            forceUpdateApp: () => {
                // 强制更新 - 暂不处理
            },
            notNeedUpdateApp: () => {
                // 不需要更新
                this.setState({checkStatus: false});
                // 检查代码是否有更新
                this._checkCodeUpdate();
            },
            downloadApkStart: () => {
                // 开始下载apk
                this.setState({checkStatus: true});
            },
            downloadApkProgress: (progress) => {
                // 下载进度条
                this.setState({progress: progress});
            },
            downloadApkEnd: () => {
                // apk下载结束
                this.setState({checkStatus: false});
            },
            onError: () => {
                this.setState({checkStatus: false});
                // 下载apk出错处理
                Alert.alert('系统提示',"下载出现异常错误，请重新打开下载！",[
                    {
                        text: '确定',onPress: () => {},
                    }
                ]);
            }
        });

        return appUpdate.checkUpdate();
    }
    async _checkCodeUpdate(){
        let deploymentKey = DEPLOYMENT_KEYS[Platform.OS].STAGING;

        // 检测代码是否最新
        CodePush.checkForUpdate(deploymentKey).then(update => {
            //console.log('code',update);
            if(!update){
                this.refs['toast'].show('已检测到是最新版本',600);
                return;
            }

            // 下载最新代码
            CodePush.sync(
                this.codePushDialogConfig(deploymentKey),
                this.codePushStatusDidChange.bind(this),
                this.codePushDownloadDidProgress.bind(this)
            );
        });
    }
    codePushDialogConfig(deploymentKey){
        return {
            // 部署key
            deploymentKey: deploymentKey,
            // 启动模式三种：ON_NEXT_RESUME:当应用从后台返回时、ON_NEXT_RESTART:下一次启动应用时、IMMEDIATE:立即更新
            installMode: CodePush.InstallMode.IMMEDIATE,
            // 升级弹出层
            updateDialog: {
                // 是否显示更新description，默认为false
                appendReleaseDescription: false,
                // 更新说明的前缀。 默认是” Description:
                descriptionPrefix:"更新内容：",
                // 强制更新的按钮文字，默认为continue
                mandatoryContinueButtonLabel:"立即更新",
                // 强制更新时，更新通知. Defaults to “An update is available that must be installed.”.
                mandatoryUpdateMessage:"重要更新，请务必安装",
                // 非强制更新时，取消按钮文字,默认是ignore
                optionalIgnoreButtonLabel: '忽略',
                // 非强制更新时，确认文字. Defaults to “Install”
                optionalInstallButtonLabel: '更新',
                // 非强制更新时，更新通知. Defaults to “An update is available. Would you like to install it?”.
                optionalUpdateMessage: '有新版本了，是否更新？',
                // 要显示的更新通知的标题. Defaults to “Update available”.
                title: '更新提示'
            },
        };
    }
    codePushStatusDidChange(status){
        switch (status) {
            case CodePush.SyncStatus.CHECKING_FOR_UPDATE: // 正在检查更新
                this.setState({
                    AppVersionPrompt: '正在检查更新...',
                });
                break;
            case CodePush.SyncStatus.AWAITING_USER_ACTION: // 等待用户操作
                this.setState({
                    AppVersionPrompt: '等待用户操作',
                });
                break;
            case CodePush.SyncStatus.DOWNLOADING_PACKAGE: // 正在下载更新包
                this.setState({
                    AppVersionPrompt: '正在下载更新包...',
                    checkStatus: true,
                });
                break;
            case CodePush.SyncStatus.INSTALLING_UPDATE: // 正在安装更新
                this.setState({
                    AppVersionPrompt: '正在安装更新...',
                });
                // 不重启app
                CodePush.restartApp(false);
                break;
            case CodePush.SyncStatus.UP_TO_DATE: // 当前已是最新版
                this.setState({
                    AppVersionPrompt: '当前已是最新版',
                    checkStatus: false,
                });
                break;
            case CodePush.SyncStatus.UPDATE_IGNORED: // 用户忽略升级
                this.setState({
                    AppVersionPrompt: '用户忽略升级',
                    checkStatus: false,
                });
                break;
            case CodePush.SyncStatus.UPDATE_INSTALLED: // 更新成功
                this.setState({
                    AppVersionPrompt: '更新成功',
                    checkStatus: false,
                });
                // 不重启app
                CodePush.restartApp(false);
                break;
            case CodePush.SyncStatus.SYNC_IN_PROGRESS: // 同步进行中
                this.setState({
                    AppVersionPrompt: '同步进行中...',
                });
                break;
            case CodePush.SyncStatus.UNKNOWN_ERROR: // 未知错误
                this.setState({
                    AppVersionPrompt: '未知错误',
                });
                break;
        }
    }
    codePushDownloadDidProgress(progress){
        this.setState({progress: progress});
    }
    render(){
        const { checkStatus,progress,screenShow,screenAnimated } = this.state;

        if(checkStatus === true){
            let _progress,_progress_show;

            if(typeof progress === 'object'){
                _progress = progress.receivedBytes / progress.totalBytes;
                _progress_show = (_progress.toFixed(2))*100;
            }
            else{
                _progress = progress / 100;
                _progress_show = progress;
            }

            return (
                <View style={styles.xzContainer}>
                    <View style={styles.xzContent}>
                        <View style={styles.xzBox}>
                            <Text style={styles.xzFont}>- 正在下载最新版本 -</Text>
                        </View>
                        <Progress.Bar
                            progress={_progress || 0}
                            width={Devices.width - 100}
                            height={5}
                            borderRadius={5}
                            style={styles.xzProgress}
                            color={'#f3916b'}
                            animated={true}
                        />
                        <View style={styles.xzBfb}>
                            <Text style={{fontSize:14}}>{_progress_show || 0}%</Text>
                        </View>
                    </View>
                    <View style={styles.xzFooter}>
                        <Text style={styles.xzFooterFont}>当前版本 {DeviceInfo.getVersion()}</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={{flex:1}}>
                <Router ref={nav => this.navigator = nav}/>
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
}

const styles = StyleSheet.create({
    screenImage: {
        flex: 1,
        width: Devices.width,
        height: Devices.height,
        position: 'absolute',
        zIndex: 1000,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        //display:'none'
    },
    xzBfb:{
        marginTop: 15,
    },
    xzProgress:{
        borderColor: '#f3916b',
        borderWidth: 0.5,
        overflow: 'hidden',
    },
    xzContainer:{
        flex: 1,
        backgroundColor: '#E6E2DE',
    },
    xzFooterFont:{
        fontSize: 14,
        color: '#888888',
    },
    xzFooter:{
        height: 50,
        justifyContent:"center",
        alignItems:'center',
    },
    xzBox:{
        marginBottom: 30,
    },
    xzContent:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    xzFont:{
        fontSize: 15,
        color: '#666666',
    },
});

let codePushOptions = { checkFrequency: CodePush.CheckFrequency.MANUAL };

App = CodePush(codePushOptions)(App);

export default App;










