<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class BusquedaAppMovil extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('consultas_movil', function (Blueprint $table) {
            $table->increments('id');
            $table->string('consulta');
            $table->string('plataforma');
            $table->string('modelo');

            //La referencia no debe existir por si el usuario no ha llenado este campo
            $table->integer('facultad');
            
            $table->longText('respuesta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('consultas_movil');
    }
}
