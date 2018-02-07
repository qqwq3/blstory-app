
// 阅读

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    TouchableHighlight,
    Keyboard,
    Animated
} from 'react-native';
import Toast from 'react-native-easy-toast';
import DrawerJsx from './DrawerJsx';
import ReaderCatalogue from './ReaderCatalogue';
import {
    ReaderHeaderSetBar,
    ReaderFooterSetBar,
    ReaderFooterFontSetBar,
    CommentSetBar
} from './ReaderSetBar';
import { Devices,Api } from "../common/Api";
import Fecth from '../common/Fecth';
import Loading from '../common/Loading';
import StorageUtil from '../common/StorageUtil';
import Icon from '../common/Icon';
import { errorShow,loginTimeout,networkCheck } from '../common/Util';

class Reader extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            fontSize: 14,
            lineHeight: 25,
            backgroundColor: '#f6f4f1',
            marginBottom:10,
            fontColor: '#000000',

            comColor: '#ffffff',
            barBackgroundColor: 'rgba(0,0,0,0.8)',
            modelSwitchStatus: false,
            themeIndex: 0,
            plateTypeIndex: 0,

            barStatusA: false,
            barStatusB: false,
            barStatusC: false,
            showBar: false,

            totalStatus: false,
            isLoading: true,

            totalTitle: '',
            totalRecords: 0,
            currentRecords: 0,
            currentTitle: '',
            currentContent: [],

            prev: null,
            prevHexId: '',
            nextHexId: '',

            book_title: this.props.navigation.state.params.book_title,
            readerPrompt: true,

            book_id: '',
            chapter_id: '',
            result: {},

            Animated: new Animated.Value(0)
        };
        this.readerBg = ['#f6f4f1','#090C13','#9bdbd3'];
        this.readerFontColor = ['#000000','#2a5a74','#000000'];
        this.comColor = ['#ffffff','#8493a2','#ffffff'];
        this.modelSwitchStatus = [false,true,false];
        this.barBackgroundColor = ['rgba(0,0,0,0.85)','rgba(32,35,37,0.95)','rgba(0,0,0,0.85)'];

        this.commontsText = '';

        this.authorized_key = this.props.navigation.state.params.authorized_key;
        this.book_hex_id = this.props.navigation.state.params.hex_id;
        this.readerStatus = this.props.navigation.state.params.readerStatus;
        this.chapter_id = this.props.navigation.state.params.chapter_id;
        this.confirm_pay = 0;
        this.book_title = this.props.navigation.state.params.book_title;
    }
    componentWillMount() {
        this._readerStatusShowChapter();
        this._setRecords();
    }
    componentDidMount() {
        this._keyboardHide = Keyboard.addListener('keyboardDidHide',this._keyboardDidHideHandler.bind(this));
    }
    componentWillUnmount() {
        // 卸载键盘隐藏事件监听
        this._keyboardHide !== null && this._keyboardHide.remove();
    }
    render(){
        let items = {
            fontSize: this.state.fontSize,
            lineHeight: this.state.lineHeight,
            backgroundColor: this.state.backgroundColor,
            marginBottom: this.state.marginBottom,
            fontColor: this.state.fontColor,
        };
        let { result,currentContent,totalStatus } = this.state;
        const { navigate,goBack } = this.props.navigation;
        const { nextHexId } = this.state;
        let text = (result.text || '暂无'),value = (result.value || 0);

        if(totalStatus === true && currentContent.length === 0){
            if(value === 'undefined' && text === 'undefined' && result === {} || totalStatus){
                Alert.alert('系统提示','由于数据采集原因，本章节暂无相关内容，请直接切换至下一章节哦。',[
                    {
                        text:'关闭',onPress:() => {goBack()}
                    },
                    {
                        text:'下一章',onPress:() =>
                    {
                        this._nextData(nextHexId,this.book_hex_id,0);
                    }
                    }
                ]);
            }
            else{
                Alert.alert('温馨提示',(value === 0 ?
                    ('目前剩余'+ value +'鹿币，无法继续阅读哦。去邀请好友可免费继续畅通阅读，同时可获得海量鹿币。') :
                    (text +'，目前剩余'+ value +'鹿币。去邀请好友可获得更多鹿币。')),[
                    {
                        text: '稍后邀请',onPress:() => {goBack()},
                    },
                    {
                        text:'马上邀请',onPress:() => navigate("Spread",{authorized_key: this.authorized_key })
                    }
                ]);
            }
        }

        return (
            totalStatus === true ? (
                <DrawerJsx
                    side="left"
                    open={false}
                    tapToClose={true}
                    type='overlay'
                    openDrawerOffset={0.2}
                    closedDrawerOffset={0}
                    style={styles.drawer}
                    content={
                        <ReaderCatalogue
                            hexId={this.book_hex_id}
                            setChapterId={(chapter_id,book_title) => this._setChapterId(chapter_id,book_title)}
                            navigation={this.props.navigation}
                            authorizedKey={this.authorized_key}
                            bookTitle={this.book_title}
                            ref={'readerCatalogue'}
                        />
                    }
                    ref={'drawer'}
                >
                    <View style={{flex:1}}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            horizontal={true}
                            pagingEnabled={true}
                            scrollEventThrottle={800}
                            onScrollBeginDrag={(e) => this._onScrollBeginDrag(e)}
                            onScrollEndDrag={(e) => this._onScrollEndDrag(e)}
                        >
                            {this._renderItem(items)}
                        </ScrollView>
                    </View>
                    <Toast
                        ref="toast"
                        position={'center'}
                        fadeInDuration={750}
                        fadeOutDuration={1000}
                        opacity={0.8}
                        style={{backgroundColor:this.state.barBackgroundColor}}
                        textStyle={{fontSize:14,color:this.state.comColor}}
                    />
                    <Loading opacity={0} show={this.state.isLoading} />
                    {
                        this.state.barStatusA === true && (
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => this._closeBarPanel()}
                                style={[styles.setBarBox]}
                            >
                                <ReaderHeaderSetBar
                                    {...this.state}
                                    returnBookDetail={() => this._returnBookDetail()}
                                />
                                <ReaderFooterSetBar
                                    {...this.state}
                                    openControlPanel={() => this._openControlPanel()}
                                    openFontSetPanel={() => this._openFontSetPanel()}
                                    readerModelSwitch={() => this._readerModelSwitch()}
                                    writtenComments={() => this._writtenComments()}
                                />
                            </TouchableOpacity>
                        )
                    }
                    {
                        this.state.barStatusB === true &&
                        <ReaderFooterFontSetBar
                            {...this.state}
                            color={'#ffffff'}
                            fontSizeTypeSubtract={() => this._fontSizeTypeSubtract()}
                            fontSizeTypeAdd={() => this._fontSizeTypeAdd()}
                            plateType={(index) => this._plateType(index)}
                            themeSwitch={(index) => this._themeSwitch(index)}
                        />
                    }
                    <CommentSetBar
                        sendComments={() => this._sendComments()}
                        closeComments={() => this._closeComments()}
                        focuStatus={this.state.barStatusC}
                        changeText={(e) => this._changeText(e)}
                        opacity={0.5}
                        ref={'textInput'}
                        visible={this.state.barStatusC}
                        closeModal={this._closeModal.bind(this)}
                        transparent={true}
                        animationType={'slide'}
                    />
                    {
                        this.state.readerPrompt === true && (
                            <TouchableOpacity
                                activeOpacity={1}
                                style={styles.readerPrompt}
                                onPress={() => this._closeFirstReaderPrompt()}
                            >
                                <View style={styles.readerSlidePagePrompt}>
                                    <Image source={Icon.iconGestureNextPage} resizeMode={'contain'}/>
                                    <Image source={Icon.iconGesturePreviewPage} resizeMode={'contain'}/>
                                </View>
                                <View style={styles.readerClickPrompt}>
                                    <Image source={Icon.iconGestureMenu} resizeMode={'contain'}/>
                                </View>
                            </TouchableOpacity>
                        )
                    }
                </DrawerJsx>
            ) : (
                <Loading opacity={0.60} show={this.state.isLoading} />
            )
        );
    }
    _keyboardDidHideHandler(){
        this._commetsControl();
    }
    _closeModal(){
        this.setState({barStatusC: false});
    }
    _changeText(commontsText){
        this.commontsText = commontsText;
    }
    _closeFirstReaderPrompt(){
        this.setState({readerPrompt: false});
        StorageUtil.save('readerPrompt',{
            readerPrompt: false,
        });
    }
    _setRecords(){
        // 第一次阅读提示
        StorageUtil.get('readerPrompt',res => {
            this.setState({
                readerPrompt: res.readerPrompt,
            });
        });

        // 字体设置记录
        StorageUtil.get('fontSet',res => {
            this.setState({
                fontSize: res.fontSize,
            });
        });

        // 阅读板式设置
        StorageUtil.get('plateSet',res => {
            this.setState({
                plateTypeIndex: res.plateTypeIndex,
                lineHeight: res.lineHeight,
                marginBottom: res.marginBottom,
            });
        });

        // 阅读模式设置记录
        StorageUtil.get('readerModel',res => {
            this.setState({
                comColor: res.comColor,
                barBackgroundColor: res.barBackgroundColor,
                modelSwitchStatus: res.modelSwitchStatus,
                backgroundColor: res.backgroundColor,
                themeIndex: res.themeIndex,
                fontColor: res.fontColor,
            });
        });
    }
    _readerStatusShowChapter(){
        let readerStatus = this.readerStatus;
        let chapter_id = this.chapter_id,
            book_hex_id = this.book_hex_id,
            confirm_pay = this.confirm_pay;

        switch (readerStatus){
            case "direct": this._requestDefaultsBookChapter();
                break;

            case 'indirect': this._comRequestData(chapter_id,book_hex_id,confirm_pay);
                break;

            default: this._requestDefaultsBookChapter();
                break;
        }
    }
    _requestDefaultsBookChapter(){
        let hex_id = this.book_hex_id;
        let url = Api.common + Api.category.getChapter,
            params = '?chapter_id=book_id' + hex_id,
            headers = {'SESSION-ID': launchConfig.sessionID,'Authorized-Key':this.authorized_key};
        const { navigate } = this.props.navigation;

        networkCheck(() => {
            Fecth.get(url,params,res => {
                if(res.code === 0){
                    this.setState({
                        totalStatus: true,
                        totalTitle: this.state.book_title,
                        totalRecords: res.data.chapters_count,
                        currentRecords: res.data.chapter.source_site_index,
                        currentContent: res.data.chapter.content,
                        currentTitle: res.data.chapter.title,
                        prev: res.data.chapter.turn_page.prev,
                        prevHexId: '',
                        nextHexId: res.data.chapter.turn_page.next.hex_id,
                        isLoading: false,

                        book_id: res.data.chapter.book_id,
                        chapter_id: res.data.chapter.id,
                        result: res.data.chapter.result || {},
                    });
                }

                if(res.code === 401){
                    this.setState({
                        totalStatus: true,
                        isLoading: false,
                    });

                    loginTimeout(_ => {navigate("Login")});
                }
            },err => {
                this.setState({
                    totalStatus: true,
                    isLoading: false,
                });

                errorShow(err);
            },headers);
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    _plateType(index){
        this.setState({
            plateTypeIndex: index,
            lineHeight: this._plateTypeNumbers(index).lineHeight,
            marginBottom: this._plateTypeNumbers(index).marginBottom,
        });

        StorageUtil.save('plateSet',{
            plateTypeIndex: index,
            lineHeight: this._plateTypeNumbers(index).lineHeight,
            marginBottom: this._plateTypeNumbers(index).marginBottom,
        },null);
    }
    _plateTypeNumbers(index){
       let lineHeight, marginBottom;

       switch (index){
           case 0: lineHeight = 25; marginBottom = 10;
               break;

           case 1: lineHeight = 30; marginBottom = 13;
               break;

           case 2: lineHeight = 35; marginBottom = 16;
               break;
       }
       return {
           lineHeight: lineHeight,
           marginBottom: marginBottom
       };
    }
    _themeSwitch(index){
        this.setState({
            themeIndex: index,
            backgroundColor: this.readerBg[index],
            fontColor: this.readerFontColor[index],
            modelSwitchStatus: this.modelSwitchStatus[index],
            comColor: this.comColor[index],
            barBackgroundColor: this.barBackgroundColor[index],
        });

        StorageUtil.save('readerModel',{
            comColor: this.comColor[index],
            barBackgroundColor: this.barBackgroundColor[index],
            modelSwitchStatus: this.modelSwitchStatus[index],
            backgroundColor: this.readerBg[index],
            themeIndex: index,
            fontColor: this.readerFontColor[index],
        },null);
    }
    _fontSizeTypeSubtract(){
        if(this.state.fontSize <= 12){
            this.refs.toast.show('已经是最小字号了哦',600);
        }
        else{
            this.setState({
                fontSize: this.state.fontSize - 1,
            });

            StorageUtil.save('fontSet',{
                fontSize: this.state.fontSize - 1,
            },null);
        }
    }
    _fontSizeTypeAdd(){
        if(this.state.fontSize >= 18){
            this.refs.toast.show('已经是最大字号了哦',600);
        }
        else{
            this.setState({
                fontSize: this.state.fontSize + 1,
            });

            StorageUtil.save('fontSet',{
                fontSize: this.state.fontSize + 1,
            },null);
        }
    }
    _setChapterId(chapter_id,book_title){
        this._comRequestData(chapter_id,this.book_hex_id,this.confirm_pay);
        this._closeControlPanel();
        this.setState({
            barStatusA: false,
            barStatusB: false,
            book_title: book_title,
        });
    }
    _renderItem(items){
        const  { currentContent } = this.state;

        return (
            <View style={{width:Devices.width, flex:1,backgroundColor:items.backgroundColor}}>
                <View style={styles.readerTitle}>
                    <Text
                        style={[styles.smallReaderTitleText,{color:this.state.modelSwitchStatus?this.state.fontColor:'#999999'}]}
                    >
                        《{this.state.totalTitle}》
                    </Text>
                </View>
                <View style={[styles.bigReaderTitle]}>
                    <Text style={[styles.bigReaderTitleText,{fontSize:15,color:this.state.fontColor}]}>{this.state.currentTitle}</Text>
                </View>
                {
                    currentContent.length !== 0 ? (
                        <ScrollView
                            style={styles.readerTextContent}
                            ref='scroll'
                            showsVerticalScrollIndicator={false}
                        >
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => this._openSetBar()}
                            >
                                {
                                    currentContent.map((content,index) => {
                                        return (
                                            <Text
                                                key={index}
                                                selectable={true}
                                                style={[styles.readerText,
                                                    {
                                                        fontSize:items.fontSize,
                                                        lineHeight:items.lineHeight,
                                                        marginBottom: items.marginBottom,
                                                        paddingLeft: 4,
                                                        color: items.fontColor,
                                                    }]}
                                            >
                                                {'        ' + content}
                                            </Text>
                                        )
                                    })
                                }
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <TouchableOpacity
                            activeOpacity={1}
                            accessible={true}
                            onPress={() => this._openSetBar()}
                            style={[styles.clickStyle]}
                        />
                    )
                }
                <View style={styles.readerContentFooter}>
                    <Text
                        style={[styles.smallReaderTitleText,{color:this.state.modelSwitchStatus?this.state.fontColor:'#999999'}]}
                    >
                        {this.state.currentRecords} / {this.state.totalRecords}
                    </Text>
                </View>
            </View>
        );
    }
    _onScrollBeginDrag(e){
        //this.setState({startX: e.nativeEvent.pageX});
        //console.log("start",e.nativeEvent)
    }
    _onScrollEndDrag(e){
        let x = e.nativeEvent.velocity.x;
        //this.setState({
        //    isLoading: true,
        //});

        if(x === 0){
            this.setState({isLoading: false});
        }

        if(x < 0){
            //console.log("向左")
            this._nextData(this.state.nextHexId,this.book_hex_id,0);
            this._scrollTop();
            //this.refs['readerCatalogue']._requestBookMarkData(1);
        }

        if(x > 0){
            //console.log("向右")
            this._prevData(this.state.prevHexId,this.book_hex_id,0);
            this._scrollTop();
            //this.refs['readerCatalogue']._requestBookMarkData(1);
        }
    }
    _scrollTop(){
        this.refs.scroll.scrollTo({x: 0,y: 0,animated: true});
    }
    _prevData(chapter_id,book_id,confirm_pay){
        if(chapter_id === ''){
            this.refs.toast.show('已经是第一章了哦',600);
            this.setState({isLoading: false});
        }
        else{
            this._comRequestData(chapter_id,book_id,confirm_pay);
        }
    }
    _nextData(chapter_id,book_id,confirm_pay){
        if(chapter_id === ''){
            this.refs.toast.show('已经是最后一章了哦',600);
            this.setState({isLoading: false});
        }
        else{
            this._comRequestData(chapter_id,book_id,confirm_pay);
        }
    }
    _comRequestData(chapter_id,book_id,confirm_pay){
        let url = Api.common + Api.category.getChapter,
            //params = "?chapter_id="+ chapter_id +"&book_id="+ book_id +"&confirm_pay=" + confirm_pay,
            params = "?chapter_id="+ chapter_id +"&confirm_pay=" + confirm_pay,
            headers = {"Authorized-Key":this.authorized_key,"SESSION-ID": launchConfig.sessionID};

        networkCheck(() => {
            Fecth.get(url,params,res => {
                if(res.code === 0){
                    this.setState({
                        totalStatus: true,
                        prevHexId: res.data.chapter.turn_page.prev === null ? '' : res.data.chapter.turn_page.prev.hex_id,
                        nextHexId: res.data.chapter.turn_page.next === null ? '' : res.data.chapter.turn_page.next.hex_id,
                        currentRecords: res.data.chapter.source_site_index,
                        currentContent: res.data.chapter.content,
                        currentTitle: res.data.chapter.title,
                        isLoading: false,
                        totalTitle: this.state.book_title,
                        totalRecords: res.data.chapters_count,
                        prev: res.data.chapter.turn_page.prev,

                        book_id: res.data.chapter.book_id,
                        chapter_id: res.data.chapter.id,
                        result: res.data.chapter.result || {},
                    });
                }

                if(res.code === 401){
                    this.setState({
                        totalStatus: true,
                        isLoading: false,
                    });

                    loginTimeout(_ => {
                        this.props.navigation.navigate("Login");
                    });
                }
            },err => {
                this.setState({
                    totalStatus: true,
                    isLoading: false,
                });

                errorShow(err);
            },headers);
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    _openSetBar(){
        this.setState({
            barStatusA: true,
            barStatusB: false,
            barStatusC: false,
        });
    }
    _closeBarPanel(){
        this.setState({barStatusA: false});
    }
    _returnBookDetail(){
        this.props.navigation.goBack();
    }
    _openControlPanel(){
        this.refs['drawer'].openControlPanel();
    }
    _closeControlPanel(){
        this.refs['drawer'].closeControlPanel();
    }
    _openFontSetPanel(){
        this.setState({
            barStatusA: false,
            barStatusB: true,
            barStatusC: false,
        });
    }
    _readerModelSwitch(){

        // 阅读模式切换
        this.setState({
            backgroundColor: this.state.backgroundColor === '#090C13' ? '#f6f4f1' : '#090C13',
            fontColor: this.state.fontColor === '#000000' ? '#2a5a74' : '#000000',
            comColor: this.state.comColor === '#ffffff' ? '#8493a2' : '#ffffff',
            barBackgroundColor: this.state.barBackgroundColor === 'rgba(32,35,37,0.95)'?'rgba(0,0,0,0.85)':'rgba(32,35,37,0.95)',
            modelSwitchStatus: !this.state.modelSwitchStatus,
            themeIndex: this._themeIndex(),
        });

        // 储存阅读模式相关的值
        StorageUtil.save('readerModel',{
            comColor: !this.state.modelSwitchStatus ? '#8493a2' : '#ffffff',
            barBackgroundColor: !this.state.modelSwitchStatus ? 'rgba(32,35,37,0.95)' : 'rgba(0,0,0,0.85)',
            modelSwitchStatus: !this.state.modelSwitchStatus,
            backgroundColor: !this.state.modelSwitchStatus ? '#090C13' : '#f6f4f1',
            themeIndex: this._themeIndex(),
            fontColor: !this.state.modelSwitchStatus ? '#2a5a74' : '#000000',
        },null);
    }
    _themeIndex(){
        let numbers;
        if(this.state.themeIndex === 0){
            numbers = 1;
        }
        else if(this.state.themeIndex === 1){
            numbers = 0;
        }
        else{
            numbers = 1;
        }
        return numbers;
    }
    _writtenComments(){
        // 书写评论
        this.setState({
            barStatusA: false,
            barStatusB: false,
            barStatusC: true,
        });
    }
    _sendComments(){
        let content = this.commontsText;
        let book_id = this.state.book_id !== '' && this.state.book_id;
        let chapter_id = this.state.chapter_id !== '' && this.state.chapter_id;
        let url = Api.common + Api.category.bookAddComment,
            params = Fecth.dictToFormData({
                book_id: book_id,
                chapter_id: chapter_id,
                content: content,
            }),
            headers = {'Authorized-Key': this.authorized_key,'SESSION-ID': launchConfig.sessionID};
        const {navigate} = this.props.navigation;

        if(content === ''){
            //this.refs.toast.show('请输入评论哦',600);
            Alert.alert('系统提示','亲，请输入评论哦',[{text: '关闭'}]);
            return;
        }

        this._commetsControl();

        networkCheck(() => {
            Fecth.post(url,params,headers,res => {
                if(res.code === 0){
                    this.refs['toast'].show('评论成功',600);
                    this.commontsText='';
                }

                if(res.code === 401){
                    loginTimeout(_ => {navigate("Login")});
                }
            },err => {
                errorShow(err);
            });
        },() => {navigate("NetWork")});
    }
    _closeComments(){
        this._commetsControl();
    }
    _commetsControl(){
        this.refs['textInput']._textInputBlur();
        this.refs['textInput']._textInputClear();
        this.setState({barStatusC: false});
    }
}

export default Reader;

const styles = StyleSheet.create({
    clickStyle: {
        flex: 1,
        overflow: 'hidden',
    },
    readerSlidePagePrompt:{
        width: Devices.width,
        height: 200,
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 35,
        paddingTop: 20,
    },
    readerClickPrompt:{
        width: Devices.width,
        height: 200,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: 20,
    },
    readerPrompt:{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(0,0,0,0.6)',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    setBarBox: {
        position: 'absolute',
        zIndex: 1000,
        flex: 1,
        right: 0,
        bottom: 0,
        left: 0,
        top: 0,
        overflow: 'hidden',
    },
    readerTextContent: {
        paddingBottom: 15,
        paddingLeft: 15,
        paddingRight: 15,
        overflow: 'hidden',
    },
    readerText: {
        color: '#333333',
        padding: 0,
    },
    smallReaderTitleText: {
        fontSize: 12,
        //color: '#999999',
    },
    bigReaderTitleText: {
        color: '#333333',
        fontWeight: 'bold',
    },
    bigReaderTitle: {
        height: 30,
        flexDirection: 'row',
        paddingLeft: 15,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'flex-start',
        //borderBottomColor:'#e5e5e5',
        //borderBottomWidth:1 / Devices.piexl,
        //borderStyle: 'solid',
    },
    readerTitle: {
        height: 34,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawer: {
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowOpacity: 0.8,
        shadowRadius: 3,
    },
    readerContentFooter: {
        height: 30,
        flexDirection: 'row',
        paddingRight: 15,
        justifyContent: 'flex-end',
        alignItems: 'center',
        //borderTopColor:'#e5e5e5',
        //borderTopWidth:1 / Devices.piexl,
        //borderStyle: 'solid',
    },
});
























