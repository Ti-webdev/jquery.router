<?php
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>jQuery router plugin</title>
	<link rel="stylesheet" type="text/css" media="all" href="style.css" />
	<link rel="stylesheet" type="text/css" media="all" href="style.css" />
	
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
	<a href="jquery.router-0.4.js">Download jquery.router-0.4.js</a>,
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
</body>
</html>