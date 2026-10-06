// Diagnóstico: abra /api/ping no site publicado.
// Mostra se as funções da pasta api/ estão sendo publicadas e se a chave chegou ao servidor.
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(
    JSON.stringify({
      ok: true,
      node: process.version,
      tokenConfigurado: Boolean(process.env.FOOTBALL_DATA_TOKEN || process.env.VITE_FOOTBALL_DATA_TOKEN),
    }),
  )
}
