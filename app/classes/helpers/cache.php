<?php

namespace Helpers;

class Cache {
	private $key_expirations = [ // only keys added to this array can be stored / retrieved.
		'workshops' => 3600 // 1 hour
	];

	public function get( $key ) {
		global $f3;
		$cache_key = 'cache.' . $key;

		if ( array_key_exists( $key, $this->key_expirations ) ) {
			if ( $f3->exists( $cache_key ) !== false ) {
				return $f3->get( $cache_key );
			}

			return false;
		}

		die( 'Cache::get - key "'. $key .'" not found.' );
	}

	public function set( $key, $value ) {
		global $f3;
		$cache_key = 'cache.' . $key;

		if ( array_key_exists( $key, $this->key_expirations ) ) {
			if ( $f3->exists( $cache_key ) === false ) {
				$f3->set( $cache_key, $value, $this->key_expirations[ $key ] );
				return true;
			}

			return false;
		}

		die( 'Cache::set - key "'. $key .'" not found.' );
	}
}
