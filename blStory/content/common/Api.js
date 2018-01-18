
// app 启动时需要调用的接口，会包含一些初始化的参数
//'http://api.yuetoupiao.cn/api/app/launch';

// 获取首页各推荐列表的数据
//'http://api.yuetoupiao.cn/api/app/book/get-promotion?promotion_id=2,3,4,5,6,7,8,9';

// 获取分类页数据
//'http://api.yuetoupiao.cn/api/app/book/category/(city|tycoon|fantasy|....)';

// 获取所有分类
//'http://api.yuetoupiao.cn/api/app/book/category-list';

// 搜索接口 - ((status 1 - 连载，2 - 完结) (free  0 - 收费，1 - 免费))
//'http://api.yuetoupiao.cn/api/front/book/query?page=[页码]&status=[1|2]&category_id=[分类id]&free=[0|1]&book_name=[书名关键字]';

//# 获取排行榜
//GET /api/app/book/get-top-list
//http://api.yuetoupiao.cn/api/app/book/get-top-list?sort_by=total_hits   (finish', 'total_hits', 'total_likes', 'total_present_amount', 'time_created)

// 书籍详情
// /api/app/book/detail?id=<hex_id>

//# 获取给定书籍的相似数据(用于猜你喜欢)
//GET /api/app/book/similar?book_id=<数字id>

//# 获取评论
//GET /book/get-comments?book_id=<数字id>&chapter_id=<章节id（如果读取书籍的评论此参数可以不提供）>

//# 添加书架
//# POST 参数
//# @param int book_id
// POST /api/app/book/add-book-case

//# 评论点赞（需要登录）
//# POST 参数  @param int comment_id
//POST app/book/like-comment

// 获取收藏列表
// http://api.yuetoupiao.cn/api/app/book/get-book-cases

// 删除收藏
// POST /api/app/book/bookcase/delete
// # POST 参数 book_id （hex_id）

//# 批量删除
//# POST 参数, book_ids 逗号分隔的hex_id
//POST /api/app/book/bookcase/batch_delete

// # 退出登录
//POST /api/app/user/logout

//# 签到（需要登录）
//POST /api/app/user/sign-in
//# 签到检查（当日是否签到）
//POST /api/app/user/check-sign-in

// 获取书签
// GET app/book/get-book-reads

//# 获取章节列表
//GET /api/app/book/get-chapters?book_id=<hex_id>
//http://api.yuetoupiao.cn/api/app/book/get-chapters?book_id=69de53b82bbf901b

//# 获取章节列表（分页获取）
//GET /api/app/book/get-chapters-pager?book_id=<hex_id>&page=<integer>

// 是否添加收藏检测
// /api/app/book/bookcase/exists?book_id=<hex_id>

// 删除书签
// POST book/bookread/delete , book_id=hex_book_id;

/*
*   # 添加评论（需要登录）
    POST /api/app/book/add-comment  (content  book_id   chapter_id)
* */

//# 获取章节详情（阅读）
//GET /api/app/book/get-chapter?chapter_id=
//# 这里 chapter_id 有两种传值方式
// http://api.yuetoupiao.cn/api/app/book/get-chapter?chapter_id=book_id69de53b82bbf901b (打开详情直接阅读：默认第一篇)
// http://api.yuetoupiao.cn/api/app/book/get-chapter?chapter_id=4df978c0a60e848cfdda1191b6598e67&book_id=69de53b82bbf901b&confirm_pay=0 (第二篇数据)

//#获取用户的最后一次的阅读记录
//GET /api/app/user/last_read

// 获取用户余额 （临时地址）
// http://192.168.0.149:8080/user/balance

import { Dimensions,PixelRatio } from 'react-native';
import Icon from './Icon';

// 获取设备高宽度，密度
const Devices = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    piexl: PixelRatio.get(),
};

// Api
const Api = {
    imgSever: 'http://img.bailu8.com/',
    common: 'http://api.yuetoupiao.cn/api/',
    //common: 'http://192.168.0.149:8081/api/',
    category: {
        begin: 'app/launch',
        eachTipList: 'app/book/get-promotion?promotion_id=2,3,4,5,6,7,8,9',
        classifiedPage: 'app/book/category',
        allClassifiy: 'app/book/category-list',
        classifiy: 'front/book/query?',
        rankingList: 'app/book/get-top-list',
        details: 'app/book/detail',
        similar: 'app/book/similar',
        comments: 'app/book/get-comments',
        weixin: 'app/user/login/weixin/params',
        weiXinCallback: 'app/user/login/weixin/callback',
        addBookCase: 'app/book/add-book-case',
        likeComment: 'app/book/like-comment',
        getBookCases: 'app/book/get-book-cases',
        bookCasesBatchDel: 'app/book/bookcase/batch_delete',
        logout: 'app/user/logout',
        signIn: 'app/user/sign-in',
        signInCheck: 'app/user/check-sign-in',
        getBookReads: 'app/book/get-book-reads',
        getChapter: 'app/book/get-chapter',
        getChapters: 'app/book/get-chapters',
        getChaptersPager: 'app/book/get-chapters-pager',
        bookCaseExists: 'app/book/bookcase/exists',
        userLastRead: 'app/user/last_read',
        bookReadDelete: 'app/book/bookread/delete',
        bookAddComment: 'app/book/add-comment',
        userBalance: 'app/user/balance',
        appLaunch_v2: 'app/launch_v2',
        checkUpgradeAndroid: 'app/checkUpgrade/android',
        checkUpgradeIos: 'app/checkUpgrade/ios',
        spreadGetDevice: 'app/spread/get_device',
        spreadSwitch: 'app/spread/switch',
        spreadExchange: 'app/spread/exchange',
    },
};

// 首页菜单配图image
const image = {
    city: require('../images/picCity.png'),
    tycoon: require('../images/picCEO.png'),
    fantasy: require('../images/picFantasy.png'),
    military: require('../images/picMilitaryScience.png'),
    game: require('../images/picPlay.png'),
    suspense: require('../images/picSuspense.png'),
    through: require('../images/picThru.png'),
    other: require('../images/picOther.png')
};

// 首页菜单menu
const Menu = [
    {key: 'city', text: '都市', pic: image.city},
    {key: 'tycoon', text: '总裁', pic: image.tycoon},
    {key: 'fantasy', text: '玄幻', pic: image.fantasy},
    {key: 'military', text: '军事', pic: image.military},
    {key: 'game', text: '游戏', pic: image.game},
    {key: 'suspense', text: '悬疑', pic: image.suspense},
    {key: 'through', text: '穿越', pic: image.through},
    {key: 'other', text: '其他', pic: image.other}
];

// 首页抽屉里的菜单drawerMenu
const drawerMenu = [
    {key: 0, router: 'Home', text: '首页', icon:  Icon.iconHome},
    {key: 1, router: 'SignIn', text: '签到', icon: Icon.iconCheck},
    {key: 2, router: 'MyLibrary', text: '书库', icon: Icon.iconLibrary},
    {key: 3, router: 'RankingList', text: '排行', icon: Icon.iconRank},
    {key: 4, router: 'Spread',text: '福利', icon: Icon.iconInviteCode},
    {key: 5, router: 'Off', text: '退出账户', icon: Icon.iconLogout}
];

// 图书馆菜单数据
const libarayMenu = [
    {key: 0,  id: 0,  name: '全部分类'},
    {key: 1,  id: 1,  name: '玄幻奇幻'},
    {key: 2,  id: 10, name: '武侠修真'},
    {key: 3,  id: 2,  name: '都市言情'},
    {key: 4,  id: 11, name: '历史军事'},
    {key: 5,  id: 8,  name: '游戏竞技'},
    {key: 6,  id: 7,  name: '末世科幻'},
    {key: 7,  id: 5,  name: '豪门总裁'},
    {key: 8,  id: 3,  name: '灵异悬疑'},
    {key: 9,  id: 4,  name: '穿越幻想'},
    {key: 10, id: 12, name: '同人美文'},
    {key: 11, id: 9,  name: '其它小说'},
];

//热更新用到的key - (ios + android)
const DEPLOYMENT_KEYS = {
    android: {
        STAGING: '1F0jUVfj2HMixNWUDvQETW3LA4b90a807393-7289-4bba-ba4a-430561def6ac',
        PRODUCTION: 'nz2C8er_VaEp3WavwaDkprxx6TV00a807393-7289-4bba-ba4a-430561def6ac',
    },
    ios: {
        STAGING: null,
        PRODUCTION: null,
    },
};

// 配置中渠道key
const CHANNEL_KEY = 'UMENG_CHANNEL';

export {
    Api,
    Menu,
    drawerMenu,
    libarayMenu,
    Devices,
    DEPLOYMENT_KEYS,

    CHANNEL_KEY
};

















