// Middleware para manejo centralizado de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de MySQL
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        return res.status(400).json({
          success: false,
          message: 'Ya existe un registro con esos datos',
          error: err.sqlMessage
        });
      case 'ER_NO_REFERENCED_ROW_2':
        return res.status(400).json({
          success: false,
          message: 'Referencia inválida a otro registro',
          error: err.sqlMessage
        });
      default:
        return res.status(500).json({
          success: false,
          message: 'Error en la base de datos',
          error: err.sqlMessage
        });
    }
  }

  // Error personalizado con statusCode
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`
  });
};

module.exports = { errorHandler, notFound };
