<?php
header('Content-Type: text/html; charset=UTF-8');
?>
<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<title>jQuery router plugin</title>
	<link rel="stylesheet" type="text/css" media="all" href="style.css" />
	<link rel="stylesheet" type="text/css" media="all" href="style.css" />
	
	<link rel="shortcut icon" href="favicon.ico">
	
	<!-- highlight.js -->
	<link rel="stylesheet" title="Default" href="highlight.js/styles/default.css">
	<script src="highlight.js/highlight.pack.js"></script>
	
	<script>
	hljs.tabReplace = '    ';
	hljs.initHighlightingOnLoad();
	</script>
</head>
<body>
	<h1>jQuery router plugin</h1>
	<a href="/download/jquery/router/jquery.router.js">Download jquery.router.js</a>,
	<a href="https://github.com/Ti-webdev/jquery.router/raw/master/jquery.router.js">latest version from github</a>
	<p>Require <b>any</b> browser, <b>any</b> jQuery version</p>

	<h2>Install:</h2>
	<pre><code><?= htmlspecialchars(file_get_contents('demo.html')) ?></code></pre>
	<? readfile('demo.html') ?>

	<h2>Demo 1:</h2>
	<pre><code><?= htmlspecialchars(file_get_contents('demo1.html')) ?></code></pre>
	<? readfile('demo1.html') ?>

	<h2>Demo 2:</h2>
	<pre><code><?= htmlspecialchars(file_get_contents('demo2.html')) ?></code></pre>
	<? readfile('demo2.html') ?>

	<h2>Demo 3:</h2>
	<pre><code><?= htmlspecialchars(file_get_contents('demo3.html')) ?></code></pre>
	<? readfile('demo3.html') ?>



	<!-- Yandex.Metrika -->
	<script src="//mc.yandex.ru/metrika/watch.js" type="text/javascript"></script>
	<div style="display:none;"><script type="text/javascript">
	try { var yaCounter1921399 = new Ya.Metrika(1921399);
	yaCounter1921399.clickmap(true);
	yaCounter1921399.trackLinks(true);
	} catch(e){}
	</script></div>
	<noscript><div style="position:absolute"><img src="//mc.yandex.ru/watch/1921399" alt="" /></div></noscript>
	<!-- /Yandex.Metrika -->
</body>
</html>