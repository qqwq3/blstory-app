
import PhotoArithmetic from './PhotoArithmetic';

function RequestImage(books_id,prefix='cover',postfix=140,random=false) {
    let id;
    let imageArr = [];

    if(books_id && typeof books_id === 'string'){
        id = books_id.split(",");
        id.map((_id) => {
            let img = PhotoArithmetic(_id,prefix,postfix,random);
            imageArr.push(img);
        });
        return imageArr;
    }

    if(books_id && typeof books_id === 'number'){
        id = books_id;
        let img = PhotoArithmetic(id,prefix,postfix,random);
        return img;
    }
}

export default RequestImage;





























