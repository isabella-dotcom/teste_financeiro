// Versão ABSOLUTAMENTE MÍNIMA - sem dependências
export default async function handler(req: any, res: any) {
  try {
    // Retornar JSON simples SEM importar nada
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
  } catch (error: any) {
    res.status(500).json({
      error: 'Erro',
      message: error?.message || 'Unknown',
    });
  }
}
