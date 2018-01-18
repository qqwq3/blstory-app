
import React,{ Component } from "react";
import {
    Text,
    StyleSheet,
    View,
} from 'react-native';
import { StackNavigator, NavigationActions } from 'react-navigation';
//import CardStackStyleInterpolator from 'react-navigation/src/views/CardStackStyleInterpolator';
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

// 路由的基本配置
const RouterConfig = {
    //登录
    Login: {
      screen:   Login,
        navigationOptions: ({navigation}) => ({
            header: null,
        })
    },
    // 首页
    Home: {
        screen: Home,
        navigationOptions: ({navigation}) => ({
            header: null,
        }),
    },
    // 我的收藏
    MyCollect: {
        screen: MyCollect,
        navigationOptions: ({navigation}) => ({
            header: (<HeaderReturn title={'我的收藏'} onPress={() => navigation.goBack()}/>)
        })
    },
    // 我的书签
    MyBookMark: {
        screen: MyBookMark,
        navigationOptions: ({navigation}) => ({
            header: (<HeaderReturn title={'我的书签'} onPress={() => navigation.goBack()}/>)
        })
    },
    // 我的书库
    MyLibrary: {
        screen: MyLibrary,
        navigationOptions: ({navigation}) => ({
            header: null
        })
    },
    // 排行榜
    RankingList: {
        screen: RankingList,
        navigationOptions: ({navigation}) => ({
            header: (<HeaderReturn title={'排行榜'} onPress={() => navigation.goBack()}/>)
        })
    },
    // 书详情
    BookDetail: {
        screen: BookDetail,
        navigationOptions: ({navigation}) => ({
            header: (<HeaderReturn title={'书籍详情'} onPress={() => navigation.goBack()}/>)
        })
    },
    // 书详情里面的章节
    BookDetailCatalog: {
        screen: BookDetailCatalog,
        navigationOptions: ({navigation}) => ({
            header: (<HeaderReturn title={'目录'} onPress={() => navigation.goBack()}/>)
        })
    },
    // 签到
    SignIn: {
        screen: SignIn,
        navigationOptions: ({navigation}) => ({
            header: null,
        })
    },
    // 阅读
    Reader: {
      screen: Reader,
      navigationOptions: ({navigation}) => ({
         header: null,
      })
    },
    // 跟多评论
    BookDetailCommentsMore: {
        screen: BookDetailCommentsMore,
        navigationOptions: ({navigation}) => ({
            header: (<HeaderReturn title={'更多评论'} onPress={() => navigation.goBack()}/>)
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
        })
    }
};

const StackNavigatorConfig = {
    mode: 'card',
    headerMode: 'screen',
    initialRouteName: 'Login',
    path: '/',
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






















