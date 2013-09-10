<?php
// setup

$f3 = require( 'app/f3/lib/base.php' );
$config = require( 'config.php' );
$f3->mset( array(
	'DEBUG' => $config[ 'debug' ],
	'UI' => 'app/views/pages/',
	'config' => $config,
	'db' => new DB\SQL(
		'mysql:host='. $config[ 'db_host' ] .
		';port='. $config[ 'db_port' ] .
		';dbname='. $config[ 'db_name' ],

		$config[ 'db_user' ],
		$config[ 'db_pass' ]
	),
	'CACHE' => $config[ 'cache' ]
) );

// controllers
$f3->set( 'AUTOLOAD', 'app/classes/' );
$Get = new API\Get;
$Set = new API\Set;
$Cache = new Helpers\Cache;

// api stuff

$f3->route( 'POST /api/set/@key', function( $f3, $params ) {
	global $Set;

	header('Content-type: application/json');

	echo $Set->set( $params[ 'key' ], $f3->get( 'POST' ) );
} );

$f3->route( 'GET /api/get/@key [ajax]', function( $f3, $params ) {
	global $Get;

	header('Content-type: application/json');

	echo $Get->get( $params[ 'key' ] );
} );

// views
$f3->route( 'GET /', function( $f3 ) {
	echo View::instance()->render( 'form.html' );
} );

$f3->route( 'GET /payment', function( $f3 ) {
	$Attendees = new Helpers\Attendees;
	$Attendees->redirectToPaypal();
} );

// init
$f3->run();
