<?php

namespace Helpers;

class Email {
	public function sendRegistrationConfirmation( $invoice ) {
		global $f3;

		$result = $f3->get( 'db' )->exec( 'SELECT * FROM attendees WHERE paypal_invoice = ?;', $invoice );

		if ( empty( $result ) ) { return; }

		$email_params = array();
		$email_addresses = array();

		foreach ( $result as $attendee ) {
			if ( !in_array( $attendee[ 'email' ], $email_addresses ) ) {
				array_push( $email_addresses, $attendee[ 'email' ] );
				array_push( $email_params, array(
					'first_name' => $attendee[ 'first_name' ],
					'amount_paid' => round( floatval( $attendee[ 'amount_paid' ] ), 2 ),
					'email' => $attendee[ 'email' ]
				) );
			}
		}

		foreach( $email_params as $email ) {
			$html = 'Dear '. $email[ 'first_name' ] .',';
			$html .= '<p>This email is to confirm your registration for Grace Conference 2013. The total amount paid is $'. $email[ 'amount_paid' ] .'.</p>';
			$html .= '<p>Note that this does not cover your stay at the Pheasant Run Resort. You&apos;ll need to register with PRR or a nearby hotel separately. Hotel registration discounts can be found at <a href="https://reservations.ihotelier.com/crs/g_reservation.cfm?groupID=794195&hotelID=2932">Pheasant Run</a>, <a href="http://www.ihg.com/holidayinnexpress/hotels/us/en/st.-charles/chisc/hoteldetail?groupCode=CCL">Holiday Inn Express</a>, and the <a href="http://cwp.marriott.com/chisc/gospelforchina/">Courtyard Mariott</a>.</p>';
			$html .= '<p>If you need to print out a copy of the permission slip, <a href="https://docs.google.com/document/d/1s8uqx7hFiYQ1w8OEk47tUn0tG8wwrT9uz0n7hcOkdgA/edit" target="_blank">they can be printed out here</a></p>';
			$html .= '<p>If you would like to volunteer, we would love to have you help us! You can sign up to <a href="https://docs.google.com/forms/d/1EJNxSxQkIrNxPaaYPk0nD9ulRj6BWfOyQG2mK9xEY7w/viewform" target="_blank">lead a small group</a>, <a href="https://docs.google.com/forms/d/1exu3FMgkir-NM8n5GwLc0-y7Ez2qt5x0p36EKxlst4Y/viewform" target="_blank">help the A/V Team</a>, or the <a href="https://docs.google.com/forms/d/1MpXhd3SgAPDGq1u45FKmRItq1G49zUiZWyX_i3Zh0_A/viewform" target="_blank">Hospitality Team</a>.</p>';
			$html .= '<p>Updates will be posted online at <a href="http://graceconference.org" target="_blank">graceconference.org</a>. You can also email us at <a href="mailto:thegraceconference@gmail.com">thegraceconference@gmail.com</a>.</p>';
			$html .= '<p>We look forward to seeing you!</p>';
			$html .= '<br>Grace Conference 2013';

			$this->send( $email[ 'email' ], 'Grace 2013 Registration Confirmation', $html );
		}
	}

	public function send( $email, $subject, $html ) {
		global $f3;

		$config = $f3->get( 'config' );
		require_once $config[ 'base_path' ] .'/app/libraries/PHPMailer/class.phpmailer.php';

		$mail = new \PHPMailer;

		$mail->IsSMTP();
		$mail->Host = 'smtp.mandrillapp.com';                 // Specify main and backup server
		$mail->SMTPAuth = true;                               // Enable SMTP authentication
		$mail->Port = 587;
		$mail->Username = 'thegraceconference@gmail.com';     // SMTP username
		$mail->Password = '572A9taQ1OcrVHPN-r_eYQ';           // SMTP password
		// $mail->SMTPSecure = 'tls';                            // Enable encryption, 'ssl' also accepted

		$mail->From = 'info@graceconference.org';
		$mail->FromName = 'Grace 2013';
		$mail->AddAddress($email);  // Add a recipient
		$mail->AddReplyTo('info@graceconference.org', 'Grace 2013');

		// $mail->WordWrap = 50;                                 // Set word wrap to 50 characters
		// $mail->AddAttachment('/var/tmp/file.tar.gz');         // Add attachments
		// $mail->AddAttachment('/tmp/image.jpg', 'new.jpg');    // Optional name
		$mail->IsHTML(true);                                  // Set email format to HTML

		$mail->Subject = $subject;
		$mail->Body    = $html;
		// $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

		$send = $mail->Send();
	}
}
