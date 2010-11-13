$(function() {
	location.hash = ''
		
	asyncTest('simple routing', 2, function () {
		$.router.remove().router('test', function() {
			ok(true, 'location #test is fine')
			setTimeout(function() { location.hash = 'test-2' }, 50)
			return function() {
				ok(true, 'leave #test is fine')
			}
		})
		location.hash = 'test'
		setTimeout(start, 300)
		/**
		 * @todo test leave
		 * @todo test delete
		 */
	})
	
	asyncTest('simple routing, leave as argument', 2, function () {
		$.router.remove().router('test', function() {
			ok(true, 'location #test is fine2')
			location.hash = 'test-2'
		}, function() {
			ok(true, 'leave #test is fine2')
		})
		location.hash = 'test'
		setTimeout(start, 200)
	})

	asyncTest('history.back()', 2, function() {
		$.router.remove().router('test-back-page-2', function() {
			ok(true, 'second page is fine')
			history.back()
		}).router('test-back-page-1', function() {
			$.router('test-back-page-1', function() {
				ok(true, 'back is fine')
			})
			location.hash = 'test-back-page-2'
		})
		location.hash = 'test-back-page-1'
		setTimeout(start, 300)
		/**
		 * @todo test leave
		 */
	})
	
	asyncTest('rouing map', 5, function() {
		var result
		var fn2 = function() {
			result = 2
			ok(true, 'table 2 is fine')
			// remove using key:
			$.router.remove('testTable1')
			location.hash = 'testTable1'
			setTimeout(function() {
				// remove using callback
				$.router.remove(fn2)
				location.hash = 'testTable2'
				result = 3
			}, 110)
		}
		$.router.remove().router({
			testTable1: function() {
				if (result) ok(false, 'remove testTable1 is fail')
				result = 1
				ok(true, 'table 1 is fine')
				setTimeout(function() {
					location.hash = 'testTable2'
				}, 10)
				return function() {
					ok(true, 'leave is fine')
				}
			},
			testTable2: fn2,
			testTable3: function() {
				ok(true, 'map #3 is fine')
			}
		})
		location.hash = 'testTable1'
		setTimeout(function() {
			equals(result, 3, "map remove is fine")
			location.hash = 'testTable3'
			setTimeout(start, 100)
		}, 450)
	})


	asyncTest('RegExp', 6, function() {
		re = /^id=(\d+)$/
		var result
		$.router.remove().router(/^\dx\d+$/, function(m) {
			if (!result) return ok(false, 'expect id!')

			equals(result, 2, "remove is fine")
			equals(m, '3x6', 'remove only one is fine')
			location.hash = '#test-regexp-gone'
		}).router(re, function(match, actualId) {
			if (result) return ok(false, "remove is fail")
			result = 1
			equals(actualId, id, "enter id is fine")
			equals(match, 'id='+id, 'enter match is fine')
			location.hash = 'regexp-gone'
		}, function(match, actualId) {
			result = 2
			equals(actualId, id, "leave id is fine")
			equals(match, 'id='+id, 'leave match is fine')

			// remove
			$.router.remove(re)
			location.hash = 'id='+Math.floor(Math.random()*1000)
			setTimeout(function() {
				location.hash = '3x6'
			}, 110)
		})
		var id = Math.floor(Math.random()*1000)
		location.hash = 'id='+id
		setTimeout(start, 450)
	})


	asyncTest('callback routing', 6, function() {
		$.router.remove().router(function(hash) {
			if ('test-callback' == hash) {
				ok(true, 'callback called')
				return function() {
					ok(true, 'routing ok')
					location.hash = 'test-callback-2'
				}
			}
			if ('test-callback-2' == hash) {
				return function() {
					ok(true, 'callback 2')
					location.hash = 'test-callback-3'
				}
			}
			if ('test-callback-3' == hash) {
				ok(true, 'callback 3, without action')
			}
		}, function() {
			ok(true, 'leave ok')
		})
		location.hash = 'test-callback'
		setTimeout(start, 350)
		/**
		 * @todo test delete
		 */
	})


	asyncTest('$.router.leave', 2, function() {
		$.router.remove().router('test-leave', function() {
			ok(true, 'callback called')
			$.router.leave(function() {
				ok(true, 'leave ok')				
			})
			location.hash = 'test-leave-gone'
		})
		location.hash = 'test-leave'
		setTimeout(start, 200)
	})
})