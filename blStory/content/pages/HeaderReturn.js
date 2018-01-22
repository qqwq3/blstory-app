
// 公共

import React,{Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    PixelRatio,
    Image,
    TouchableWithoutFeedback
} from 'react-native';
import Icon from '../common/Icon';
import { Devices } from "../common/Api";
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
    imgBox: {
        height: 44,
        width: 100,
        position: 'absolute',
        left: 0,
        top: 0,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    row: {
        height: 44,
        flexDirection: 'row',
        width: Devices.width,
    },
    rowBorder: {
        borderBottomWidth: 1 / Devices.piexl,
        borderStyle: 'solid',
    },
    iconBlackArrowLeft: {
        width: 10,
        height: 17,
        marginLeft: 15,
        alignSelf: 'center',
        resizeMode: 'contain'
    },
    titleTextBox: {
        justifyContent: 'center',
        flexDirection: 'row',
        flex: 1
    },
    titleText: {
        alignSelf: 'center',
        fontSize: 17,
        fontWeight: 'bold',
    }
});

class HeaderReturn extends Component{
    static propTypes = {
        onPress: PropTypes.func,
        title: PropTypes.string.isRequired,
        bottomBorder: PropTypes.bool,
        backgroundColor: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        borderBottomColor: PropTypes.string.isRequired,
    };
    static defaultProps = {
        title: '',
        bottomBorder: true,
        backgroundColor: '#FFFFFF',
        color: '#304758',
        borderBottomColor: '#E5E5E5',
    };
    render(){
        return (
            <TouchableWithoutFeedback
                accessible={true}
                onPress={this.props.onPress}
            >
                <View
                    style={[
                        styles.row,this.props.bottomBorder === true &&
                        styles.rowBorder,{backgroundColor:this.props.backgroundColor,borderBottomColor:this.props.borderBottomColor}
                    ]}
                >
                    <View style={styles.imgBox}>
                        <Image
                            style={styles.iconBlackArrowLeft}
                            source={Icon.iconBlackArrowLeft}
                            tintColor={this.props.color}
                        />
                    </View>
                    <View style={styles.titleTextBox}>
                        <Text style={[styles.titleText,{color:this.props.color}]}>{this.props.title}</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default HeaderReturn;












