
// 评论

import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableWithoutFeedback
} from 'react-native';
import { Api,Devices } from "../common/Api";
import Icon from '../common/Icon';
import RequestImage from '../common/RequestImage';
import DateUtil from '../common/DateUtil';
import Fecth from '../common/Fecth';
import PropTypes from 'prop-types';
import { errorShow,loginTimeout,networkCheck } from '../common/Util';

class BookDetailComments extends Component{
    static propTypes = {
        commentsData: PropTypes.array,
    };
    static defaultProps = {
        commentsData: [],
    };
    render(){
        return (
            this.props.commentsData.map((o,j) => {
                let user_uri = RequestImage(o.user_id,'avatar','64x64',false);

                return (
                    <View key={j} style={styles.commentsRow}>
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
                                    <TouchableWithoutFeedback onPress={() => this._commentsClick(o.id,j)}>
                                        <View style={styles.comtents_dz}>
                                            <Image source={Icon.iconLikeFinger} style={{width:14,height:14}} resizeMode={"contain"} />
                                            <View style={{marginLeft:5,marginBottom:-3}}><Text style={{fontSize: 12,color: '#999999'}}>{this.props.likeCountArr[j]}</Text></View>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </View>
                        </View>
                    </View>
                )
            })
        )
    }
    _commentsClick(id,index){
        let authorized_key = this.props.authorized_key;
        let url = Api.common + Api.category.likeComment,
            params = Fecth.dictToFormData({comment_id: id}),
            headers = {'Authorized-Key': authorized_key,'SESSION-ID': launchConfig.sessionID};

        let likeCountArr = this.props.likeCountArr;
        let likeCount = this.props.likeCountArr[index] + 1;
        let likeStatus = this.props.likeStatus;

        if(likeStatus[index] === true){
            this.props.toast.show('亲，这条评论你已经点过赞了哦！',600);
            return
        }

        likeStatus.splice(index,1,true);
        likeCountArr.splice(index,1,likeCount);
        this.props.newLikeCountArr(likeCountArr);
        this.props.newLikeStatus(likeStatus);

        networkCheck(() => {
            Fecth.post(url,params,headers,res => {
                if(res.code === 0){
                    this.props.toast.show('点赞成功！',600);
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
}

export default BookDetailComments;

const styles = StyleSheet.create({
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









