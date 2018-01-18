
// 图书菜单LibrayMenu组件

import React from 'react';
import {
    Text,
    View,
    Image,
    StyleSheet,
    TouchableWithoutFeedback,
    Dimensions,
    PixelRatio,
    TouchableOpacity,
    FlatList,
    SectionList
} from 'react-native';
import PropTypes from 'prop-types';
import { libarayMenu,Devices } from "../common/Api";

class LibrayMenu extends React.Component{
    constructor(props){
        super(props);
        this.menuData = [
            {key: 0, text: '全部进度'},
            {key: 1, text: '连载中'},
            {key: 2, text: '已完结'}
        ];
    }
    static propTypes = {
        cateSwitchIndex: PropTypes.number,
        cateProgressIndex: PropTypes.number,
        cateSwitch: PropTypes.func,
        cateProgress: PropTypes.func,
    };
    render(){
        return (
            <View style={{marginBottom: 10,overflow: 'hidden'}}>
                <View style={styles.menuRow}>
                    <View style={[styles.menuInner,styles.menuInnerBottomBorder]}>
                        {
                            libarayMenu.map((item,index) => {
                                let color = this.props.cateSwitchIndex === index ? "#f3916b" : "#808080";
                                return (
                                    <TouchableWithoutFeedback
                                        key={index}
                                        onPress={() => this.props.cateSwitch(item.id,index)}
                                    >
                                        <View style={styles.menuBox}>
                                            <Text style={[styles.menuFont,{color:color}]}>{item.name}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                );
                            })
                        }
                    </View>
                </View>

                <View style={styles.menuRow}>
                    <View style={styles.menuInner}>
                        {
                            this.menuData.map((item,index) => {
                                let color = this.props.cateProgressIndex === index ? "#f3916b" : "#808080";
                                return (
                                    <TouchableWithoutFeedback
                                        key={index}
                                        onPress={() => this.props.cateProgress(index)}
                                    >
                                        <View style={styles.menuBox}>
                                            <Text style={[styles.menuFont,{color:color}]}>{item.text}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                );
                            })
                        }
                    </View>
                </View>
            </View>
        );
    }
}

export default LibrayMenu;

const styles = StyleSheet.create({
    menuInner: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 15,
        marginRight: 15,
        paddingBottom: 20
    },
    menuInnerBottomBorder: {
        borderBottomColor: '#E5E5E5',
        borderStyle: 'solid',
        borderBottomWidth: 1 / Devices.piexl
    },
    menuRow: {
        backgroundColor: '#FFFFFF',
        flexDirection:'row'
    },
    menuBox: {
        width: (Devices.width - 30) / 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20

    },
    menuFont: {
        fontSize: 13,
        color: '#808080'
    },
});
































