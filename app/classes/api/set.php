<?php
namespace API;

class Set {
	private $db;

	public function __construct() {
		global $f3;

		$this->db = $f3->get( 'db' );
	}

	public function set( $key, $post ) {
		if ( $key === 'attendee_registration' ) {
			return $this->registerAttendee( $post );
		} elseif ( $key === 'attendee_payment' ) {
			return $this->attendeePayment( $post );
		} elseif ( $key === 'reset_registration' ) {
			return $this->resetRegistration();
		}

		return $this->formatDataToJSON( array( 'error' => 'key not recognized: ' . $key ) );
	}

	private function registerAttendee( $post ) {
		global $f3;

		$Attendees = new \Helpers\Attendees;
		$result = $Attendees->registerAttendees( json_decode( $post[ 'value' ], true ) );

		if ( empty( $result ) ) {
			return $this->formatDataToJSON( array( 'status' => 'error', 'error' => $this->db->errorInfo() ) );
		}

		return $this->formatDataToJSON( array( 'status' => 'success', 'attendee_ids' => $result ) );
	}

	private function attendeePayment( $post ) { // this is the paypal callback
		global $f3, $Email;

		$logPost = var_export( $post, true );
		$logGet = var_export( $f3->get( 'GET' ), true );
		$logSession = var_export( $f3->get( 'SESSION' ), true );
		$logServer = var_export( $f3->get( 'SERVER' ), true );

		$this->db->exec(
			'INSERT INTO paypal_post_log (post, session, get, server) VALUES (?, ?, ?, ?);',
			array(
				1 => $logPost,
				2 => $logSession,
				3 => $logGet,
				4 => $logServer
			)
		);

		// $amount = $post[ 'mc_gross' ];
		// $id = $post[ 'invoice' ];

		// $result = $this->db->exec( 'UPDATE attendees SET paid=?, amount_paid=?, payment_date=? WHERE id=?;',
		// 	array(
		// 		1 => 1,
		// 		2 => $amount,
		// 		3 => date( 'Y-m-d H:i:s' ),
		// 		4 => $id
		// 	)
		// );

		// if ( $result === 1 ) {
		// 	$Email->sendRegistrationConfirmation( $id );

		// 	return $this->formatDataToJSON( array( 'status' => 'success' ) );
		// } else {
		// 	return $this->formatDataToJSON( array( 'status' => 'error' ) );
		// }
	}

	private function resetRegistration() {
		global $f3;

		$f3->set( 'SESSION', array() );
		return $this->formatDataToJSON( array( 'status' => 'success' ) );
	}

	public function formatDataToJSON( $data ) {
		return json_encode( $data );
	}
}
