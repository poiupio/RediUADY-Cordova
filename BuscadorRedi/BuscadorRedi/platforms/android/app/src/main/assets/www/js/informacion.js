function cargarFacultades(){

    // Se desactivo es funcionalidad por que el endpoint
    // se elimino de manera inesperada

    //cargar las facultades disponibles
    // var URL_FAC = URL_SOLR + '/facultades';
    // $.ajax( datosAjax(URL_FAC) ).done(function (resp) {
    //     console.log("Facultades:"  + resp);
    //     FACULTADES = resp;
    //     var facultades = "";
    //     $.each(resp, function (i, e) {
    //         facultades = facultades + "<li><a id='" + e.id + "'>" + e.name + "</a></li>";
    //     });
    //     $("#popupFacultad > ul").html(facultades);
    //     $("#popupFacultad > ul a").on('tap', function (e) {
    //         localStorage.facultad = this.id;
    //         INFORMACION["facultad"] = localStorage.facultad;
    //         colocarFacultadAcutal();
    //         $("#popupFacultad").popup('close');
    //     });
    //     colocarFacultadAcutal();
    // });
}

function colocarFacultadAcutal(){
    var actual = "Sin facultad";
    $.each(FACULTADES, function (i, e) {
        if (e.id == localStorage.facultad) {
            actual = e.name;
        }
    })
    //colocar facultad actual
    $("#facultadAcutal").text(actual);
}

function datosAjax(url, tipo, data, error){
	if (!tipo) { tipo = 'GET'; }
	var parametros = {
        url: url,
        type: tipo,
        method: tipo,
        data: data,
        //cache: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Accept', 'application/json');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            errorDeConexion(xhr, ajaxOptions, thrownError);
        }
    };
    console.log("URL: " + parametros);
	return parametros;
}

function datosAjaxPOST(url, data){
    var parametros = {
        url: url,
        type: 'POST',
        method: 'POST',
        data: data,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            errorDeConexion(xhr, ajaxOptions, thrownError);
        }
    };
    return parametros;
}

function errorDeConexion(xhr, ajaxOptions, thrownError){
    mostrarMensaje("Error", "Hay un error de conexión a internet con tu dispositivo. Revisa tu conexión a internet");
    ocultarCargando();
}
