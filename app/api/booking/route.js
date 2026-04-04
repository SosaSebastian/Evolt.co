import { NextResponse } from 'next/server';

// Esta función maneja las peticiones POST (cuando enviamos datos)
export async function POST(request) {
  try {
    // 1. Extraemos los datos que vienen del formulario o de Postman
    const body = await request.json();
    
    // 2. Aquí es donde procesarías los datos (validar cédula, ciudad, etc.)
    console.log("--- NUEVA SOLICITUD RECIBIDA ---");
    console.log(body);

    // 3. Simulamos la creación de un ID único para E Volt
    const trackingId = `EV-${Date.now().toString().slice(-6)}`;

    // 4. Respondemos con éxito y enviamos el ID de seguimiento
    return NextResponse.json({
      success: true,
      message: "Datos de E Volt procesados correctamente",
      trackingId: trackingId,
      nextStep: "cal_com_redirect"
    }, { status: 201 });

  } catch (error) {
    // Si algo sale mal (ej: el JSON está mal escrito), respondemos error
    return NextResponse.json({ 
      success: false, 
      message: "Error en el formato de los datos" 
    }, { status: 400 });
  }
}