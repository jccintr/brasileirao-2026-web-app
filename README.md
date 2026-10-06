# Brasileirão 2026 Web

Versão web do [Brasileirão 2026](https://github.com/jccintr/brasileirao-2026-android-app): classificação, rodadas e jogos de cada equipe do Campeonato Brasileiro Série A, com dados da [football-data.org](https://www.football-data.org) (competição `BSA`).
Vite + React 19 + Tailwind v4 + React Router (JavaScript).

## O que tem

- **Classificação**: tabela completa (Pts, PJ, V, E, D, GP, GC, SG) com escudos e faixas coloridas (Libertadores, pré-Libertadores, Sul-Americana, rebaixamento). GP/GC aparecem só em telas largas. Clicar no time abre os jogos dele.
- **Rodadas**: seletor de 1 a 38 (setas, janela de seleção, setas do teclado e deslize no celular). Abre na rodada atual; a rodada fica na URL (`/rodadas?rodada=12`).
- **Equipes** e **detalhe do time**: próximos jogos e últimos resultados.
- **Tema claro, escuro ou do sistema**, no cabeçalho e em Ajustes. A escolha fica salva e, em "Sistema", o app acompanha o aparelho. Um script no `index.html` aplica o tema antes do React carregar, sem "piscar".
- Cache de 60 s e junção de chamadas simultâneas (o plano gratuito permite 10 requisições por minuto), erros amigáveis e "tentar novamente".
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
src/pages/                       # Standings, Rounds, Teams, TeamDetail, Settings
src/components/                  # AppShell, MatchCard, TeamCrest, RoundPicker, ...
src/index.css                    # tokens de cor (claro/escuro) + Tailwind
```

## Pontos de atenção

- **A chave fica exposta**: tudo que começa com `VITE_` vai para o código do navegador, e qualquer pessoa consegue ler a chave. Serve para uso pessoal ou desenvolvimento.
- **O limite de 10 requisições por minuto é por chave**, então todos os visitantes dividem o mesmo limite. Para publicar de forma aberta, o ideal é um pequeno proxy (função serverless) que guarde a chave, faça cache de 1 a 5 minutos e responda com CORS. Basta apontar `VITE_API_BASE_URL` para ele; sem chave configurada, o app não envia o header `X-Auth-Token`.
- **CORS**: a football-data.org precisa aceitar chamadas vindas do navegador para o seu domínio. Se a página mostrar "Não foi possível conectar à API" com a internet funcionando, é o caso mais provável, e o proxy resolve.
- **Rotas**: o app usa `BrowserRouter`. Na hospedagem, configure o fallback de SPA (todas as rotas servem `index.html`), como na Render (Rewrite `/*` -> `/index.html`), Netlify ou Vercel.
- As vagas das zonas (G4, pré-Libertadores, Sul-Americana, Z4) seguem o formato mais comum e podem mudar de uma temporada para outra.
