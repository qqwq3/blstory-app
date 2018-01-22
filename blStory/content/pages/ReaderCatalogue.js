
// 阅读章节目录

import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
    ListView,
    Image,
    ActivityIndicator
} from 'react-native';
import _ from 'lodash';
import { Devices,Api } from "../common/Api";
import ScrollableTabView from 'react-native-scrollable-tab-view';
import ChapterPartition from '../common/ChapterPartition';
import Loading from '../common/Loading';
import Fecth from '../common/Fecth';
import SelectChapterArea from './SelectChapterArea';
import Icon from '../common/Icon';
import { errorShow,loginTimeout,networkCheck } from '../common/Util';

class ReaderCatalogue extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            chapters: [],
            isLoading: true,
            page: 1,
            total_records: 0,
            totalPage:1,
            startIndex:0,
            endIndex:0,
            status: false,
            pop: false,
            bookMarkDataStatus: false,

            isLoadMore: false,
            bookMarkPage: 1,
            animating: true,
        };
        this.ds = new ListView.DataSource({rowHasChanged:(r1,r2) => r1 !== r2});
        this.authorized_key = this.props.authorizedKey;
        this.bookTitle = this.props.bookTitle;
        this.cachedResults = {
            nextPage: 1,
            items: [],
            total: 0,
        };
    }
    render(){
        return (
            <View style={styles.rcContainer}>
                <ScrollableTabView
                    renderTabBar={() => <ReaderCatalogueMenu/>}
                    tabBarInactiveTextColor={'#4c4c4c'}
                    tabBarActiveTextColor={'#f3916b'}
                    tabBarBackgroundColor={'#ffffff'}
                    locked={false}
                >
                    <View style={styles.rcBody} tabLabel={'目录'}>
                        <View style={styles.rcBodyHeader}>
                            <View><Text style={[styles.rcFont,{color: '#808080'}]}>共{this.state.total_records}章节</Text></View>
                            <TouchableOpacity onPress={() => this._openChapterSelect()} style={styles.rcBodyRowBut}>
                                <Text style={[styles.rcFont,{color: '#808080'}]}>{this.state.startIndex} ~ {this.state.endIndex} 章</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            style={[styles.rcBodyContent]}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            ref={ref => this._scrollViewRef = ref}
                        >
                            {
                                this.state.chapters.map((item,index) => {
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.rcBodyRow]}
                                            activeOpacity={0.75}
                                            onPress={() => this._toRead(item.hex_id,this.bookTitle)}
                                        >
                                            <Text style={styles.rcFont}>{item.title}</Text>
                                        </TouchableOpacity>
                                    );
                                })
                            }
                            <View style={styles.noPrompt}>
                                <Text style={styles.noPromptText}>没有更多章节了哦</Text>
                            </View>
                        </ScrollView>
                    </View>
                    <View style={styles.rcBody} tabLabel={'书签'}>
                        {
                            this.state.bookMarkDataStatus ? (
                                <ListView
                                    dataSource={this.ds.cloneWithRows(this.cachedResults.items)}
                                    renderRow={(rowData) => this._bookMark(rowData)}
                                    showsVerticalScrollIndicator={false}
                                    onEndReached={this._fetchMoreData.bind(this)}
                                    onEndReachedThreshold={40}
                                    enableEmptySections={true}
                                    automaticallyAdjustContentInsets={false}
                                    renderFooter={this._renderFooter.bind(this)}
                                />
                            ) : (
                                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                                    <View style={{justifyContent:'center',alignItems:'center'}}>
                                        <Image source={Icon.iconNoBookMark} resizeMode={'contain'} style={{marginBottom:30}} />
                                        <Text style={{fontSize:16,color:'#999999'}}>去找本书看看吧！</Text>
                                    </View>
                                </View>
                            )
                        }
                    </View>
                </ScrollableTabView>
                {
                    this.state.pop ? (
                        <SelectChapterArea
                            count={this.state.totalPage}
                            totalRecods={this.state.total_records}
                            closeChapterSelect={() => this._closeChapterSelect()}
                            changePage={(page) => this._changePage(page)}
                            page={this.state.page}
                        />
                    ) : null
                }
                <Loading opacity={0.80} show={this.state.isLoading} />
            </View>
        )
    }
    componentWillMount() {
        this._requestChapterListData(1);
        this._requestBookMarkData(1);
    }
    shouldComponentUpdate(nextProps,nextState) {
        if(!_.isEqual(this.props,nextProps) || !_.isEqual(this.state,nextState)){
            return true;
        }
        else{
            return false;
        }
    }
    componentWillUpdate(nextProps,nextState) {
        this._requestChapterListData(nextState.page);
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
    _fetchMoreData(){
        if(this.cachedResults.items.length === this.cachedResults.total || this.state.isLoadMore){
            return
        }

        let page = this.cachedResults.nextPage;
        this.setState({isLoadMore: true});
        this._requestBookMarkData(page);
    }
    _requestBookMarkData(page){
        let url = Api.common + Api.category.getBookReads,
            params = '?page='+ page + '&limit=15',
            headers = {"Authorized-Key": this.authorized_key,"SESSION-ID": launchConfig.sessionID};

        networkCheck(() => {
            Fecth.get(url,params,res => {
                if(res.code === 0){
                    let items = this.cachedResults.items.slice();
                    items = items.concat(res.data.records);

                    this.cachedResults.items = items;
                    this.cachedResults.total = res.data.total_records;
                    this.cachedResults.nextPage += 1;
                    this.setState({
                        bookMarkDataStatus: true,
                        isLoadMore: false,
                    });
                }
                else{
                    this.setState({
                        bookMarkDataStatus: true,
                        isLoadMore: false,
                    });

                    loginTimeout(_ => {
                        this.props.navigation.navigate("Login");
                    });
                }
            },err => {
                this.setState({
                    bookMarkDataStatus: true,
                    isLoadMore: false,
                });

                errorShow(err);
            },headers);
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    _requestChapterListData(page){
        let hex_id = this.props.hexId;
        let url = Api.common + Api.category.getChaptersPager,
            params = '?book_id=' + hex_id + '&page=' + page,
            headers = {"SESSION-ID": launchConfig.sessionID};

        networkCheck(() => {
            Fecth.get(url,params,res => {
                if(res.code === 0){
                    let chapter = ChapterPartition.noTraverse(res.data.total_records,page,100);

                    this.setState({
                        isLoading: false,
                        chapters: res.data.chapters,
                        total_records: res.data.total_records,
                        startIndex: chapter.startIndex,
                        endIndex: chapter.endIndex,
                        totalPage: chapter.totalPage,
                        status: true,
                    });
                }
                else{
                    this.setState({
                        isLoading: false,
                        status: true,
                    });

                    loginTimeout(_ => {
                        this.props.navigation.navigate("Login");
                    });
                }
            },err => {
                this.setState({
                    isLoading: false,
                    status: true,
                });

                errorShow(err);
            },headers);
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    _toRead(chapter_id,book_title){
        this.props.setChapterId(chapter_id,book_title);
    }
    _openChapterSelect(){
        this.setState({pop: true});
    }
    _closeChapterSelect(){
        this.setState({pop: false});
    }
    _changePage(page){
        this.setState({pop: false,isLoading: true,page: page});
        this._scrollViewRef.scrollTo({x: 0,y: 0,animated: false});
    }
    _bookMark(rowData){
        let chapter_id_hex = rowData.chapter_id_hex;
        let book_title = rowData.book_title;

        return (
            <View style={styles.rcBodyContent}>
                <TouchableOpacity
                    style={[styles.rcBodyRow,{height: 60,borderStyle:'solid'}]}
                    onPress={() => this._contiueRead(chapter_id_hex,book_title)}
                    activeOpacity={1}
                >
                    <View style={styles.rcBodyRowLeft}>
                        <View><Text style={styles.rcFont}>{rowData.book_title}</Text></View>
                        <View style={{flexDirection:'row'}}>
                            <View style={{marginRight:5}}><Text style={[styles.rcFont,{color:'#808080',fontSize:12}]}>已读至</Text></View>
                            <View style={{maxWidth:160}}>
                                <Text numberOfLines={1} style={[styles.rcFont,{color: '#808080',fontSize: 12}]}>{rowData.chapter_title}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.rcBodyRowBut}>
                        <Text style={[styles.rcFont,{color:'#808080'}]}>继续阅读</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    _contiueRead(chapter_id_hex,book_title){
        this.props.setChapterId(chapter_id_hex,book_title);
    }
}

// 自定义 - 切换菜单
class ReaderCatalogueMenu extends React.Component{
    render(){
        return (
            <View style={styles.rcHeader}>
                {
                    this.props.tabs.map((name,index) => {
                        let color = this.props.activeTab === index ? "#f3916b" : "#808080";
                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.75}
                                style={[styles.rcMenu,index === 0 && styles.rightBorder]}
                                onPress={() => this._tabSwifit(index)}
                            >
                                <Text style={[styles.rcMenuFont,{color:color}]}>{name}</Text>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        )
    }
    _tabSwifit(index){
        return this.props.goToPage(index);
    }
}

export default ReaderCatalogue;

const styles = StyleSheet.create({
    rightBorder: {
        borderRightWidth: 1 / Devices.piexl,
        borderRightColor: '#e5e5e5',
        borderStyle: 'solid',
    },
    noPrompt: {
        flexDirection: 'row',
        overflow: 'hidden',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noPromptText: {
        fontSize: 14,
        color: '#999999',
    },
    rcFont: {
        fontSize: 13,
        color: '#4C4C4C',
    },
    rcRightBorder: {
        borderRightColor: '#e5e5e5',
        borderRightWidth: 1 / Devices.piexl,
        borderStyle: 'solid',
    },
    rcContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
    },
    rcHeader: {
        height: 50,
        borderBottomColor: '#e5e5e5',
        borderBottomWidth: 1 / Devices.piexl,
        borderStyle: 'solid',
        overflow: 'hidden',
        flexDirection: 'row',
        paddingTop: 10,
    },
    rcMenu: {
        height: 30,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rcMenuFont: {
        fontSize: 15,
        color: '#808080',
    },
    rcBody: {
        overflow: 'hidden',
        paddingRight: 10,
        paddingLeft: 10,
        flexDirection: 'column',
        flex: 1,
    },
    rcBodyHeader: {
        height: 50,
        justifyContent: 'space-between',
        flexDirection: 'row',
        overflow: 'hidden',
        alignItems: 'center',
    },
    rcBodyRowBut: {
        height: 30,
        borderWidth: 1 / Devices.piexl,
        borderStyle: 'solid',
        borderColor: '#808080',
        borderRadius: 2,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 6,
        paddingRight: 6,
    },
    rcBodyContent: {
        flex: 1,
    },
    rcBodyRow: {
        height: 40,
        borderBottomColor: '#dcdcdc',
        borderBottomWidth: 1 / Devices.piexl,
        borderStyle : 'dashed',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

























