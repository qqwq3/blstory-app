
// 首页头部公共部分

import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    PixelRatio,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Alert,
    TextInput
} from 'react-native';
import Icon from '../common/Icon';
import { Devices } from "../common/Api";
import PropTypes from 'prop-types';

class HomeHeader extends Component{
    static propTypes = {
        search: PropTypes.func,
        openDrawer: PropTypes.func,
        goMyBookMark: PropTypes.func,
        status: PropTypes.bool,
        goMyLibrary: PropTypes.func,
        goMyCollect: PropTypes.func,
    };
    constructor(props){
        super(props);
        this.searchStatus = this.props.navigation.state.params.searchStatus;
    }
    render() {
        return (
            <View style={styles.headerBox}>

                <View style={styles.headerLeft}>
                    <View style={styles.comFlex}>
                        <TouchableOpacity
                            style={styles.comFlex}
                            activeOpacity={0.75}
                            onPress={() => this.props.openDrawer()}
                        >
                            <Image source={Icon.iconOperation} style={styles.iconOperation}/>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.comFlex}
                        activeOpacity={0.75}
                        onPress={() => this.props.goMyBookMark()}
                    >
                        <Image source={Icon.iconBooks} style={styles.iconBooks}/>
                    </TouchableOpacity>
                </View>

                <View style={styles.headerModdle}>
                    <TouchableWithoutFeedback onPress={() => this._isClickEvent()}>
                        <View style={styles.searchBox}>
                            <View style={styles.searchInner}>
                                <Image source={Icon.iconSearch} style={styles.iconSearch}/>
                            </View>
                            <TextInput
                                style={styles.searchInput}
                                returnKeyType={'search'}
                                placeholder={'请输入关键字'}
                                underlineColorAndroid={'transparent'}
                                placeholderTextColor={'#B2B2B2'}
                                onSubmitEditing={(e) => this._onSubmitEditing(e)}
                                textAlignVertical={'center'}
                                editable={!this.props.status}
                                autoFocus={this.searchStatus}
                                ref={ref => this._textInput = ref}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>

                <TouchableOpacity
                    style={styles.headerRight}
                    activeOpacity={0.75}
                    onPress={() => this.props.goMyCollect()}
                >
                    <Image source={Icon.iconStar} style={styles.iconStar} />
                </TouchableOpacity>
            </View>
        );
    }
    _clearTextInput(){
        this._textInput.clear();
    }
    _textInputBlur(){
        this._textInput.blur();
    }
    _isClickEvent(){
        this.props.status === true && this.props.goMyLibrary();
    }
    _onSubmitEditing(e){
        let value = e.nativeEvent.text;
        this.props.search(value);
    }
}

export default HomeHeader;

const styles = StyleSheet.create({
    headerBox: {
        backgroundColor: '#FFFFFF',
        flexDirection: "row",
        borderBottomWidth: 1 / Devices.piexl,
        borderBottomColor: '#E5E5E5',
        borderStyle: 'solid'
    },
    headerLeft: {
        height: 44,
        alignSelf: "flex-start",
        flex: 2,
        flexDirection: 'row'
    },
    comFlex: {
        flex: 1,
        flexDirection: 'row'
    },
    headerModdle: {
        flex: 5,
        overflow: 'hidden',
        paddingTop: 9.5,
        paddingBottom: 9.5
    },
    searchBox: {
        backgroundColor: '#F0F0F0',
        flex: 1,
        overflow: 'hidden',
        borderRadius: 2,
        flexDirection: 'row'
    },
    searchInner: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: 25
    },
    searchInput:{
        flex: 1,
        backgroundColor: 'transparent',
        fontSize: 12,
        padding: 0,
        margin: 5
    },
    headerRight: {
        height: 44,
        alignSelf: "flex-end",
        flex: 1,
        flexDirection: 'row'
    },
    iconStar: {
        width: 16,
        height: 16,
        position: 'absolute',
        right: 15,
        alignSelf: 'center'
    },
    iconSearch: {
        width: 15,
        height: 15,
        alignSelf: 'center',
        marginLeft: 10
    },
    iconOperation: {
        width: 20,
        height: 16,
        alignSelf: 'center',
        marginLeft: 15

    },
    iconBooks: {
        width: 15,
        height: 16,
        alignSelf: 'center',
        marginLeft: 10
    }
});













