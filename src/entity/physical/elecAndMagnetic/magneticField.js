// 开关
import cloneDeep from 'lodash/cloneDeep';
import renderDataComponent from '@/components/physical/renderData';
import movableComponent from '@/components/physical/movable';
import MagneticFieldComponent from '@/components/physical/magneticField';
import MagneticFieldLine from '@/components/physical/magneticFieldLine';


const renderData = {
    //  图集信息
    atlasUrl: '/texture/mechanics/demo.json',
    //  层级信息及布局
    postionJson: [
        {
            type: 'graphics',
            shape: 'circle',
            img: '',
            x: 200,
            y: 0,
            r: 200,
            w: 400,
            h: 400,
            fillColor: 0x99ccff,
            angle: 0,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 0.5,
            children: []
        }
    ]
};

function createMagneticFieldEntity(world) {
    const data = cloneDeep(renderData);
    const {x, y, w, h} = data.postionJson[0];
    const data2 = transformPos(x, y, w, h);
    world
        .createEntity()
        .addComponent(MagneticFieldComponent, {
            B: {
                x: 0,
                y: 0,
                // 垂直向下
                z: -0.4368,
                scale: 0.001,
                rounds: {
                    x: data2.x,
                    y: data2.y,
                    r: data2.width / 2
                }
            }
        })
        .addComponent(renderDataComponent, data)
        .addComponent(MagneticFieldLine)
        .addComponent(movableComponent);

}
// TODO:  重复函数
function transformPos(x, y, width, height, anchor = {x: 0.5, y: 0.5}, angle = 0) {
    const scale = 0.6;

    const dx =  (anchor.x - 0.5) * width * Math.cos(angle * Math.PI / 180) * scale;
    const dx2 =  (anchor.y - 0.5) * height * Math.sin(angle * Math.PI / 180) * scale;

    const dy = (anchor.x - 0.5) * width * Math.sin(angle * Math.PI / 180) * scale;
    const dy2 = (anchor.y - 0.5) * height * Math.cos(angle * Math.PI / 180) * scale;
    return {
        x: window.innerWidth  / 2 + x * scale - dx + dx2,
        y: window.innerHeight  / 2 + y * scale - dy - dy2,
        width: width * scale,
        height: height * scale,
        angle
    };
}
export default createMagneticFieldEntity;
