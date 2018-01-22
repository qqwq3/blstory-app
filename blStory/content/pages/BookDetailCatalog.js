
// 书详情里的章节目录

import React,{ Component } from  'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
} from 'react-native';
import _ from 'lodash';
import { Devices,Api } from '../common/Api';
import Loading from '../common/Loading';
import Fecth from '../common/Fecth';
import ChapterPartition from '../common/ChapterPartition';
import SelectChapterArea from './SelectChapterArea';
import { errorShow,loginTimeout,networkCheck } from '../common/Util';

class BookDetailCatalog extends Component{
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
        };
        this.hex_id = this.props.navigation.state.params.hex_id;
        this.authorized_key = this.props.navigation.state.params.authorized_key;
        this.book_title = this.props.navigation.state.params.book_title;
    }
    componentWillMount() {
        this._requestData(this.state.page);
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
        this._requestData(nextState.page);
    }
    _requestData(page){
        let hex_id = this.hex_id;
        let url = Api.common + Api.category.getChaptersPager,
            params = '?book_id=' + hex_id + '&page=' + page,
            headers = {'SESSION-ID': launchConfig.sessionID};

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
                errorShow(err);
            },headers);
        },() => {
            this.props.navigation.navigate("NetWork");
        });
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
    render(){
        return (
            <View style={{flex:1}}>
                {
                    this.state.status === true && (
                        <View style={{flex:1}}>
                            <View style={styles.rcBodyHeader}>
                                <View><Text style={[styles.rcFont,{color: '#808080'}]}>共 {this.state.total_records} 章节</Text></View>
                                <TouchableOpacity
                                    onPress={() => this._openChapterSelect()}
                                    style={styles.rcBodyRowBut}
                                >
                                    <Text style={[styles.rcFont,{color: '#808080'}]}>{this.state.startIndex} ~ {this.state.endIndex} 章</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.rcBody}>
                                <ScrollView
                                    style={[styles.rcBodyContent]}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                    alwaysBounceVertical={true}
                                    ref={ref => this._scrollViewRef = ref}
                                >
                                    {
                                        this.state.chapters.map((item,index) => {
                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[styles.rcBodyRow]}
                                                    activeOpacity={0.75}
                                                    onPress={() => this._toRead(item.id,item.hex_id,item.book_id)}
                                                >
                                                    {/*<View><Text style={styles.rcFont}>第{ArabicNumeralIntoChinese(item.source_site_index)}章</Text></View>*/}
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
                        </View>
                    )
                }
                <Loading opacity={1} show={this.state.isLoading} />
            </View>
        );
    }
    _toRead(current_id,chapter_id,book_id){
        let hex_id = this.hex_id;
        let authorized_key = this.authorized_key;
        let book_title = this.book_title;

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
}

export default BookDetailCatalog;

const styles = StyleSheet.create({
    noPrompt: {
        flexDirection: 'row',
        overflow: 'hidden',
        height: 50,
        justifyContent: 'center'
    },
    noPromptText: {
        fontSize: 14,
        color: '#999999',
        textAlignVertical: 'center'
    },
    rcBodyRow: {
        height: 50,
        borderBottomColor: '#cccccc',
        borderBottomWidth: 1 / Devices.piexl,
        borderStyle : 'dashed',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rcBodyContent: {
        flex: 1,
        paddingBottom: 10,
        paddingRight: 10,
        paddingLeft: 10,
    },
    rcBody: {
        overflow: 'hidden',
        flexDirection: 'column',
        flex: 1,
    },
    rcBodyHeader: {
        height: 50,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1 / Devices.piexl,
        borderBottomColor: '#e5e5e5',
        borderStyle: 'solid',
        backgroundColor: '#ffffff',
        paddingLeft: 15,
        paddingRight: 15,
    },
    rcFont: {
        fontSize: 14,
        color: '#4C4C4C',
    },
    rcBodyRowBut: {
        height: 30,
        borderWidth: 1 / Devices.piexl,
        borderStyle: 'solid',
        borderColor: '#808080',
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 6,
        paddingRight: 6,
    },
});










































