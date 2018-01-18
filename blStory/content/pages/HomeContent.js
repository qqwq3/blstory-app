
// 首页内容

import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Alert,
    Image,
    FlatList,
    RefreshControl,
    NetInfo,
} from 'react-native';
import _ from 'lodash';
import RequestImage from '../common/RequestImage';
import HomeMenu from './HomeMenu';
import { Api , Devices } from '../common/Api';
import Fecth from '../common/Fecth';
import Loading from '../common/Loading';
import { errorShow,networkCheck } from '../common/Util';

// 装饰点的颜色取值合集
const dotColor = {
    red: '#f53d5f',
    yellow: '#F8AD54',
    pruple: '#FF00FF',
    green: '#00FF00'
};

class HomeContent extends Component{
    constructor(props){
        super(props);
        this.state = {
            loadingStatus: false,
            data: [],
            refreshing: false,
            menuStyleListenr: false,
            isLoading: true,
            index: null,
        };
    }
    componentWillMount() {
        this._requestData();
    }
    shouldComponentUpdate(nextProps,nextState) {
        if(!_.isEqual(this.props,nextProps) || !_.isEqual(this.state,nextState)){
            return true;
        }
        else{
            return false;
        }
    }
    _requestData(){
        let url = Api.common + Api.category.eachTipList,
            params = '',
            headers = {'SESSION-ID': launchConfig.sessionID};

            Fecth.get(url,params,res => {
                if(res.code === 0){
                    let obj = res.data.promotions;
                    let data = [];

                    for(let key in obj){
                        data.push(obj[key]);
                    }

                    this.setState({
                        data: data,
                        refreshing: false,
                        isLoading: false,
                    });
                }
            },err => {
                this.setState({
                    refreshing: false,
                    isLoading: false,
                });
                errorShow(err);
            },headers);
    }
    _moreBooks(){
        const {navigate} = this.props.navigation;

        networkCheck((isConnected) => {
            navigate("MyLibrary",{user:{...this.props.user}});
            this.props.isConnected(isConnected);
        },(isConnected) => {
            this.props.isConnected(isConnected);
        });
    }
    _rowRenderItem = ({item,index}) => {
        let obj = item.objs,
            img = RequestImage(obj.book_ids),
            innerData = [];

        if(obj.books.length === 0){
            return <View/>;
        }

        obj.books.map((innerObj,innerIndex) => {
            innerIndex > 0 && innerData.push({key: innerIndex,subObjs:innerObj,imgArr:img[innerIndex]});
        });

        return (
            <View style={styles.box}>
                <View style={styles.boxHeader}>
                    <View style={[styles.boxBlodDot,{backgroundColor:dotColor.red}]}>
                    </View>
                    <Text style={styles.boxHeaderTitle}>{obj.title}</Text>
                    <TouchableWithoutFeedback onPress={() => this._moreBooks()}>
                        <View style={styles.moreTextBox}>
                            <Text style={styles.moreText}>更多</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>

                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => this._openDetails(obj.books[0].hex_id,obj.books[0].id)}
                >
                    <View style={styles.boxBody}>
                        <View style={[styles.bookBox,styles.bookBoxWH]}>
                            <Image source={{uri:img[0]}} style={[styles.bookBoxWH,{borderRadius:2}]}/>
                        </View>
                        <View style={styles.bookSection}>
                            <Text style={styles.bookSectionTitle}>{obj.books[0].title}</Text>
                            <Text style={styles.bookSectionAuthor}>{obj.books[0].author_name}</Text>
                            <Text style={styles.bookSectionText} numberOfLines={3}>
                                {obj.books[0].description ? obj.books[0].description : '暂无描述'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={styles.boxFooter}>
                    <FlatList
                        data={innerData}
                        renderItem={this._innerRenderItem}
                        numColumns={4}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
        );
    };
    _openDetails(hex_id,id){
        networkCheck((isConnected) => {
            this.props.navigation.navigate("BookDetail",{
                hex_id: hex_id,
                id: id,
                authorized_key: this.props.user.authorized_key,
            });
            this.props.isConnected(isConnected);
        },(isConnected) => {
            this.props.isConnected(isConnected);
        });
    }
    _innerRenderItem = ({item,index}) => {
        let obj = item.subObjs,
            img = item.imgArr;

        return (
            <TouchableWithoutFeedback onPress={() => this._openDetails(obj.hex_id,obj.id)}>
                <View style={styles.boxFooterLump}>
                    <View style={styles.bookSmallView}>
                        <Image source={{uri:img}} style={[styles.bookSmall,{borderRadius:2}]}/>
                    </View>
                    <Text style={styles.boxFooterText} numberOfLines={1}>{obj.title}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    };
    _menuSwitch(item,index){
        let types = item.key;
        let url = Api.common + Api.category.classifiedPage;
        let params = '/' +types;
        let { navigate } = this.props.navigation;

        networkCheck((isConnected) => {
            this.setState({
                index: index,
                isLoading: true
            });

            Fecth.get(url,params,(res) => {
                if(res.code === 0){
                    this.setState({
                        data: res.data,
                        menuStyleListenr: false,
                        isLoading: false,
                    });
                }
            },(err) => {
                errorShow(err);
            });

            this.props.isConnected(isConnected);
        },(isConnected) => {
            this.props.isConnected(isConnected);
        });
    }
    _refresh(){
        if(this.state.refreshing === true){
            return
        }

        this.setState({refreshing: true,menuStyleListenr: true});
        this._requestData();
    }
    render(){
        let rowRenderData = [],
            refreshing = this.state.refreshing,
            menuStyleListenr = this.state.menuStyleListenr;
        let data = this.state.data !== [] && this.state.data;

        data.map((obj,index) => {
            rowRenderData.push({key: index,objs: obj});
        });

        return (
            <View style={{flex: 1}}>
                <FlatList
                    data={rowRenderData}
                    renderItem={this._rowRenderItem}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    legacyImplementation={false}
                    ListHeaderComponent={
                        <HomeMenu
                            menuStyleListenr={menuStyleListenr}
                            menuSwitch={(item,index) => this._menuSwitch(item,index)}
                            index={this.state.index}
                        />
                    }
                    ListFooterComponent={
                        <View style={styles.noPrompt}>
                            <Text style={styles.noPromptText}>没有更多推荐了哦</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => this._refresh()}
                            tintColor='#f3916b'
                            colors={['#f3916b']}
                        />
                    }
                />
                <Loading opacity={0.60} show={this.state.isLoading}/>
            </View>
        );
    }
}

export default HomeContent;

const styles = StyleSheet.create({
    noPrompt: {
        flexDirection: 'row',
        overflow: 'hidden',
        height: 40,
        justifyContent: 'center'
    },
    noPromptText: {
        fontSize: 14,
        color: '#999999',
        textAlignVertical: 'center'
    },
    box: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        marginTop: 10
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
    },
    moreTextBox: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 15
    },
    moreText: {
        color: '#B2B2B2',
        fontSize: 12,
        alignSelf: 'center'
    },
    boxBody: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        paddingTop: 15,
        paddingBottom: 15,
        marginLeft: 15,
        marginRight: 15,
        borderBottomWidth: 1 / Devices.piexl,
        borderStyle: 'solid',
        borderBottomColor: '#E5E5E5'
    },
    bookBox: {
        elevation: 3,
        shadowColor: '#FBFBFB',
        shadowOffset: {width: 4,height: 3},
        shadowOpacity: 0.6,
        flexDirection: 'row',
    },
    bookBoxWH: {
        width: 75,
        height: 95
    },
    bookSection: {
        paddingLeft: 15,
        paddingRight: 15,
        flex: 1,
        flexDirection: 'column'
    },
    bookSectionTitle: {
        color: '#4C4C4C',
        fontSize: 15,
        marginBottom: 5
    },
    bookSectionAuthor: {
        color: '#808080',
        fontSize: 12,
        marginBottom: 5
    },
    bookSectionText: {
        color: '#808080',
        fontSize: 12,
        lineHeight: 18
    },
    boxFooter: {
        backgroundColor: '#FFFFFF',
        paddingBottom: 15,
    },
    boxFooterLump: {
        width: Devices.width / 4,
        paddingTop: 15
    },
    bookSmall: {
        width: 60,
        height: 76,
        borderRadius: 2,
        alignSelf: 'center'
    },
    bookSmallView:{
        elevation: 3,
        shadowOpacity:0.75,
        shadowColor: "#e5e5e5",
        shadowOffset: {width:4,height:3},
    },
    boxFooterText: {
        fontSize: 12,
        fontWeight: '100',
        color: '#4C4C4C',
        marginTop: 10,
        maxWidth: 60,
        textAlign: 'center',
        alignSelf: 'center'
    }
});

