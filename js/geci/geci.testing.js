// Source: src/shim/array.js
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(cb,args) {
    var t, k=0, len=this.length;
    if (arguments.length >= 2) t = args;
    while (k < len) {
      if (k in this) cb.call(t, this[k], k, this);
      k++;
    }
  }
}

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement) {
    'use strict';
    var n, k, t = Object(this),
        len = t.length >>> 0;
    if (len === 0) return -1;
    n = 0;
    if (arguments.length > 1) {
      n = Number(arguments[1]);
      if (n != n) n = 0;
      else if (n !== 0 && n != Infinity && n != -Infinity) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
    if (n >= len) return -1;
    for (k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) {
      if (k in t && t[k] === searchElement) return k;
    }
    return -1;
  };
}

if (!Array.prototype.map) {
  Array.prototype.map = function (callback, thisArg) {
    var T, A, k;
    if (this === null) {
      throw new TypeError(' this is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
      T = thisArg;
    }
    A = new Array(len);
    k = 0;
    while (k < len) {
      var kValue, mappedValue;
      if (k in O) {
        kValue = O[k];
        mappedValue = callback.call(T, kValue, k, O);
        A[k] = mappedValue;
      }
      k++;
    }
    return A;
  };
}

// Source: src/shim/function.js
if (!Function.prototype.bind) {
  Function.prototype.bind = function (s) {
    var slice = Array.prototype.slice;
    var args = slice.call(arguments, 1),
        fn = this, 
        NOP = function () {},
        bound = function () {
          return fn.apply(this instanceof NOP && s? this : s,
                          args.concat(slice.call(arguments)));
        };
    NOP.prototype = this.prototype;
    bound.prototype = new NOP();
    return bound;
  };
}

// Source: src/shim/object.js
if (!Object.keys) {
  Object.keys = (function () {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}
// Source: src/core/base.js
(function(window,document) {
  'use strict';
  /** @namespace geci */
  var s4 = function() {
    return Math.floor(65536*(1+Math.random())).toString(16).substring(1);
  }

  var groupCall = function(namespace, methods) {
    if (!methods) return;
    return function() {
      methods.forEach(function(method) {
        namespace[method]();
      });
    }
  }

  var htmlEvents = 'load unload blur change focus reset select submit abort keydown keypress keyup click dblclick mousedown mousemove mouseout mouseover mouseup readystatechange'.split(' ');
  var eventHandlers = {};
  window.geci = {  
    domReady: null,
    libraryBase: window.GECI_LIBRARY_BASE || '',
    createDispatcher: function(target) {
      target.listeners = {};
      target.createEvent = function(type,data) {
        var d = document, ev;
        if (!!d.createEvent) {
          ev = d.createEvent('CustomEvent');
          ev.initCustomEvent(type,true,true,data);
        } else if (d.createEventObject) {
          ev = d.createEventObject();
          ev.customType = type;
          ev.detail = data;
        }
        return ev;
      }

      target.dispatchEvent = function(ev, data) {
        if (typeof(ev) === 'string') ev = this.createEvent(ev, data);
        else if (data) ev.detail = data;
        var list = this.listeners;
        if (list === undefined) return;
        var arr = list[ev.type];
        if (arr !== undefined) {
          if (ev.target === undefined) ev.target = this;
          for (var i=0; i < arr.length; i ++) {
            arr[i].call(this, ev);
          }
        }
      }

      target.addEventListener = function (type, listener) {
        var l = this.listeners;
        if (l[type] === undefined) l[type] = [listener];
        else if (l[type].indexOf(listener) === -1) l[type].push(listener);
      }

      target.hasEventListener = function (type, listener) {
        var l = this.listeners;
        if (l[type] !== undefined && l[type].indexOf(listener) !== -1) return true;
        else return false;
      }

      target.removeEventListener = function (type, listener) {
        var l = this.listeners;
        var index = l[type].indexOf(listener);
        if (index !== - 1) l[type].splice(index, 1);
      }

      target.createEvent = function(type,data) {
        var d = document, ev;
        if (!!d.createEvent) {
          ev = d.createEvent('CustomEvent');
          ev.initCustomEvent(type,true,true,data);
        } else if (d.createEventObject) {
          ev = d.createEventObject();
          ev.customType = type;
          ev.detail = data;
        }
        return ev;
      }
    },

    setLibraryBase: function(base) {
      if (!this.libraryBase) this.libraryBase = base;
    },

    getLibraryBase: function() {
      return this.libraryBase;
    },

    option: function(value,alternative) {
      return (('undefined' === typeof value)? alternative : value);
    },

    // TODO Include two-letter ISO 639-1 codes
    defaultLocale: 'es',

    /**
     * Filters an object based on the set locale
     * @param {Object} object Object containing the locales
     **/
    getLocale: function(o) {
      return o[this.defaultLocale];
    },

    /**
     * Adds a new module to the geci namespace
     * @param {String} packageName Package name, eg: 'geci.dom'
     * @param {Object} methods The module object
     */
    ns: function(pkg,m) {
      var o = geci;
      var p = pkg.split('.');
      for (var i = (p[0] == 'geci')? 1:0; i < p.length; i++) {
        o[p[i]] = o[p[i]] || {};
        if (i == p.length - 1 && m) o[p[i]] = m;
        o = o[p[i]];
      }
      return o;
    },

    /**
     * Converts an Iterable object into an Array
     * @param {Iterable} iterable An iterable object
     **/
    toArray: function(iterable) {
      if (!iterable) return [];
      if ('toArray' in Object(iterable)) return iterable.toArray();
      var length = iterable.length || 0, results = new Array(length);
      while (length--) results[length] = iterable[length];
      return results;
    },

    extend: function(s, d) {
      for (var k in s) if (!d.hasOwnProperty(k)) d[k] = s[k];
      return d;
    },

    resolveVariable: function(variable, object) {
      if (!object) return null;
      var nextProp, nextMatch, scope = object;
      var getParent = /([\w-_])+/g;
      while (!!(nextMatch = getParent.exec(variable))) {
        nextProp = nextMatch[0];
        if (scope.hasOwnProperty(nextProp)) scope = scope[nextProp];
        else { scope = undefined; break }
      }
      return scope;
    },

    guid: function() {
      return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4();
    },

    stopEvent: function(ev) {
      if (ev.preventDefault) ev.preventDefault();
      else ev.returnValue = false;
    },


    filterHandler: function(type, handler) {
      return function(ev) { if (ev.customType == type) handler(ev) }
    },

    addHandler: function(el, type, handler, capture) {
      if (el instanceof Array) {
        var handlers = [];
        for (var i=0; i < el.length; i++) handlers.push(this.addHandler(el[i], type, handler, capture));
        return handlers;
      }
      var eventHandler;
      capture = capture || false;
      if (this.eventModel(el)) {
        eventHandler = handler;
        el.addEventListener(type, eventHandler, capture);
      }else{
        var custom = (htmlEvents.indexOf(type) == -1);
        if (custom) el.attachEvent('ondataavailable', this.filterHandler(type, handler));
        else {
          eventHandler = function() { handler.apply(el, arguments) };
          el.attachEvent('on' + type, eventHandler);
        }
      }
      var uid = geci.dom.getUID(el);
      if (!(uid in eventHandlers)) eventHandlers[uid] = {}
      if (!(type in eventHandlers[uid])) eventHandlers[uid][type] = [];
      eventHandlers[uid][type].push([eventHandler, capture]);
      return eventHandler;
    },

    removeHandler: function(el, type, handler, capture) {
      capture = capture || false;
      var index = this.getHandlerIndex(el, type, handler, capture);
      if (!~index) return;
      if (this.eventModel(el)) el.removeEventListener(type, handler, capture);
      else el.detachEvent('on' + type, handler); // FIXME
      var uid = geci.dom.getUID(el);
      eventHandlers[uid][type].splice(index, 1);
    },

    removeAllHandlers: function(el, type) {
      var uid = geci.dom.getUID(el);
      if (!(uid in eventHandlers)) return;
      if (!(type in eventHandlers[uid])) return;
      for (var i=0; i < eventHandlers[uid][type].length; i++) {
        var ev = eventHandlers[uid][type][i];
        if (this.eventModel(el)) el.removeEventListener(type, ev[0], ev[1]);
        else el.detachEvent('on' + type, ev[0]); // FIXME
      }
      delete eventHandlers[uid][type];
    },

    getHandlerIndex: function(el, type, handler, capture) {
      var uid = geci.dom.getUID(el);
      if (!(uid in eventHandlers)) return -1;
      if (!(type in eventHandlers[uid])) return -1;
      for (var i=0; i < eventHandlers[uid][type].length; i++) {
        var ev = eventHandlers[uid][type][i];
        if (handler == ev[0] && capture == ev[1]) return i;
      }
      return -1;
    },

    eventModel: function(el) {
      return ('undefined' !== typeof el.addEventListener);
    },

    shouldDefer: function(conditions) {
      for (var i=0; i < conditions.length; i++) {
        var condition = conditions[i];
        if (condition instanceof Array) return this.shouldDefer(condition);
        else if (condition.match(/\/.*\//)) return false;
      }
      return true;
    },

    matchesConditions: function(conditions, and) {
      if (!conditions) return true;
      var matchAll = !!and;
      var matches = false;
      for (var i=0; i < conditions.length; i++) {
        var condition = conditions[i];
        if (condition instanceof Array) matches = this.matchesConditions(condition, true);
        else if (condition.match(/\/.*\//)) {
          var regex = eval(condition);
          var ua = window.navigator.userAgent;
          matches = regex.test(ua);
        }else matches = geci.dom.test(condition);
        if (!matches && matchAll) return false;
        if (matches && !matchAll) return true
      }
      return matches;
    },

    isRunnable: function(options, deferred) {
      if (!options) return true;
      var only    = options.only || null;
      var except  = options.except || null;
      var deferOnly = (only)? this.shouldDefer(only) : false;
      var deferExcept = (except)? this.shouldDefer(except) : false;
      var needsDefer = deferOnly || deferExcept;
      if (!this.domReady && needsDefer) return this.bindOnReady(deferred);

      var run = true;
      if (only) run = this.matchesConditions(only);
      if (run && except) run = !this.matchesConditions(except);
      return run;
    },

    load: function(url, options) {
      options = options || {};
      var defer = this.load.bind(this, url, options);
      if (!this.isRunnable(options, defer)) return;
      var done = false;
      var d = document;
      var t = 'script';
      var el = d.createElement(t);
      var external = url.match(/^(http|\/\/)/) || options.external
      if (!external) url = this.libraryBase + url;
      el.async = ('undefined' !== typeof options.async)? options.async : true;
      el.src = url;
      var p = d.getElementsByTagName(t)[0];
      p.parentNode.insertBefore(el, p);
      if (options.callback || (options.scope && options.onLoad)) {
        el.onreadystatechange = el.onload = function() {
          var state = el.readyState;
          if (!done && (!state || /loaded|complete/.test(state))) {
            done = true;
            if (options.callback) options.callback();
            else groupCall(eval(options.scope), options.onLoad)();
          }
        }
      }
    },

    runStack: function(module, options, onReady, onLoad) {
      var defer = this.runStack.bind(this, module, options, onReady, onLoad);
      if (this.isRunnable(options, defer) && (onReady || onLoad)) {
        this.bindOnReady(groupCall(module,onReady));
        this.bindOnLoad(groupCall(module,onLoad));
      }
    },
  
    loadVendor: function(vendorName, options, onReady, onLoad) {
      var vendors = geci.vendors;
      var module = vendors[vendorName];
      var defer = this.loadVendor.bind(this, vendorName, options, onReady, onLoad)
      if (this.isRunnable(options, defer)) {
        if (module.enable) module.enable(options);
        if (onReady) this.bindOnReady(groupCall(module,onReady));
        if (onLoad) this.bindOnLoad(groupCall(module,onLoad));
      }
    },

    bindOnReady: function(callback, scope) {
      if (!callback) return;
      var self = this;
      var d = document;
      var hasEventModel = this.eventModel(d);
      var ev         = hasEventModel? 'DOMContentLoaded' : 'readystatechange';
      var stateCheck = hasEventModel?   'interactive'    :    'complete';
      var deferred = function() {
        if (d.readyState !== stateCheck) return;
        self.domReady = true;
        self.removeHandler(d, ev, deferred);
        callback.call(scope);
      }
      if (self.domReady) callback.call(scope);
      else this.addHandler(d, ev, deferred);
    },

    getQueryObject: function(o,url) {
      var qs;
      if ('string' === typeof o) { url = o; o = {} }
      if (url) {
        var index = url.indexOf('?');
        if (!~index) qs = null;
        else qs = url.split('#')[0].substr(index);
      }else qs = document.location.search;
      if (!qs) return (o || {});
      else {
        qs = qs.substr(1);
        var arr = qs.split('&');
        var params = {};
        arr.forEach(function(p) {
          var a = p.split('=');
          params[a[0]] = decodeURIComponent(a[1]);
        });
        for (var i in o) params[i] = o[i];
        return params;
      }
    },

    getHashObject: function() {
      var o = {};
      var arr = window.location.hash.substr(1).split('&');
      var params = {};
      arr.forEach(function(p) {
        var a = p.split('=');
        params[a[0]] = decodeURIComponent(a[1]);
      });
      for (var i in o) params[i] = o[i];
      return params;
    },

    getQueryString: function(o, url) {
      if ('string' === typeof o) { url = o; o = {} }
      var params = [];
      var qs = this.getQueryObject(o,url);
      for (var c in qs) params.push(c + '=' + encodeURIComponent(qs[c]));
      return (!params)? null : '?' + params.join('&');
    },

    isEnabled: function(vendorName) {
      return ('undefined' !== typeof (geci.vendors[vendorName]));
    },

    bindOnLoad: function(callback, scope) {
      if (!callback) return;
      this.addHandler(window, 'load', callback.bind(scope));
    }
  }
  window.geci.createDispatcher(window.geci);
})(window, document);

// Source: src/core/dom.js
geci.ns('dom', (function() {
  return {
    test: function(str) {
      switch(str.charAt(0)) {
      case '.':
        return this.allByClass(str.substr(1)).length > 0;
      case '#':
        return !!this.findById(str.substr(1));
      default:
        return this.allByTag(str).length > 0;
      }
    },

    getPosition: function(el) {
      var x = 0, y = 0;
      while (el !== null){
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent;
      }
      return { x: x, y: y }
    },

    replace: function(el0, el1) {
      var nextSibling = el0.nextSibling;
      var parentNode = el0.parentNode;
      this.remove(el0);
      if (!nextSibling) parentNode.appendChild(el1);
      else parentNode.insertBefore(el1, nextSibling);
    },

    remove: function(el) {
      el.parentNode.removeChild(el);
    },

    empty: function(el) {
      while (el.hasChildNodes()) el.removeChild(el.firstChild);
    },

    triggerEvent: function(el, ev) {
      if ('string' == typeof ev) ev = geci.createEvent(ev);
      if (!!el.dispatchEvent) el.dispatchEvent(ev);
      else if (el.fireEvent) el.fireEvent('ondataavailable', ev);
    },

    /**
     * Subscribes an element to a event source and dispatches (untouched) the event
     *
     **/
    pipeEvent: function(from, to, type) {
      var self = this;
      geci.addHandler(from, type, function(ev) {
        self.triggerEvent(to, ev);
      });
    },

    addClass: function(el, className) {
      var list = (el instanceof Array)? geci.toArray(el) : [el];
      list.forEach(function(el) {
        var elClasses;
        if (el.className) {
          elClasses = el.className.split(' ');
          if (elClasses.indexOf(className) < 0) elClasses.push(className);
        }else elClasses = [className];
        el.className = elClasses.join(' ');
      });
    },

    removeClass: function(el, className) {
      if(!el) return null;
      var list = (el instanceof Array)? geci.toArray(el) : [el];
      list.forEach(function(el) {
        if(el.className) {
          var elClasses = el.className.split(' ');
          if (!(className in elClasses)) {
            var newClasses = [];
            elClasses.forEach(function(c) { if (c != className) newClasses.push(c) });
            el.className = newClasses.join(' ');
          }
        }
      });
    },

    hasClass: function(el, className) {
      var sp = ' ';
      return (sp + el.className + sp).indexOf(sp + className + sp) > -1;
    },

    create: function(type,content) {
      var el = document.createElement(type);
      if (content) el.innerHTML = content;
      return el;
    },

    // TODO Standard, yet IE mindfuck
    findById: function(id) {
      return document.getElementById(id);
    },

    allByTag: function(tag, scope) {
      return geci.toArray((scope||document).getElementsByTagName(tag));
    },

    deepFind: function(scope, className) {
      var sibling;
      var chain = [];
      do {
        if (this.hasClass(scope, className)) chain.push(scope);
        else{
          sibling = scope.previousSibling;
          while (sibling) {
            if (this.hasClass(sibling, className)) {
              chain.push(sibling);
              break;
            }
            sibling = sibling.previousSibling;
          }
        }
        scope = scope.parentNode;
      } while (scope);
      return chain;
    },

    allByClass: function(className, scope) {
      var m = 'getElementsByClassName';
      var self = this;
      if ((scope||document)[m]) return geci.toArray((scope||document)[m](className));
      else {
        var list = [];
        var nodes = this.allByTag('*',scope||document);
        nodes.forEach(function(el) {
          if (self.hasClass(el, className)) list.push(el);
        });
        return geci.toArray(list);
      }
    },

    scrollToElement: function(el,x,minus) {
      var y = this.getOffset(el).top + this.getScrollTop();
      if(minus)y -= minus;
      window.scroll(x||0,y);
    },

    scrollTo: function(to, duration) {
      if (duration <= 0) return;
      var st = document.documentElement.scrollTop || document.body.scrollTop;
      var difference = to - st;
      var perTick = difference / duration * 10;
      setTimeout(function() {
        document.documentElement.scrollTop = st + perTick;
        document.body.scrollTop = st + perTick;
        if (st == to) return;
        geci.dom.scrollTo(to, duration - 10);
      }, 10);
    }, 

    getScrollTop: function(){
      if('pageYOffset' in window) return window.pageYOffset;
      else{
        var b = document.body;
        var d = document.documentElement;
        d = (d.clientHeight)? d : b;
        return d.scrollTop;
      }
    },
    
    getWindowWidth: function() {
      return (window.innerWidth)? window.innerWidth:document.documentElement.clientWidth;
    }, 

    getWindowHeight: function() {
      return (window.innerHeight)? window.innerHeight:document.documentElement.clientHeight;
    }, 

    getOffset: function(el) {
      var _x = 0;
      var _y = 0;
      while( el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
      }
      return { top: _y, left: _x };
    },

    getData: function(element, subtype) {
      var data;
      var regexp = new RegExp('data' + ((subtype)? '-' + subtype + '-(.*)' : '-(.*)'));
      geci.toArray(element.attributes).forEach(function(attr) {
        var e = regexp.exec(attr.name);
        if (e) {
          data = data || {};
          data[e[1]] = attr.value;
        }
      });
      return data || false;
    },

    setData: function(element, name, value) {
      element.setAttribute('data-' + name, value);
    },

    clearData: function(element, subtype) {
      var regexp = new RegExp('data' + ((subtype)? '-' + subtype + '-(.*)' : '-(.*)'));
      geci.toArray(element.attributes).forEach(function(attr) {
        var e = regexp.exec(attr.name);
        if (e) element.removeAttribute(attr.name);
      });
    },

    getUID: function(element) {
      if ('undefined' === typeof element.uid) element.uid = geci.guid();
      return element.uid;
    },

    str2html: function(str){
      var d = geci.dom.create('div');
      d.innerHTML = str;
      return d.firstChild;
    }
  }
})());

// Source: src/core/error.js
geci.ns('error', (function() {
  return {
    general: function(desc) {
      this.description = desc;
    },
    service: function(status, desc) {
      this.status = status;
      this.description = desc;
    }
  }
})());

// Source: src/vendors/enabled/gtm2.js
var dom = geci.dom;
geci.ns('vendors.gtm2', (function() {
  var w = window;
  return {
    dataLayerName: 'dataLayer',
    url: '//www.googletagmanager.com/gtm.js?id=',
    push: function(o) {
      w[this.dataLayerName].push(o);
    },

    getData: function(el) {
      var o = {};
      var holders = dom.deepFind(el, 'dataholder');
      for (var i=0; i < holders.length; i++) {
        var data = dom.getData(holders[i]);
        if (data.json) {
          if (data.scope && !o[data.scope]) o[data.scope] = JSON.parse(data.json);
          else return JSON.parse(data.json);
        }
      }
      return o;
    },

    clickHandler: function(el) {
      var self = this;
      geci.addHandler(el, 'click', function() {
        var eventName = dom.getData(el).event || null;
        var data = self.getData(el);
        if (eventName) data.event = eventName;
        self.push(data);
      })
    },

    hookClickEvents: function() {
      var links = dom.allByClass('event');
      for (var i=0; i < links.length; i++) this.clickHandler(links[i]);
    },

    enable: function(options) {
      var l = options.dataLayer || 'dataLayer';
      var dl = l != 'dataLayer'? '&l='+l :'';
      this.dataLayerName = l;
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      geci.load(this.url + options.id + dl);
      geci.bindOnLoad(this.hookClickEvents.bind(this));
    }
  };
})());

// Source: src/bootstraps/geci.testing.js
(function() {
  geci.loadVendor('gtm2', {id:'GTM-NF8S7D'});
})()