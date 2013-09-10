<?php

namespace Helpers;

class Attendees {
	private $db;

	public function __construct() {
		global $f3;

		$this->db = $f3->get( 'db' );
	}

	public function registerAttendees( $attendees ) {
		global $f3;

		$ids_affected = array();
		$errors_happened = false;

		$f3->set( 'SESSION.number_of_attendees', count( $attendees ) );
		$f3->set( 'SESSION.attendees', $attendees );

		$this->db->begin();
		foreach ( $attendees as $attendee ) {
			$attendee_sql_fields = $this->prepareAttendeeFieldsForInsertion( $attendee );

			$result = $this->db->exec( 'INSERT INTO attendees
				(first_name, last_name, email, age, grade, status, undergrad_year, phone, phone_is_mobile, address, city, state, zip, meal_plan, ip_address, calculated_payment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
				array(
					1 => $attendee_sql_fields[ 'first_name' ],
					2 => $attendee_sql_fields[ 'last_name' ],
					3 => $attendee_sql_fields[ 'email' ],
					4 => $attendee_sql_fields[ 'age' ],
					5 => $attendee_sql_fields[ 'grade' ],
					6 => $attendee_sql_fields[ 'status' ],
					7 => $attendee_sql_fields[ 'undergrad_year' ],
					8 => $attendee_sql_fields[ 'phone' ],
					9 => $attendee_sql_fields[ 'phone_is_mobile' ],
					10 => $attendee_sql_fields[ 'address' ],
					11 => $attendee_sql_fields[ 'city' ],
					12 => $attendee_sql_fields[ 'state' ],
					13 => $attendee_sql_fields[ 'zip' ],
					14 => $attendee_sql_fields[ 'meal_plan' ],
					15 => $f3->get( 'IP' ),
					16 => $attendee_sql_fields[ 'calculated_payment' ]
				)
			);

			if ( $result === 1 ) {
				array_push( $ids_affected, $this->db->lastInsertId() );
			} else {
				$errors_happened = true;
			}
		}
		$this->db->commit();

		if ( !$errors_happened ) {
			$f3->set( 'SESSION.attendee_ids', $ids_affected );
			return $ids_affected;
		} else {
			return false;
		}
	}

	private function prepareAttendeeFieldsForInsertion( $attendee ) {
		$final_values = array();

		// answers
		foreach( $attendee[ 'answers' ] as $fieldValues ) {
			$final_values[ $fieldValues[ 'field' ] ] = $fieldValues[ 'value' ];
		}

		empty( $final_values[ 'grade' ] ) && ( $final_values[ 'grade' ] = null );
		empty( $final_values[ 'status' ] ) && ( $final_values[ 'status' ] = null );
		empty( $final_values[ 'undergrad_year' ] ) && ( $final_values[ 'undergrad_year' ] = null );
		$final_values[ 'phone_is_mobile' ] = ( $final_values[ 'phone_is_mobile' ] === 'yes' ) ? 1 : 0;

		$final_values[ 'calculated_payment' ] = $attendee[ 'payment' ][ 'total_cost' ];

		return $final_values;
	}

	public function redirectToPaypal() {
		global $f3;

		$base_url = 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=MNUGKS74MHQ6C';
		$params = array(
			'amount' => $this->getTotalCostOfAttendees( $f3->get( 'SESSION.attendees' ) ),
			'invoice' => base64_encode( serialize( $f3->get( 'SESSION.attendee_ids' ) ) ),
			// 'notify_url' => 'http://registration.graceconference.org/api/set/attendee_payment',
			// 'return_url' => 'http://registration.graceconference.org/'
		);

		$encoded_params = array();
		foreach ( $params as $field => $value ) {
			array_push( $encoded_params, "$field=" . urlencode( $value ) );
		}

		$final_url = $base_url .'&'. implode( '&', $encoded_params );

		header( 'Location: ' . $final_url );
		exit;
	}

	private function getTotalCostOfAttendees( $attendees ) {
		$total_cost = 0;

		foreach ( $attendees as $attendee ) {
			$total_cost += intval( $attendee[ 'payment' ][ 'total_cost' ] );
		}

		return $total_cost;
	}
}
