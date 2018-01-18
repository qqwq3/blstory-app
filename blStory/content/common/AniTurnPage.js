
// 阅读翻页

import React,{ Component } from 'react';
import {
    View,
    PanResponder,
    TouchableOpacity,
    Alert,
} from 'react-native';

class AniTurnPage extends Component{
    componentWillMount(evt,gestureState) {
        this._panResponder = PanResponder.create({
            //用户开始触摸屏幕的时候，是否愿意成为响应者；默认返回false，无法响应，
            // 当返回true的时候则可以进行之后的事件传递。
            onStartShouldSetPanResponder: this.onStartShouldSetPanResponder,
            //在每一个触摸点开始移动的时候，再询问一次是否响应触摸交互；
            onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
            //开始手势操作，也可以说按下去。给用户一些视觉反馈，让他们知道发生了什么事情！（如：可以修改颜色）
            onPanResponderGrant: this.onPanResponderGrant,
            //最近一次的移动距离.如:(获取x轴y轴方向的移动距离 gestureState.dx,gestureState.dy)
            onPanResponderMove: this.onPanResponderMove,
            //用户放开了所有的触摸点，且此时视图已经成为了响应者。
            onPanResponderRelease: this.onPanResponderRelease,
            //另一个组件已经成为了新的响应者，所以当前手势将被取消。
            onPanResponderTerminate: this.onPanResponderTerminate,
        });
    }
    onStartShouldSetPanResponder = (evt, gestureState) => {
        return true;
    };
    onMoveShouldSetPanResponder = (evt, gestureState) => {
        return true;
    };
    onPanResponderGrant = (evt, gestureState) => {

    };
    onPanResponderMove = (evt, gestureState) => {

    };
    onPanResponderRelease = (evt, gestureState) => {
        let dx = gestureState.dx;
        dx !==0 && (dx > 0 ? this.props.toRight() : this.props.toLeft());
    };
    onPanResponderTerminate = (evt, gestureState) => {

    };
    render(){
        let panHandlers = this._panResponder.panHandlers;

        return (
            <View
                style={this.props.style}
                {...panHandlers}
            >
                {this.props.children}
            </View>
        )
    }
}

export default AniTurnPage;















