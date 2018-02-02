
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    FlatList,
    TextInput,
    Modal
} from 'react-native';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Devices } from "../common/Api";
import Icon from '../common/Icon';

// 阅读头部bar
class ReaderHeaderSetBar extends React.Component{
    static propTypes = {
        barBackgroundColor: PropTypes.string.isRequired,
        returnBookDetail: PropTypes.func,
        comColor: PropTypes.string.isRequired,
        totalTitle: PropTypes.string.isRequired,
    };
    render(){
        return (
            <View style={[styles.readerHeaderSetBar,{backgroundColor:this.props.barBackgroundColor}]}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.readerHeaderReturn}
                    onPress={() => this.props.returnBookDetail()}
                >
                    <Image
                        source={Icon.iconBlackArrowLeft}
                        tintColor={this.props.comColor}
                        style={{width:8,height:12}}
                        resizeMode={'contain'}
                    />
                </TouchableOpacity>
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                    <Text style={{fontSize:18,color:this.props.comColor}}>{this.props.totalTitle}</Text>
                </View>
                {/*<TouchableOpacity style={styles.readerHeaderRmb} activeOpacity={1}>*/}
                {/*<Image source={Icon.iconRmb} tintColor={this.props.comColor} resizeMode={"contain"}/>*/}
                {/*</TouchableOpacity>*/}
            </View>
        )
    }
}

// 阅读底部bar
class ReaderFooterSetBar extends React.Component{
    static propTypes = {
        barBackgroundColor: PropTypes.string,
        modelSwitchStatus: PropTypes.bool,
        comColor: PropTypes.string.isRequired,
        openControlPanel: PropTypes.func,
        openFontSetPanel: PropTypes.func,
        readerModelSwitch: PropTypes.func,
        writtenComments: PropTypes.func,
    };
    render(){
        return (
            <View style={[styles.readerFooterSetBar,{backgroundColor: this.props.barBackgroundColor}]}>
                {this._data().map((item,index) => this._renderItem(item,index))}
            </View>
        )
    }
    _renderItem = (item,index) => {
        return (
            <TouchableOpacity
                key={index}
                onPress={() => this._onPress(index)}
                activeOpacity={1}
                style={styles.readerFooterSetBox}
            >
                <Image
                    source={item.icon}
                    resizeMode={'contain'}
                    tintColor={this.props.comColor}
                    style={{width:25,height:25}}
                />
                <Text style={{fontSize:12,color:this.props.comColor}}>{item.text}</Text>
            </TouchableOpacity>
        );
    };
    _data(){
        return [
            {key:1,text:'章节目录',icon:Icon.iconChapter},
            {key:2,text:'设置',icon:Icon.iconTextSize},
            {key:3,text:this.props.modelSwitchStatus?'日间模式':'夜间模式',icon:this.props.modelSwitchStatus?Icon.iconSun:Icon.iconMoon},
            {key:4,text:'书写评论',icon:Icon.iconPencil}
        ];
    }
    _onPress(index){
         switch(index){
            case 0: // 打开抽屉面板
                this.props.openControlPanel();
                break;
            case 1: // 打开字体设置栏
                this.props.openFontSetPanel();
                break;
            case 2: // 阅读模式切换
                this.props.readerModelSwitch();
                break;
            case 3: // 书写评论
                this.props.writtenComments();
                break;
        }
    }
}

// 阅读底部字体设置
class ReaderFooterFontSetBar extends React.Component{
    static propTypes = {
        barBackgroundColor: PropTypes.string.isRequired,
        fontSizeTypeSubtract: PropTypes.func,
        comColor: PropTypes.string.isRequired,
        fontSizeTypeAdd: PropTypes.func,
        themeIndex: PropTypes.number,
        plateTypeIndex: PropTypes.number,
        themeSwitch: PropTypes.func,
        plateType: PropTypes.func,
    };
    constructor(props){
        super(props);
        this.state = {
            bg: ['#f6f4f1','#090C13','#9bdbd3'],
            themeIndex: 0,
            plateTypeIndex: 1,
        };
    }
    render(){
        return (
            <View style={[styles.readerFooterFontSetBar,{backgroundColor:this.props.barBackgroundColor}]}>
                <View style={styles.readerFooterSBRow}>
                    <View style={{width:70,height:55,alignItems:'center',flexDirection:'row'}}>
                        <Text style={{fontSize:14,color:this.props.comColor}}>字号</Text>
                    </View>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center',justifyContent:'space-between'}}>
                        <TouchableOpacity
                            onPress={() => this.props.fontSizeTypeSubtract()}
                            activeOpacity={1}
                            style={[styles.setFontBut,{borderColor:this.props.comColor}]}
                        >
                            <Text style={{fontSize:15,color:this.props.comColor}}>A -</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.props.fontSizeTypeAdd()}
                            activeOpacity={1}
                            style={[styles.setFontBut,{borderColor:this.props.comColor}]}
                        >
                            <Text style={{fontSize:15,color:this.props.comColor}}>A +</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.readerFooterSBRow}>
                    <View style={{width:70,height:55,alignItems:'center',flexDirection:'row'}}>
                        <Text style={{fontSize:14,color:this.props.comColor}}>主题</Text>
                    </View>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center',justifyContent:'space-between'}}>
                        {
                            this.state.bg.map((bg,i) => {
                                let borderColor = this.props.themeIndex === i ? "#f3916b" : "transparent";
                                let sty = this.props.themeIndex === i ? styles.readerFooterYq : styles.readerFooterYqBig;
                                return (
                                    <TouchableOpacity
                                        onPress={() => this._themeSwitch(i)}
                                        key={i}
                                        activeOpacity={1}
                                        style={[styles.selected,{borderColor:borderColor}]}
                                    >
                                        <View style={[{backgroundColor:bg},sty]}/>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
                <View style={styles.readerFooterSBRow}>
                    <View style={{width:70,height:55,alignItems:'center',flexDirection:'row'}}>
                        <Text style={{fontSize:14,color:this.props.comColor}}>板式</Text>
                    </View>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center',justifyContent:'space-between'}}>
                        {
                            [4,3,2].map((number,i) => {
                                let borderColor = this.props.plateTypeIndex === i ? '#f3916b' : this.props.comColor;
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        activeOpacity={1}
                                        style={[styles.selected,{borderColor:borderColor}]}
                                        onPress={() => this._plateType(i)}
                                    >
                                        <View style={[styles.readerFooterYq,styles.plateType]}>
                                            {this._line(number)}
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
            </View>
        )
    }
    _line(numbers){
         return _.range(numbers).map((obj,key) => {
            return (
                <View key={key} style={[styles.line,{backgroundColor: this.props.comColor}]}/>
            );
         });
    }
    _plateType(i){
        this.setState({plateTypeIndex: i});
        this.props.plateType(i);
    }
    _themeSwitch(i){
        this.setState({themeIndex: i});
        this.props.themeSwitch(i);
    }
}

// 评论窗口
class CommentSetBar extends React.Component{
    static propTypes = {
        opacity: PropTypes.number,
        closeComments: PropTypes.func,
        sendComments: PropTypes.func,
        changeText: PropTypes.func,
        focuStatus: PropTypes.bool,
        closeModal: PropTypes.func,
        transparent: PropTypes.bool,
        visible: PropTypes.bool,
        animationType: PropTypes.string
    };
    static defaultProps = {
        focuStatus: false,
        opacity: 0.60,
        animationType: 'slide'
    };
    render(){
        return (
            <Modal
                visible={this.props.visible}
                animationType={this.props.animationType}
                onRequestClose={() => this.props.closeModal()}
                transparent={this.props.transparent}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.commontsContent,{backgroundColor: 'rgba(0,0,0,'+this.props.opacity+')'}]}
                    onPress={() => this.props.closeComments()}
                >
                    <View style={styles.commentsBox}>
                        <TouchableOpacity
                            accessible={true}
                            activeOpacity={1}
                            style={styles.commentsCommit}
                            onPress={() => this.props.sendComments()}
                        >
                            <Text style={{fontSize:15,color:'#808080'}}>发送</Text>
                        </TouchableOpacity>
                        <View style={styles.commentsContent}>
                            <TextInput
                                style={styles.commentsTextInput}
                                multiline={true}
                                editable={true}
                                autoFocus={this.props.focuStatus}
                                autoCapitalize={'none'}
                                placeholder={'写出战胜作者的评论吧~'}
                                placeholderTextColor={'#cccccc'}
                                underlineColorAndroid={'transparent'}
                                onChangeText={(e) => this.props.changeText(e)}
                                ref={ref => this._textInput = ref}
                                keyboardType={'ascii-capable'}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }
    _textInputBlur(){
        return this._textInput.blur();
    }
    _textInputClear(){
        return this._textInput.clear();
    }
}

export { ReaderHeaderSetBar,ReaderFooterSetBar,ReaderFooterFontSetBar,CommentSetBar };

const styles = StyleSheet.create({
    commontsContent:{
        width: Devices.width,
        position: 'absolute',
        zIndex: 600,
        overflow: 'hidden',
        left: 0,
        bottom: 0,
        top: 0,
        right: 0,
    },
    commentsTextInput:{
        flex: 1,
        fontSize: 14,
        padding: 15,
        textAlign: 'left',
        textAlignVertical: 'top', // 只支持Android
        lineHeight: 20,
        color: '#333333',
    },
    commentsContent:{
        borderWidth: 0.5,
        borderColor: '#e5e5e5',
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        flex: 1,
        marginBottom: 15,
        marginHorizontal: 15,
    },
    commentsCommit:{
        height: 48,
        paddingHorizontal: 15,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentsBox:{
        height: 180,
        position: 'absolute',
        zIndex: 600,
        backgroundColor: '#f6f4f1',
        left: 0,
        bottom: 0,
        width: Devices.width,
    },
    plateType: {
        alignItems:'center',
        justifyContent:'space-between',
        paddingTop:8,
        paddingBottom:8,
    },
    line: {
        width: 15,
        height: 1,
    },
    selected: {
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 19,
    },
    readerFooterYq: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    readerFooterYqBig: {
        width: 38,
        height: 38,
        borderRadius: 19,
    },
    setFontBut: {
        height: 30,
        width: 90,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 25,
    },
    readerFooterSBRow: {
        paddingLeft: 15,
        paddingRight: 55,
        flexDirection: 'row',
        height: 60,
    },
    readerFooterFontSetBar: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        zIndex: 100,
        width: Devices.width,
        overflow: 'hidden',
    },
    readerFooterSetBox: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    readerFooterSetBar: {
        position: 'absolute',
        width: Devices.width,
        height: 65,
        left: 0,
        zIndex: 100,
        bottom: 0,
        flexDirection: 'row',
    },
    readerHeaderSetBar: {
        position: 'absolute',
        width: Devices.width,
        height: 45,
        left: 0,
        zIndex: 100,
        top: 0,
    },
    readerHeaderReturn: {
        height: 45,
        width: Devices.width / 3,
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 100,
        overflow: 'hidden',
        paddingLeft: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    readerHeaderRmb: {
        height: 45,
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 100,
        width: Devices.width / 3,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingRight: 15,
    },
});




















