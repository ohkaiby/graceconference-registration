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
		$Attendees = new \Helpers\Attendees;

		$this->db->begin();

		$Attendees->logPaypalTransaction();
		$result = $Attendees->updateAttendeesWithPayment( $post[ 'invoice' ], $post[ 'mc_gross' ] );

		$this->db->commit();

		if ( $result === 1 ) {
			$Email = new \Helpers\Email;
			$Email->sendRegistrationConfirmation( $post[ 'invoice' ] );

			return $this->formatDataToJSON( array( 'status' => 'success' ) );
		} else {
			return $this->formatDataToJSON( array( 'status' => 'error' ) );
		}
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
