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
	
	asyncTest('rouing map', 4, function() {
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
			testTable2: fn2
		})
		location.hash = 'testTable1'
		setTimeout(function() {
			equals(result, 3, "map is fine");
			start()
		}, 450)
	})


	asyncTest('RegExp', 4, function() {
		$.router.remove().router(/^id=(\d+)$/, function(match, actualId) {
			equals(id, actualId, "id is fine");
			equals(match, 'id='+id, 'match is fine');
			location.hash = 'regexp-gone'			
		}, function(match, actualId) {
			equals(id, actualId, "id is fine");
			equals(match, 'id='+id, 'match is fine');
		})
		var id = Math.floor(Math.random()*1000)
		location.hash = 'id='+id
		setTimeout(start, 200)
		/**
		 * @todo test delete
		 */
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