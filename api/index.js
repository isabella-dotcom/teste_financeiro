// Versão JavaScript pura - sem TypeScript
module.exports = async function handler(req, res) {
  try {
    res.status(200).json({
      status: 'ok',
      message: 'Função serverless funcionando!',
      method: req.method,
      url: req.url,
      path: req.path,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      cwd: process.cwd(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro',
      message: error?.message || 'Unknown',
    });
  }
};

