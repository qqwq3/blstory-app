
import React,{ Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TouchableWithoutFeedback,
} from 'react-native';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Devices } from '../common/Api';
import ChapterPartition from '../common/ChapterPartition';

class SelectChapterArea extends Component{
    static propTypes = {
        changePage: PropTypes.func,
        totalRecods: PropTypes.number,
        count: PropTypes.number,
        closeChapterSelect: PropTypes.func,
        page: PropTypes.number,
    };
    constructor(props){
        super(props);
        this.state = {
            startIndexArr: [],
            endIndexArr: [],
        };
    }
    componentWillMount() {
        this._requestArr();
    }
    _requestArr(){
        let chapter = ChapterPartition.traverse(this.props.totalRecods,100);
        this.setState({
            startIndexArr: chapter.startIndex,
            endIndexArr: chapter.endIndex,
        });
    }
    _select(page){
        this.props.changePage(page);
        this.setState({page: page});
    }
    render(){
        let countArr = _.range(this.props.count);

        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => this.props.closeChapterSelect()}
                style={styles.pop}
            >
                <View style={styles.popContent}>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        alwaysBounceVertical={true}
                    >
                        {
                            countArr.map((item,index) => {
                                let dotItem = this.props.page === (index+1) ? <View style={styles.selectDot} /> : null;
                                let borderColor = this.props.page === (index+1) ? '#F8AD54' : '#808080';

                                return (
                                    <TouchableOpacity
                                        onPress={() => this._select(item+1)}
                                        key={index}
                                        style={styles.popRow}
                                    >
                                        <View>
                                            <Text style={{fontSize:15,color:'#808080'}}>
                                                {this.state.startIndexArr[index]} ~ {this.state.endIndexArr[index]} 章
                                            </Text>
                                        </View>
                                        <View>
                                            <View style={[styles.singleSelect,{borderColor:borderColor}]}>
                                                {dotItem}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                </View>
            </TouchableOpacity>
        )
    }
}

export default SelectChapterArea;

const styles = StyleSheet.create({
    selectDot:{
        width: 12,
        height: 12,
        backgroundColor: '#F8AD54',
        borderRadius: 12,
        overflow: 'hidden',
    },
    singleSelect: {
        borderWidth: 0.5,
        borderStyle:'solid',
        width:20,
        height:20,
        borderRadius:20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    popRow:{
        flexDirection:'row',
        justifyContent:'space-between',
        height: 40,
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
    },
    popContent:{
        width: Devices.width - 80,
        backgroundColor:'#ffffff',
        borderRadius:6,
        overflow:'hidden',
        paddingTop:15,
        paddingBottom:15,
        minHeight:70,
        maxHeight: Devices.height - 200,
    },
    pop:{
        position:'absolute',
        left:0,
        right:0,
        top:0,
        bottom:0,
        backgroundColor:'rgba(0,0,0,0.75)',
        zIndex:500,
        justifyContent:'center',
        alignItems:'center',
    },
});





























