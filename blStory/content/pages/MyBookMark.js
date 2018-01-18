// 我的书签

import React,{ Component } from 'react';
import {
    Alert,
    View,
    Text,
    ListView,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TouchableHighlight,
    TouchableWithoutFeedback,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import Toast from 'react-native-easy-toast';
import { Devices,Api } from "../common/Api";
import Loading from '../common/Loading';
import Fecth from '../common/Fecth';
import Icon from '../common/Icon';
import RequestImage from '../common/RequestImage';
import { errorShow } from '../common/Util';

class MyBookMark extends Component{
    constructor(props){
        super(props);
        this.state={
            dataStatus: false,
            isLoading: true,
            isLoadMore: false,
            data: [],
        };
        this.authorized_key = this.props.navigation.state.params.authorized_key;
        this.ds = new ListView.DataSource({rowHasChanged:(r1,r2) => r1 !== r2});
        this.cachedResults = {
            nextPage: 1,
            items: [],
            total: 0,
        };
    }
    componentWillMount(){
        this._requestData(1);
    }
    _requestData(page){
        let url = Api.common + Api.category.getBookReads,
            params = '?page='+ page +'&limit=8',
            headers = {'Authorized-Key': this.authorized_key,'SESSION_ID': launchConfig.sessionID};

        Fecth.get(url,params,res => {
            if(res.code === 0){
                let items = this.cachedResults.items.slice();
                items = items.concat(res.data.records);

                this.cachedResults.items = items;
                this.cachedResults.total = res.data.total_records;
                this.cachedResults.nextPage += 1;
                this.setState({
                    dataStatus: true,
                    isLoading: false,
                    isLoadMore: false,
                    data: items,
                });
            }

            if(res.code === 404){
                this.setState({
                    dataStatus: false,
                    isLoading: false,
                    isLoadMore: false,
                });
            }
        },err => {
            this.setState({
                dataStatus: false,
                isLoading: false,
                isLoadMore: false,
            });
            errorShow(err);
        },headers);
    }
    _deleteRow(item, secId, rowId, rowMap) {
        let book_id_hex = item.book_id_hex;
        let url = Api.common + Api.category.bookReadDelete,
            params = Fecth.dictToFormData({book_id: book_id_hex}),
            headers = {'Authorized-Key': this.authorized_key,"SESSION-ID": launchConfig.sessionID};

        rowMap[`${secId}${rowId}`].closeRow();
        const newData = [...this.state.data];
        newData.splice(rowId, 1);
        this.setState({data: newData});
        this.cachedResults.items = [];
        this.cachedResults.nextPage = 1;
        this.cachedResults.total = 0;

        Fecth.post(url,params,headers,res => {
            if(res.code === 0){
                this.refs.toast.show('删除成功！',1000);
                this._requestData(1);
            }
        },err => {
            errorShow(err);
        });
    }
    _renderHiddenRow(data, secId, rowId, rowMap){
        return (
            <View style={styles.BookMarkBoxDeRowBack}>
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => this._deleteRow(data, secId, rowId, rowMap)}
                >
                    <View style={styles.BookMarkBoxDel}>
                        <Text style={styles.BookMarkBoxDelText}>删除</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    _renderRow(item, secId, rowId, rowMap){
        let uri = RequestImage(item.book_id),
            chapter_id_hex = item.chapter_id_hex,
            book_title = item.book_title,
            book_id_hex = item.book_id_hex;

        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => this._continueRead(chapter_id_hex,book_title,book_id_hex)}
            >
                <View style={{backgroundColor: '#FFF'}}>
                    <View style={styles.BookMarkBox}>
                        <Image style={styles.BookMarkImage} source={{uri:uri}}/>
                        <View style={styles.BookMarkMassage}>
                            <Text style={styles.BookMarkTitle} numberOfLines={1}>{item.book_title}</Text>
                            <View style={[styles.BookMarkNew]}>
                                <View style={{marginRight: 5}}>
                                    <Text style={[styles.BookFont,{color:'#F8AD54'}]}>我的进度</Text>
                                </View>
                                <View style={{maxWidth:195}}>
                                    <Text style={[styles.BookFont,{color:'#F8AD54'}]} numberOfLines={1}>{item.chapter_title}</Text>
                                </View>
                            </View>
                            <View style={[styles.BookMarkNew]}>
                                <View style={{marginRight: 5}}><Text style={styles.BookFont}>最新章节</Text></View>
                                <View style={{maxWidth:195}}><Text style={styles.BookFont} numberOfLines={1}>{item.latest_chapter.title}</Text></View>
                            </View>
                            <View style={[styles.BookMarkNew]}>
                                <View style={{marginRight: 5}}><Text style={styles.BookFont}>{item.author_name}</Text></View>
                                <View><Text style={styles.BookFont}>{item.total_likes}人在阅读</Text></View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    _continueRead(chapter_id_hex,book_title,book_id_hex){
        let authorized_key = this.authorized_key;

        this.props.navigation.navigate('Reader',{
            chapter_id: chapter_id_hex,
            hex_id: book_id_hex,
            authorized_key: authorized_key,
            readerStatus: 'indirect',
            book_title: book_title,
        });
    }
    _fetchMoreData(){
        if(this.cachedResults.items.length === this.cachedResults.total || this.state.isLoadMore){
            return
        }

        let page = this.cachedResults.nextPage;
        this.setState({isLoadMore: true});
        this._requestData(page);
    }
    _renderFooter(){
        if(this.cachedResults.items.length === this.cachedResults.total && this.cachedResults.total !== 0){
            return (
                <View style={{height:40,justifyContent:'center',alignItems:'center'}}>
                    <Text style={{fontSize: 14,color: '#999999'}}>没有更多了哦</Text>
                </View>
            );
        }

        if(!this.state.isLoadMore){
            return null;
        }

        return (
            <ActivityIndicator
                animating={this.state.animating}
                style={{height:40,justifyContent:'center',alignItems:'center'}}
                size="small"
                color='#F8AD54'
            />
        );
    }
    render(){
        return (
            <View style={{flex:1}}>
                {
                    this.state.dataStatus ? (
                        <View style={styles.BookMarkContent}>
                            <SwipeListView
                                dataSource={this.ds.cloneWithRows(this.state.data)}
                                renderRow={(item, secId, rowId, rowMap) => this._renderRow(item, secId, rowId, rowMap)}
                                renderHiddenRow={(data, secId, rowId, rowMap) => this._renderHiddenRow(data, secId, rowId, rowMap)}
                                rightOpenValue={-90}
                                disableRightSwipe={true}
                                tension={0}
                                friction={20}
                                previewOpenValue={1}
                                showsVerticalScrollIndicator={false}
                                enableEmptySections={true}
                                automaticallyAdjustContentInsets={false}
                                onEndReached={this._fetchMoreData.bind(this)}
                                onEndReachedThreshold={40}
                                renderFooter={this._renderFooter.bind(this)}
                            />
                        </View>
                    ) : (
                        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                            <View style={{justifyContent:'center',alignItems:'center'}}>
                                <Image source={Icon.iconNoBookMark} resizeMode={'contain'} style={{marginBottom:30}} />
                                <Text style={{fontSize:18,color:'#999999'}}>去找本书看看吧！</Text>
                            </View>
                        </View>
                    )
                }
                <Loading opacity={1} show={this.state.isLoading} />
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
}

export default MyBookMark;

const styles = StyleSheet.create({
    backTextWhite: {
        color: '#FFF'
    },
    standaloneRowFront: {
        alignItems: 'center',
        backgroundColor: '#CCC',
        justifyContent: 'center',
        height: 50,
    },
    standaloneRowBack: {
        alignItems: 'center',
        backgroundColor: '#8BC645',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15
    },


    BookMarkProgress: {
        flex: 1,
        fontSize: 12,
        color: '#f3916b',
        flexDirection: 'row',
        flexWrap: 'nowrap'
    },
    BookFont: {
        fontSize: 12,
        color: '#808080',
    },
    BookMarkNew: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'nowrap',
        marginRight: 15,
        height: 25,
        alignItems: 'center',
        overflow: 'hidden',
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
    BookMarkTitle: {
        fontSize: 15,
        color: '#4C4C4C',
        flex: 2
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
        borderBottomWidth: 1 / Devices.piexl,
        borderBottomColor: '#E5E5E5',
        borderStyle: 'solid',
        flexDirection: 'row'
    },
    BookMarkBoxDel: {
        width: 90,
        flexDirection: 'row',
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center'
    },
    BookMarkBoxDelText: {
        color: '#FFFFFF',
        fontSize: 17,

    },
    BookMarkBoxDeRowBack: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: '#f8525a'
    }
});
