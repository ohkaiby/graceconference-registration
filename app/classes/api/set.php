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
		}

		return $this->formatDataToJSON( [ 'error' => 'key not recognized: ' . $key ] );
	}

	private function registerAttendee( $post ) {
		global $f3;

		$val = $post[ 'value' ];

		$final_values = [];
		foreach( $val as $field ) {
			$final_values[ $field[ 'field' ] ] = $field[ 'value' ];
		}

		empty( $final_values[ 'grade' ] ) && ( $final_values[ 'grade' ] = null );
		empty( $final_values[ 'status' ] ) && ( $final_values[ 'status' ] = null );
		empty( $final_values[ 'undergrad_year' ] ) && ( $final_values[ 'undergrad_year' ] = null );
		empty( $final_values[ 'children_details' ] ) && ( $final_values[ 'children_details' ] = null );

		$final_values[ 'phone_is_mobile' ] = ( $final_values[ 'phone_is_mobile' ] === 'yes' ) ? 1 : 0;
		$final_values[ 'hotel_code_of_conduct' ] = ( $final_values[ 'hotel_code_of_conduct' ] === 'true' ) ? 1 : 0;

		if ( empty( $final_values[ 'bringing_children' ] ) ) {
			$final_values[ 'bringing_children' ] = null;
		} elseif ( $final_values[ 'bringing_children' ] === 'yes' ) {
			$final_values[ 'bringing_children' ] = 1;
		} else {
			$final_values[ 'bringing_children' ] = 0;
		}

		$result = $this->db->exec( 'INSERT INTO attendees
			(first_name, last_name, email, age, grade, status, undergrad_year, phone, phone_is_mobile, address, city, state, zip, meal_plan, bringing_children, children_details, agreed_to_hotel_agreement, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
			array(
				1 => $final_values[ 'first_name' ],
				2 => $final_values[ 'last_name' ],
				3 => $final_values[ 'email' ],
				4 => $final_values[ 'age' ],
				5 => $final_values[ 'grade' ],
				6 => $final_values[ 'status' ],
				7 => $final_values[ 'undergrad_year' ],
				8 => $final_values[ 'phone' ],
				9 => $final_values[ 'phone_is_mobile' ],
				10 => $final_values[ 'address' ],
				11 => $final_values[ 'city' ],
				12 => $final_values[ 'state' ],
				13 => $final_values[ 'zip' ],
				14 => $final_values[ 'meal_plan' ],
				15 => $final_values[ 'bringing_children' ],
				16 => $final_values[ 'children_details' ],
				17 => $final_values[ 'hotel_code_of_conduct' ],
				18 => $f3->get( 'IP' )
			)
		);

		if ( $result === 1 ) {
			$f3->set( 'SESSION.attendee_id', $this->db->lastInsertId() );

			foreach ( $final_values as $key => $val ) {
				$f3->set( 'SESSION.'. $key, $val );
			}

			return $this->formatDataToJSON( [ 'status' => 'success', 'id' => $this->db->lastInsertId() ] );
		} else {
			return $this->formatDataToJSON( [ 'status' => 'error' ] );
		}
	}

	private function attendeePayment( $post ) { // this is the paypal callback
		global $f3;

		$amount = $post[ 'mc_gross' ];
		$id = $post[ 'invoice' ];

		$result = $this->db->exec( 'UPDATE attendees SET paid=?, amount_paid=?, payment_date=? WHERE id=?;',
			array(
				1 => 1,
				2 => $amount,
				3 => date( 'Y-m-d H:i:s' ),
				4 => $id
			)
		);

		if ( $result === 1 ) {
			$email = new Helpers\Email();
			$email->sendRegistrationConfirmation( $id );

			return $this->formatDataToJSON( [ 'status' => 'success' ] );
		} else {
			return $this->formatDataToJSON( [ 'status' => 'error' ] );
		}
	}

	public function formatDataToJSON( $data ) {
		return json_encode( $data );
	}
}
