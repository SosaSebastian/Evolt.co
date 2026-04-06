-- CreateTable
CREATE TABLE "tecnicos" (
    "id_tecnico" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "fecha_nacimiento" TIMESTAMP(3),
    "certificacion" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tecnicos_pkey" PRIMARY KEY ("id_tecnico")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id_booking" SERIAL NOT NULL,
    "tracking_id" TEXT NOT NULL,
    "servicio" TEXT NOT NULL,
    "nombre_cliente" TEXT NOT NULL,
    "numero_documento" BIGINT NOT NULL,
    "ciudad" TEXT NOT NULL DEFAULT 'Bogotá',
    "tipo_locacion" TEXT,
    "referencia_cotizacion" TEXT,
    "tecnico_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizado_at" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id_booking")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id_cotizacion" SERIAL NOT NULL,
    "codigo_cotizacion" TEXT NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "tecnico_id" INTEGER NOT NULL,
    "cumple_retie" BOOLEAN NOT NULL DEFAULT false,
    "tipo_cargador" TEXT,
    "cableado_metros" INTEGER,
    "requiere_obra" BOOLEAN NOT NULL DEFAULT false,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id_cotizacion")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id_pago" SERIAL NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_pago" TEXT NOT NULL DEFAULT 'completado',
    "cotizacion_id" INTEGER NOT NULL,
    "id_metodo_pago" INTEGER NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "medios_pago" (
    "id_metodo_pago" SERIAL NOT NULL,
    "nombre_metodo" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "medios_pago_pkey" PRIMARY KEY ("id_metodo_pago")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_tracking_id_key" ON "bookings"("tracking_id");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_codigo_cotizacion_key" ON "cotizaciones"("codigo_cotizacion");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_booking_id_key" ON "cotizaciones"("booking_id");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "tecnicos"("id_tecnico") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id_booking") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "tecnicos"("id_tecnico") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "cotizaciones"("id_cotizacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_metodo_pago_fkey" FOREIGN KEY ("id_metodo_pago") REFERENCES "medios_pago"("id_metodo_pago") ON DELETE RESTRICT ON UPDATE CASCADE;
