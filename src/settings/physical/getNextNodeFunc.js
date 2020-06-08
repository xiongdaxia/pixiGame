/**
 *
 */
export function batteryGetNextNode() {
    return null;
}

/**
 * 普通二接线柱器件的获取下一节点方法
 * @param {String} inputKey 输入的entityId_postKey
 * @param {Boolean} isDistinguish 是否区分正负极
 * @param status 状态 0-正常（连通）  1-断开 2-短路（0电阻连通）
 */
export function twoPostNextNodeFunc(inputKey, isDistinguish, status = 0) {
    // 两接线柱的获取下一节点方法
    if (!inputKey.includes('_')) {
        return null;
    }
    if (status === 1) {
        return null;
    }
    const splitArr = inputKey.split('_');
    const entityId = Number(splitArr[0]);
    const postId = Number(splitArr[1]);
    if (entityId < 0 || postId < 0) {
        return null;
    }
    if (isDistinguish) {
        if (postId === 0) {
            return `${entityId}_${1}`;
        }
    }
    else {
        return `${entityId}_${(postId + 1) % 2}`;
    }
}
