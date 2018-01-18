
import { Api } from "./Api";

let _url = Api.imgSever;

let PhotoArithmetic = function(input, prefix, postfix, random){
    let id = parseInt(input);

    if (!isNaN(id) && id > 0) {
        let idstr = id.toString();
        // 补位
        let strs = [];
        for (let i = 0; i < 9 - idstr.length; i ++) {
            strs.push('0');
        }

        strs.push(idstr);
        strs = strs.join('');

        let pathes = strs.substring(0, 3) + '/' + strs.substring(3, 6) + '/' + strs.substring(6);
        let url = _url + prefix + '/' + pathes + '.jpg';

        if (postfix) {
            url += '!' + postfix;
        }

        if(random === true){
            url += '?r='+ Math.random();
        }

        return url;
    }
};

export default PhotoArithmetic;



















