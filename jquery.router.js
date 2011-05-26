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
 * 			$.route.leave(function() { alert('hide callback') })
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
 * @url http://ti.y1.ru/jquery/router/
 * @author Ti
 * @see $.history
 */


/**
 * The structure of this file:
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


(function($, plugin) {
	$[plugin] = function(key, callback, leave) {
		initOnce()
		var r
		if (key instanceof RegExp) r = new RouterRegExp(key, callback, leave)
		else if ('function' == typeof key) r = new RouterCallback(key, callback)
		else if ('object' == typeof key) r = new RouterMap(key, callback)
		else r = new RouterStatic(key, callback, leave)
		list.push(r)
		var hash = $[plugin].last()
		// если добавили с текущим хешом - запускаем
		if (r.test(hash)) {
			runLeave()
			// извлекаем текущий хеш из истории
			$[plugin].pop()
			// запуск
			runRouter(r)
			// ложим обратно в историю
			history.push(hash)
		}
		return $
	}

	var activeHashChangeCallback

	$[plugin] = $.extend($[plugin], {
		hasHistory: function() {
			return 0 < history.length
		},


		last: function() {
			return $[plugin].hasHistory() ? history[history.length-1] : ''
		},


		pop: function() {
			return history.pop()
		},


		remove: function(remove) {
			// без аргументов - очистить все
			if (0 == arguments.length) {
				list = []
				leaveRouter = null
				return $
			}

			// убрать конкретные
			$(arguments).each(function(i, signRoute) {
				var r, newList = []
				while(r = list.pop()) {
					if (r.leave == signRoute) {
						r.leave = null
						if (leaveRouter == r) leaveRouter = null
					}
					if (r.remove(signRoute)) {
						if (leaveRouter == r) leaveRouter = null
						continue
					}
					newList.push(r) 
				}
				list = newList
			})

			return $
		},
		
		
		leave: function(fn) {
			if ('function' !== typeof fn) throw new Error('Invalid leave callback. Function required!')
			leaveRouter = new RouterLeave(fn)
			return $
		},


		newChangeCallback: function(fn) {
			activeHashChangeCallback = function(hash) {
				if (activeHashChangeCallback === arguments.callee) {
					runLeave()
					run(hash)
				}
			}
			initOnce = function() {}
			return activeHashChangeCallback
		},


		restoreChangeCallback: function() {
			activeHashChangeCallback = jQueryHistoryHashChangeCallback
			initOnce = jQueryHistoryInitOnce
			if (list.length) initOnce()
		}
	})
	
	var list = []
	var history = []

	var RouterRegExp = function(regExp, init, leave) {
		var matches, _leave
		this.test = function(hash) {
			matches = regExp.exec(hash)
			return matches && true
		}
		this.exec = function() {
			_leave = init.apply(null, matches) || leave
			return 'function' == typeof _leave
		}
		this.leave = function() {
			_leave.apply(null, matches)
		}
		this.remove = function(sign) {
			if (regExp == sign) return true
			if (init == sign) return true
			if (leave == sign) delete leave
			if (_leave == sign) _leave = null
			return false
		}
	}
	var RouterStatic = function(name, init, leave) {
		this.test = function(hash) {
			return name == hash
		}
		this.exec = function() {
			this.leave = init() || leave
			return 'function' == typeof this.leave
		}
		this.remove = function(sign) {
			if (name == sign) return true
			if (init == sign) return true
			if (leave == sign) delete leave
			return false
		}
	}
	var RouterMap = function(map, leave) {
		var init
		this.test = function(hash) {
			init = map[hash]
			return init && true
		}
		this.exec = function(hash) {
			this.leave = init() || leave
			return 'function' == typeof this.leave
		}
		this.remove = function(sign) {
			if (map == sign) return true

			do {
				var found = false
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
			if (leave == sign) delete leave
			return false
		}
	}
	var RouterCallback = function(callback, leave) {
		var init
		this.test = function(hash) {
			init = callback(hash)
			return init && true
		}
		this.exec = function() {
			this.leave = init() || leave
			return 'function' == typeof this.leave
		}
		this.remove = function(sign) {
			if (callback == sign) return true
			if (leave == sign) delete leave
			return false
		}
	}
	var RouterLeave = function(callback) {
		this.test = function() { return false }
		this.exec = function() { return false }
		this.leave = function() {
			callback()
			$[plugin].remove(callback)
		}
		this.remove = function(sign) {
			return callback == sign
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
	
	var runLeave = function() {
		if (leaveRouter) {
			leaveRouter.leave()
			leaveRouter = null
		}
	}

	var runRouter = function(router) {
		if (router.exec()) leaveRouter = router
	}

	var leaveRouter

	var jQueryHistoryHashChangeCallback = $[plugin].newChangeCallback()
	var jQueryHistoryInitOnce = (function() {
		var isInitDone = false

		var init = function() {
			$.history.init(jQueryHistoryHashChangeCallback)
		}

		return function() {
			if (isInitDone) return
			if (jQueryHistoryHashChangeCallback !== activeHashChangeCallback) return

			isInitDone = true
			if ($.browser.msie) $(init)
			else init()
		}
	})()

	var initOnce = jQueryHistoryInitOnce
})(jQuery, 'router');