
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
import PropTypes from 'prop-types';
import Icon from "../common/Icon";
import { Devices,Api } from "../common/Api";
import Fecth from '../common/Fecth';
import RequestImage from '../common/RequestImage';
import Loading from '../common/Loading';
import { errorShow } from '../common/Util';

class MyCollect extends Component{
    constructor(props){
        super(props);
        this.state = {
            data: [],
            isLoadMore: false,
            isLoading: true,
            itemStatus: true,

            allStatus: 'close',
            iconStatus: true,
            selectedStatusCount: 0,
            indexArr: [],
        };
        this.authorized_key = this.props.navigation.state.params.authorized_key;
        this.cacheReults = {
            nextPage: 1,
            total: 0,
            items: [],
        };
        this.bookIdCollection = [];
        this.bookIds = '';
        this.indexArr = [];
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

        Fecth.get(url,params,res => {
            if(res.code === 0){
                let items = this.cacheReults.items.slice();
                items = items.concat(res.data.records);

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

            if(res.code === 404){
                this.setState({
                    isLoadMore: false,
                    isLoading: false,
                    itemStatus: false,
                });
            }
        },err => {
            this.setState({
                isLoadMore: false,
                isLoading: false,
                itemStatus: false,
            });
            errorShow(err);
        },headers);
    }
    _renderItem({item,index}){
        return (
            <Books
                {...item.data}
                index={index}
                navigation={this.props.navigation}
                selected={(value) => this._selected(value)}
                bookId={(book_id,value) => this._bookId(book_id,value)}
                bookIndex={(index,status) => this._bookIndex(index,status)}
                iconStatus={this.state.iconStatus}
                authorized_key={this.authorized_key}
            />
        );
    }
    _bookIndex(index,status){
        status === 'selected' && this.indexArr.push(index);
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
            <ActivityIndicator
                animating={this.state.animating}
                style={{height:50,justifyContent:'center',alignItems:'center',backgroundColor:'#fff',marginBottom:-15}}
                size="small"
                color='#F8AD54'
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

        let data = this.state.data;
        let newIndexArr = _.uniq(this.indexArr);

        _.pullAt(data,newIndexArr);

        this.setState({
            data: data,
            allStatus: 'close',
            iconStatus: false,
            selectedStatusCount: 0,
            isLoadMore: false,
        });
        this.cacheReults.items = [];
        this.cacheReults.nextPage = 1;
        this.cacheReults.total = 0;

        Fecth.post(url,params,headers,(res) => {
            if(res.code === 0){
                this.refs.toast.show('删除成功！',600);
                this._requestData(1);
            }
        },(err) => {
            errorShow(err);
        });
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
    _selected(value){
        if(value === 'selected'){
            this.setState({
                selectedStatusCount:this.state.selectedStatusCount+1,
                allStatus: 'open',
            });
        }

        if(value === 'select'){
            this.setState({
                selectedStatusCount:this.state.selectedStatusCount-1,
            });
        }

        if(this.state.selectedStatusCount === 1){
            if(value === 'selected'){
                this.setState({allStatus: 'open'});
            }
            else{
                this.setState({allStatus: 'close'});
            }
        }
        this.setState({iconStatus: true});
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
        selected: PropTypes.func,
        navigation: PropTypes.object,
        bookIndex: PropTypes.func,
        index: PropTypes.number,
    };
    constructor(props){
        super(props);
        this.state = {
            selected: 'select',
        };
    }
    render(){
        let uri = RequestImage(this.props.book_id),
            book_id = this.props.book_id,
            book_id_hex = this.props.book_id_hex;

        return (
            <TouchableWithoutFeedback
                onPress={() => this._onPress(book_id,book_id_hex)}
                onLongPress={() => this._onLongPress(book_id,book_id_hex)}
            >
                <View style={styles.CollectBox}>
                    <View style={styles.CollectSubBox}>
                        {this.state.selected === 'selected' ? (
                            this.props.iconStatus ? (<View style={styles.CollectBookSelect}>
                                <Image source={Icon.iconBookSelect} style={styles.CollectBookSelectIcon}/>
                            </View>) : null
                        ) : null}
                        <View style={{maxWidth: 75,overflow: 'hidden',}}>
                            <Image source={{uri:uri}} style={styles.CollectImage} />
                            <Text style={styles.CollectBookTitle} numberOfLines={1}>{this.props.book_title}</Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
    _onPress(book_id,book_id_hex){
        let authorized_key = this.props.authorized_key;

        this.setState({selected: 'select'});
        this.props.bookId(book_id_hex,"select");
        this.state.selected === 'select' ? this.props.navigation.navigate('BookDetail',{
            hex_id: book_id_hex,
            id: book_id,
            authorized_key: authorized_key,
        }) : this.props.selected("select");
    }
    _onLongPress(book_id,book_id_hex){
        this.setState({selected: 'selected'});
        this.props.selected("selected");
        this.props.bookId(book_id_hex,"selected");
        this.props.bookIndex(this.props.index,this.state.selected);
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
        width: 18,
        height: 18,
        borderRadius: 18,
        position: 'absolute',
        right: 0,
        zIndex:2000,
        marginTop: 9,
        marginRight: 9,
        justifyContent: 'center',
        flexDirection: 'row'
    },
    CollectBookSelectIcon: {
        width: 18,
        height: 18
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



























