import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // 1. Importamos la conexión que creamos en lib/prisma.js

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log("--- SOLICITUD REAL RECIBIDA ---");
    console.log(body);

    // 2. Generamos el ID de seguimiento (E Volt style)
    const trackingId = `EV-${Math.floor(100000 + Math.random() * 900000)}`;

    // 3. 🚀 GUARDADO REAL EN POSTGRESQL
    // Usamos 'prisma.booking.create' porque en tu schema el modelo se llama 'Booking'
    const nuevoBooking = await prisma.booking.create({
      data: {
        servicio: body.servicio,           // 'visita' o 'instalacion'
        tracking_id: trackingId,
        nombre_cliente: body.nombre,
        // IMPORTANTE: El número de documento debe ir como BigInt para Postgres
        numero_documento: BigInt(body.numeroDocumento), 
        ciudad: body.ciudad || "Bogotá",
        tipo_locacion: body.tipoLocacion || null,
        referencia_cotizacion: body.referenciaCotizacion || null,
      }
    });

    // 4. Respondemos con éxito enviando el ID generado
    return NextResponse.json({
      success: true,
      message: "Agendamiento guardado en base de datos",
      trackingId: nuevoBooking.tracking_id, // Usamos el ID confirmado por la DB
      nextStep: "cal_com_redirect"
    }, { status: 201 });

  } catch (error) {
    console.error("ERROR AL GUARDAR EN DB:", error);
    
    return NextResponse.json({
      success: false,
      message: "Error al procesar el agendamiento",
      details: error.message
    }, { status: 500 });
  }
}