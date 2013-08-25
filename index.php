<?php
$f3 = require( 'app/f3/lib/base.php' );
$config = require( 'config.php' );

$f3->set( 'DEBUG', 3 );

$f3->set( 'UI', 'app/views/pages/' );

$f3->route( 'GET /', function( $f3 ) {
	echo View::instance()->render( 'form.html' );
} );

// api stuff

$f3->set( 'AUTOLOAD', 'app/classes/' );
$Get = new API\Get;
$Set = new API\Set;

$f3->route( 'POST /api/set/@key/@value', function( $key, $value ) {

} );

$f3->route( 'GET /api/get/@key [ajax]', function( $key ) {

} );

$f3->run();
