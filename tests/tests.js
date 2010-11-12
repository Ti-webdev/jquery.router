$(function() {
	location.hash = ''
		
	asyncTest('simple routing', 2, function () {
		$.router.remove().router('test', function() {
			ok(true, 'location #test is fine')
			setTimeout(function() { location.hash = 'test-2' }, 50)
			return function() {
				ok(true, 'rollback #test is fine')
			}
		})
		location.hash = 'test'
		setTimeout(start, 300)
		/**
		 * @todo test rollback
		 * @todo test delete
		 */
	})
	
	asyncTest('simple routing, rollback as argument', 2, function () {
		$.router.remove().router('test', function() {
			ok(true, 'location #test is fine2')
			location.hash = 'test-2'
		}, function() {
			ok(true, 'rollback #test is fine2')
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
		 * @todo test rollback
		 */
	})
	
	asyncTest('table rouing', 2, function() {
		$.router.remove().router({
			testTable1: function() {
				ok(true, 'table 1 is fine')
				location.hash = 'testTable2'
			},
			testTable2: function() {
				ok(true, 'table 2 is fine')
			}
		})
		location.hash = 'testTable1'
		setTimeout(start, 200)
		/**
		 * @todo test rollback
		 * @todo test delete
		 */
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
			ok(true, 'rollback ok')
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