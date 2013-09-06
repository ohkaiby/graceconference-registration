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
		global $f3;
		require_once $f3->get( 'config' )[ 'base_path' ] .'/app/libraries/PHPMailer/class.phpmailer.php';

		$mail = new PHPMailer;

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
