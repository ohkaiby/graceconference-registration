<?php

namespace Helpers;

class Attendees {
	private $db;

	public function __construct() {
		global $f3;

		$this->db = $f3->get( 'db' );
	}

	public function registerAttendees( $attendees, $freeAttendee = false ) {
		global $f3;

		$ids_affected = array();
		$errors_happened = false;

		$attendee_ids = $f3->get( 'SESSION.attendee_ids' );
		if ( !empty( $attendee_ids ) ) {
			$payment_invoice = $this->getPaymentInvoice( $attendee_ids );
			$payment_url = $this->getPaymentUrl( $payment_invoice );

			return array( 'status' => 'success', 'attendee_ids' => $attendee_ids, 'payment_url' => $payment_url, 'invoice' => $payment_invoice );
		}

		// everything after this point is if this is the user's first time of attempting to submitting payment
		$f3->set( 'SESSION.number_of_attendees', count( $attendees ) );
		$f3->set( 'SESSION.attendees', $attendees );

		$this->db->begin();

		$field_names = array( 'first_name', 'last_name', 'email', 'age', 'exact_age', 'gender', 'grade', 'status', 'undergrad_year', 'phone', 'phone_is_mobile', 'address', 'city', 'state', 'zip', 'meal_plan', 'ip_address', 'calculated_payment' );
		if ( $freeAttendee ) {
			$field_names[] = 'paid';
			$field_names[] = 'payment_date';
			$field_names[] = 'amount_paid';
		}

		$questions_marks = array();
		for ( $i = 0; $i < count( $field_names ); $i++ ) {
			$questions_marks[] = '?';
		}
		$questions_marks = implode( ', ', $questions_marks );

		foreach ( $attendees as $attendee ) {
			$attendee_sql_fields = $this->prepareAttendeeFieldsForInsertion( $attendee );
			$field_values = array(
				1 => $attendee_sql_fields[ 'first_name' ],
				2 => $attendee_sql_fields[ 'last_name' ],
				3 => $attendee_sql_fields[ 'email' ],
				4 => $attendee_sql_fields[ 'age' ],
				5 => $attendee_sql_fields[ 'exact_age' ],
				6 => $attendee_sql_fields[ 'gender' ],
				7 => $attendee_sql_fields[ 'grade' ],
				8 => $attendee_sql_fields[ 'status' ],
				9 => $attendee_sql_fields[ 'undergrad_year' ],
				10 => $attendee_sql_fields[ 'phone' ],
				11 => $attendee_sql_fields[ 'phone_is_mobile' ],
				12 => $attendee_sql_fields[ 'address' ],
				13 => $attendee_sql_fields[ 'city' ],
				14 => $attendee_sql_fields[ 'state' ],
				15 => $attendee_sql_fields[ 'zip' ],
				16 => $attendee_sql_fields[ 'meal_plan' ],
				17 => $f3->get( 'IP' ),
				18 => $attendee_sql_fields[ 'calculated_payment' ]
			);

			if ( $freeAttendee ) {
				$field_values[ 19 ] = 1; // paid
				$field_values[ 20 ] = date( 'Y-m-d H:i:s' ); // payment date
				$field_values[ 21 ] = 0; // amount_paid
			}

			$query = 'INSERT INTO attendees ('. implode( ', ', $field_names ) .') VALUES ('. $questions_marks .');';
			$result = $this->db->exec( $query, $field_values );

			if ( $result === 1 ) {
				array_push( $ids_affected, $this->db->lastInsertId() );
			} else {
				$errors_happened = true;
			}
		}

		if ( !$errors_happened ) {
			$payment_invoice = $this->getPaymentInvoice( $ids_affected );
			$payment_url = $this->getPaymentUrl( $payment_invoice );

			$f3->set( 'SESSION.attendee_ids', $ids_affected );
			$f3->set( 'SESSION.invoice', $payment_invoice );

			foreach ( $ids_affected as $id ) { // why the "IN" clause doesn't work, I don't know.
				$this->db->exec( 'UPDATE attendees set paypal_invoice = ? WHERE id = ?;',
					array(
						1 => $payment_invoice,
						2 => $id
					)
				);
			}
		}

		$this->db->commit();

		if ( !$errors_happened ) {
			return array( 'status' => 'success', 'attendee_ids' => $ids_affected, 'payment_url' => $payment_url, 'invoice' => $payment_invoice );
		} else {
			return array( 'status' => 'error', 'error' => $this->db->errorInfo() );
		}
	}

	private function prepareAttendeeFieldsForInsertion( $attendee ) {
		$final_values = array();
		$default_null_fields = array( 'exact_age', 'grade', 'status', 'undergrad_year' );

		// answers
		foreach( $attendee[ 'answers' ] as $fieldValues ) {
			$final_values[ $fieldValues[ 'field' ] ] = $fieldValues[ 'value' ];
		}

		foreach( $default_null_fields as $field ) {
			empty( $final_values[ $field ] ) && ( $final_values[ $field ] = null );
		}

		$final_values[ 'phone_is_mobile' ] = ( $final_values[ 'phone_is_mobile' ] === 'yes' ) ? 1 : 0;
		$final_values[ 'calculated_payment' ] = $attendee[ 'payment' ][ 'total_cost' ];

		return $final_values;
	}

	private function getPaymentInvoice( $attendee_ids ) {
		return base64_encode( serialize( $attendee_ids ) );
	}

	private function getPaymentUrl( $invoice ) {
		global $f3;
		$config = $f3->get( 'config' );

		$base_url = $config[ 'payment_url' ];
		$params = array(
			'amount' => $this->getTotalCostOfAttendees( $f3->get( 'SESSION.attendees' ) ),
			// 'amount' => .01,
			'invoice' => $invoice
			// 'return_url' => 'http://registration.graceconference.org/'
		);

		$encoded_params = array();
		foreach ( $params as $field => $value ) {
			array_push( $encoded_params, "$field=" . urlencode( $value ) );
		}

		$final_url = $base_url .'&'. implode( '&', $encoded_params );
		return $final_url;
	}

	private function getTotalCostOfAttendees( $attendees ) {
		$total_cost = 0;

		foreach ( $attendees as $attendee ) {
			$total_cost += intval( $attendee[ 'payment' ][ 'total_cost' ] );
		}

		return $total_cost;
	}

	public function updateAttendeesWithPayment( $invoice, $amount ) {
		$attendee_ids = unserialize( base64_decode( $invoice ) );
		$attendee_ids_sql_str = implode( ', ', $attendee_ids );

		return $this->db->exec( 'UPDATE attendees SET paid=?, payment_date=?, amount_paid=? WHERE paypal_invoice = ?;',
			array(
				1 => 1,
				2 => date( 'Y-m-d H:i:s' ),
				3 => $amount,
				4 => $invoice
			)
		);
	}

	public function logPaypalTransaction() {
		global $f3;

		$logPost = var_export( $f3->get( 'POST' ), true );
		$logGet = var_export( $f3->get( 'GET' ), true );
		$logSession = var_export( $f3->get( 'SESSION' ), true );
		$logServer = var_export( $f3->get( 'SERVER' ), true );

		return $this->db->exec(
			'INSERT INTO paypal_post_log (post, session, get, server) VALUES (?, ?, ?, ?);',
			array(
				1 => $logPost,
				2 => $logSession,
				3 => $logGet,
				4 => $logServer
			)
		);
	}
}
