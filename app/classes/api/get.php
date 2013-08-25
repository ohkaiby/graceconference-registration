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
		}

		return $this->formatDataToJSON( [ 'error' => 'key not recognized: ' . $key ] );
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
					w.speaker_id = s.id;'
			);
		}

		$Cache->set( 'workshops', $results );

		return $this->formatDataToJSON( $results );
	}

	public function formatDataToJSON( $data ) {
		return json_encode( $data );
	}
}
