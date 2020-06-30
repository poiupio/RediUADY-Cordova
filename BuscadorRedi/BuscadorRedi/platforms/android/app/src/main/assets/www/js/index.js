var URL = 'http://redi.uady.mx/rest/';
var BITSTREAM_URL = 'http://redi.uady.mx/rest'; //Sin slash

//Demo url: https://demo.dspace.org/rest/

var METADATOS_BUSQUEDA = ["dc.title",
    "dc.creator",
    "dc.description.abstract",
    "dc.subject"];

/* Va sin slash final, dado que si lo tiene sale como GET */
var URL_SOLR = "http://redisw.uady.mx/api/busqueda-movil";

/*Si se quiere la carga dinamica con Scroll activar la variable y cambiar el maximo*/
var MAXIMO = 10000;
var CARGA_DINAMICA = false;

/** Cache **/
var COLECCIONES = [];
var COMUNIDADES = [];
var ITEMS_COLECCION = [];
var COLECCION_ANT = "";
var ITEMS_COLECCION_ANT = "";
var ITEM_DETALLE = "";
var INFORMACION = {};
var FACULTADES = [];

var NOMBRE_COLEC = "";
var NOMBRE_COMUN = "";

// --- CORDOVA

var app = {

    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.initEvent();
        INFORMACION["modelo"] = device.model;
        INFORMACION["plataforma"] = device.platform;
        INFORMACION["facultad"] = localStorage.facultad;
    },

    initEvent: function () {

    }
};

app.initialize();

// --- CORDOVA

$(document).on("mobileinit", function () {
    $.mobile.linkBindingEnabled = true;
    $.mobile.hashListeningEnabled  = true;
    $.mobile.ajaxEnabled = true;
    $.mobile.defaultPageTransition = 'none';

    agregarListeners();
    configurarHeader();
    cargarFacultades();

    window.location.hash = 'pagBuscar';
});

function configurarHeader(){
    $("[data-role='header'], [data-role='footer']").toolbar({ theme: "a" });
}

function agregarListeners() {

    $(document).on("pagecontainershow", function (event, ui) {
        var idPag = ui.toPage.prop("id");
        switch(idPag){
            case "pagBuscar":
                colocarComunidadesMini();
            break;
            case "pagComunidades":
                cargarComunidades();
            break;
            case "pagColecciones":
                var uuid = localStorage.comunidadUUID;
                mostrarColecciones(uuid);
            break;
            case "pagItems":
                var uuid = localStorage.coleccionUUID;
                mostrarItemsColeccion(uuid);
            break;
            case "pagDetalleItem":
                var uuid = localStorage.itemUUID;
                mostrarMetadatosItem(uuid);
            break;
        }
    });

    $(document).on('pagecontainerbeforeshow', function(event, ui){
        var idPag = ui.toPage.prop("id");
        if (idPag == "pagBuscar") {
            $("a[data-rel='back']").hide();
        }else{
            $("a[data-rel='back']").show();
        }
    });

    $("#formBuscar").on("submit", buscarRecurso);
    $("#formBuscar").keyup("type", sugerirArticulos);
    $("#formBuscar").focusout("loseFocus", ocultarSugerencias);
    $(".sugerencia").click("clicked", cambiarValorBusqueda)

    if (CARGA_DINAMICA) {
        $(document).on("scrollstop", verificarScroll);
    }

    
    $("#btnBorrarCache").on('click', function () {
        COLECCIONES = [];
        COMUNIDADES = [];
        ITEMS_COLECCION = [];
        COLECCION_ANT = "";
        ITEMS_COLECCION_ANT = "";
        ITEM_DETALLE = "";
        mostrarMensaje('Éxito', 'Se ha borrado exitosamente el caché');
    })
}

function mostrarColecciones(uuid){
    mostrarCargando();
    if (COLECCIONES.length > 0 && COLECCION_ANT === uuid) {
        ocultarCargando();
        return;
    }
    $("#msgNoHayColecciones").hide();
    COLECCION_ANT = uuid;
    $("#tablaColecciones").html("").listview('refresh');
     $.ajax( datosAjax(URL + 'communities/' + uuid + '/collections ') ).done(function (resp) {
        if (resp.length < 1) {
            $("#msgNoHayColecciones").show();
            ocultarCargando();
            return;
        }
        COLECCIONES = resp;
        colocarColecciones(COLECCIONES);
        ocultarCargando();
    });
}

function mostrarItemsColeccion(uuid) {
    mostrarCargando();

    if (ITEMS_COLECCION.length > 0 && (ITEMS_COLECCION_ANT === uuid)) {
        ocultarCargando();
        return;
    }

    ITEMS_COLECCION_ANT = uuid;
    $("#tablaColecItems").html("").listview('refresh');
    ULT_ITEM = 0;
    $("#msgNoHayItemsColeccion").hide();

    $.ajax( datosAjax(URL + 'collections/' + uuid + "/items") ).done(function (resp) {
        if (resp.length < 1) {
            $("#msgNoHayItemsColeccion").show();
            ocultarCargando();
            return;
        }
        ITEMS_COLECCION = resp;
        colocarItems(ITEMS_COLECCION);
    });
}

var ULT_ITEM = 0;

function colocarItems(items) {
    if (ULT_ITEM === items.length) {
        return;
    }
    mostrarCargando();
    var linea = "<li data-role='list-divider'>Documentos</li>";
    try {
        for (var i = 0; i < MAXIMO + ULT_ITEM; i++) {
            //<img src='img/document.jpg'>
            var contenido = "<h2>" + items[i].name + "</h2>";
            contenido = contenido + "<p> Última modificación: " + items[i].lastModified + "</p>";
            linea = linea + "<li><a id='" + items[i].id + "'href='#' data-transition='slide'>" + contenido + "</a></li>";
        }
    } catch (err) {
        console.log("Maximo de lista alcanzado");
    }
    ULT_ITEM = i;
    $("#tablaColecItems").html(linea).listview('refresh');
    $('#tablaColecItems a').on('tap', function (e) {
        console.log("Detalle de item: " + this.id);
        e.preventDefault();
        localStorage.itemUUID = this.id;
        $(":mobile-pagecontainer").pagecontainer("change", "#pagDetalleItem");
    });
    ocultarCargando();
}

function agregarMasItems() {

    $(document).off("scrollstop");
    console.log("Intentando agregar items");

    setTimeout(function () {
        colocarItems(ITEMS_COLECCION);
        $(document).on("scrollstop", verificarScroll);
    }, 500);
}

function mostrarMetadatosItem(uuid) {
    mostrarCargando();
    if (uuid === ITEM_DETALLE) {
        ocultarCargando();
        return;
    }
    ITEM_DETALLE = uuid;
    reiniciarDetalleItem();
    $.ajax( datosAjax(URL + "items/" + uuid + "/metadata") ).done(function (resp) {
        colocarMetadatos(resp);
        ocultarCargando();
    });
}

function colocarMetadatos(metadatos) {
    var creadores = "";
    for (var i = 0; i < metadatos.length; i++) {
        var llave = metadatos[i].key;
        var valor = metadatos[i].value;
        switch (llave) {
            case "dc.title":
                $("#nombreItem").text(valor);
                break;
            case "dc.creator":
                creadores = valor + "; " + creadores;
                $("#creador").text(creadores);
                break;
            case "dc.description.abstract":
                $("#resumen").text(valor);
                break;
            case "dc.subject":
                var keyword = "<li data-icon='search'><a href='#'>" + valor + "</a></li>";
                $("#keywords").append(keyword).listview('refresh');
                break;
            case "dc.date":
                $("#fechaPub").text(valor);
                break;
            case "dc.identifier":
                $("#issn").text(valor);
                break;
            default:
                break;
        }
    }

    $("#issn").on("tap", function (e) {
        e.preventDefault();
        var url = $(this).text();
        var browser = cordova.InAppBrowser.open(url, '_system');
        browser.addEventListener('loaderror', function (e) {
            alert(e.message);
        });
    })
    $("#btnRecursoItem").on("tap", function (e) {
        e.preventDefault();
        console.log("Bitstreams de: " + localStorage.itemUUID);
        mostrarRecursosItem(localStorage.itemUUID);
    });
    $("#keywords li").on("tap", function (e) {
        e.preventDefault();
        var nombre = $(this).text();
        $("#formBuscar input[name='buscar']").val(nombre);
        $("#formBuscar").submit();
        $(":mobile-pagecontainer").pagecontainer("change", "#pagBuscar");
    });
}

function mostrarRecursosItem(uuid) {
    mostrarCargando();
    $("#listaRecursosItem").html("").listview('refresh');
    $.ajax( datosAjax(URL + "items/" + uuid + "/bitstreams") ).done(function (resp) {
        var linea = "";
        for (var i = 0; i < resp.length; i++) {
            linea = linea + "<li data-icon='arrow-d'><a href='" +
                    resp[i].retrieveLink + "'>" +
                    resp[i].name +
                    " (" + resp[i].sizeBytes + " bytes)</a>" +
                    "<p style='display: none;'>" + resp[i].mimeType + "</p></li>";
        }
        $("#listaRecursosItem").html(linea).listview('refresh');

        $("#listaRecursosItem li").on("tap", function (e) {
            var a = $(this).find("a")[0];
            var url = $(a).attr("href");
            url = BITSTREAM_URL + url;
            var browser = cordova.InAppBrowser.open(url, '_system');
            browser.addEventListener('loaderror', function (e) {
                alert(e.message);
            });
        });

        $("#btnRecursoItem").attr("disabled", "");
        $("#listaRecursosItem").show();
        ocultarCargando();
    });
}

function reiniciarDetalleItem() {
    $("#nombreItem").text("Sin título");
    $("#creador").text("Sin autor");
    $("#resumen").text("Sin resumen");
    $("#keywords").html("").listview('refresh');
    $("#fechaPub").text("Sin fecha de publicación");
    $("#issn").text("Sin ISSN");
    $("#listaRecursosItem").hide();
    $("#listaRecursosItem").html("").listview('refresh');
    $("#btnRecursoItem").off(); //Importante para no gastar peticiones, quita todos los listeners
    $("#btnRecursoItem").removeAttr("disabled");
}

function mostrarError(error) {
    console.log(error.source);
    console.log(error.target);
    console.log(error.code);
}

function mostrarCargando() {
    $.mobile.loading('show');
}

function mostrarCargandoMensaje(mensaje) {
    $.mobile.loading('show', {text: mensaje, textVisible: true});
}

function ocultarCargando() {
    $.mobile.loading('hide');
}

function mostrarMensaje(titulo, mensaje) {
    $("#dlgMensajeTitulo").text(titulo);
    $("#dlgMensajeTexto").text(mensaje);
    $("#popupMensaje").popup();
    $("#popupMensaje").popup("open");
}


/**
 * Verifica si al momento de detenerse el evento de scroll se ha llegado al fondo
 * de la vista.
 *
 * @param {type} idPag Si se necesita una pagina diferente a pagItems
 * @url https://jqmtricks.wordpress.com/2014/07/15/infinite-scrolling/
 * @returns null
 */
function verificarScroll(idPag) {

    var activePage =
            $.mobile.pageContainer.pagecontainer("getActivePage"),
            screenHeight = $.mobile.getScreenHeight(),
            contentHeight = $(".ui-content", activePage).outerHeight(),
            scrolled = $(window).scrollTop(),
            header = $(".ui-header", activePage).outerHeight() - 1,
            footer = $(".ui-footer", activePage).outerHeight() - 1,
            scrollEnd = contentHeight - screenHeight + header + footer;

    if (activePage[0].id === "pagItems" && scrolled >= scrollEnd) {
        agregarMasItems();
        //callback();
    }
}
