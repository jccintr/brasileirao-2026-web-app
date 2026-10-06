import { handleFootballRequest } from '../../server/footballProxy.js'

// Função serverless da Vercel: /api/football/* -> football-data.org.
// O vercel.json reescreve /football-api/* para cá.
export default function handler(req, res) {
  return handleFootballRequest(req, res)
}
