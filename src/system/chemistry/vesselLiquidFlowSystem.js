/**
 * @file 容器-液体流动现象
 */

import {Graphics} from 'pixi.js';
import {System} from 'ecsy';
import ReactionVesselComponent from '@/components/chemistry/reactionVesselComponent';
import StructureComponent from '@/components/chemistry/structureComponent';
import RenderComponent from '@/components/chemistry/renderComponent';

class vesselLiquidFlowSystem extends System {

    init() {
        console.log('显示容器内现象 init! ');
    }

    execute() {
        const {results} = this.queries.reactionVessel;
        results.forEach(entity => {
            this.initVesselLiquid(entity);
        });
    }

    /**
     * 渲染化容器内液体
     * @param {*} entity
     */
    initVesselLiquid(entity) {
        const reactionVessel = entity.getMutableComponent(
            ReactionVesselComponent
        );
        const {cubage, availableCubage} = reactionVessel;
        const fillCubage = cubage - availableCubage;

        const renderData = entity.getMutableComponent(
            RenderComponent
        );
        const {sprite} = renderData;
        const {angle} = sprite;
        const container = sprite.getChildByName('container');
        if (container && fillCubage) {
            const {initialWidth: width, initialHeight: height} = container;
            const totalArea = width * height;
            const showArea = container.showArea || container.showArea === 0
                ? container.showArea
                : fillCubage * totalArea / cubage;
            container.showArea = showArea;
            this.updateContainerLiquid({angle, width, height, showArea, totalArea, container});
        }
        else {
            const liquid = container.getChildByName('liquidGraphics');
            liquid && container.removeChild(liquid);
        }
    }

    /**
     * 计算容器内液体面积、坐标点
     * @param {*} angle
     * @param {*} width
     * @param {*} height
     * @param {*} showArea
     * @param {*} totalArea
     * @param {*} container
     */
    updateContainerLiquid(param) {
        let {
            angle: rotateAngle,
            width,
            height,
            showArea: lastShowArea,
            totalArea,
            container
        } = param;
        rotateAngle = (rotateAngle + 360) % 360;
        const tanAngle = Math.tan(rotateAngle * Math.PI / 180);
        let posArr = [];

        const maxAvailableArea = this.calculateMaxAvailableArea(rotateAngle, width, height, totalArea);
        lastShowArea = Math.min(maxAvailableArea, lastShowArea);
        container.showArea = lastShowArea;
        // 根据面积-计算体积-更新容器内液体物质的体积 ------------ TODO

        const bottomMinusTop = width * tanAngle;
        const top = ((lastShowArea * 2 / width) - bottomMinusTop) / 2;
        const bottom = top + bottomMinusTop;
        if (top < 0) {
            const widthTrangle = Math.sqrt(lastShowArea * 2 / tanAngle);
            const heightTrangle = widthTrangle * tanAngle;
            posArr = [
                {x: width, y: height},
                {x: width - widthTrangle, y: height},
                {x: width, y: height - heightTrangle}
            ];
        }
        else if (bottom < 0) {
            const widthTrangle = Math.sqrt(lastShowArea * 2 / Math.abs(tanAngle));
            const heightTrangle = widthTrangle * Math.abs(tanAngle);
            posArr = [
                {x: 0, y: height},
                {x: widthTrangle, y: height},
                {x: 0, y: height - heightTrangle}
            ];
        }
        else {
            posArr = [
                {x: width, y: height},
                {x: 0, y: height},
                {x: 0, y: height - top},
                {x: width, y: height - bottom}
            ];
        }
        this.drawLiquid(posArr, container);
    }

    /**
     * 绘制容器内液体
     * @param {*} posArr
     * @param {*} container
     */
    drawLiquid(posArr, container) {
        const liquidGraphics = new Graphics();
        liquidGraphics.name = 'liquidGraphics';
        liquidGraphics.beginFill(0xffffff, 0.2);
        liquidGraphics.moveTo(posArr[0].x, posArr[0].y);
        posArr.forEach((item, index) => {
            if (index !== 0) {
                liquidGraphics.lineTo(item.x, item.y);
            }
        });
        liquidGraphics.closePath();
        liquidGraphics.endFill();
        const liquid = container.getChildByName('liquidGraphics');
        liquid && container.removeChild(liquid);
        container.addChild(liquidGraphics);
    }

    /**
     * 计算当前旋转角度容器最大容纳面积
     * @param {*} angle 容器旋转角度
     * @param {*} width 容器container初始宽度
     * @param {*} height 容器container初始高度
     * @param {*} totalArea 容器contaienr总面积
     */
    calculateMaxAvailableArea(angle, width, height, totalArea) {
        const angleBound = Math.atan(height / width) * 180 / Math.PI;
        let maxArea = totalArea;
        if (angle >= 90 && angle <= 270) {
            maxArea = 0;
        }
        else if (angle < angleBound || angle > (270 + angleBound)) {
            maxArea = totalArea - (width * width * Math.abs(Math.tan(angle * Math.PI / 180)) / 2);
        }
        else if (angle > angleBound || angle < (270 + angleBound)) {
            maxArea = height / Math.abs(Math.tan(angle * Math.PI / 180)) * height / 2;
        }
        return maxArea;
    }


}

vesselLiquidFlowSystem.queries = {
    reactionVessel: {
        components: [ReactionVesselComponent, StructureComponent],
        listen: {
            changed: [StructureComponent]
        }
    }
};

export default vesselLiquidFlowSystem;
