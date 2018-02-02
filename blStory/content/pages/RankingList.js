
// 排行榜

import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import ImageLoad from 'react-native-image-placeholder';
import PropTypes from 'prop-types';
import RankingTabBar from './RankingTabBar';
import { Api,Devices } from "../common/Api";
import RequestImage from '../common/RequestImage';
import Fecth from '../common/Fecth';
import Loading from '../common/Loading';
import { errorShow,loginTimeout,networkCheck } from '../common/Util';
import Icon from '../common/Icon';

class RankingList extends Component{
    constructor(props){
        super(props);
        this.state = {
            tabNames: ['点击榜', '收藏榜', '新书榜', '完结榜'],
            tabStatusValue: ["total_hits","total_likes","total_present_amount","finish"],
            switchStatus: false
        };
        this.authorized_key = this.props.navigation.state.params.user.authorized_key;
        this.data = {
            total_hits: [],
            total_likes: [],
            total_present_amount: [],
            finish: []
        };
    }
    componentWillMount() {
        const { tabStatusValue } = this.state;
        this._grabStructure(tabStatusValue);
    }
    render(){
        const { tabStatusValue,tabNames,isLoading } = this.state;

        return (
            <View style={styles.RankingListConent}>
                <ScrollableTabView
                    renderTabBar={() => <RankingTabBar/>}
                    initialPage={0}
                    tabBarInactiveTextColor={'#4c4c4c'}
                    tabBarActiveTextColor={'#f3916b'}
                    tabBarBackgroundColor={'#ffffff'}
                    locked={false}
                    scrollWithoutAnimation={false}
                    prerenderingSiblingsNumber={3}
                >
                    {
                        tabNames.map((name,key) => {
                            return (
                                <ScrollView
                                    style={styles.content}
                                    key={key}
                                    tabLabel={name}
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                    ref={'scrollView'}
                                >
                                    {
                                        this.data[tabStatusValue[key]].map((obj,index) => {
                                            return this._renderItem(obj,index);
                                        })
                                    }
                                    <RankingListFooter text={'没有更多排行了哦'}/>
                                </ScrollView>
                            )
                        })
                    }
                </ScrollableTabView>
                <Loading opacity={0.60} show={isLoading} />
            </View>
        );
    }
    _grabStructure(args){
        let url = Api.common + Api.category.rankingList,
            headers = {'SESSION-ID': launchConfig.sessionID,'Authorized-Key': this.authorized_key};
        const { navigate } = this.props.navigation;

        args.map((obj,index) => {
            let params = "?sort_by=" + obj;
            this._requestData(url,params,headers,navigate,index);
        });
    }
    _requestData(url,params,headers,navigate,index){
        networkCheck(() => {
            Fecth.get(url,params,(res) => {
                // 请求成功
                if(res.code === 0){
                    this._assignment(index,res.data);
                    this.setState({isLoading: false});
                }

                //登录超时
                if(res.code === 401){
                    loginTimeout(_ => {navigate("Login")});
                    this.setState({isLoading: false});
                }

                // 无数据
                if(res.code === 404){
                    this.setState({isLoading: false});
                    // 待处理
                }
            },(err) => {
                errorShow(err);
            },headers);
        },() => {navigate("NetWork")});
    }
    _assignment(index,data){
        switch (index){
            case 0: // 点击榜
                let total_hits = this.data.total_hits.slice();
                if(total_hits && total_hits.length === 0){
                    total_hits = data;
                    this.data.total_hits = total_hits;
                }
                break;

            case 1: // 收藏榜
                let total_likes = this.data.total_likes.slice();
                if(total_likes && total_likes.length === 0){
                    total_likes = data;
                    this.data.total_likes = total_likes;
                }
                break;

            case 2: // 新书榜
                let total_present_amount = this.data.total_present_amount.slice();
                if(total_present_amount && total_present_amount.length === 0){
                    total_present_amount = data;
                    this.data.total_present_amount = total_present_amount;
                }
                break;

            case 3: // 完结榜
                let finish = this.data.finish.slice();
                if(finish && finish.length === 0){
                    finish = data;
                    this.data.finish = finish;
                }
                break;
        }
    }
    _renderItem(item,index){
        let obj = item,
            id = obj.id,
            hex_id = obj.hex_id,
            uri = RequestImage(id),

            iconGateway = index < 3
            ? index===0 && require('../images/iconGateway1.png')
            || index===1 && require('../images/iconGateway2.png')
            || index===2 && require('../images/iconGateway3.png')
            : require('../images/iconGateway4.png');

        return (
            <TouchableOpacity
                key={index}
                style={styles.boxBody}
                activeOpacity={0.75}
                onPress={() => this._openDetails(hex_id,id)}
            >
                <View style={[styles.bookBox,styles.bookBoxWH]}>
                    <ImageLoad
                        source={{uri: uri}}
                        style={[styles.bookBoxWH,{
                            borderRadius: 2,
                            borderWidth: 0.25,
                            borderColor: '#ccc'}]
                        }
                        isShowActivity={false}
                        customImagePlaceholderDefaultStyle={styles.bookBoxWH}
                        borderRadius={2}
                        placeholderSource={Icon.iconBookDefaultBig}
                    />
                </View>
                <View style={styles.bookSection}>
                    <View style={styles.btHeader}>
                        <Text style={styles.bookSectionTitle}>{obj.title}</Text>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={[styles.rankNumber,index > 8 ? styles.left1 : styles.left2]}>{index + 1}</Text>
                            <Image source={iconGateway} style={{width:19,height:14}} />
                        </View>
                    </View>
                    <View style={[styles.bookSectionBase]}>
                        <View style={styles.basic}>
                            <Text style={[styles.font,{flex:1}]}>{obj.author_name}</Text>
                            <Text style={[styles.font,{flex:1}]}>{obj.category_name}</Text>
                        </View>
                        <View style={styles.ready}><Text style={styles.font}>{obj.total_likes}人在阅读</Text></View>
                    </View>
                    <View style={{paddingRight: 15}}>
                        <Text style={[styles.bookSectionText,styles.font]} numberOfLines={3}>
                            {obj.description}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    _openDetails(hex_id,id){
        let authorized_key = this.authorized_key;
        const {navigate} = this.props.navigation;

        networkCheck(() => {
            navigate("BookDetail",{
                hex_id: hex_id,
                id: id,
                authorized_key: authorized_key,
            });
        },() => {navigate("NetWork")});
    }
}

// 定义一个尾部组件
class RankingListFooter extends Component{
    static propTypes = {
        text: PropTypes.string
    };
    static defaultProps = {
        text: '没有更多了哦'
    };
    render(){
        return (
            <View style={styles.promptBox}>
                <Text style={styles.promptText}>{this.props.text}</Text>
            </View>
        );
    }
}

export default RankingList;

const styles = StyleSheet.create({
    left1: {
        left: 4.2
    },
    left2: {
        left: 7
    },
    promptBox: {
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
    },
    promptText: {
        fontSize: 14,
        color: '#c4c4c4'
    },
    content: {
        backgroundColor: '#ffffff',
        flex: 1
    },
    rankNumber: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: 'bold',
        position: 'absolute',
        zIndex: 100,
        left: 7,
        top: 2.8
    },
    btHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    basic: {
        flex: 1,
        flexDirection: 'row'
    },
    ready: {
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        overflow: 'hidden'
    },
    font: {
        color: '#808080',
        fontSize: 12
    },
    RankingListConent: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFFFFF'
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
        borderBottomColor: '#E5E5E5',
        overflow:'visible',
    },
    bookBox: {
        // elevation: 3,
        // shadowColor: '#FBFBFB',
        // shadowOffset: {width: 4,height: 3},
        // shadowOpacity: 0.6,
        // borderRadius: 2,
        flexDirection: 'row'
    },
    bookBoxWH: {
        width: 75,
        height: 95
    },
    bookSection: {
        paddingLeft: 15,
        paddingRight: 0,
        flex: 1,
        flexDirection: 'column'
    },
    bookSectionTitle: {
        color: '#4C4C4C',
        fontSize: 15,
        marginBottom: 5
    },
    bookSectionBase: {
        marginBottom: 5,
        flexDirection: 'row'
    },
    bookSectionText: {
        lineHeight: 18,
        textAlign: 'left'
    },
    boxFooter: {
        backgroundColor: '#FFFFFF',
        paddingTop: 15,
        paddingBottom: 15,
        flexDirection: 'row',
        overflow: 'hidden'
    }
});




























