import {Tween} from './tween';

// 对运动方法进行封装
const animation = function (target, from, to, duration, easing, callback) {
    const isFunction = function (obj) {
        return typeof obj === 'function';
    };
    const isNumber = function (obj) {
        return typeof obj === 'number';
    };
    const isString = function (obj) {
        return typeof obj === 'string';
    };
    // 转换成毫秒
    const toMillisecond = function (obj) {
        if (isNumber(obj)) {
            return obj;
        }
        if (isString(obj)) {
            if (/\d+m?s$/.test(obj)) {
                if (/ms/.test(obj)) {
                    return 1 * obj.replace('ms', '');
                }
                return 1000 * obj.replace('s', '');
            }
            if (/^\d+$/.test(obj)) {
                return +obj;
            }
        }
        return -1;
    };

    if (!isNumber(from) || !isNumber(to)) {
        if (window.console) {
            console.error('from和to两个参数必须都为数值');
        }
        return 0;
    }

    // 缓动算法
    const tween = Tween;

    if (!tween) {
        if (window.console) {
            console.error('缓动算法函数缺失');
        }
        return 0;
    }

    // duration, easing, callback均为可选参数
    // 而且顺序可以任意
    const options = {
        duration: 300,
        easing: 'Linear',
        callback() { }
    };

    const setOptions = function (obj) {
        if (isFunction(obj)) {
            options.callback = obj;
        }
        else if (toMillisecond(obj) !== -1) {
            options.duration = toMillisecond(obj);
        }
        else if (isString(obj)) {
            options.easing = obj;
        }
    };
    setOptions(duration);
    setOptions(easing);
    setOptions(callback);

    // requestAnimationFrame的兼容处理
    if (!window.requestAnimationFrame) {
        // eslint-disable-next-line
        requestAnimationFrame = function (fn) {
            return setTimeout(fn, 17);
        };
    }
    if (!window.cancelAnimationFrame) {
        // eslint-disable-next-line
        cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }

    // 算法需要的几个变量
    let start = 0;
    // during根据设置的总时间计算
    const during = Math.ceil(options.duration / 17);
    // 动画请求帧
    let req = null;

    // 当前动画算法
    // 确保首字母大写
    options.easing = options.easing.slice(0, 1).toUpperCase() + options.easing.slice(1);
    const arrKeyTween = options.easing.split('.');
    let fnGetValue;

    if (arrKeyTween.length === 1) {
        fnGetValue = tween[arrKeyTween[0]];
    }
    else if (arrKeyTween.length === 2) {
        fnGetValue = tween[arrKeyTween[0]] && tween[arrKeyTween[0]][arrKeyTween[1]];
    }
    if (isFunction(fnGetValue) === false) {
        console.error(`没有找到名为"${options.easing}"的动画算法`);
        return;
    }

    // 运动
    var step = function () {
        // 当前的运动位置
        const value = fnGetValue(start, from, to - from, during);

        // 时间递增
        start++;
        // 如果还没有运动到位，继续
        if (start <= during) {
            if (!target.isStopAllAction) {
                req = requestAnimationFrame(step);
            }
            options.callback(value);
        }
        else {
            // 动画结束，这里可以插入回调...
            options.callback(to, true);
        }
    };
    // 开始执行动画
    step();

    return function () {
        return req;
    };
};
const Action = {
    runAction(target, {actionList = [], isLoop = false}) {
        // console.log('runAction正在执行......');
        const realList = this.getRealActionList(target, actionList);
        const loop = isLoop;
        // 使用promise.resolve将promise数组串成一个任务队列
        let quence = Promise.resolve();
        realList.forEach((item, index) => {
            quence = quence
                .then(() => {
                    // 如果想立刻停止动作，将节点的isStopAllAction设置为true
                    if (target.isStopAllAction) {
                        return Promise.reject('不是真的出错了');
                    }
                    if (loop && index === realList.length - 1) {
                        this[item.action](item).then(() => {
                            this.runAction(target, {actionList, isLoop});
                        });
                        return Promise.resolve();
                    }
                    return this[item.action](item);
                })
                .catch(err => {
                    console.log(err);
                });
        });

        return quence;
    },
    getRealActionList(target, actionList = []) {
        // 添加target到记录动作信息数组中
        const list = actionList.map(item => {
            item.target = target;
            return item;
        });
        return list;
    },
    repeatForever({actionList = []}) {
        return {actionList, isLoop: true};
    },
    sequence() {
        // eslint-disable-next-line
        let args = Array.prototype.slice.call(arguments);
        args = args.map(item => item.actionList);
        const actionList = [].concat.apply([], args);
        return {actionList, isLoop: false};
    },
    place(x, y) {
        const actionList = [];
        actionList.push({
            action: 'runPlace',
            endScale: {x, y}
        });
        return {actionList, isLoop: false};
    },
    runPlace({target, endScale}) {
        return new Promise(resolve => {
            target.x = endScale.x;
            target.y = endScale.y;
            resolve();
        });
    },
    scaleTo(duration, x, y, easing = 'Linear') {
        const actionList = [];
        actionList.push({
            action: 'runScaleTo',
            duration,
            endScale: {x, y},
            easing
        });
        return {actionList, isLoop: false};
    },
    runScaleTo({target, endScale, duration = 1000, easing = 'Linear'}) {
        // x方向的缩放
        const promiseX = new Promise(resolve => {
            animation(target, target.scale.x, endScale.x, duration, easing, (value, isEnding) => {
                target.scale.x = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });

        // y方向的缩放
        const promiseY = new Promise(resolve => {
            animation(target, target.scale.y, endScale.y, duration, easing, (value, isEnding) => {
                target.scale.y = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });
        // 两个方向都完成，执行回调
        return Promise.all([promiseX, promiseY]);
    },
    moveBy(duration, x, y, easing = 'Linear') {
        const actionList = [];
        actionList.push({
            action: 'runMoveBy',
            duration,
            deltaPos: {x, y},
            easing
        });
        return {actionList, isLoop: false};
    },
    runMoveBy({target, deltaPos, duration = 300, easing = 'Linear'}) {
        // x,y轴上的变化量
        const endX = target.position.x + deltaPos.x;
        const endY = target.position.y + deltaPos.y;
        // x轴方向的移动
        const promiseX = new Promise(resolve => {
            if (deltaPos.x) {
                animation(target, target.position.x, endX, duration, easing, (value, isEnding) => {
                    target.position.x = value;
                    if (target.isStopAllAction) {
                        resolve();
                    }
                    if (isEnding) {
                        resolve();
                    }
                });
            }
            else {
                resolve();
            }
        });

        // y轴方向的移动
        const promiseY = new Promise(resolve => {
            if (deltaPos.y) {
                animation(target, target.position.y, endY, duration, easing, (value, isEnding) => {
                    target.position.y = value;
                    if (target.isStopAllAction) {
                        resolve();
                    }
                    if (isEnding) {
                        resolve();
                    }
                });
            }
            else {
                resolve();
            }
        });
        return Promise.all([promiseX, promiseY]);
    },
    moveTo(duration, pos, easing = 'Linear') {
        const actionList = [];
        actionList.push({
            action: 'runMoveTo',
            duration,
            pos,
            easing
        });
        return {actionList, isLoop: false};
    },
    callFunc(fn) {
        const actionList = [];
        actionList.push({
            action: 'runCallFunc',
            fn
        });
        return {actionList, isLoop: false};
    },
    runCallFunc({fn}) {
        return new Promise(resolve => {
            fn();
            resolve();
        });
    },
    runMoveTo({target, pos, duration = 300, easing = 'Linear'}) {
        // x轴方向的移动
        const promiseX = new Promise(resolve => {
            animation(target, target.position.x, pos.x, duration, easing, (value, isEnding) => {
                target.position.x = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });

        // y轴方向的移动
        const promiseY = new Promise(resolve => {
            animation(target, target.position.y, pos.y, duration, easing, (value, isEnding) => {
                target.position.y = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });

        // 两个方向上的运动都完成，整个动作完成，执行回调。
        return Promise.all([promiseX, promiseY]);
    },
    scaleBy(duration, x, y, easing = 'Linear') {
        const actionList = [];
        actionList.push({
            action: 'runScaleBy',
            duration,
            deltaScale: {x, y},
            easing
        });
        return {actionList, isLoop: false};
    },
    runScaleBy({target, deltaScale, duration = 1000, easing}) {
        const endScaleX = target.scale.x * deltaScale.x;
        const endScaleY = target.scale.y * deltaScale.y;
        // x方向缩放
        const promiseX = new Promise(resolve => {
            animation(target, target.scale.x, endScaleX, duration, easing, (value, isEnding) => {
                target.scale.x = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });

        // y方向缩放
        const promiseY = new Promise(resolve => {
            animation(target, target.scale.y, endScaleY, duration, 'Linear', (value, isEnding) => {
                target.scale.y = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });

        // 两个方向都完成，执行回调
        return Promise.all([promiseX, promiseY]);
    },
    rotateBy(duration, rotation, easing = 'Linear') {
        const actionList = [];
        actionList.push({
            action: 'runRotateBy',
            duration,
            rotation,
            easing
        });
        return {actionList, isLoop: false};
    },
    runRotateBy({target, rotation, duration = 1000, easing}) {
        const endRotation = target.rotation + rotation;
        const promiseA = new Promise(resolve => {
            animation(target, target.rotation, endRotation, duration, easing, (value, isEnding) => {
                target.rotation = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });
        return promiseA;
    },
    angleBy(duration, angle, easing = 'Linear') {
        const actionList = [];
        actionList.push({
            action: 'runAngleBy',
            duration,
            angle,
            easing
        });
        return {actionList, isLoop: false};
    },
    runAngleBy({target, angle, duration = 1000, easing}) {
        const endAngle = target.angle + angle;
        const promiseA = new Promise(resolve => {
            animation(target, target.angle, endAngle, duration, easing, (value, isEnding) => {
                target.angle = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });
        return promiseA;
    },
    angleTo(duration, angle, easing = 'Linear') {
        const actionList = [];
        actionList.push({
            action: 'runAngleTo',
            duration,
            angle,
            easing
        });
        return {actionList, isLoop: false};
    },
    runAngleTo({target, angle, duration = 1000, easing}) {
        const endAngle = angle;
        const promiseA = new Promise(resolve => {
            animation(target, target.angle, endAngle, duration, easing, (value, isEnding) => {
                target.angle = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });
        return promiseA;
    },
    fadeIn(duration, easing = 'Linear') {
        const actionList = [];
        actionList.push({
            action: 'runFadeIn',
            duration,
            easing
        });
        return {actionList, isLoop: false};
    },

    runFadeIn({target, duration = 1000, easing}) {
        const promiseA = new Promise(resolve => {
            animation(target, 0, 1, duration, easing, (value, isEnding) => {
                target.alpha = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });
        return promiseA;
    },
    fadeOut(duration, easing = 'Linear') {
        const actionList = [];
        actionList.push({
            action: 'runFadeOut',
            duration,
            easing
        });
        return {actionList, isLoop: false};
    },

    runFadeOut({target, duration = 1000, easing}) {
        const promiseA = new Promise(resolve => {
            animation(target, 1, 0, duration, easing, (value, isEnding) => {
                target.alpha = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });
        return promiseA;
    },

    fadeTo(duration, endAlpha, easing = 'Linear') {
        const actionList = [];
        actionList.push({
            action: 'funFadeTo',
            duration,
            easing,
            endAlpha
        });
        return {actionList, isLoop: false};
    },

    funFadeTo({target, endAlpha, duration = 1000, easing}) {
        return new Promise(resolve => {
            animation(target, target.alpha, endAlpha, duration, easing, (value, isEnding) => {
                target.alpha = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });
    },
    delayTime(duration) {
        const actionList = [];
        actionList.push({
            action: 'runDelayTime',
            duration
        });
        return {actionList, isLoop: false};
    },
    runDelayTime({duration}) {
        return new Promise(resolve => setTimeout(resolve, duration));
    },
    rotateTo(duration, rotation, easing = 'Linear') {
        const actionList = [];
        actionList.push({
            action: 'runRotateTo',
            duration,
            rotation,
            easing
        });
        return {actionList, isLoop: false};
    },

    runRotateTo({target, rotation, duration = 1000, easing = 'Linear'}) {
        return new Promise(resolve => {
            animation(target, target.rotation, rotation, duration, easing, (value, isEnding) => {
                target.rotation = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });
    },

    jumpTo(duration, x, y, height) {
        const actionList = [];
        actionList.push({
            action: 'runJumpTo',
            duration,
            pos: {x, y},
            height
        });
        return {actionList, isLoop: false};
    },

    runJumpTo({target, pos, height = 0, duration = 300}) {
        const posMax = {x: (pos.x - target.position.x) / 2, y: target.position.y - height};
        // x轴方向的移动
        const promiseX = new Promise(resolve => {
            animation(target, target.position.x, pos.x, duration, 'Linear', (value, isEnding) => {
                target.position.x = value;
                if (target.isStopAllAction) {
                    resolve();
                }
                if (isEnding) {
                    resolve();
                }
            });
        });

        // y轴方向的移动
        const promiseY = new Promise(resolve => {
            new Promise(resolve1 => {
                animation(target, target.position.y, posMax.y, duration / 2, 'Quart.easeOut', (value, isEnding) => {
                    target.position.y = value;
                    if (target.isStopAllAction) {
                        resolve1();
                    }
                    if (isEnding) {
                        resolve1();
                    }
                });
            }).then(() => {
                animation(target, target.position.y, pos.y, duration / 2, 'Quart.easeIn', (value, isEnding) => {
                    target.position.y = value;
                    if (target.isStopAllAction) {
                        resolve();
                    }
                    if (isEnding) {
                        resolve();
                    }
                });
            });
        });

        // 两个方向上的运动都完成，整个动作完成，执行回调。
        return Promise.all([promiseX, promiseY]);
    }
};

export default Action;
