<?php

// setup

$f3 = require( 'app/f3/lib/base.php' );
$config = require( 'config.php' );
$f3->mset( [
	'DEBUG' => $config[ 'debug' ],
	'UI' => 'app/views/pages/',
	'config' => $config,
	'db' => new DB\SQL(
		'mysql:host='. $config[ 'db_host' ] .
		';port='. $config[ 'db_port' ] .
		';dbname='. $config[ 'db_name' ],

		$config[ 'db_user' ],
		$config[ 'db_pass' ]
	)
] );

// controllers

$f3->set( 'AUTOLOAD', 'app/classes/' );
$Get = new API\Get;
$Set = new API\Set;

// api stuff

$f3->route( 'POST /api/set/@key/@value', function( $f3, $params ) {

} );

$f3->route( 'GET /api/get/@key [ajax]', function( $f3, $params ) {
	global $Get;

	echo $Get->get( $params[ 'key' ] );
} );

// views

$f3->route( 'GET /', function( $f3 ) {
	echo View::instance()->render( 'form.html' );
} );

// init
$f3->run();
