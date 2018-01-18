
// 加载动画组件

import React,{ Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';

//let Progress = require('react-native-progress');
/*
* <Progress.Circle
    thickness={2}
    borderWidth={3}
    borderColor={"#f3916b"}
    size={40}
    indeterminate={true}
    strokeCap={'round'}
  />
* */

class Loading extends Component{
    static propTypes = {
        isShow: PropTypes.bool,
        opacity: PropTypes.number,
        size: PropTypes.string,
        color: PropTypes.string,
        animating: PropTypes.bool,
        varible: PropTypes.number,
    };
    static defaultProps = {
        isShow: true,
        opacity: 0.80,
        color: '#f3916b',
        size: 'large',
        animating: true,
        varible: 255,
    };
    render(){
        return (
            this.props.show === true ? (
                <View style={[styles.loadingContent,{backgroundColor: 'rgba('+this.props.varible+','+this.props.varible+','+this.props.varible+','+this.props.opacity+')'}]}>
                    <ActivityIndicator
                        animating={this.props.animating}
                        style={styles.activityIndicator}
                        size={this.props.size}
                        color={this.props.color}
                    />
                </View>
            ) : null
        );
    }
}

export default Loading;

const styles = StyleSheet.create({
    activityIndicator:{
        height:40,
        justifyContent:'center',
        alignItems:'center',
    },
    loadingContent: {
        flex: 1,
        position: 'absolute',
        zIndex: 9999,
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    }
});