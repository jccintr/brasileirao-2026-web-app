import { handleFootballRequest } from '../server/footballProxy.js'

// O vercel.json reescreve /football-api/<caminho> para /api/football?path=<caminho>.
export default function handler(req, res) {
  return handleFootballRequest(req, res)
}
