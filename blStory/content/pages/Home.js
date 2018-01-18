
// 首页

import React,{ Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    FlatList,
    TouchableHighlight,
    Alert,
    StatusBar,
    NetInfo,
} from 'react-native';
import Toast from 'react-native-easy-toast';
import DrawerJsx from './DrawerJsx';
import HomeContent from './HomeContent';
import HomeHeader from './HomeHeader';
import DrawerPageMenu from './DrawerPageMenu';
import Fecth from '../common/Fecth';
import { Api } from "../common/Api";
import NetWork from './NetWork';
import { errorShow,networkCheck } from '../common/Util';

class Home extends Component{
    constructor(props){
        super(props);
        this.state = {
            balance: 0,
            isConnected: true,
        };
        this.user = this.props.navigation.state.params.user;
    }
    componentWillMount(){
        StatusBar.setBackgroundColor("#ffffff");
    }
    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
        this.balanceTimer && clearTimeout(this.balanceTimer);
    }
    render(){
        const {navigate} = this.props.navigation;
        const { isConnected } = this.state;
        let user = this.user,
            authorized_key = user.authorized_key;

        return (
            <View style={{flex:1}}>
                {
                    isConnected ? (
                        <DrawerJsx
                            side="left"   //抽屉方向 top／left／right／bottom
                            open={false}  //默认是否打开抽屉
                            tapToClose={true} //点击内容处 会关闭抽屉
                            type='overlay'    //抽屉出现的方式：overlay：抽屉覆盖内容 static:抽屉一只在内容后面 打开的时内容会滑动，displace：不会覆盖的 进出
                            openDrawerOffset={0.3} // 抽屉占整个屏幕的百分比（1-0.4=0.6）
                            closedDrawerOffset={0} //关闭抽屉后 抽屉在屏幕中的显示比例
                            style={styles.drawer}  //抽屉样式，背景色 透明度，阴影啥的
                            tweenDuration={250}
                            elevation={4}
                            ref={'drawer'}
                            content={
                                <DrawerPageMenu
                                    openWay='directClose'
                                    onPress={(router) => navigate(router,{user: user,searchStatus: false})}
                                    closeDrawer={() => this._closeControlPanel()}
                                    navigation={this.props.navigation}
                                    logout={() => this._logout()}
                                    user={user}
                                    balance={this.state.balance}
                                    isConnected={this._isConnected.bind(this)}
                                />
                            }
                        >
                            <HomeHeader
                                openDrawer={() => this._openControlPanel()}
                                goMyCollect={() => this._goMyCollect(authorized_key)}
                                goMyBookMark={() => this._goMyBookMark(authorized_key)}
                                goMyLibrary={() => this._goMyLibrary(user)}
                                navigation={this.props.navigation}
                                status={true}
                            />
                            <HomeContent
                                navigation={this.props.navigation}
                                user={user}
                                isConnected={this._isConnected.bind(this)}
                            />
                        </DrawerJsx>
                    ) : (
                        <NetWork
                            headerStatus={false}
                            refreshNetwork={() => this._refreshNetwork()}
                        />
                    )
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
            </View>
        );
    }
    _isConnected(isConnected){
        this.setState({isConnected:isConnected});
    }
    _refreshNetwork(){
        networkCheck((isConnected) => {
            this.setState({isConnected:isConnected});
        },(isConnected) => {
            this.setState({isConnected:isConnected});
        });
    }
    _requestUserBalance(){
        let url = Api.common + Api.category.userBalance;
        let authorized_key = this.user.authorized_key;
        let params = '';
        let headers = {'Authorized-Key': authorized_key,"SESSION-ID": launchConfig.sessionID};

        Fecth.get(url,params,res => {
            if(res.code === 0){
                this.setState({balance: res.data.balance});
            }
        },err => {
            errorShow(err);
        },headers);
    }
    _logout(){
        this.refs.toast.show('退出成功！',600);
        this.timer = setTimeout(() => {
            this.props.navigation.navigate('Login');
        },600);
    }
    _openControlPanel(){
        networkCheck((isConnected) => {
            this.balanceTimer = setTimeout(() => {
                this.refs['drawer'].openControlPanel();
            },250);

            this._requestUserBalance();
            this.setState({isConnected:isConnected});
        },(isConnected) => {
            this.setState({isConnected:isConnected});
        });
    }
    _closeControlPanel(){
        this.refs['drawer'].closeControlPanel();
    }
    _goMyCollect(authorized_key){
        networkCheck((isConnected) => {
            this.props.navigation.navigate("MyCollect",{
                authorized_key: authorized_key
            });
            this.setState({isConnected:isConnected});
        },(isConnected) => {
            this.setState({isConnected:isConnected});
        });
    }
    _goMyBookMark(authorized_key){
        networkCheck((isConnected) => {
            this.props.navigation.navigate("MyBookMark",{
                authorized_key: authorized_key
            });
            this.setState({isConnected:isConnected});
        },(isConnected) => {
            this.setState({isConnected:isConnected});
        });
    }
    _goMyLibrary(user){
        networkCheck((isConnected) => {
            this.props.navigation.navigate("MyLibrary",{
                user: user,
                searchStatus: true,
            });
            this.setState({isConnected:isConnected});
        },(isConnected) => {
            this.setState({isConnected:isConnected});
        });
    }
}

export default Home;

const styles = StyleSheet.create({
    drawer: {
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowOpacity: 0.8,
        shadowRadius: 3,
    },
});










































