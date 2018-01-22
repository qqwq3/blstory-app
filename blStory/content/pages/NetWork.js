
// 无网络显示的界面

import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Alert,
    AlertIOS,
    Platform,
} from 'react-native';
import Icon from '../common/Icon';
import { networkCheck } from '../common/Util';

class NetWork extends Component{
    render(){
        return (
            <View style={{flex:1,backgroundColor: "#F1F1F1",}}>
                <View style={styles.box}>
                    <Image source={Icon.iconNoWifi} style={styles.image} />
                    <Text style={styles.font}>网络信号被UFO吸走了</Text>
                </View>
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.refreshBtn}
                    onPress={this._refreshNetwork.bind(this)}
                >
                    <Text style={{fontSize:15,color:'#F8AD54'}}>点击刷新网络</Text>
                </TouchableOpacity>
            </View>
        );
    }
    _refreshNetwork(){
        const { navigate } = this.props.navigation;

        networkCheck(() => {
            navigate("Login");
        },() => {
            if(Platform.OS === 'android'){
                Alert.alert('系统提示','亲，请检查你的网络哦！',[
                    {text: '确定',onPress: () => {}}
                ]);
            }

            if(Platform.OS === 'ios'){
                AlertIOS.alert('系统提示','亲，请检查你的网络哦！',[
                    {text: '确定',onPress: () => {}}
                ]);
            }
        });
    }
}

export default NetWork;

const styles = StyleSheet.create({
    refreshBtn: {
        height: 50,
        justifyContent:'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    box:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image:{
        resizeMode: 'contain',
        marginBottom: 40,
    },
    font: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#bbbbbb',
    },
});












































