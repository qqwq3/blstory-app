
// 无网络显示的界面

import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from '../common/Icon';
import HeaderReturn from './HeaderReturn';

class NetWork extends Component{
    static propTypes = {
        goBack: PropTypes.func,
        refreshNetwork: PropTypes.func,
        prompt: PropTypes.string,
        title: PropTypes.string,
        headerStatus: PropTypes.bool,
    };
    static defaultProps = {
        prompt: '网络信号被UFO吸走了！',
        title: '网络拥堵，请稍后再试',
        headerStatus: true,
    };
    render(){
        return (
            <View style={{flex:1}}>
                {
                    this.props.headerStatus === true &&
                    <HeaderReturn
                        title={this.props.title}
                        onPress={() => this.props.goBack()}
                    />
                }
                <View style={styles.box}>
                    <Image source={Icon.iconNoWifi} style={styles.image} />
                    <Text style={styles.font}>{this.props.prompt}</Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={() => this.props.refreshNetwork()}
                >
                    <Text style={{fontSize:15,color:'#F8AD54'}}>点击刷新网络</Text>
                </TouchableOpacity>
            </View>
        );
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
        backgroundColor: '#F1F1F1',
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












































