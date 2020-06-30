function buscarRecurso(e) {
    e.preventDefault();
    mostrarCargando();
    var consulta = $("#txtBuscar").val();
    var data = {
        consulta: consulta,
        modelo: INFORMACION.modelo,
        plataforma: INFORMACION.plataforma,
        facultad: INFORMACION.facultad
    }
    
    $.ajax( datosAjaxPOST(URL_SOLR, data) ).done(function (resp) {
    	console.log(resp);
    	console.log(consulta);
        $("#divContenido").hide();
    	llenarListaBusqueda(resp);
    });

    ocultarCargando();
}

function llenarListaBusqueda(resp) {
    
    var datos = resp.response;
    var encontrados = parseInt(datos.numFound);
    var info = $("#divLista p");
    $(info).html("");
    
    if (encontrados > 0) {
        var tabla = $("#tablaBusqueda");
        var linea =  "";
        $(info).html("Encontrados <b>" + datos.numFound + "</b> documentos." );
        $(info).show();
        $.each(datos.docs, function (ind, elem) {
            var autor = elem.author;
            var titulo = elem.title;
            var handle = elem.handle;
            var contenido = "<h2>" + titulo + "</h2>";
            contenido = contenido + "<p>" + autor + "</p>";
            linea = linea + "<li><a id='" + handle + "' data-transition='slide'>" + contenido + "</a></li>";
        });

        $(tabla).html(linea).listview('refresh');

        $("#tablaBusqueda a").on('tap', function (e) {
            e.preventDefault();
            mostrarDocumento(this.id);
        })

    }else{
        $(info).show();
        $(info).html("No se han encontrado documentos.");
        $("#tablaBusqueda").html("").listview('refresh');
    }
}

function mostrarDocumento(handleId) {
    mostrarCargando();
    $.ajax( datosAjax(URL + 'handle/' + handleId) ).done(function (resp) {
        var itemUUID = resp.id;
        localStorage.itemUUID = itemUUID;
        ocultarCargando();
        $(":mobile-pagecontainer").pagecontainer("change", "#pagDetalleItem");
    });
}