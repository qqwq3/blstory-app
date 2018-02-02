
// 我的收藏

import React,{ Component } from 'react';
import {
    View,
    Text,
    Image,
    Alert,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ListView,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import _ from 'lodash';
import Toast from 'react-native-easy-toast';
import ImageLoad from 'react-native-image-placeholder';
import PropTypes from 'prop-types';
import Icon from "../common/Icon";
import { Devices,Api } from "../common/Api";
import Fecth from '../common/Fecth';
import RequestImage from '../common/RequestImage';
import Loading from '../common/Loading';
import { errorShow,loginTimeout,networkCheck } from '../common/Util';
import FooterLoadActivityIndicator from '../common/FooterLoadActivityIndicator';

class MyCollect extends Component{
    constructor(props){
        super(props);
        this.state = {
            data: [],
            isLoadMore: false,
            isLoading: true,
            itemStatus: true,

            allStatus: 'close',
            iconStatus: false,
            indexArr: [],
        };
        this.user = this.props.navigation.state.params.user;
        this.authorized_key = this.user.authorized_key;
        this.cacheReults = {
            nextPage: 1,
            total: 0,
            items: [],
        };
        this.bookIdCollection = [];
        this.bookIds = '';
        this.indexArr = [];
        this.iconStatusCollection = [];
    }
    componentWillMount() {
        this._requestData(1);
    }
    render(){
        let data = [];
        let _data = this.state.data !== [] && this.state.data;

        _data.map((items,index) => {
            data.push({key: index,data: items});
        });

        return (
            <View style={{flex:1}}>
                {
                    this.state.itemStatus ?
                        (
                            <View style={styles.CollectContent}>
                                <FlatList
                                    data={data}
                                    renderItem={this._renderItem.bind(this)}
                                    numColumns={3}
                                    enableEmptySections={true}
                                    showsVerticalScrollIndicator={false}
                                    horizontal={false}
                                    contentContainerStyle={{paddingBottom:15}}
                                    ListFooterComponent={() => this._listFooterComponent()}
                                    onEndReached={() => this._fetchMoreData()}
                                    onEndReachedThreshold={0.1}
                                    legacyImplementation={false}
                                />
                                {
                                    this.state.allStatus === 'open' ?
                                        (<TouchableOpacity activeOpacity={0.75} onPress={() => this._delBook()}>
                                            <View style={styles.CollectBooksDel}>
                                                <Text style={styles.CollectBookDelText}>删除</Text>
                                            </View>
                                        </TouchableOpacity>) : null
                                }
                            </View>
                        ) : (
                            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                                <View style={{justifyContent:'center',alignItems:'center'}}>
                                    <Image source={Icon.iconNoCollection} resizeMode={'contain'} style={{marginBottom:30}} />
                                    <Text style={{fontSize:18,color:'#999999'}}>你还没有任何收藏哦！</Text>
                                </View>
                            </View>
                        )
                }
                <Loading opacity={1} show={this.state.isLoading}/>
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
    _requestData(page){
        let url = Api.common + Api.category.getBookCases,
            params = '?limit=15' + '&page=' + page,
            headers = {'Authorized-Key' : this.authorized_key,"SESSION-ID": launchConfig.sessionID};
        const { navigate } = this.props.navigation;

        networkCheck(() => {
            Fecth.get(url,params,res => {
                // 请求成功
                if(res.code === 0){
                    let items = this.cacheReults.items.slice();
                    let iconStatusCollection = this.iconStatusCollection.slice();

                    res.data.records.map(() => {
                        iconStatusCollection = iconStatusCollection.concat('select');
                    });

                    items = items.concat(res.data.records);

                    this.iconStatusCollection = iconStatusCollection;
                    this.cacheReults.items = items;
                    this.cacheReults.total = res.data.total_records;
                    this.cacheReults.nextPage += 1;
                    this.setState({
                        data: this.cacheReults.items,
                        isLoadMore: false,
                        isLoading: false,
                        itemStatus: true,
                    });
                }

                // 无数据
                if(res.code === 404){
                    this.setState({
                        isLoadMore: false,
                        isLoading: false,
                        itemStatus: false,
                    });
                }

                // 登录超时
                if(res.code === 401){
                    this.setState({
                        isLoadMore: false,
                        isLoading: false,
                        itemStatus: true,
                    });

                    loginTimeout(_ => {
                        navigate("Login");
                    });
                }
            },err => {
                this.setState({
                    isLoadMore: false,
                    isLoading: false,
                    itemStatus: true,
                });

                errorShow(err);
            },headers);
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    _renderItem({item,index}){
        return (
            <Books
                {...item.data}
                index={index}
                navigation={this.props.navigation}
                bookId={(book_id,value) => this._bookId(book_id,value)}
                bookIndex={(index,status) => this._bookIndex(index,status)}
                iconStatus={this.state.iconStatus}
                authorized_key={this.authorized_key}
                iconStatusCollection={this.iconStatusCollection}
            />
        );
    }
    _bookIndex(index,status){
        if(status === 'selected'){
            this.indexArr.push(index);
            this.iconStatusCollection[index] = status;
        }

        if(status === 'select'){
            let new_indexArr = this.indexArr.filter(function(x){
                return x !== index
            });

            this.indexArr = new_indexArr;
            this.iconStatusCollection[index] = status;
        }

        if(this.indexArr.length === 0){
            this.setState({
                iconStatus: false,
                allStatus: 'close',
            });
        }
        else{
            this.setState({
                iconStatus: true,
                allStatus: 'open',
            });
        }
    }
    _listFooterComponent(){
        if(this.cacheReults.items.length === this.cacheReults.total && this.cacheReults.total !== 0){
            return (
                <View style={{height:50,justifyContent:'center',alignItems:'center',marginBottom:-15}}>
                    <Text style={{fontSize: 14,color: '#999999'}}>没有更多收藏了哦</Text>
                </View>
            );
        }

        if(!this.state.isLoadMore){
            return null;
        }

        return (
            <FooterLoadActivityIndicator
                type={'horizontal'}
                style={{height:50,justifyContent:'center',alignItems:'center'}}
            />
        );
    }
    _fetchMoreData(){
        if(this.cacheReults.items.length === this.cacheReults.total || this.state.isLoadMore){
            return
        }

        let page = this.cacheReults.nextPage;

        this.setState({isLoadMore: true});
        this._requestData(page);
    }
    _delBook(){
        let authorized_key = this.authorized_key;
        let url = Api.common + Api.category.bookCasesBatchDel,
            params = Fecth.dictToFormData({book_ids: this.bookIds}),
            headers = {'Authorized-Key': authorized_key,"SESSION-ID": launchConfig.sessionID};
        const { navigate } = this.props.navigation;

        let data = this.state.data;
        let newIndexArr = _.uniq(this.indexArr);

        _.pullAt(data,newIndexArr);
        _.pullAt(this.iconStatusCollection,newIndexArr);

        networkCheck(() => {
            Fecth.post(url,params,headers,(res) => {
                if(res.code === 0){
                    this.refs.toast.show('删除成功',600);
                    this.setState({
                        data: data,
                        allStatus: 'close',
                        iconStatus: false,
                        isLoadMore: false,
                    });
                    this.cacheReults.items = [];
                    this.cacheReults.nextPage = 1;
                    this.cacheReults.total = 0;
                    this.bookIdCollection = [];
                    this.bookIds = '';
                    this.indexArr = [];
                    this.iconStatusCollection = [];
                    this._requestData(1);
                }

                if(res.code === 401){
                    loginTimeout(_ => {navigate("Login")});
                }
            },(err) => {
                errorShow(err);
            });
        },() => {navigate("NetWork")});
    }
    _bookId(book_id,value){
        // 数组追加
        this.bookIdCollection.push(book_id);
        //数组过滤
        let filterArr = _.uniq(this.bookIdCollection.filter(x => x !== null));

        if(value === 'selected'){
            this.bookIdCollection = filterArr;
            //数组转换字符串
            let strId = filterArr.join(",");
            //赋值ids
            this.bookIds = strId;
        }

        if(value === 'select'){
            //删除数组当中的对应的值
            _.remove(filterArr,val => val === book_id);
            this.bookIdCollection = filterArr;
            //数组转换字符串
            let strId = filterArr.join(",");
            //赋值ids
            this.bookIds = strId;
        }
    }
}

// 定义一个Books组件
class Books extends Component{
    static propTypes = {
        book_id: PropTypes.number,
        book_id_hex: PropTypes.string,
        iconStatus: PropTypes.bool,
        book_title: PropTypes.string,
        authorized_key: PropTypes.string,
        bookId: PropTypes.func,
        navigation: PropTypes.object,
        bookIndex: PropTypes.func,
        index: PropTypes.number,
    };
    constructor(props){
        super(props);
    }
    render(){
        let uri = RequestImage(this.props.book_id);
        let { index,iconStatusCollection,iconStatus } = this.props;

        return (
            <TouchableWithoutFeedback
                onPress={this._openDetails.bind(this)}
                onLongPress={this._onLongPress.bind(this)}
            >
                <View style={styles.CollectBox}>
                    <View style={styles.CollectSubBox}>
                        {
                            iconStatusCollection[index] === 'selected' &&
                            iconStatus &&
                                <TouchableOpacity activeOpacity={1} onPress={this._onPress.bind(this)} style={styles.CollectBookSelect}>
                                    <Image source={Icon.iconBookSelect} style={styles.CollectBookSelectIcon}/>
                                </TouchableOpacity>
                        }
                        <View style={{maxWidth: 75,overflow: 'hidden',}}>
                            <ImageLoad
                                source={{uri: uri}}
                                style={styles.CollectImage}
                                customImagePlaceholderDefaultStyle={styles.CollectImage}
                                placeholderSource={Icon.iconBookDefaultBig}
                                isShowActivity={false}
                                borderRadius={2}
                            />
                            <Text style={styles.CollectBookTitle} numberOfLines={1}>{this.props.book_title}</Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
    _openDetails(){
        let authorized_key = this.props.authorized_key;
        const { navigate } = this.props.navigation;
        let { index,iconStatusCollection,book_id,book_id_hex } = this.props;

        if(iconStatusCollection[index] === 'select'){
            navigate('BookDetail',{
                hex_id: book_id_hex,
                id: book_id,
                authorized_key: authorized_key
            });
        }
    }
    _onPress(){
        let { bookId,bookIndex,index,book_id_hex } = this.props;

        bookId(book_id_hex,"select");
        bookIndex(index,"select");
    }
    _onLongPress(){
        let { bookId,bookIndex,index,book_id_hex } = this.props;

        bookId(book_id_hex,"selected");
        bookIndex(index,"selected");
    }
}

export default MyCollect;

const styles = StyleSheet.create({
    bookSmallView:{
        elevation: 3,
        shadowOpacity:0.6,
        shadowColor: "#e5e5e5",
        shadowOffset: {width:4,height:3},
    },
    checkbox:{
        width:20,
        height:20,
        borderRadius:15,
        overflow:'hidden',
        alignItems:'center',
        justifyContent:'center'
    },
    TextLeft: {
        fontSize: 15,
        marginLeft: 15
    },
    TextModdle: {
        fontSize: 17
    },
    TextRight: {
        fontSize: 15,
        marginRight: 15
    },
    BoxLeft:{
        flex: 1,
        justifyContent: 'flex-start'
    },
    BoxModdle: {
        flex: 4,
        justifyContent: 'center'
    },
    BoxRight: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    CollectBookSelect: {
        position: 'absolute',
        right: 6,
        top: 6,
        zIndex:2000,
        justifyContent: 'center',
        flexDirection: 'row',
        width: 94,
        height: 104,
    },
    CollectBookSelectIcon: {
        width: 18,
        height: 18,
        position: 'absolute',
        right: 3,
        top: 3
    },
    CollectBooksDel: {
        backgroundColor: '#F8525A',
        height: 50,
        borderTopWidth: 1 / Devices.piexl,
        borderTopColor: '#E5E5E5',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    CollectBookDelText: {
        alignSelf: 'center',
        fontSize: 17,
        color: '#FFFFFF'
    },
    CollectContent: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    CollectBox: {
        flexDirection: 'column',
        width: Devices.width / 3
    },
    CollectImage: {
        width: 75,
        height: 95,
        borderRadius: 2,
        overflow: 'hidden',
        borderWidth: 0.25,
        borderColor: '#ccc'
    },
    CollectSubBox: {
        alignSelf: 'center',
        paddingTop: 15,
        paddingLeft: 15,
        paddingRight: 15
    },
    CollectBookTitle: {
        fontSize: 14,
        fontWeight: '100',
        color: '#4C4C4C',
        marginTop: 15,
        textAlign: 'center',
    },
    CollectCs: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingBottom: 15,
        backgroundColor: '#ffffff',
    },
    CollectOperHeader: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1 / Devices.piexl,
        borderBottomColor: '#E5E5E5',
        borderStyle: 'solid',
        height: 44,
        flexDirection: 'row'
    },
    CollectOperHeaderText: {
        color: '#304758',
        alignSelf: 'center'
    },
    CollectOperBox: {
        flex: 1,
        flexDirection: 'row',
    }
});



























