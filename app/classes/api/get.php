<?php
namespace API;

class Get {
	private $db;

	public function __construct() {
		global $f3;

		$this->db = $f3->get( 'db' );
	}

	public function get( $key ) {
		global $Cache;

		if ( $key === 'workshops' ) {
			return $this->getWorkshops();
		} elseif ( $key === 'check_payment_made' ) {
			return $this->checkPaymentMade();
		}

		return $this->formatDataToJSON( array( 'error' => 'key not recognized: ' . $key ) );
	}

	private function getWorkshops() {
		global $Cache;

		$results = $Cache->get( 'workshops' );

		if ( $results === false ) {
			$results = $this->db->exec( '
				SELECT
					w.id,
					w.workshop_slot,
					w.name,
					w.display,
					w.speaker_id,
					s.name AS speaker_name,
					w.cost,
					w.max_attendees,
					w.description
				FROM
					workshops w LEFT JOIN
					speakers s
				ON
					w.speaker_id = s.id;' );
		}

		$Cache->set( 'workshops', $results );

		return $this->formatDataToJSON( $results );
	}

	private function checkPaymentMade() {
		global $f3;
		$id = $f3->get( 'GET.attendee_id' );

		$results = $this->db->exec( 'SELECT paid FROM attendees WHERE id = ?', $id );
		return $this->formatDataToJSON( array( 'paid' => $results && $results[ 0 ][ 'paid' ] === 1 ) );
	}

	public function formatDataToJSON( $data ) {
		return json_encode( $data );
	}
}
