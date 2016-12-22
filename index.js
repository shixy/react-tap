var React = require('react');

var createTapEvent = require('./createTapEvent.js');

// 缓存一下，下面要重写
var originalCreateElement = React.createElement;

React.createElement = function() {
    var args = Array.prototype.slice.call(arguments);

    var type = args[0];
    var props = args[1];

    // 只看基础组件(html标签)上的onTap
    var isBasicTag = type && typeof type === 'string';
    var hasOnTapProp = props && typeof props.onTap === 'function';

    if (isBasicTag && hasOnTapProp) {
        // 加上自定义的onTap事件
        args[1] = createTapEvent(type, props || {});
    }

    // 调用React的createElement
    return originalCreateElement.apply(null, args);
};

// 将React默认提供的默认html Components也用自定义的createElement执行
if (typeof React.DOM === 'object') {
    for (var key in React.DOM) {
        React.DOM[key] = React.createElement.bind(null, key);
    }
}
