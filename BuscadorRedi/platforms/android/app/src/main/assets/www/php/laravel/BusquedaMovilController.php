<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BusquedaMovilController extends Controller
{
    
    private $IP = "localhost";
    private $PUERTO = "8080";
	private $SERVIDOR = '';

    public function __construct()
    {
        $this->SERVIDOR = 'http://' . $this->IP . ':' . $this->PUERTO . '/solr/search/query?';
    }

    public function buscar(Request $request){
    	
    	$consulta = $request->consulta;
    	$modelo = $request->modelo;
    	$plataforma = $request->plataforma;
    	$facultad = $request->facultad;

        if (!$consulta) {
            return response('No se especificó consulta a buscar', 500);
        }

    	//determinar si el cliente envia los datos
    	if (!$modelo) {
    		$modelo = 'Sin modelo';
    	}
    	if (!$plataforma) {
    		$plataforma = 'Sin plataforma';
    	}
    	if (!$facultad) {
    		$facultad = 0;
    	}

    	$idBusqueda = $this->guardarBusqueda($consulta, $plataforma, $modelo, $facultad);
    	$url = $this->SERVIDOR . "wt=json&q=" . urlencode($consulta . " AND withdrawn:false");
    	
    	$request = curl_init($url);
    	curl_setopt($request, CURLOPT_HEADER, 0);
		curl_setopt($request, CURLOPT_RETURNTRANSFER, 1);
		$respuesta = curl_exec($request);
		curl_close($request);

		$this->guardarResultado($idBusqueda, $respuesta);

		return response()->json($respuesta);

    }

    private function guardarResultado($id, $respuesta){
    	$busqueda = \App\BusquedaMovil::find($id);
    	$busqueda->respuesta = $respuesta;
    	$busqueda->save();
    }

    private function guardarBusqueda($consulta, $plataforma, $modelo, $facultad){
    	$busqueda = new \App\BusquedaMovil;
    	$busqueda->consulta = $consulta;
    	$busqueda->plataforma = $plataforma;
    	$busqueda->modelo = $modelo;
    	$busqueda->facultad = $facultad;
        $busqueda->respuesta = 'Sin respuesta';
    	$busqueda->save();
    	return $busqueda->id;
    }
}
