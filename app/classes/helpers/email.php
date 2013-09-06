<?php

namespace Helpers;

class Email {
	public function sendRegistrationConfirmation( $attendee_id ) {
		global $f3;

		$result = $f3->get( 'db' )->exec( 'SELECT * FROM attendees WHERE id = ?;', $attendee_id );

		if ( empty( $result ) ) { return; }

		$fields = $result[ 0 ];

		$html = 'Dear '. $fields[ 'first_name' ] .',';
		$html .= '<p>This email is to confirm your registration for Grace Conference 2013. The total amount paid is $'. $fields[ 'amount_paid' ] .'.</p>';
		$html .= '<p>Note that this does not cover your stay at the Pheasant Run Resort. You’ll need to register with PRR or a nearby hotel separately. Hotel registration discounts can be found at <a href="https://reservations.ihotelier.com/crs/g_reservation.cfm?groupID=794195&hotelID=2932">Pheasant Run at iHotelier</a>, <a href="http://www.ihg.com/holidayinnexpress/hotels/us/en/st.-charles/chisc/hoteldetail?groupCode=CCL">Holiday Inn Express</a>, and the <a href="http://cwp.marriott.com/chisc/gospelforchina/">Courtyard Mariott</a>.</p>';
		$html .= '<p>We look forward to seeing you!</p>';
		$html .= '<br><br>Grace Conference 2013';

		$this->send( $fields[ 'email' ], 'Grace 2013 Registration Confirmation', $html );
	}

	public function send( $email, $subject, $html ) {
		global $mail;

		$headers = array(
			'From' => 'Grace 2013 <info@graceconference.org>',
			'To' => $email,
			'Subject' => $subject,
			'MIME-Version' => '1.0',
			'Content-type' => 'text/html; charset=iso-8859-1'
		);

		$send = $mail->send( $email, $headers, $html );
	}
}
