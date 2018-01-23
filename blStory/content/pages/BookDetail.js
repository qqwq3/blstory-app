
// 书籍详情

import React,{ Component} from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    FlatList,
    Animated,
    InteractionManager,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import Toast from 'react-native-easy-toast';
import { Api,Devices } from "../common/Api";
import Icon from '../common/Icon';
import RequestImage from '../common/RequestImage';
import DateUtil from '../common/DateUtil';
import Fecth from '../common/Fecth';
import BookDetailComments from './BookDetailComments';
import Loading from '../common/Loading';
import { errorShow,networkCheck,loginTimeout } from '../common/Util';

// 装饰点的颜色集合
const dotColor = {
    red: '#f53d5f',
    yellow: '#F8AD54',
    pruple: '#FF00FF',
    green: '#00FF00'
};

// 公共组件头
class ComHeader extends Component{
    static propTypes = {
        color: PropTypes.string,
        comments: PropTypes.number,
        name: PropTypes.string
    };
    render(){
        return (
            <View style={styles.boxHeader}>
                <View style={[styles.boxBlodDot,{backgroundColor:this.props.color}]}/>
                <View style={{flexDirection:'row',alignSelf: 'center',alignItems:'center'}}>
                    <View>
                        <Text style={styles.boxHeaderTitle}>{this.props.name}</Text>
                    </View>
                    <View style={{marginLeft: 15}}>
                        <Text style={{fontSize: 12,color: '#999999'}}>{this.props.comments}</Text>
                    </View>
                </View>
            </View>
        );
    }
}

// 内容
class BookDetail extends Component{
    constructor(props) {
        super(props);
        this.state = {
            detailData: {},
            status: false,
            similarData: [],
            commentsData: [],
            total_records: 0,
            isLoading: true,
            bookCaseExists: false,

            expanded: true,
            animation: new Animated.Value(),
            MinHeight: 56, // 默认值可改动
            MaxHeight: 0,
            isShow: false,

            id: this.props.navigation.state.params.id,
            hex_id: this.props.navigation.state.params.hex_id,
            authorized_key: this.props.navigation.state.params.authorized_key,

            likeCountArr: [],
            likeStatus: [],
            isConnected: true,
        };
        this.icons = {
            'up': Icon.iconGrayArrowTop,
            'down': Icon.iconGrayArrowBottom
        };
        this.likeCountArr = [];
        this.likeStatus = [];
    }
    componentWillMount() {
        //InteractionManager.runAfterInteractions(() => {
            this._requestData(this.state.id,this.state.hex_id);
            this._bookCaseExists(this.state.id,this.state.hex_id);
            this._requestCommets(this.state.id);
        //});
    }
    componentDidMount() {
        this.state.animation.setValue(this.state.MinHeight);
    }
    render(){
        let obj = this.state.detailData,
            status = this.state.status,
            uri = RequestImage(obj.id);

        // 箭头方法默认向下
        let icon = this.icons['down'],
            expended = this.state.expanded,
            isShow = this.state.isShow;

        if(!expended){
            icon = this.icons['up'];
        }

        return (
            status ?
                (
                    <View style={{flex:1}}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{backgroundColor: '#ffffff'}}>
                                <View style={styles.BookMarkBox}>
                                    <Image style={styles.BookMarkImage} source={{uri:uri}}/>
                                    <View style={styles.BookMarkMassage}>
                                        <Text style={styles.BookMarkTitle}>{obj.title}</Text>
                                        <View style={styles.BookMarkNewView}>
                                            <Text style={[styles.BookMarkFont,{marginRight: 15}]}>{obj.category_name}</Text>
                                            <Text style={[styles.BookMarkFont]}>{obj.status.text}</Text>
                                        </View>
                                        <View style={styles.BookMarkNewView}>
                                            <Text style={[styles.BookMarkFont,{marginRight: 15}]}>{obj.author_name}</Text>
                                            <Text style={[styles.BookMarkFont]}>{obj.total_words}字</Text>
                                        </View>
                                        <Text style={styles.BookMarkNew} numBerOfLines={1}>
                                            <Text>{obj.total_likes}次阅读</Text>
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {/*文章折叠动画*/}
                            <TouchableWithoutFeedback accessible={true} onPress={() => isShow === true && this._toggle()}>
                                <View style={styles.box}>
                                    <Animated.View style={[{height:isShow === true ? this.state.animation : this.state.MaxHeight},styles.AnimatedView,]}>
                                        <Text onLayout={(e) => this._MaxHeight(e)}>
                                            <Text style={styles.description}>
                                                {'        ' + obj.description}
                                            </Text>
                                        </Text>
                                    </Animated.View>
                                    {
                                        isShow === true && (
                                            <LinearGradient
                                                colors={['rgba(255,255,255,0.55)','rgba(255,255,255,1.0)']}
                                                style={styles.arrow}
                                            >
                                                <Image source={icon} style={{width:12,height:8}} />
                                            </LinearGradient>
                                        )
                                    }
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={styles.mlLastestMes}>
                                <TouchableOpacity
                                    onPress={() => this._bookCatalog(obj.hex_id,obj.title)}
                                    style={styles.mlLastestMes_left}
                                    activeOpacity={0.75}
                                >
                                    <Image source={Icon.iconIntroMenu} style={{width:14,height:10}} />
                                    <Text style={styles.mlLastestMesText}>目录</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.mlLastestMes_right}
                                    activeOpacity={0.75}
                                    onPress={() =>
                                        obj.latest_chapter === null ? this.refs.toast.show('暂无最新章节') : this._indirectReader(obj.latest_chapter.hex_id,obj.title)
                                    }
                                >
                                    <View style={{flexDirection:'row'}}>
                                        <View style={{flexDirection:'row',marginRight:5}}><Text style={styles.mlLastestMesText}>最新</Text></View>
                                        <View style={{flexDirection:'row'}}>
                                            <Text numberOfLines={1} style={[styles.mlLastestMesText,{maxWidth:150}]}>
                                                { obj.latest_chapter === null ? '暂无最新章节' : obj.latest_chapter.title}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{flexDirection:'row'}}>
                                        <Text style={styles.mlLastestMesText}>
                                            {obj.latest_chapter === null ? '' :DateUtil.formatDate(obj.time_created*1000,'yyyy-MM-dd')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.ComContent,{paddingBottom:15}]}>
                                <ComHeader name={'猜你喜欢'} comments={null} color={dotColor.red}/>
                                <View style={styles.aeRow}>{this._similarItem(this.state.similarData)}</View>
                            </View>
                            {
                                this.state.total_records !== 0 && (
                                    <View style={[styles.ComContent,{marginBottom:10}]}>
                                        <ComHeader name={'读者评论'} comments={this.state.total_records} color={dotColor.yellow}/>
                                        <BookDetailComments
                                            commentsData={this.state.commentsData}
                                            authorized_key={this.props.navigation.state.params.authorized_key}
                                            toast={this.refs.toast}
                                            likeCountArr={this.state.likeCountArr !== [] && this.state.likeCountArr}
                                            likeStatus={this.state.likeStatus !== [] && this.state.likeStatus}
                                            newLikeCountArr={this._newLikeCountArr.bind(this)}
                                            newLikeStatus={this._newLikeStatus.bind(this)}
                                            navigation={this.props.navigation}
                                        />
                                        {
                                            this.state.total_records > 10 &&
                                            <TouchableOpacity
                                                activeOpacity={0.75}
                                                onPress={this._viewMoreComments.bind(this)}
                                                style={styles.moreComments}
                                            >
                                                <Text style={{fontSize:14,color:'#F3916B'}}>点击查看跟多评论</Text>
                                            </TouchableOpacity>
                                        }
                                    </View>
                                )
                            }
                        </ScrollView>
                        <View style={styles.BottomRow}>
                            <TouchableOpacity
                                onPress={() => this._readingImmediately(obj.hex_id,obj.title)}
                                activeOpacity={0.75}
                                style={styles.readyNowBtn}
                            >
                                <Text style={styles.readyNowBtnText}>立即阅读</Text>
                            </TouchableOpacity>
                            {
                                this.state.bookCaseExists ?
                                    (
                                        <View style={styles.scBtn}>
                                            <Text style={[styles.scBtnText,{color:'#dcdcdc'}]}>已收藏</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity onPress={() => this._addCollection(obj.id)}  activeOpacity={0.75} style={styles.scBtn}>
                                            <Text style={styles.scBtnText}>收藏</Text>
                                        </TouchableOpacity>
                                    )
                            }
                        </View>
                        <Toast
                            ref="toast"
                            position={'center'}
                            fadeInDuration={750}
                            fadeOutDuration={1000}
                            opacity={0.8}
                            style={{backgroundColor:'#000000'}}
                            textStyle={{fontSize:14,color:'#fff'}}
                        />
                        <Loading opacity={0.60} show={this.state.isLoading} />
                    </View>
                ) : <Text/>
        );
    }
    _viewMoreComments(){
        networkCheck(() => {
            this.props.navigation.navigate('BookDetailCommentsMore',{
                book_id: this.state.id,
                authorized_key: this.state.authorized_key,
            });
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    _newLikeStatus(newLikeStatus){
        this.setState({likeStatus: newLikeStatus});
    }
    _newLikeCountArr(newLikeCountArr){
        this.setState({likeCountArr: newLikeCountArr});
    }
    _bookCaseExists(id,hex_id){
        let url = Api.common + Api.category.bookCaseExists,
           params = '?book_id=' + hex_id,
           headers = {
               'Authorized-Key': this.state.authorized_key,
               'SESSION-ID': launchConfig.sessionID,
           };
        const { navigate } = this.props.navigation;

        networkCheck(() => {
            Fecth.get(url,params,res => {
                if(res.code === 0){
                    this.setState({bookCaseExists: true});
                }
            },err => {
                errorShow(err);
            },headers);
        },() => {
            navigate("NetWork");
        });
    }
    _requestData(id,hex_id){
        let url_detail = Api.common + Api.category.details,
            url_similar = Api.common + Api.category.similar;
        const { navigate } = this.props.navigation;

        networkCheck(() => {
            // 猜你喜欢
            Fecth.get(url_similar,"?book_id="+id,(res) => {
                if(res.code === 0){
                    this.setState({
                        similarData: res.data.records,
                        isLoading: false,
                    });
                }
                else{
                    this.setState({isLoading: false});
                }
            },(err) => {
                errorShow(err);
            });

            // 书籍详情
            Fecth.get(url_detail,"?id=" + hex_id,(res) => {
                if(res.code === 0){
                    this.setState({
                        detailData: res.data,
                        status: true,
                        isLoading: false,
                    });
                }
                else{
                    this.setState({
                        isLoading: false,
                        status: true,
                    });

                    loginTimeout(_ => {
                        navigate("Login");
                    });
                }
            },(err) => {
                errorShow(err);
            });
        },() => {
            navigate("NetWork");
        });
    }
    _requestCommets(id){
        let url_comments = Api.common + Api.category.comments;
        let params = "?book_id=" + id + '&limit=10' + '&page=1';
        headers = {'SESSION-ID': launchConfig.sessionID};
        const { navigate } = this.props.navigation;

        networkCheck(() => {
            //书籍评论
            Fecth.get(url_comments,params,(res) => {
                if(res.code === 0){
                    res.data.records.map((item,index) => {
                        this.likeCountArr.push(item.like_count);
                        this.likeStatus.push(false);
                    });

                    this.setState({
                        commentsData: res.data.records,
                        total_records: res.data.total_records,
                        isLoading: false,
                        likeCountArr: this.likeCountArr,
                        likeStatus: this.likeStatus,
                    });
                }
                else{
                    this.setState({
                        isLoading: false,
                    });
                }
            },(err) => {
                errorShow(err);
            },headers);
        },() => {
            navigate("NetWork");
        });
    }
    _toggle(){
        this.setState({expanded: !this.state.expanded});
        let changeValue = this.state.expanded ? this.state.MaxHeight : this.state.MinHeight;

        Animated.spring(this.state.animation,{
            toValue: changeValue,
            friction: 10, //摩擦力 （越小 振幅越大）
            tension: 100, //拉力
        }).start();
    }
    _MaxHeight(e){
        let MaxHeight = e.nativeEvent.layout.height;
        this.setState({MaxHeight: MaxHeight});
        parseInt(MaxHeight) >= this.state.MinHeight && this.setState({isShow: true});
    }
    _bookCatalog(hex_id,book_title){
        let authorized_key = this.state.authorized_key;

        networkCheck(() => {
            this.props.navigation.navigate('BookDetailCatalog',{
                hex_id: hex_id,
                authorized_key: authorized_key,
                book_title: book_title,
            });
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    _readingImmediately(hex_id,book_title){
        let authorized_key = this.state.authorized_key;

        networkCheck(() => {
            this.props.navigation.navigate('Reader',{
                hex_id: hex_id,
                authorized_key: authorized_key,
                readerStatus: 'direct',
                book_title: book_title,
            });
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    _indirectReader(chapter_id,book_title){
        let hex_id = this.state.hex_id;
        let authorized_key = this.state.authorized_key;

        networkCheck(() => {
            this.props.navigation.navigate('Reader',{
                chapter_id: chapter_id,
                hex_id: hex_id,
                authorized_key: authorized_key,
                readerStatus: 'indirect',
                book_title: book_title,
            });
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    _addCollection(book_id){
        let authorized_key = this.state.authorized_key;
        let url = Api.common + Api.category.addBookCase,
            params = {book_id:book_id},
            headers = {'Authorized-Key': authorized_key,"SESSION-ID": launchConfig.sessionID};

        networkCheck(() => {
            // post请求
            Fecth.post(url,Fecth.dictToFormData(params),headers,(res) => {
                if(res.code === 0){
                    if(res.data === 'add'){
                        this.refs.toast.show('添加成功',600);
                        this.setState({bookCaseExists: true});
                    }
                }
                else{
                    loginTimeout(_ => {
                        this.props.navigation.navigate("Login");
                    });
                }
            },(err) => {
                errorShow(err);
            });
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    _similarItem(similarData){
        let uri,results;
        results = similarData.map((obj,index) => {
            uri = RequestImage(obj.id);

            return (
                <TouchableWithoutFeedback
                    key={index}
                    onPress={() => this._similarItemOnPress(obj.id,obj.hex_id)}
                >
                    <View style={styles.boxFooterLump}>
                        <Image source={{uri:uri}} style={styles.bookSmall}/>
                        <Text style={styles.boxFooterText} numberOfLines={1}>{obj.title}</Text>
                    </View>
                </TouchableWithoutFeedback>
            );
        });
        return results;
    }
    _similarItemOnPress(id,hex_id){
        this.setState({isLoading: true});
        this._requestData(id,hex_id);
        this._bookCaseExists(id,hex_id);
        this._requestCommets(id);
    }
}

let aeData = [
    {
        key: 'a',
        text: '玫瑰之约A'
    },
    {
        key: 'b',
        text: '玫瑰之约B'
    },
    {
        key: 'c',
        text: '玫瑰之约C'
    },
    {
        key: 'd',
        text: '玫瑰之约D'
    },
    {
        key: 'e',
        text: '玫瑰之约E'
    },
    {
        key: 'f',
        text: '玫瑰之约F'
    }
];

// 定义一个作者打赏组件
class AuthorExceptional extends Component{
    render(){
        return (
            <View style={styles.ComContent}>
                <ComHeader name={'打赏作者'} color={dotColor.yellow}/>
                <View style={styles.aeRow}>
                    {this.aeItemDom()}
                </View>
                <View style={styles.aeBtnRow}>
                    <TouchableOpacity activeOpacity={0.75} style={styles.aeBtn}>
                       <Text style={styles.aeBtnText}>打赏</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    aeItemDom = () => {
        return (
            <FlatList
                data={aeData}
                renderItem={this.aeRenderItem}
                contentContainerStyle={styles.FlatListContainer}
            />
        );
    };
    aeRenderItem = ({item,index}) => {
        return (
            <View style={styles.aeBox}>
                <View style={styles.aeImage}/>
                <View style={[styles.aeText,{marginBottom: 5}]}><Text style={styles.smallFont}>{item.text}</Text></View>
                <View style={styles.aeText}><Text style={styles.smallFont}>0</Text></View>
            </View>
        );
    }
}

export default BookDetail;

const styles = StyleSheet.create({
    moreComments:{
        height: 50,
        overflow:'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerBox: {
        marginRight:15,
        marginLeft:15,
        borderBottomColor: '#E5E5E5',
        borderBottomWidth: 1 / Devices.piexl,
        borderStyle: 'solid',
        overflow: 'hidden',
        paddingBottom: 15,
    },
    box: {
        backgroundColor: '#ffffff',
        flexDirection: 'column'
    },
    AnimatedView: {
        paddingHorizontal: 15,
    },
    arrow: {
        flexDirection: 'row',
        height: 30,
        marginLeft: 15,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: '#E5E5E5',
        borderBottomWidth: 1 / Devices.piexl,
        borderStyle: 'solid'
    },
    mlLastestMes_left: {
        marginTop: 10,
        height: 20,
        width: 60,
        borderRightWidth: 1 / Devices.piexl,
        borderRightColor: "#E5E5E5",
        borderStyle: 'solid',
        paddingLeft: 5,
        paddingRight: 10,
        overflow: 'hidden',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row'
    },
    mlLastestMes_right: {
        flex: 1,
        overflow: 'hidden',
        paddingLeft: 10,
        paddingRight: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mlLastestMes: {
        height: 40,
        backgroundColor:'#ffffff',
        flexDirection: 'row',
        paddingRight: 15,
        paddingLeft: 15,
    },
    mlLastestMesText: {
        fontSize: 12,
        color: '#4d4d4d',
    },
    description: {
        fontSize: 12,
        color: '#808080',
        lineHeight: 17,
    },
    innerBottom: {
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    arrowBottom: {
        backgroundColor: '#FFF',
        height: 32,
        width: Devices.width,
        position: 'relative',
        zIndex: 1000,
        flexDirection: 'row',
    },
    linearGrandBox: {
        justifyContent:'center',
        alignItems:'center',
        width:200,
        height:50,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5
    },
    readyNowBtn: {
        flex: 1,
        backgroundColor: '#F3916B',
        justifyContent: 'center',
        alignItems: 'center'
    },
    readyNowBtnText: {
        fontSize: 15,
        color: '#FFFFFF',
    },
    scBtn: {
        backgroundColor: '#FFFFFF',
        width: 125,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scBtnText: {
        fontSize: 15,
        color: '#F3916B',
    },
    BottomRow: {
        height: 45,
        borderTopWidth: 1 / Devices.piexl,
        borderTopColor: '#E5E5E5',
        borderStyle: 'solid',
        flexDirection: 'row',
    },
    FlatListContainer: {
        justifyContent:'space-around',
        flexDirection: 'row'
    },
    boxFooter: {
        backgroundColor: '#FFFFFF',
        paddingTop: 15,
        paddingBottom: 15
    },
    boxFooterLump: {
        flex: 1,
        justifyContent: 'center'
    },
    bookSmall: {
        width: 60,
        height: 76,
        borderRadius: 2,
        overflow: 'hidden',
        alignSelf: 'center'
    },
    boxFooterText: {
        fontSize: 12,
        fontWeight: '100',
        color: '#4C4C4C',
        marginTop: 10,
        alignSelf: 'center',
        maxWidth: 60
    },
    aeBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        alignSelf: 'center'
    },
    aeBtn: {
        backgroundColor: '#F3916B',
        width: 80,
        height: 30,
        borderRadius: 2,
        justifyContent: 'center'
    },
    aeBtnRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 18
    },
    aeBox: {
        justifyContent: 'center',
        flex: 1
    },
    aeImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#CBCBCB',
        overflow: 'hidden',
        alignSelf: 'center',
        marginBottom: 10
    },
    aeText: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    smallFont: {
        fontSize: 10,
        color: '#888888'
    },
    aeRow: {
        flexDirection: 'row',
        marginTop: 12,
    },
    ComContent: {
        backgroundColor: '#FFFFFF',
        marginTop: 10
    },
    BookMarkFont: {
        fontSize: 12,
        color: '#808080'
    },
    BookMarkNewView: {
        paddingTop: 5,
        flexDirection: 'row'
    },
    BookMarkNew: {
        flex: 1,
        fontSize: 12,
        color: '#808080',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        paddingTop: 5
    },
    BookMarkProgress: {
        flex: 1,
        fontSize: 12,
        color: '#f3916b',
        flexDirection: 'row',
        flexWrap: 'nowrap'
    },
    BookMarkTitle: {
        fontSize: 15,
        color: '#4C4C4C',
        flex: 2
    },
    BookMarkMassage: {
        flex: 1,
        marginLeft: 15,
        flexDirection: 'column'
    },
    BookMarkContent: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    BookMarkImage: {
        width: 75,
        height: 95,
        borderRadius: 2
    },
    BookMarkBox: {
        marginLeft: 15,
        paddingTop: 15,
        paddingBottom: 15,
        flexDirection: 'row'
    },
    boxHeader: {
        height: 35,
        overflow: 'hidden',
        flexDirection: 'row'
    },
    boxBlodDot: {
        height: 15,
        width: 2,
        alignSelf: 'center'
    },
    boxHeaderTitle: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#4C4C4C',
        alignSelf: 'center',
        marginLeft: 13
    }
});























