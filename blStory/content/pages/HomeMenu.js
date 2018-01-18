
// 首页导航部分

import React,{Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ListView,
    Dimensions,
    Alert,
    TouchableWithoutFeedback,
    FlatList,
} from 'react-native';
import PropTypes from 'prop-types';
import { Menu,Devices } from '../common/Api';

class HomeMenu extends Component{
    static propTypes = {
        menuStyleListenr: PropTypes.bool,
        index: PropTypes.number,
        menuSwitch: PropTypes.func,
    };
    constructor(props){
        super(props);
        this.state={
            menuTypes: '',
            index: null,
        }
    }
    render(){
        let menuStyleListenr = this.props.menuStyleListenr;

        return (
            <View style={styles.navContainer}>
                <View style={styles.navContent}>
                    {
                        Menu.map((item,index) => {
                            let color = this.props.index === index ? "#F3916B" : "#4C4C4C";
                            let scale = this.props.index === index ? 1.2 : 1;

                            return (
                                <TouchableWithoutFeedback
                                    key={index}
                                    onPress={() => this.props.menuSwitch(item,index)}
                                >
                                    <View style={[styles.innerListView,styles.listView]}>
                                        <Image source={item.pic} style={[styles.navImage,menuStyleListenr === false && {transform:[{scale:scale}]}]}/>
                                        <Text style={[styles.navText,menuStyleListenr === false && {color:color}]}>{item.text}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            )
                        })
                    }
                </View>
            </View>
        );
    }
}

export default HomeMenu;

const styles = StyleSheet.create({
    navContainer:{
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
    },
    navContent: {
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    listView:{
        width: Devices.width / 4,
        height: 74,
    },
    innerListView: {
        flexDirection:'column',
        alignItems: 'center'
    },
    navImage:{
        marginTop: 10,
        width: 35,
        height: 35,
        borderRadius: 35,
    },
    navText: {
        marginTop:5,
        fontSize: 12,
        color: '#4C4C4C'
    }
});

