// Endpoint rápido (sem latência artificial) - útil como baseline no teste de carga
module.exports = (req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
};
