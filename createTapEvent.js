require('./index.less');

var isIOS = window.navigator.userAgent.match(/(iPhone\sOS)\s([\d_]+)/);

// 手指移动距离判定上限
var MOVE_THRESHOLD = 8;
// 长按时间判定
var TOUCH_DELAY = 1000;
// 点击态移除的时间间隔
var TOUCH_ACTIVE_DELAY = 150;

var touchEvents = {
    startPos: {},
    lastPos: {}
};

var touchKeysToStore = [
    'clientX',
    'clientY',
    'pageX',
    'pageY',
    'screenX',
    'screenY',
    'radiusX',
    'radiusY'
];

// 缓存坐标位置等属性
var storeTouchKeys = function(touch, target) {
    if (typeof target.persist === 'function') {
        target.persist();
    }

    if (touch) {
        for (var i = 0; i < touchKeysToStore.length; i += 1) {
            var key = touchKeysToStore[i];
            target[key] = touch[key];
        }
    }
}

var invalidateIfMoreThanOneTouch = function(event) {
    // 多指触摸设为无效tap
    touchEvents.invalid = event.touches && event.touches.length > 1 || touchEvents.invalid;
};

/**
 * 增加默认disable功能
 */
var isDisabled = function(element) {
    if (!element) {
        return false;
    }
    var disabled = element.getAttribute('disabled');

    return disabled !== false && disabled !== null;
}

var fakeTapEvent = function(event) {
    if (typeof event.persist === 'function') {
        event.persist();
    }

    event.type = 'tap';
    event.button = 0;
};

/**
 * 增加点击态功能
 */
var wrapTap = function(onTap, tapActive) {
    var cls = (typeof tapActive === 'boolean') ? 'tap-active' : tapActive;

    return function(event) {
        if (typeof event.persist === 'function') {
            event.persist();
        }
        var target = event.currentTarget;
        target.classList.add(cls);
        setTimeout(function() {
            target.classList.remove(cls);
            setTimeout(function() {
                onTap(event, target);
            }, 50);
        }, TOUCH_ACTIVE_DELAY);
    }
};

var onTouchStart = function(callback, event) {
    // 修复iOS下滚动点停跳转的问题
    if (!touchEvents.moved) {
        setTimeout(function() {
            touchEvents.hasStart = true;
        });
    }

    // 是否有效tap
    touchEvents.invalid = false;
    // 手指是否滑动了
    touchEvents.moved = false;
    // 手指是否摸上了
    touchEvents.touched = true;
    touchEvents.lastTouchDate = new Date().getTime();

    // 缓存当前位置
    storeTouchKeys(event.touches[0], touchEvents.startPos);
    storeTouchKeys(event.touches[0], touchEvents.lastPos);

    // 不处理多指触摸
    invalidateIfMoreThanOneTouch(event);

    if (typeof callback === 'function') {
        callback(event);
    }

}

var onTouchMove = function(callback, event) {
    touchEvents.hasStart = false;

    touchEvents.touched = true;
    touchEvents.lastTouchDate = new Date().getTime();

    storeTouchKeys(event.touches[0], touchEvents.lastPos);

    invalidateIfMoreThanOneTouch(event);

    // 判断手指移动距离是否过大
    if (Math.abs(touchEvents.startPos.clientX - touchEvents.lastPos.clientX) > MOVE_THRESHOLD ||
        Math.abs(touchEvents.startPos.clientY - touchEvents.lastPos.clientY) > MOVE_THRESHOLD) {
        touchEvents.moved = true;
    }

    if (typeof callback === 'function') {
        callback(event);
    }
}

var onTouchEnd = function(callback, onTap, type, tapActive, event) {
    touchEvents.touched = true;
    touchEvents.lastTouchDate = new Date().getTime();

    invalidateIfMoreThanOneTouch(event);

    if (typeof callback === 'function') {
        callback(event);
    }

    if (!touchEvents.invalid && !touchEvents.moved) {
        var box = event.currentTarget.getBoundingClientRect();

        // 判断点击区域
        if (touchEvents.lastPos.clientX - (touchEvents.lastPos.radiusX || 0) <= box.right &&
            touchEvents.lastPos.clientX + (touchEvents.lastPos.radiusX || 0) >= box.left &&
            touchEvents.lastPos.clientY - (touchEvents.lastPos.radiusY || 0) <= box.bottom &&
            touchEvents.lastPos.clientY + (touchEvents.lastPos.radiusY || 0) >= box.top) {

            if (!isDisabled(event.currentTarget)) {
                if (typeof onTap === 'function') {
                    if (tapActive) {
                        onTap = wrapTap(onTap, tapActive);
                    }

                    // 修复iOS滚动点停问题
                    if(isIOS && !touchEvents.hasStart) {

                    }else {
                        storeTouchKeys(touchEvents.lastPos, event);
                        fakeTapEvent(event);
                        onTap(event, event.currentTarget);
                    }
                }
            }
        }
    }
}

var createTapEvent = function(type, props) {
    var newProps = {};
    for (var key in props) {
        newProps[key] = props[key];
    }

    // 开始模拟onTap
    newProps.onTouchStart = onTouchStart.bind(null, props.onTouchStart);
    newProps.onTouchMove = onTouchMove.bind(null, props.onTouchMove);
    newProps.onTouchEnd = onTouchEnd.bind(null, props.onTouchEnd, props.onTap, type, props.tapActive);

    //去掉自定义的属性，React15.4+ 不允许非规范的自定义属性，出现红色的告警
    delete newProps.onTap;
    delete newProps.tapActive;

    if (typeof Object.freeze === 'function') {
        Object.freeze(newProps);
    }

    return newProps;
}

module.exports = createTapEvent;
