//  能发光的
import {createComponentClass} from 'ecsy';

const ShineableComponent = createComponentClass(
    {
    // 正常状态图片名 0-100%亮度
        normalPicArr: {default: []},
        // 烧毁图片名
        burnPic: {default: ''}
    },
    'ShineableComponent'
);

export default ShineableComponent;
