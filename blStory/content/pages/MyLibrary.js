
// 我的书库

import React,{ Component } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity,
    FlatList,
    SectionList,
    RefreshControl,
    ListView,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import Toast from 'react-native-easy-toast';
import DrawerJsx from './DrawerJsx';
import DrawerPageMenu from './DrawerPageMenu';
import HomeHeader from './HomeHeader';
import Fecth from '../common/Fecth';
import { Api,Devices } from "../common/Api";
import LibrayMenu from './LibraryMenu';
import RequestImage from '../common/RequestImage';
import Loading from '../common/Loading';
import NetWork from './NetWork';
import { errorShow,networkCheck } from '../common/Util';

class MyLibrary extends Component{
    constructor(props){
        super(props);
        this.state = {
            data: [],
            refreshing: false,
            returnTopStatus: false,

            isLoading: true,
            isLoadMore: false,
            cateSwitchIndex: 0,
            cateProgressIndex: 0,

            page: 1,
            cateId: 0,
            status: 1,
            name: null,

            balance: 0,
            isConnected: true,
        };
        this.ds = new ListView.DataSource({rowHasChanged:(r1,r2) => r1 !== r2});
        this.user = this.props.navigation.state.params.user;
        this.cachedResults = {
            nextPage: 1,
            items: [],
            total: 0,
        };
    }
    componentWillMount() {
        this._requestData(1,0,1,null,'auto');
    }
    componentDidMount(){
        this._keyboardHide = Keyboard.addListener('keyboardDidHide',this._keyboardDidHideHandler.bind(this));
    }
    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
        this.balanceTimer && clearTimeout(this.balanceTimer);

        // 卸载键盘隐藏事件监听
        this._keyboardHide !== null && this._keyboardHide.remove();
    }
    render(){
        const { navigate } = this.props.navigation;
        const { isConnected } = this.state;

        let user = this.user,
            authorized_key = user.authorized_key;

        return (
            <View style={{flex:1}}>
                {
                    isConnected ? (
                        <DrawerJsx
                            side="left"
                            open={false}
                            tapToClose={true}
                            type='overlay'
                            openDrawerOffset={0.3}
                            closedDrawerOffset={0}
                            style={styles.drawer}
                            tweenDuration={250}
                            elevation={4}
                            ref={'drawer'}
                            content={
                                <DrawerPageMenu
                                    openWay='skipClose'
                                    onPress={(router) => navigate(router,{user: user,searchStatus: false})}
                                    closeDrawer={() => this._closeControlPanel()}
                                    navigation={this.props.navigation}
                                    logout={() => this._logout()}
                                    user={user}
                                    balance={this.state.balance}
                                    isConnected={this._isConnected.bind(this)}
                                />
                            }
                        >
                            <HomeHeader
                                openDrawer={() => this._openControlPanel()}
                                goMyCollect={() => this._goMyCollect(authorized_key)}
                                goMyBookMark={() => this._goMyBookMark(authorized_key)}
                                navigation={this.props.navigation}
                                status={false}
                                search={(value) => this._search(value)}
                                ref={'textInput'}
                            />
                            <ListView
                                dataSource={this.ds.cloneWithRows(this.state.data)}
                                renderRow={(item) => this._renderRow(item)}
                                showsVerticalScrollIndicator={false}
                                onEndReached={this._fetchMoreData.bind(this)}
                                onEndReachedThreshold={50}
                                automaticallyAdjustContentInsets={false}
                                renderHeader={this._renderHeader.bind(this)}
                                renderFooter={this._renderFooter.bind(this)}
                                enableEmptySections={true}
                                ref={ref => this._listViewRef = ref}
                                onScroll={this._onScroll.bind(this)}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this._refresh.bind(this)}
                                        tintColor='#f3916b'
                                        colors={['#f3916b']}
                                    />
                                }
                            />
                            <Toast
                                ref="toast"
                                position={'center'}
                                fadeInDuration={750}
                                fadeOutDuration={1000}
                                opacity={0.8}
                                style={{backgroundColor:'#000000'}}
                                textStyle={{fontSize:14,color:'#fff'}}
                            />
                            <Loading opacity={0.6} show={this.state.isLoading}/>
                            {
                                this.state.returnTopStatus ?
                                    <TouchableOpacity onPress={() => this._returnTop()} style={styles.zdBox}>
                                        <Text style={styles.zdBoxFont}>返回</Text>
                                        <Text style={styles.zdBoxFont}>顶部</Text>
                                    </TouchableOpacity>
                                    : null
                            }
                        </DrawerJsx>
                    ) : (
                        <NetWork
                            headerStatus={false}
                            refreshNetwork={() => this._refreshNetwork()}
                        />
                    )
                }
            </View>
        );
    }
    _keyboardDidHideHandler(){
        this.refs['textInput']._textInputBlur();
    }
    _isConnected(isConnected){
        this.setState({isConnected:isConnected});
    }
    _refreshNetwork(){
        networkCheck((isConnected) => {
            this.setState({isConnected:isConnected});
        },(isConnected) => {
            this.setState({isConnected:isConnected});
        });
    }
    _requestUserBalance(){
        let url = Api.common + Api.category.userBalance;
        let authorized_key = this.user.authorized_key;
        let params = '';
        let headers = {'Authorized-Key': authorized_key,"SESSION-ID": launchConfig.sessionID};

        Fecth.get(url,params,res => {
            if(res.code === 0){
                this.setState({balance: res.data.balance});
            }
        },err => {
            errorShow(err);
        },headers);
    }
    _requestData(page, cateId, status, name, dataModel){
        let url = Api.common + Api.category.classifiy,
            params = "page=" + page + '&category_id=' + cateId + '&status=' + status + '&book_name=' + name + '&limit=8',
            headers = {"SESSION-ID": launchConfig.sessionID};

        Fecth.get(url,params,res => {
            if(res.code === 0){
                this.cachedResults.total = res.data.total_records;
                this.cachedResults.nextPage += 1;

                if(dataModel === 'auto'){
                    let items = this.cachedResults.items.slice();
                    items = items.concat(res.data.records);

                    this.cachedResults.items = items;
                    this.setState({data: this.cachedResults.items});
                }

                if(dataModel === 'other'){
                    let items = this.cachedResults.items.slice();
                    items = res.data.records;

                    this.cachedResults.items = items;
                    this.setState({data: res.data.records});
                }

                this.setState({
                    isLoadMore: false,
                    isLoading: false,
                    refreshing: false,
                });
            }
        },err => {
            this.setState({
                isLoadMore: false,
                isLoading: false,
                refreshing: false,
            });
            errorShow(err);
        },headers);
    }
    _closeControlPanel(){
        this.refs['drawer'].closeControlPanel();
    }
    _openControlPanel(){
        networkCheck((isConnected) => {
            this.balanceTimer = setTimeout(() => {
                this.refs['drawer'].openControlPanel();
            },250);

            this._requestUserBalance();
            this.setState({isConnected:isConnected});
        },(isConnected) => {
            this.setState({isConnected:isConnected});
        });
    }
    _goMyCollect(authorized_key){
        networkCheck((isConnected) => {
            this.props.navigation.navigate("MyCollect",{
                authorized_key: authorized_key
            });
            this.setState({isConnected:isConnected});
        },(isConnected) => {
            this.setState({isConnected:isConnected});
        });
    }
    _goMyBookMark(authorized_key){
        networkCheck((isConnected) => {
            this.props.navigation.navigate("MyBookMark",{
                authorized_key: authorized_key
            });
            this.setState({isConnected:isConnected});
        },(isConnected) => {
            this.setState({isConnected:isConnected});
        });
    }
    _logout(){
        this.refs.toast.show('退出成功！',600);
        this.timer = setTimeout(() => {
            this.props.navigation.navigate('Login');
        },600);
    }
    _onScroll(e){
        let y = e.nativeEvent.contentOffset.y;
        y > 0 ? this.setState({returnTopStatus:true}) : this.setState({returnTopStatus:false});
    }
    _refresh(){
        this.cachedResults.nextPage = 1;
        this.setState({
            refreshing: true,
            page: 1,
            cateId: 0,
            status: 1,
            name: null,
            isLoadMore: false,
            cateSwitchIndex: 0,
            cateProgressIndex: 0,
        });
        this.refs['textInput']._clearTextInput();
        this.refs['textInput']._textInputBlur();
        this._requestData(1,0,1,null,'other');
    }
    _fetchMoreData(){
        if(this.cachedResults.items.length === this.cachedResults.total || this.state.isLoadMore){
            return
        }

        let page = this.cachedResults.nextPage;
        let cateId = this.state.cateId;
        let status = this.state.status;
        let name = this.state.name;

        this.setState({isLoadMore: true,isLoading: false});
        this._requestData(page,cateId,status,name,'auto');
    }
    _returnTop(){
        this._listViewRef.scrollTo({x: 0, y: 0, animated: true});
        this.refs['textInput']._textInputBlur();
    }
    _renderHeader(){
        return (
            <LibrayMenu
                cateSwitchIndex={this.state.cateSwitchIndex}
                cateProgressIndex={this.state.cateProgressIndex}
                cateSwitch={(id,index) => this._cateSwitch(id,index)}
                cateProgress={(index) => this._cateProgress(index)}
            />
        );
    }
    _cateSwitch(id,index){
        let page = 1;
        let cateId = id;
        let status = this.state.status;
        let name = this.state.name;

        this.setState({
            cateSwitchIndex: index,
            cateId: id,
            isLoading: true,
        });
        this.cachedResults.nextPage = page;
        this._requestData(page,cateId,status,name,'other');
    }
    _cateProgress(index){
        let page = 1;
        let cateId = this.state.cateId;
        let status = index;
        let name = this.state.name;

        this.setState({
            cateProgressIndex: index,
            status: index,
            isLoading: true,
        });
        this.cachedResults.nextPage = page;
        this._requestData(page,cateId,status,name,'other');
    }
    _search(name){
        let page = 1;
        let cateId = this.state.cateId;
        let status = this.state.status;

        this.setState({
            name: name,
            isLoading: true,
        });
        this.cachedResults.nextPage = page;
        this._requestData(page,cateId,status,name,'other');
    }
    _renderFooter(){
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
    _renderRow(item){
        let uri = RequestImage(item.id);

        return (
            <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => this._openDetails(item.hex_id,item.id)}
            >
                <View style={{backgroundColor: '#FFF'}}>
                    <View style={[styles.BookMarkBox,styles.menuInnerBottomBorder]}>
                        <Image style={styles.BookMarkImage} source={{uri:uri}}/>
                        <View style={styles.BookMarkMassage}>
                            <Text style={styles.BookMarkTitle} numberOfLines={1}>{item.title}</Text>
                            <View style={[styles.BookMarkNew]}>
                                <View style={{marginRight: 5}}><Text style={styles.BookFont}>最新章节</Text></View>
                                <View style={{maxWidth:193}}>
                                    <Text style={styles.BookFont} numberOfLines={1}>{item.latest_chapter.title}</Text>
                                </View>
                            </View>
                            <View style={[styles.BookMarkNew]}>
                                <View style={{marginRight: 5}}><Text style={styles.BookFont}>{item.author.name}</Text></View>
                                <View><Text style={styles.BookFont}>{item.total_likes}人在阅读</Text></View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    _openDetails(hex_id,id){
        this.props.navigation.navigate("BookDetail",{
            hex_id: hex_id,
            id: id,
            authorized_key: this.user.authorized_key,
        });
    }
}

export default MyLibrary;

const styles = StyleSheet.create({
    zdBoxFont:{
        fontSize:12,
        color:'#fff',
    },
    zdBox:{
        position: 'absolute',
        zIndex: 1000,
        width: 55,
        height: 55,
        backgroundColor: 'rgba(0,0,0,0.60)',
        borderRadius: 60,
        bottom: 15,
        right: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuInnerBottomBorder: {
        borderBottomColor: '#E5E5E5',
        borderStyle: 'solid',
        borderBottomWidth: 1 / Devices.piexl
    },
    drawer: {
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowOpacity: 0.8,
        shadowRadius: 3,
    },
    BookFont: {
        fontSize: 12,
        color: '#808080',
    },
    BookMarkImage: {
        width: 75,
        height: 95,
        borderRadius: 2
    },
    BookMarkMassage: {
        flex: 1,
        marginLeft: 15,
        flexDirection: 'column'
    },
    BookMarkTitle: {
        fontSize: 15,
        color: '#4C4C4C',
        flex: 2
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
    BookMarkBox: {
        marginLeft: 15,
        paddingTop: 15,
        paddingBottom: 15,
        flexDirection: 'row'
    }
});
















