const cargarCierre = async () => {
  try {
    setLoadingCierre(true);

    // 🔹 PAGOS (PRODUCTOS + posibles ligas antiguas)
    const resPagos = await api.get("/pagos");
    const pagos = resPagos.data.pagos || [];

    const pagosDia = pagos.filter((p) => {
      const fecha = new Date(p.fecha);
      if (isNaN(fecha)) return false;

      const fechaLocal =
        fecha.getFullYear() + "-" +
        String(fecha.getMonth() + 1).padStart(2, "0") + "-" +
        String(fecha.getDate()).padStart(2, "0");

      return fechaLocal === fechaCierre;
    });

    // 🔹 MENSUALIDADES
    const year = fechaCierre.split("-")[0];
    const resMensualidades = await api.get(`/paga-mes/pagos/${year}`);
    const mensualidadesData =
      resMensualidades.data.pagos || resMensualidades.data || [];

    const mensualidadesDia = mensualidadesData.filter((m) => {
      if (!m.fecha && !m.createdAt) return false;

      const fecha = new Date(m.fecha || m.createdAt);
      if (isNaN(fecha)) return false;

      const fechaLocal =
        fecha.getFullYear() + "-" +
        String(fecha.getMonth() + 1).padStart(2, "0") + "-" +
        String(fecha.getDate()).padStart(2, "0");

      return fechaLocal === fechaCierre;
    });

    // 🔹 LIGAS (🔥 AQUÍ ESTABA EL PROBLEMA REAL)
    let ligasDia = [];
    try {
      const resLigas = await api.get("/pagos-ligas"); // 👈 asegúrate que esta ruta exista
      const ligasData = resLigas.data || [];

      ligasDia = ligasData.filter((l) => {
        const fecha = new Date(l.createdAt || l._id);
        if (isNaN(fecha)) return false;

        const fechaLocal =
          fecha.getFullYear() + "-" +
          String(fecha.getMonth() + 1).padStart(2, "0") + "-" +
          String(fecha.getDate()).padStart(2, "0");

        return fechaLocal === fechaCierre;
      });
    } catch (err) {
      console.log("No hay endpoint de ligas o falló:", err.message);
    }

    // 🔹 PRODUCTOS (solo pagos normales)
    const productos = pagosDia.filter((p) => {
      const nombre = (
        p.productoManual ||
        p.producto?.nombre ||
        ""
      ).toLowerCase();

      return !nombre.includes("liga");
    });

    // 🔹 FUNCIONES
    const calcular = (lista) => ({
      total: lista.reduce((acc, p) => acc + (p.monto || 0), 0),
      efectivo: lista
        .filter((p) => p.metodoPago === "Efectivo")
        .reduce((acc, p) => acc + (p.monto || 0), 0),
      transferencia: lista
        .filter((p) => p.metodoPago === "Transferencia")
        .reduce((acc, p) => acc + (p.monto || 0), 0),
      tarjeta: lista
        .filter((p) => p.metodoPago === "Tarjeta")
        .reduce((acc, p) => acc + (p.monto || 0), 0),
    });

    const calcularMensualidades = (lista) => ({
      total: lista.reduce((acc, m) => acc + (m.total || 0), 0),
      efectivo: lista
        .filter((m) => m.metodoPago === "Efectivo")
        .reduce((acc, m) => acc + (m.total || 0), 0),
      transferencia: lista
        .filter((m) => m.metodoPago === "Transferencia")
        .reduce((acc, m) => acc + (m.total || 0), 0),
      tarjeta: lista
        .filter((m) => m.metodoPago === "Tarjeta")
        .reduce((acc, m) => acc + (m.total || 0), 0),
    });

    // 🔹 LIGAS CALCULADAS
    const ligasCalculadas = {
      total: ligasDia.reduce((acc, l) => acc + (l.total || 0), 0),
      efectivo: ligasDia
        .filter((l) => l.tipoPago === "Efectivo")
        .reduce((acc, l) => acc + (l.total || 0), 0),
      transferencia: ligasDia
        .filter((l) => l.tipoPago === "Nequi")
        .reduce((acc, l) => acc + (l.total || 0), 0),
      tarjeta: 0,
    };

    const totalPagos = pagosDia.reduce((acc, p) => acc + (p.monto || 0), 0);

    // 🔹 SET FINAL
    setCierre({
      ligas: ligasCalculadas,
      mensualidades: calcularMensualidades(mensualidadesDia),
      productos: calcular(productos),
      totalDia:
        totalPagos +
        calcularMensualidades(mensualidadesDia).total +
        ligasCalculadas.total,
    });

  } catch (err) {
    console.error(err);
  } finally {
    setLoadingCierre(false);
  }
};
