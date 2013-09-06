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
require_once "Mail.php";
$mail = Mail::factory( 'smtp', array(
	'host' => 'smtp.mandrillapp.com',
	'port' => 587,
	'auth' => true,
	'username' => 'thegraceconference@gmail.com',
	'password' => '572A9taQ1OcrVHPN-r_eYQ'
) );

$f3->set( 'AUTOLOAD', 'app/classes/' );
$Get = new API\Get;
$Set = new API\Set;
$Cache = new Helpers\Cache;
$Email = new Helpers\Email;

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

// init
$f3->run();
