
// 弹出层封装

import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Alert,
} from 'react-native';
import PopupDialog,{ScaleAnimation,DialogTitle} from 'react-native-popup-dialog';
import { Devices } from "./Api";
import PropTypes from 'prop-types';

// 动画类型 - 缩放型
const scaleAnimation = new ScaleAnimation();

/*
    <Dialog
        keys={'button-exchange'}
        height={175}
        promptTitle={'兑换'}
        conform={this._exchangeConform.bind(this)}
        cancel={this._exchangeCancel.bind(this)}
        ref={ref => this._dialogRef = ref}
        overlayOpacity={0.75}
        children={
            <TextInput
                autoCapitalize={'none'}
                placeholder={'请输入兑换码'}
                placeholderTextColor={'#dcdcdc'}
                underlineColorAndroid={'transparent'}
                ref={"textInputRef"}
                style={styles.popTextInput}
            />
        }
    />
* */

class Dialog extends Component{
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        promptTitle: PropTypes.string,
        dismiss: PropTypes.func,
        children: PropTypes.any,
        conform: PropTypes.func,
        keys: PropTypes.string,
        cancel: PropTypes.func,
        overlayOpacity: PropTypes.number
    };
    static defaultProps = {
        width: Devices.width - 80,
        height: 200,
        overlayOpacity: 0.8
    };
    render(){
        return (
            <PopupDialog
                overlayOpacity={this.props.overlayOpacity}
                dialogStyle={{backgroundColor:'#fff'}}
                containerStyle={{zIndex: 10, elevation: 4}}
                ref={ref => this.dialog = ref}
                dialogTitle={<DialogTitle
                    titleStyle={styles.dialogTitle}
                    title={this.props.promptTitle}
                    titleTextStyle={{fontSize:15}}
                />}
                width={this.props.width}
                height={this.props.height}
                dialogAnimation={scaleAnimation}
                actions={[
                    <View key={this.props.keys} style={styles.buttons}>
                        <TouchableOpacity
                            style={styles.button}
                            activeOpacity={0.75}
                            onPress={() => this.props.cancel()}
                        >
                            <View style={[styles.buttonView,styles.buttonRightBorder]}>
                                <Text style={[styles.buttonFont,{color:'#999999'}]}>取消</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button}
                            activeOpacity={0.75}
                            onPress={() => this.props.conform()}
                        >
                            <View style={styles.buttonView}>
                                <Text style={[styles.buttonFont,{color:'#F8AD54'}]}>确定</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                ]}
            >
                <View style={styles.popContent}>
                    {this.props.children}
                </View>
            </PopupDialog>
        );
    }
}

export default Dialog;

const styles = StyleSheet.create({
    dialogTitle: {
        height:45,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#ececec',
    },
    buttonView: {
        flex: 1,
        justifyContent: 'center',
        alignItems:'center',
    },
    popContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems:'center',
    },
    buttons:{
        flexDirection: 'row',
        height: 45,
        borderTopColor: '#e5e5e5',
        borderStyle: 'solid',
        borderTopWidth: 1 / Devices.piexl,
    },
    buttonRightBorder:{
        borderRightColor: '#e5e5e5',
        borderStyle: 'solid',
        borderRightWidth: 1 / Devices.piexl,
    },
    button:{
        flex: 1,
    },
    buttonFont:{
        fontSize: 15,
    }
});



































