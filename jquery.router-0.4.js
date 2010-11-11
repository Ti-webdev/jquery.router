/**
 * jQuery router plugin
 *
 * Mini How-To:
 *
 * register actions:
 * $.router({
 * 		add: function() {
 * 			alert('add')
 * 			return function() {
 * 				alert('destroy add')
 * 			}
 * 		},
 * 		feedback: function() {
 * 			alert('show feedback form')
 * 			$.router.rollback(function() { alert('hide callback') })
 * 		}
 * })
 * 
 * detect id number: #id:1, #id:2, ...
 * $.router(/^id:(\d+)$/, function(m, id) {
 * 		alert('id is: '+id)
 * })
 * 
 * $.router.remove('add')
 * 
 * get last hash:
 * var lastHash = $.router.last()
 * 
 * pop last hash:
 * var hash = $.router.pop()
 *
 * remove all actions:
 * $.router.remove()
 * 
 * The BSD licenses
 * http://en.wikipedia.org/wiki/BSD_licenses
 * 
 * @version 0.4
 * @url http://ti.y1.ru/jquery/router/
 * @author Ti
 * @see $.history
 */

/**
 * 1. include $.history plugin
 * 2. define $.router plugin
 */


/*
 * jQuery history plugin
 * 
 * The MIT License
 * 
 * Copyright (c) 2006-2009 Taku Sano (Mikage Sawatari)
 * Copyright (c) 2010 Takayuki Miwa
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function($) {
    var locationWrapper = {
        put: function(hash, win) {
            (win || window).location.hash = this.encoder(hash);
        },
        get: function(win) {
            var hash = ((win || window).location.hash).replace(/^#/, '');
            try {
                return $.browser.mozilla ? hash : decodeURIComponent(hash);
            }
            catch (error) {
                return hash;
            }
        },
        encoder: encodeURIComponent
    };

    var iframeWrapper = {
        id: "__jQuery_history",
        init: function() {
            var html = '<iframe id="'+ this.id +'" style="display:none" src="javascript:false;" />';
            $("body").prepend(html);
            return this;
        },
        _document: function() {
            return $("#"+ this.id)[0].contentWindow.document;
        },
        put: function(hash) {
            var doc = this._document();
            doc.open();
            doc.close();
            locationWrapper.put(hash, doc);
        },
        get: function() {
            return locationWrapper.get(this._document());
        }
    };

    function initObjects(options) {
        options = $.extend({
                unescape: false
            }, options || {});

        locationWrapper.encoder = encoder(options.unescape);

        function encoder(unescape_) {
            if(unescape_ === true) {
                return function(hash){ return hash; };
            }
            if(typeof unescape_ == "string" &&
               (unescape_ = partialDecoder(unescape_.split("")))
               || typeof unescape_ == "function") {
                return function(hash) { return unescape_(encodeURIComponent(hash)); };
            }
            return encodeURIComponent;
        }

        function partialDecoder(chars) {
            var re = new RegExp($.map(chars, encodeURIComponent).join("|"), "ig");
            return function(enc) { return enc.replace(re, decodeURIComponent); };
        }
    }

    var implementations = {};

    implementations.base = {
        callback: undefined,
        type: undefined,

        check: function() {},
        load:  function(hash) {},
        init:  function(callback, options) {
            initObjects(options);
            self.callback = callback;
            self._options = options;
            self._init();
        },

        _init: function() {},
        _options: {}
    };

    implementations.timer = {
        _appState: undefined,
        _init: function() {
            var current_hash = locationWrapper.get();
            self._appState = current_hash;
            self.callback(current_hash);
            setInterval(self.check, 100);
        },
        check: function() {
            var current_hash = locationWrapper.get();
            if(current_hash != self._appState) {
                self._appState = current_hash;
                self.callback(current_hash);
            }
        },
        load: function(hash) {
            if(hash != self._appState) {
                locationWrapper.put(hash);
                self._appState = hash;
                self.callback(hash);
            }
        }
    };

    implementations.iframeTimer = {
        _appState: undefined,
        _init: function() {
            var current_hash = locationWrapper.get();
            self._appState = current_hash;
            iframeWrapper.init().put(current_hash);
            self.callback(current_hash);
            setInterval(self.check, 100);
        },
        check: function() {
            var iframe_hash = iframeWrapper.get(),
                location_hash = locationWrapper.get();

            if (location_hash != iframe_hash) {
                if (location_hash == self._appState) {    // user used Back or Forward button
                    self._appState = iframe_hash;
                    locationWrapper.put(iframe_hash);
                    self.callback(iframe_hash); 
                } else {                              // user loaded new bookmark
                    self._appState = location_hash;  
                    iframeWrapper.put(location_hash);
                    self.callback(location_hash);
                }
            }
        },
        load: function(hash) {
            if(hash != self._appState) {
                locationWrapper.put(hash);
                iframeWrapper.put(hash);
                self._appState = hash;
                self.callback(hash);
            }
        }
    };

    implementations.hashchangeEvent = {
        _init: function() {
            self.callback(locationWrapper.get());
            $(window).bind('hashchange', self.check);
        },
        check: function() {
            self.callback(locationWrapper.get());
        },
        load: function(hash) {
            locationWrapper.put(hash);
        }
    };

    var self = $.extend({}, implementations.base);

    if($.browser.msie && ($.browser.version < 8 || document.documentMode < 8)) {
        self.type = 'iframeTimer';
    } else if("onhashchange" in window) {
        self.type = 'hashchangeEvent';
    } else {
        self.type = 'timer';
    }

    $.extend(self, implementations[self.type]);
    $.history = self;
})(jQuery);




(function($) {
	var list = []
	var history = []

	var RouterRegExp = function(regExp, init, rollback) {
		var matches, _rollback
		this.test = function(hash) {
			matches = regExp.exec(hash)
			return matches && true
		}
		this.exec = function() {
			_rollback = init.apply(null, matches) || rollback
		}
		this.rollback = function() {
			if ('function' == typeof _rollback) _rollback.apply(matches)
		}
		this.remove = function(sign) {
			if (regExp == sign) return true
			if (init == sign) return true
			if (rollback == sign) delete rollback
			if (_rollback == sign) _rollback = null
			return false
		}
	}
	var RouterStatic = function(name, init, rollback) {
		var _rollback
		this.test = function(hash) {
			return name == hash
		}
		this.exec = function() {
			_rollback = init() || rollback
		}
		this.rollback = function() {
			if ('function' == typeof _rollback) _rollback()
		}
		this.remove = function(sign) {
			if (name == sign) return true
			if (init == sign) return true
			if (rollback == sign) delete rollback
			if (_rollback == sign) _rollback = null
			return false
		}
	}
	var RouterMap = function(map, rollback) {
		var init, _rollback
		this.test = function(hash) {
			init = map[hash]
			return init && true
		}
		this.exec = function(hash) {
			_rollback = init() || rollback
		}
		this.rollback = function() {
			if ('function' == typeof _rollback) _rollback()
		}
		this.remove = function(sign) {
			if (map == sign) return true

			do {
				var found
				$.each(map, function(key, value) {
					if (key == sign || value == sign) {
						found = key
						return false
					}
				})
				if (found) {
					delete map[found]
				}
			}
			while(found)

			if (init == sign) return true
			if (rollback == sign) delete rollback
			if (_rollback == sign) _rollback = null
			return false
		}
	}
	var RouterCallback = function(callback, rollback) {
		var init, _rollback
		this.test = function(hash) {
			init = callback(hash)
			return init && true
		}
		this.exec = function() {
			_rollback = init() || rollback
		}
		this.rollback = function() {
			if ('function' == typeof _rollback) _rollback()
		}
		this.remove = function(sign) {
			if (callback == sign) return true
			if (rollback == sign) delete rollback
			if (_rollback == sign) _rollback = null
			return false
		}
	}

	var run = function(hash) {
		var i = list.length-1, found = false
		while(!found && 0 <= i) {
			found = list[i].test(hash)
			if (found) {
				runRouter(list[i])
			}
			i--
		}
		history.push(hash)
	}

	var runRouter = function(router) {
		router.exec()
		prevRouter = router
	}


	$.router = function(key, callback, rollback) {
		var r
		if (key instanceof RegExp) r = new RouterRegExp(key, callback, rollback)
		else if ('function' == typeof key) r = new RouterCallback(key, callback)
		else if ('object' == typeof key) r = new RouterMap(key, callback)
		else r = new RouterStatic(key, callback, rollback)
		list.push(r)
		var hash = $.router.last()
		// если добавили с текущим хешом - запускаем
		if (r.test(hash)) {
			// извлекаем текущий хеш из истории
			$.router.pop()
			// запуск
			runRouter(r)
			// ложим обратно в историю
			history.push(hash)
		}
		return $
	}


	$.router.last = function() {
		return 0 < history.length ? history[history.length-1] : ''
	}


	$.router.pop = function() {
		return history.pop()
	}

	$.router.remove = function(remove) {
		// без аргументов - очистить все
		if (0 == arguments.length) {
			list = []
			prevRouter = null
			return $
		}

		// убрать конкретные
		$(arguments).each(function(i, signRoute) {
			var r, newList = []
			while(r = list.pop()) {
				if (r.remove(signRoute)) {
					if (prevRouter == r) prevRouter = null
					continue
				}
				newFns.push(fn) 
			}
			list = newList
		})

		return $
	}

	var prevRouter
	
	var init = function() {
		$.history.init(function(hash) {
			if (prevRouter) prevRouter.rollback()
			run(hash)
		})
	}

	if ($.browser.msie) $(window).load(init)
	else init()
})(jQuery);