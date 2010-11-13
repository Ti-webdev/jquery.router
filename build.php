#!/usr/bin/env php
<?php
// этот скрипт используется для сборки вебморды страницы http://ti.y1.ru/jquery/router/
// добавляет суффикс версии в файле jquery.router.js 
// ставит версию в tests/index.html, index.php и demo.html
$src = __DIR__;
$dist = __DIR__.'-deploy';


// клонируем
$shSrc = escapeshellarg("$src/");
$shDist = escapeshellarg($dist);
`rsync -aHCv --delete $shSrc $shDist`;


// получаем версию
chdir($src);
$version = trim(exec('git tag'));
if (!$version) {
	fwrite(STDERR, 'version not found');
	die(1);
}

// ставим @version в jquery.router.js
$org = file_get_contents("$dist/jquery.router.js");
$result = preg_replace('#(\s*)\*/#', '$1* @version '.$version.'$0', $org, 1);
file_put_contents("$dist/jquery.router.js", $result, LOCK_UN);

// 
rename("$dist/jquery.router.js", "$dist/jquery.router-$version.js");

// заменяем (исклчая гитхаб)
foreach(array('index.php', 'demo.html', 'tests/index.html') as $file) {
	$org = file_get_contents("$dist/$file");
	$result = preg_replace('#(?<!master/)(jquery\.router)(\.js)#', '$1-'.$version.'$2', $org);
	file_put_contents("$dist/$file", $result, LOCK_UN);
}