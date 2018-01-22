
// 更多评论

import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
    TouchableWithoutFeedback,
    RefreshControl,
} from 'react-native';
import Toast from 'react-native-easy-toast';
import Loading from '../common/Loading';
import Icon from '../common/Icon';
import { Api,Devices } from "../common/Api";
import Fecth from '../common/Fecth';
import RequestImage from '../common/RequestImage';
import DateUtil from '../common/DateUtil';
import { errorShow,loginTimeout,networkCheck } from '../common/Util';

class BookDetailCommentsMore extends Component{
    constructor(props){
        super(props);
        this.state = {
            isLoading: true,
            isLoadMore: false,
            dataStatus: false,
            refreshing: false,
            returnTopStatus: false,

            likeCountArr: [],
            likeStatus: [],
        };
        this.book_id = this.props.navigation.state.params.book_id;
        this.authorized_key = this.props.navigation.state.params.authorized_key;
        this.cachedResults = {
            nextPage: 1,
            total: 0,
            items: [],
        };
        this.likeCountArr = [];
        this.likeStatus = [];
    }
    componentWillMount() {
        this._requestData(1);
    }
    _requestData(page){
        let url = Api.common + Api.category.comments;
        let params = "?book_id=" + this.book_id + '&limit=10' + '&page=' + page;
        let headers = {'SESSION-ID': launchConfig.sessionID};

        networkCheck(() => {
            Fecth.get(url,params,(res) => {
                if(res.code === 0){
                    let items = this.cachedResults.items.slice();
                    let countArr = this.likeCountArr.slice();
                    let statusArr = this.likeStatus.slice();

                    items = items.concat(res.data.records);

                    res.data.records.map((item) => {
                        countArr = countArr.concat(item.like_count);
                        statusArr = statusArr.concat(false);
                    });

                    this.likeCountArr = countArr;
                    this.likeStatus = statusArr;
                    this.cachedResults.items = items;
                    this.cachedResults.total = res.data.total_records;
                    this.cachedResults.nextPage += 1;
                    this.setState({
                        isLoading: false,
                        isLoadMore: false,
                        dataStatus: true,
                        refreshing: false,
                        likeCountArr: this.likeCountArr,
                        likeStatus: this.likeStatus,
                    });
                }
                else{
                    this.setState({
                        isLoading: false,
                        isLoadMore: false,
                        dataStatus: true,
                        refreshing: false,
                    });

                    loginTimeout(_ => {
                        this.props.navigation.navigate("Login");
                    });
                }
            },(err) => {
                this.setState({
                    isLoading: false,
                    isLoadMore: false,
                    dataStatus: true,
                    refreshing: false,
                });

                errorShow(err);
            },headers);
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    _renderItem({item,index}){
        let o = item.data;
        let user_uri = RequestImage(o.user_id,'avatar','64x64',false);

        return (
            <View style={styles.commentsRow}>
                <View style={styles.comments_left}>
                    <Image source={{uri:user_uri}} style={{width:30,height:30}} resizeMode={'contain'}/>
                </View>
                <View style={styles.comments_right}>
                    <View style={styles.comments_title}>
                        <Text style={{fontSize: 12,color: '#999999'}}>{o.user_name}</Text>
                    </View>
                    <View style={styles.comments_content}>
                        <Text style={{fontSize: 12,color: '#666666',lineHeight:17}}>
                            {o.content}
                        </Text>
                        <View style={styles.comments_date_dz}>
                            <View style={styles.comments_date}>
                                <Text style={{fontSize: 12,color: '#999999'}}>{DateUtil.formatDate(o.time_created*1000,'yyyy-MM-dd')}</Text>
                            </View>
                            <TouchableWithoutFeedback onPress={() => this._commentsClick(o.id,index)}>
                                <View style={styles.comtents_dz}>
                                    <Image source={Icon.iconLikeFinger} style={{width:14,height:14}} resizeMode={"contain"} />
                                    <View style={{marginLeft:5,marginBottom:-3}}><Text style={{fontSize: 12,color: '#999999'}}>{this.state.likeCountArr[index]}</Text></View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
    _ListFooterComponent(){
        if(this.cachedResults.items.length === this.cachedResults.total && this.cachedResults.total !== 0){
            return (
                <View style={{height:50,justifyContent:'center',alignItems:'center'}}>
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
                style={{height:50,justifyContent:'center',alignItems:'center',backgroundColor:'#fff'}}
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
        this._requestData(page);
    }
    _refresh(){
        this.setState({refreshing: true});
        this.cachedResults.items = [];
        this.cachedResults.total = 0;
        this.cachedResults.nextPage = 1;
        this._requestData(1);
    }
    _commentsClick(id,index){
        let authorized_key = this.authorized_key;
        let url = Api.common + Api.category.likeComment,
            params = Fecth.dictToFormData({comment_id: id}),
            headers = {'Authorized-Key': authorized_key,'SESSION-ID': launchConfig.sessionID};

        let likeCountArr = this.state.likeCountArr;
        let likeCount = this.state.likeCountArr[index] + 1;
        let likeStatus = this.state.likeStatus;

        if(likeStatus[index] === true){
            this.refs.toast.show('亲，这条评论你已经点过赞了哦！',600);
            return
        }

        likeStatus.splice(index,1,true);
        likeCountArr.splice(index,1,likeCount);

        this.setState({
            likeCountArr:likeCountArr,
            likeStatus:likeStatus
        });

        networkCheck(() => {
            Fecth.post(url,params,headers,res => {
                if(res.code === 0){
                    this.refs.toast.show('点赞成功！',600);
                }
                else{
                    loginTimeout(_ => {
                        this.props.navigation.navigate("Login");
                    });
                }
            },err => {
                errorShow(err);
            });
        },() => {
            this.props.navigation.navigate("NetWork");
        });
    }
    render(){
        let _data = this.cachedResults.items;
        let data = [];

        _data.map((items,index) => {
            data.push({key: index,data: items});
        });

        return (
            <View style={styles.cmContent}>
                {
                    this.state.dataStatus === true &&
                    <FlatList
                        data={data}
                        renderItem={this._renderItem.bind(this)}
                        showsVerticalScrollIndicator={false}
                        horizontal={false}
                        ListFooterComponent={this._ListFooterComponent.bind(this)}
                        onEndReached={this._fetchMoreData.bind(this)}
                        onEndReachedThreshold={0.2}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._refresh.bind(this)}
                                tintColor='#f3916b'
                                colors={['#f3916b']}
                            />
                        }
                    />
                }
                <Loading opacity={0.60} show={this.state.isLoading} />
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

export default BookDetailCommentsMore;

const styles = StyleSheet.create({
    cmContent:{
        flex: 1,
        backgroundColor: '#fff',
    },
    comtents_dz: {
        width: 120,
        height: 30,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1000,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingBottom: 3.5,
    },
    comments_date: {
        alignSelf: 'flex-end',
    },
    comments_date_dz: {
        flexDirection: 'row',
        height: 30,
        position: 'relative'
    },
    comments_title: {
        height: 30,
        alignItems: 'center',
        flexDirection: 'row'
    },
    comments_content: {
        flexWrap: 'wrap',
        flexDirection: 'column',
    },
    commentsRow: {
        flexDirection: 'row',
        overflow: "hidden",
        marginRight: 15,
        marginLeft: 15,
        borderBottomWidth: 1 / Devices.piexl,
        borderBottomColor: "#E5E5E5",
        borderStyle: 'solid',
        paddingBottom: 10,
        paddingTop: 10,
    },
    comments_left: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#CBCBCB',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 1 / Devices.width,
        borderStyle: 'solid',
        borderColor: '#F8AD54',
    },
    comments_right: {
        flex:1,
        overflow: 'hidden',
    },
});






















































