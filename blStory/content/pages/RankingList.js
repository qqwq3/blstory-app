
// 排行榜

import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    FlatList
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import RankingTabBar from './RankingTabBar';
import { Api,Devices } from "../common/Api";
import RequestImage from '../common/RequestImage';
import Fecth from '../common/Fecth';
import Loading from '../common/Loading';
import { errorShow } from '../common/Util';

class RankingList extends Component{
    constructor(props){
        super(props);
        this.state = {
            tabNames: ['点击榜', '收藏榜', '新书榜', '完结榜'],
            tabStatusValue: ["total_hits","total_likes","total_present_amount","finish"],
            listData: [],
            isLoading: true,
        }
    }
    componentWillMount() {
        let tabStatusValue = this.state.tabStatusValue;
        this._requestData(tabStatusValue[0]);
    }
    render(){
        let tabNames = this.state.tabNames,
            _data = [],
            tabStatusValue = this.state.tabStatusValue;
        this.state.listData.map((obj,i) => {
            _data.push({key: i,obj: obj});
        });

        return (
            <View style={styles.RankingListConent}>
                <ScrollableTabView
                    renderTabBar={() => <RankingTabBar
                        tabStatusValue={tabStatusValue}
                        requestData={(args) => this._requestData(args)}
                    />}
                    tabBarInactiveTextColor={'#4c4c4c'}
                    tabBarActiveTextColor={'#f3916b'}
                    tabBarBackgroundColor={'#ffffff'}
                    locked={true}
                >
                    {
                        this.state.tabNames.map((name,key) => {
                            return (
                                <View style={styles.content} key={key} tabLabel={name}>
                                    <FlatList
                                        data={_data}
                                        renderItem={this._renderItem}
                                        numColumns={1}
                                        ListFooterComponent={<RankingListFooter/>}
                                        showsHorizontalScrollIndicator={false}
                                        showsVerticalScrollIndicator={false}
                                    />
                                </View>
                            )
                        })
                    }
                </ScrollableTabView>
                <Loading show={this.state.isLoading} />
            </View>
        );
    }
    _requestData(args){
        let url = Api.common + Api.category.rankingList,
            params = "?sort_by=" + args,
            headers = {'SESSION-ID': launchConfig.sessionID};

        Fecth.get(url,params,(res) => {
            res.code === 0 && this.setState({
                listData: res.data,
                isLoading: false,
            });
        },(err) => {
            errorShow(err);
        },headers);
    }
    _renderItem = ({item,index}) => {
        let obj = item.obj,
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
                style={styles.boxBody}
                activeOpacity={0.75}
                onPress={() => this._openDetails(hex_id,id)}
            >
                <View style={[styles.bookBox,styles.bookBoxWH,{marginLeft:3}]}>
                    <Image source={{uri: uri}} style={[styles.bookBoxWH,{borderRadius:2}]}/>
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
        let authorized_key = this.props.navigation.state.params.user.authorized_key;

        this.props.navigation.navigate("BookDetail",{
            hex_id: hex_id,
            id: id,
            authorized_key: authorized_key,
        });
    }
}

// 定义一个尾部组件
class RankingListFooter extends Component{
    render(){
        return (
            <View style={styles.promptBox}>
                <Text style={styles.promptText}>没有更多了哦</Text>
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
        height: 35,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
    },
    promptText: {
        fontSize: 12,
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
        elevation: 3,
        shadowColor: '#FBFBFB',
        shadowOffset: {width: 4,height: 3},
        shadowOpacity: 0.6,
        borderRadius: 2,
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




























