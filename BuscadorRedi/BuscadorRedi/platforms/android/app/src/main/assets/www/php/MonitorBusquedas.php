<?php 
require_once ('db/ConectorDB.php');

class MonitorBusquedas{

	private $db;

	public function __construct(){
		$this->db = ConectorDB::getInstance();
	}

	public function guardarBusqueda($termino, $plat, $modelo, $fac){
		$fecha_hora = date('Y-m-d H:i:s');
		if (!$fac) {
			$fac = 0;
		}
		$query = "INSERT INTO consultas(consulta, plataforma, modelo, facultad, fecha_hora) VALUES" 
					. "('$termino', '$plat', '$modelo', $fac, '$fecha_hora')";
		return $this->db->query($query);
	}

	public function  guardarResultado($id, $resultado){
		$query = "UPDATE consultas SET respuesta = '$resultado' WHERE id = '$id'";
		$this->db->query($query);
	}
	
}