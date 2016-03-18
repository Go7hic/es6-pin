(function(window, document) {
  'use strict';
  /**
   * 设置基本的参数，并执行初始化
   * @param {String} el     需要固定的元素，必填
   * @param {String} othel   当滚动超过这个个元素的时候开始固定，可选
   * @param {Number} aHeight 自定义滚动高差，可选
   * @param {[type]} options [description]
   */
  function Pin(el, othel, aHeight, options) {
    this.el = (typeof el === 'string') ? document.querySelector(el) : el;
    this.othel = (typeof othel === 'string') ? document.querySelector(othel) : othel;
    this.aHeight = aHeight || 0;
    this.parent = this.el.parentNode;

    this.setOptions(options || {});

    this.init();
  }

  Pin.prototype.setOptions = function(options) {
    this.options = {
      onPin: (options.onPin !== undefined) ? options.onPin : Pin.noop,
      onUnpin: (options.onUnpin !== undefined) ? options.onUnpin : Pin.noop,
      onTouchBottom: (options.onTouchBottom !== undefined) ? options.onTouchBottom : Pin.noop,
      stopOnBottom: (options.stopOnBottom !== undefined) ? options.stopOnBottom : true,
      respectWindow: (options.respectWindow !== undefined) ? options.respectWindow : true
    };
  };

  Pin.prototype.init = function() {
    this.createHelperElement();
    this.bind();
    this.calcPositions();
    this.onWindowScroll();
  };

  Pin.prototype.createHelperElement = function() {
    this.helperDiv = document.createElement(this.el.tagName);

    Pin.setStyle(this.helperDiv, {
      position: Pin.getStyle(this.el, 'position'),
      height: Pin.getStyle(this.el, 'height'),
      width: Pin.getStyle(this.el, 'width'),
      float: Pin.getStyle(this.el, 'float'),
      margin: Pin.getStyle(this.el, 'margin'),
      padding: Pin.getStyle(this.el, 'padding'),
      borderTop: Pin.getStyle(this.el, 'borderTop'),
      borderLeft: Pin.getStyle(this.el, 'borderLeft'),
      borderRight: Pin.getStyle(this.el, 'borderRight'),
      borderBottom: Pin.getStyle(this.el, 'borderBottom'),
      display: 'none',
      visibility: 'hidden'
    });

    this.parent.insertBefore(this.helperDiv, this.el);
  };

  Pin.prototype.refreshHelperElementWidth = function() {
    Pin.setStyle(this.helperDiv, {
      width: Pin.getStyle(this.el, 'width')
    });
  };

  Pin.prototype.showHelperElement = function(show) {
    Pin.setStyle(this.helperDiv, {
      display: (show === false) ? 'none' : 'block'
    });
  };

  Pin.prototype.destroy = function() {
    Pin.setStyle(this.el);
    this.unbind();
  };

  Pin.prototype.calcPositions = function() {
    if (Pin.getStyle(this.parent, 'position') === 'static') {
      Pin.setStyle(this.parent, {
        position: 'relative'
      });
    }

    this.positions = {
      offset: this.getOffset(this.el),
      parentOffset: this.getParentOffset(),
      stopTop: (this.parent.offsetHeight + this.getOffset(this.parent).top) - this.el.offsetHeight
    };
  };

  Pin.prototype.getOffset = function(element) {
    var de = document.documentElement,
      box = element.getBoundingClientRect();

    return {
      top: box.top + window.pageYOffset - de.clientTop,
      left: box.left + window.pageXOffset - de.clientLeft
    };
  };
  Pin.prototype.getParentOffset = function() {
    return {
      left: this.el.offsetLeft
    }
  };


  Pin.prototype.bind = function() {
    this.reloadBind = this.reload.bind(this);
    this.onWindowScrollBind = this.onWindowScroll.bind(this);

    window.addEventListener('resize', this.reloadBind);
    window.addEventListener('scroll', this.onWindowScrollBind);
  };

  Pin.prototype.unbind = function() {
    window.removeEventListener('resize', this.reloadBind);
    window.removeEventListener('scroll', this.onWindowScrollBind);
  };

  Pin.prototype.reload = function() {
    this.showHelperElement(false);
    Pin.setStyle(this.el);
    this.calcPositions();
    this.onWindowScroll();
    this.refreshHelperElementWidth();
  };

  // 滚动事件的时候执行的一些方法
  Pin.prototype.onWindowScroll = function() {
    var newTop;
    var _othel = this.othel;
    var _othelH = _othel.offsetHeight || 0;

    // 屏幕窗口小没有滚动
    if (this.options.respectWindow) {
      if (Pin.windowIsSmaller(this.el)) {
        return;
      }
    }
    if (this.touchBottom()) {
      return;
    }
    newTop = window.pageYOffset - this.positions.offset.top - _othelH - this.aHeight;

    if (newTop > 0 && Pin.getStyle(this.el, 'position') === 'fixed') {
      return;
    }

    if (newTop <= 0 && (Pin.getStyle(this.el, 'position') === 'relative' || Pin.getStyle(this.el, 'position') === 'static')) {
      return;
    }
    if (newTop > 0) {
      return this.pinElement();
    }

    Pin.setStyle(this.el);
    this.options.onUnpin(this);
    this.showHelperElement(false);
  };

  Pin.prototype.pinElement = function() {
    Pin.setStyle(this.el, {
      position: 'fixed',
      left: Pin.toPx(this.positions.offset.left),
      width: Pin.getStyle(this.el, 'width'),
      top: 0,
      marginLeft: 0,
      marginTop: 0,
      bottom: ''
    });

    this.options.onPin(this);
    this.showHelperElement();
  };

  Pin.prototype.touchBottom = function() {
    if (!this.options.stopOnBottom) {
      return false;
    }

    if (window.pageYOffset > this.positions.stopTop) {

      if (Pin.getStyle(this.el, 'position') === 'absolute') {
        return true;
      }

      Pin.setStyle(this.el, {
        position: 'absolute',
        width: Pin.getStyle(this.el, 'width'),
        top: '',
        bottom: 0,
        left: Pin.toPx(this.positions.parentOffset.left),
        marginLeft: ''
      });

      this.options.onTouchBottom(this);
      this.showHelperElement();

      return true;
    }

    return false;
  };

  // 设置样式
  Pin.setStyle = function(el, properties) {
    if (!properties) {
      el.removeAttribute('style');
      return;
    }
    for (var property in properties) {
      el.style[property] = properties[property];
    }
  };

  Pin.getStyle = function(el, property) {
    return (property) ? window.getComputedStyle(el)[property] : window.getComputedStyle(el);
  };

  Pin.toPx = n => n + 'px';

  Pin.windowIsSmaller = el => window.innerHeight < el.offsetHeight;

  Pin.init = function() {
    var pinElements = Array.prototype.slice.call(document.querySelectorAll('[data-pin]'));

    pinElements.forEach(function(e) {
      new Pin(e);
    });
  };

  Pin.noop = function() {};

  window.Pin = Pin;
  // 当页面 DOM 渲染完成开始初始化
  if (typeof Document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', Pin.init);
  }

  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = Pin;
  } else if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(function() {
      return Pin;
    });
  } else {
    this.Pin = Pin;
  }
}(window, document));
