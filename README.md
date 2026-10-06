# Brasileirão 2026 Web

Versão web do [Brasileirão 2026](https://github.com/jccintr/brasileirao-2026-android-app): classificação, rodadas e jogos de cada equipe do Campeonato Brasileiro Série A, com dados da [football-data.org](https://www.football-data.org) (competição `BSA`).
Vite + React 19 + Tailwind v4 + React Router (JavaScript).

## O que tem

- **Classificação**: tabela completa (Pts, PJ, V, E, D, GP, GC, SG) com escudos e faixas coloridas (Libertadores, pré-Libertadores, Sul-Americana, rebaixamento). GP/GC aparecem só em telas largas. Clicar no time abre os jogos dele.
- **Rodadas**: seletor de 1 a 38 (setas, janela de seleção, setas do teclado e deslize no celular). Abre na rodada atual; a rodada fica na URL (`/rodadas?rodada=12`).
- **Ao Vivo**: jogos em andamento (primeiro tempo, intervalo, prorrogação e pênaltis), atualizados sozinhos a cada 45 s. Pausa quando a aba do navegador fica em segundo plano e busca na hora ao voltar. Se há jogo rolando quando você abre o app na Classificação, ele já abre em Ao Vivo.
- **Equipes** e **detalhe do time**: próximos jogos e últimos resultados.
- **Tema claro, escuro ou do sistema**, no cabeçalho e em Ajustes. A escolha fica salva e, em "Sistema", o app acompanha o aparelho. Um script no `index.html` aplica o tema antes do React carregar, sem "piscar".
- Cache de 60 s e junção de chamadas simultâneas (o plano gratuito permite 10 requisições por minuto), erros amigáveis e "tentar novamente".
- Ao Vivo usa 1 requisição a cada 45 s (a API não tem um filtro "ao vivo": busca os jogos do dia e filtra no navegador).
- Layout com abas na parte de baixo no celular e no topo no desktop.

## Rodando

```bash
npm install
cp .env.example .env     # coloque sua chave em VITE_FOOTBALL_DATA_TOKEN
npm run dev
npm test
npm run build
```

Chave gratuita: https://www.football-data.org/client/register

## Estrutura

```
index.html                       # fontes + script anti-flash do tema
src/App.jsx                      # rotas
src/api/client.js                # fetch + cache + erros amigáveis
src/api/football.js              # endpoints da BSA
src/config/env.js                # chave, URL da API, temporada, nº de rodadas
src/config/qualificationZones.js # faixas da tabela (ajuste aqui se a CBF mudar as vagas)
src/context/ThemeContext.jsx     # preferência system | light | dark
src/utils/matchday.js            # rodada atual, agrupamento, próximos/resultados
src/utils/liveMatches.js         # quais status contam como "ao vivo"
src/pages/                       # Standings, Rounds, Teams, TeamDetail, Live, Settings
src/hooks/                       # useAsync, useLiveAutoNavigate
src/components/                  # AppShell, MatchCard, TeamCrest, RoundPicker, ...
src/index.css                    # tokens de cor (claro/escuro) + Tailwind
```

## Publicando na Vercel

O repositório já traz o proxy de produção: `api/football.js` (função serverless; o `vercel.json` reescreve `/football-api/...` para `/api/football?path=...`) + `server/footballProxy.js` + `vercel.json`. Ele guarda a chave no servidor, só repassa as rotas que o app usa e usa o cache da CDN (30 s nos jogos do dia, 60 s no resto), então todos os visitantes juntos gastam poucas requisições do limite de 10 por minuto.

Em **Settings → Environment Variables** do projeto na Vercel:

| Variável | Valor |
| --- | --- |
| `VITE_API_BASE_URL` | `/football-api/v4` |
| `FOOTBALL_DATA_TOKEN` | sua chave (**sem** o prefixo `VITE_`, para não ir para o navegador) |

Se existir `VITE_FOOTBALL_DATA_TOKEN` na Vercel, apague: com esse prefixo a chave é embutida no site. Depois faça um novo deploy (variáveis `VITE_` são lidas no build).

Para conferir o deploy, abra `/api/ping` (deve mostrar `tokenConfigurado: true`) e depois `/football-api/v4/competitions/BSA/standings`.

O `vercel.json` também faz as rotas do app (`/rodadas`, `/equipes/123`...) funcionarem ao recarregar a página.

## Pontos de atenção

- **Em desenvolvimento a chave `VITE_` fica no navegador**: serve para uso pessoal. Em produção use o proxy acima.
- **Sem o proxy, o limite de 10 requisições por minuto é por chave**, então todos os visitantes dividem o mesmo limite.
- **Desenvolvimento local**: com `VITE_API_BASE_URL=/football-api/v4` o Vite usa o proxy do `vite.config.js` (resolve o CORS). Sem essa variável o navegador chama a API direto e pode ser bloqueado.
- As vagas das zonas (G4, pré-Libertadores, Sul-Americana, Z4) seguem o formato mais comum e podem mudar de uma temporada para outra.
