
import React,{ Component } from "react";
import {
    Text,
    StyleSheet,
    View,
} from 'react-native';
import { StackNavigator, NavigationActions } from 'react-navigation';
import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator';
import HeaderReturn from './HeaderReturn';
import Home from './Home';
import MyCollect from './MyCollect';
import MyBookMark from './MyBookMark';
import BookDetail from "./BookDetail";
import RankingList from './RankingList';
import MyLibrary from './MyLibrary';
import Login from './Login';
import SignIn from './SignIn';
import BookDetailCatalog from './BookDetailCatalog';
import Reader from './Reader';
import BookDetailCommentsMore from './BookDetailCommentsMore';
import Spread from './Spread';
import NetWork from './NetWork';

// 路由的基本配置
const RouterConfig = {
    //登录
    Login: {
      screen: Login,
        navigationOptions: ({navigation}) => ({
            header: null,
            gesturesEnabled: false
        })
    },
    // 首页
    Home: {
        screen: Home,
        navigationOptions: ({navigation}) => ({
            header: null,
            gesturesEnabled: false,
        }),
    },
    // 我的收藏
    MyCollect: {
        screen: MyCollect,
        navigationOptions: ({navigation}) => ({
            header: (<HeaderReturn title={'我的收藏'} onPress={() => navigation.goBack()}/>),
            gesturesEnabled: false
        })
    },
    // 我的书签
    MyBookMark: {
        screen: MyBookMark,
        navigationOptions: ({navigation}) => ({
            header: (
                <HeaderReturn
                    title={'我的书签'}
                    onPress={() => navigation.goBack()}
                />
            ),
            gesturesEnabled: false
        })
    },
    // 我的书库
    MyLibrary: {
        screen: MyLibrary,
        navigationOptions: ({navigation}) => ({
            header: null,
            gesturesEnabled: false
        })
    },
    // 排行榜
    RankingList: {
        screen: RankingList,
        navigationOptions: ({navigation}) => ({
            header: (<HeaderReturn title={'排行榜'} onPress={() => navigation.goBack()}/>),
            gesturesEnabled: false
        })
    },
    // 书详情
    BookDetail: {
        screen: BookDetail,
        navigationOptions: ({navigation}) => ({
            header: (<HeaderReturn title={'书籍详情'} onPress={() => navigation.goBack()}/>),
            gesturesEnabled: false
        })
    },
    // 书详情里面的章节
    BookDetailCatalog: {
        screen: BookDetailCatalog,
        navigationOptions: ({navigation}) => ({
            header: (<HeaderReturn title={'目录'} onPress={() => navigation.goBack()}/>),
            gesturesEnabled: false
        })
    },
    // 签到
    SignIn: {
        screen: SignIn,
        navigationOptions: ({navigation}) => ({
            header: null,
            gesturesEnabled: false
        })
    },
    // 阅读
    Reader: {
        screen: Reader,
        navigationOptions: ({navigation}) => ({
            header: null,
            gesturesEnabled: false
        })
    },
    // 跟多评论
    BookDetailCommentsMore: {
        screen: BookDetailCommentsMore,
        navigationOptions: ({navigation}) => ({
            header: (<HeaderReturn title={'更多评论'} onPress={() => navigation.goBack()}/>),
            gesturesEnabled: false
        })
    },
    // 分享推广
    Spread: {
        screen: Spread,
        navigationOptions: ({navigation}) => ({
            header: (
                <HeaderReturn
                    title={'福利兑换'}
                    onPress={() => navigation.goBack()}
                    backgroundColor={'#ff5a5a'}
                    color={'#ffffff'}
                    bottomBorder={true}
                    borderBottomColor={'#ffffff'}
                />
            ),
            gesturesEnabled: false
        })
    },
    // 无网络
    NetWork: {
        screen: NetWork,
        navigationOptions: ({navigation}) => ({
            header: (
                <HeaderReturn
                    title={'温馨提示'}
                    onPress={() => navigation.goBack()}
                    backgroundColor={'#F1F1F1'}
                    bottomBorder={true}
                />
            ),
            gesturesEnabled: false
        })
    }
};

const StackNavigatorConfig = {
    mode: 'card',
    headerMode: 'screen',
    initialRouteName: 'Login',
    initialRouteParams: {},
    path: '/',
    transitionConfig:()=>({
        screenInterpolator: CardStackStyleInterpolator.forHorizontal
    })
};

const Router = StackNavigator(RouterConfig,StackNavigatorConfig);

// 防止速点
const navigateOnce = (getStateForAction) => (action, state) => {
    const {type, routeName} = action;
    return (
        state &&
        type === NavigationActions.NAVIGATE &&
        routeName === state.routes[state.routes.length - 1].routeName
    ) ? null : getStateForAction(action, state);
};

Router.router.getStateForAction = navigateOnce(Router.router.getStateForAction);

export default Router;






















