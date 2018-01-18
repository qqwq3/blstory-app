
import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    FlatList,
    AsyncStorage,
    Alert,
} from 'react-native';
import PropTypes from 'prop-types';
import { drawerMenu } from '../common/Api';
import RequestImage from '../common/RequestImage';
import StorageUtil from '../common/StorageUtil';
import Fecth from '../common/Fecth';
import { Api } from "../common/Api";
import { errorShow,networkCheck } from '../common/Util';

class DrawerPageMenu extends React.Component{
    static propTypes = {
        openWay: PropTypes.string,
        closeDrawer: PropTypes.func,
        onPress: PropTypes.func,
        logout: PropTypes.func,
        balance: PropTypes.number,
    };
    constructor(props){
        super(props);
        this.state = {
            user: {},
            result: '',
        };
        this.user = this.props.user;
    }
    componentWillMount() {
        StorageUtil.get("user",(res) => {
            this.setState({user: res});
        });
    }
    render(){
        let user = this.user,
            userId = user.id,
            userImg = RequestImage(userId,'avatar','64x64',false),
            userName = user.name;

        return (
            <View style={styles.drawerContainer}>
                <View style={styles.drawerCHeader}>
                    <View style={styles.drawerPic}>
                        <Image source={{uri:userImg}} resizeMode={'contain'} style={styles.drawerImage} />
                    </View>
                    <View style={[styles.drawerName,{paddingVertical:6}]}>
                        <Text style={styles.drawerNameText} numberOfLines={1}>{userName}</Text>
                        <Text style={{color:'#fff',fontSize:12}} numberOfLines={1}>余额 : {this.props.balance | 0}鹿币</Text>
                    </View>
                </View>
                <FlatList
                    data={drawerMenu}
                    renderItem={this.renderItem}
                    numColumns={1}
                />
            </View>
        );
    }
    renderItem = ({item,index}) => {
        return (
            <TouchableHighlight
                activeOpacity={0.75}
                underlayColor='#2E3133'
                onPress={() => this.drawerMenuSelect(item,index)}
            >
                <View style={styles.drawerMenu}>
                    <Image style={[styles.drawerMenuImage,index===2 && {height:24}]} source={item.icon} />
                    <Text style={styles.drawerMenuText}>{item.text}</Text>
                </View>
            </TouchableHighlight>
        );
    };
    drawerMenuSelect(item,index){
        // 获取到用户key
        let authorized_key = this.props.user.authorized_key;

        // 首页
        if(index === 0){
            if(this.props.openWay === 'directClose'){
                this.props.closeDrawer();
            }
            if(this.props.openWay === 'skipClose'){
                networkCheck((isConnected) => {
                    this.props.onPress(item.router);
                    this.props.isConnected(isConnected);
                },(isConnected) => {
                    this.props.isConnected(isConnected);
                });
            }
        }
        // 签到
        else if(index === 1){
            this.props.closeDrawer();
            networkCheck((isConnected) => {
                this.props.navigation.navigate("SignIn",{
                    authorized_key:authorized_key
                });
                this.props.isConnected(isConnected);
            },(isConnected) => {
                this.props.isConnected(isConnected);
            });
        }
        // 图书馆
        else if(index === 2){
            if(this.props.openWay === 'directClose'){
                networkCheck((isConnected) => {
                    this.props.onPress(item.router);
                    this.props.isConnected(isConnected);
                },(isConnected) => {
                    this.props.isConnected(isConnected);
                });
            }
            if(this.props.openWay === 'skipClose'){
                this.props.closeDrawer();
            }
        }
        // 排行榜
        else if(index === 3){
            this.props.closeDrawer();
            networkCheck((isConnected) => {
                this.props.onPress(item.router);
                this.props.isConnected(isConnected);
            },(isConnected) => {
                this.props.isConnected(isConnected);
            });
        }
        // 邀请码
        else if(index === 4){
            this.props.closeDrawer();
            networkCheck((isConnected) => {
                this.props.navigation.navigate("Spread",{
                    authorized_key:authorized_key
                });
                this.props.isConnected(isConnected);
            },(isConnected) => {
                this.props.isConnected(isConnected);
            });
        }
        // 退出账户
        else if(index === 5){
            let url = Api.common + Api.category.logout,
                params = Fecth.dictToFormData({}),
                headers = {'SESSION-ID': launchConfig.sessionID};

            this.props.closeDrawer();
            networkCheck((isConnected) => {
                Fecth.post(url,params,headers,res => {
                    res.code === 0 && this.props.logout();
                },err => {
                    errorShow(err);
                });
                this.props.isConnected(isConnected);
            },(isConnected) => {
                this.props.isConnected(isConnected);
            });
        }
    }
}

export default DrawerPageMenu;

const styles = StyleSheet.create({
    shareBox:{
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
    },
    drawerMenuImage: {
        width: 25,
        height: 22,
        resizeMode: 'stretch'
    },
    drawerCHeader: {
        flexDirection: 'row',
        overflow: 'hidden',
        padding: 15
    },
    drawerPic:{
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3D3D3D'
    },
    drawerContainer: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: '#232628'
    },
    drawerMenu: {
        flexDirection: 'row',
        overflow: 'hidden',
        height: 40,
        paddingLeft: 25,
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 5
    },
    drawerMenuText: {
        fontSize: 13,
        color: '#FFFFFF',
        marginLeft: 15
    },
    drawerImage: {
        width: 50,
        height: 50,
        resizeMode: 'contain'
    },
    drawerName: {
        flex: 1,
        paddingLeft: 15,
        justifyContent:'center',
    },
    drawerNameText: {
        fontSize: 15,
        color: '#FFFFFF',
        flex: 1
    },
});






























