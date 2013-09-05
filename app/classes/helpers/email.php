<?php

namespace Helpers;

class Email {
	private $email;
	private $subject;
	private $message;

	public function __construct( $email=null, $subject=null, $message=null ) {
		$this->email = $email;
		$this->subject = $subject;
		$this->message = $message;
	}

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

		$this->email = $fields[ 'email' ];
		$this->subject = 'Grace 2013 Registration Confirmation';
		$this->message = $html;

		$this->send();
	}

	public function send() {
		require_once "Mail.php";

		$headers = array(
			'From' => 'Grace 2013 <info@graceconference.org>',
			'To' => $this->email,
			'Subject' => $this->subject,
			'MIME-Version' => '1.0',
			'Content-type' => 'text/html; charset=iso-8859-1'
		);

		$smtp = Mail::factory( 'smtp', array(
			'host' => 'smtp.mandrillapp.com',
			'port' => 587
			'auth' => true,
			'username' => 'thegraceconference@gmail.com',
			'password' => '572A9taQ1OcrVHPN-r_eYQ'
		) );

		$mail = $smtp->send( $this->email, $headers, $this->message );
	}
}
