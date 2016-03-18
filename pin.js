((function(window, document) {
  'use strict'
  class Pin {
    /**
     * 设置基本的参数，并执行初始化
     * @param {String} el     需要固定的元素，必填
     * @param {String} othel   当滚动超过这个个元素的时候开始固定，可选
     * @param {Number} aHeight 自定义滚动高差，可选
     * @param {[type]} options [description]
     */
    constructor(el, othel, aHeight, options) {
      this.el = (typeof el === 'string') ? document.querySelector(el) : el;
      this.othel = (typeof othel === 'string') ? document.querySelector(othel) : othel;
      this.aHeight = aHeight || 0;
      this.parent = this.el.parentNode;

      this.setOptions(options || {});

      this.init();
    }

    setOptions(options) {
      this.options = {
        onPin: (options.onPin !== undefined) ? options.onPin : Pin.noop,
        onUnpin: (options.onUnpin !== undefined) ? options.onUnpin : Pin.noop,
        onTouchBottom: (options.onTouchBottom !== undefined) ? options.onTouchBottom : Pin.noop,
        stopOnBottom: (options.stopOnBottom !== undefined) ? options.stopOnBottom : true,
        respectWindow: (options.respectWindow !== undefined) ? options.respectWindow : true
      };
    }

    init() {
      this.createHelperElement();
      this.bind();
      this.calcPositions();
      this.onWindowScroll();
    }

    createHelperElement() {
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
    }

    refreshHelperElementWidth() {
      Pin.setStyle(this.helperDiv, {
        width: Pin.getStyle(this.el, 'width')
      });
    }

    showHelperElement(show) {
      Pin.setStyle(this.helperDiv, {
        display: (show === false) ? 'none' : 'block'
      });
    }

    destroy() {
      Pin.setStyle(this.el);
      this.unbind();
    }

    calcPositions() {
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
    }

    getOffset(element) {
      const de = document.documentElement,
        box = element.getBoundingClientRect();

      return {
        top: box.top + window.pageYOffset - de.clientTop,
        left: box.left + window.pageXOffset - de.clientLeft
      };
    }

    getParentOffset() {
      return {
        left: this.el.offsetLeft
      };
    }

    bind() {
      this.reloadBind = this.reload.bind(this);
      this.onWindowScrollBind = this.onWindowScroll.bind(this);

      window.addEventListener('resize', this.reloadBind);
      window.addEventListener('scroll', this.onWindowScrollBind);
    }

    unbind() {
      window.removeEventListener('resize', this.reloadBind);
      window.removeEventListener('scroll', this.onWindowScrollBind);
    }

    reload() {
      this.showHelperElement(false);
      Pin.setStyle(this.el);
      this.calcPositions();
      this.onWindowScroll();
      this.refreshHelperElementWidth();
    }

    onWindowScroll() {
      let newTop;
      const _othel = this.othel;
      const _othelH = _othel.offsetHeight || 0;

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
    }

    pinElement() {
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
    }

    touchBottom() {
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
    }
  }

  // 设置样式
  Pin.setStyle = (el, properties) => {
    if (!properties) {
      el.removeAttribute('style');
      return;
    }

    for (let property in properties) {
      el.style[property] = properties[property];
    }
  };

  Pin.getStyle = (el, property) => (property) ? window.getComputedStyle(el)[property] : window.getComputedStyle(el);

  Pin.toPx = n => `${n}px`;

  Pin.windowIsSmaller = el => window.innerHeight < el.offsetHeight;

  Pin.init = () => {
    const pinElements = Array.prototype.slice.call(document.querySelectorAll('[data-pin]'));
    pinElements.forEach(e => {
      new Pin(e);
    });
  };

  Pin.noop = () => {};

  window.Pin = Pin;
  // 当页面 DOM 渲染完成开始初始化
  if (typeof Document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', Pin.init);
  }
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = Pin;
  } else if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(() => Pin);
  } else {
    this.Pin = Pin;
  }
})(window, document));
