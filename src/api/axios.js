  API . put ( ` /rutinas/asignar/ ${ id } ` , datos , configuración ) ;
exportar const eliminarAsignacionRutina = ( id , config ) =>     
  API . eliminar ( ` /rutinas/asignar/ ${ id } ` , configuración ) ;
export const consultarRutinaPorNumeroIdentificacion = (    
  numeroIdentificacion ,
  configuración
) => 
  api . obtener (
    ` /rutinas/consultarRutinasPorNumeroIdentificacion/ ${ numeroIdentificacion } ` ,
    configuración
  ) ;

// Clases
export const obtenerClasesDisponibles = ( config ) =>     
  API . get ( "/clases/disponibles" , config ) ;
exportar const registrarClienteEnClase = ( datos , configuración ) =>     
  API . post ( "/clases/registrador" , datos , configuración ) ;
export const consultarClasesPorNumeroIdentificacion = (    
  numeroIdentificacion ,
  configuración
) => API . get ( ` /clases/consultar/ ${ numeroIdentificacion } ` , config ) ; 

// Usuarios
export const obtenerUsuarios = ( config ) => api . get ( "/usuarios" , config ) ;     
export const editarUsuario = ( id , datos , config ) =>     
  api .put ( ` / usuarios/ ${ id } ` , datos , config ) ;

// Composición corporal
export const crearComposicionCorporal = ( data , config ) =>     
  api . post ( "/composicion-corporal" , data , config ) ;
export const consultarComposicionPorCliente = (    
  identificación ,
  configuración
) => API . get ( ` /composicion-corporal/cliente/ ${ identificacion } ` , config ) ; 

// Medición porristas
export const crearMedicionPorristas = ( datos , configuración ) =>     
  API . post ( "/medicion-porristas" , datos , config ) ;
export const obtenerMedicionesPorristas = ( config ) =>     
  API . get ( "/medicion-porristas" , config ) ;
export const editarMedicionPorristas = ( id , datos , config ) =>     
  API . put ( ` /medicion-porristas/ ${ id } ` , datos , config ) ;
exportar const eliminarMedicionPorristas = ( id , config ) =>     
  API . eliminar ( ` /medicion-porristas/ ${ id } ` , config ) ;

// Autenticación
exportar const login = ( datos ) => api . post ( "/auth/login" , datos ) ;     
export const registrarse = ( data ) => api . post ( "/auth/register" , data ) ;     

exportar api predeterminada ; 

