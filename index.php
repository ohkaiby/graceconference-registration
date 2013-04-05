<?php
$f3 = require( 'app/f3/base.php' );

$f3->set( 'DEBUG', 3 );

$f3->set( 'UI', 'app/views/pages/' );

$f3->route( 'GET /', function( $f3 ) {
	echo View::instance()->render( 'form.html' );
} );

$f3->route( 'POST /api/set/@key/@value', function( $key, $value ) {

} );

$f3->run();
