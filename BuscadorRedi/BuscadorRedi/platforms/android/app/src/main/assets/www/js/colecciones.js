function cargarColecciones() {
    mostrarCargando();
    if (COLECCIONES.length > 0) {
        ocultarCargando();
        return;
    }
    $("#tablaColecciones").html("").listview('refresh');
    $.ajax( datosAjax(URL + 'collections') ).done(function (resp) {
        COLECCIONES = resp;
        colocarColecciones(COLECCIONES);
        ocultarCargando();
    });
}

function colocarColecciones(colecciones) {
    var linea = "<li data-role='list-divider'>Colecciones</li>";
     
    for (var i = 0; i < colecciones.length; i++) {
        var descripcion = colecciones[i].shortDescription;
         if (descripcion === "") { descripcion = "Sin descripción"; } 
        var contenido = "<h2>" + colecciones[i].name + "</h2>";
        contenido = contenido + "<p>" + descripcion + "</p>";
        contenido = contenido + "<p class='ui-li-aside'><strong>Documentos: " + colecciones[i].numberItems + "</strong></p>"
        linea = linea + "<li><a id='" + colecciones[i].id + "'href='#' data-transition='slide'>" + contenido + "</a></li>";
    }

    $("#tablaColecciones").html(linea).listview('refresh');
    $('#tablaColecciones a').on('tap', function (e) {
        e.preventDefault();
        NOMBRE_COLEC = $(this.children[0]).text();
        $("#nombreColeccion").html("<b>" + NOMBRE_COLEC + "</b>");
        console.log("Coleeciones: " + this.id);
        localStorage.coleccionUUID = this.id;
        $(":mobile-pagecontainer").pagecontainer("change", "#pagItems");
    });
}
