# LexPanel — Painel de Atendimentos Jurídicos

Aplicação web full stack para visualização, pesquisa e análise de atendimentos jurídicos. Desenvolvida com **Node.js + Express** no back-end e **React + Vite** no front-end.

---

## Pré-requisitos

- Node.js **v18+**
- npm **v9+**

---

## 1. Executar o Back-end

```bash
cd backend
npm install
npm start
# Servidor disponível em http://localhost:3001
```

Para desenvolvimento com hot-reload (Node 18+):

```bash
npm run dev
```

### Endpoints disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Status da API |
| GET | `/api/atendimentos` | Lista paginada com filtros |
| GET | `/api/atendimentos/metricas` | KPIs e dados para gráficos |
| GET | `/api/atendimentos/opcoes` | Valores únicos para filtros |
| GET | `/api/atendimentos/exportar` | Todos os registros filtrados |
| GET | `/api/atendimentos/:id` | Atendimento por ID |

**Query params de `/api/atendimentos`:**
`busca`, `status`, `area`, `advogado`, `dataInicio`, `dataFim`, `page`, `limit`

---

## 2. Executar o Front-end

```bash
cd frontend
npm install
npm run dev
# Aplicação disponível em http://localhost:5173
```

> O front-end espera o back-end em `http://localhost:3001`. Ambos devem estar rodando simultaneamente.

---

## 3. Dependências e Justificativas

### Back-end

| Pacote | Versão | Justificativa |
|--------|--------|---------------|
| `express` | ^4.18 | Framework web maduro, API simples e extensível para construção de rotas REST |
| `cors` | ^2.8 | Middleware para habilitar CORS com configuração por origem, evitando bloqueios de segurança do browser |

### Front-end

| Pacote | Versão | Justificativa |
|--------|--------|---------------|
| `react` | ^18 | Biblioteca principal de UI; hooks funcionais modernos |
| `vite` | ^5 | Bundler ultrarrápido com HMR, substitui CRA com performance superior |
| `axios` | ^1.6 | Cliente HTTP com interceptors, timeout e melhor tratamento de erros que fetch nativo |
| `recharts` | ^2.10 | Biblioteca de gráficos baseada em SVG, composable e idiomática para React |
| `jspdf` | ^2.5 | Geração de PDF no browser sem dependência de servidor |
| `jspdf-autotable` | ^3.8 | Plugin para tabelas formatadas dentro do jsPDF, com estilos, alternância de linhas e cabeçalho |

---

## 4. Decisões Técnicas

### Arquitetura back-end
O projeto segue separação clara em três camadas: `routes/` (mapeamento de URLs), `controllers/` (lógica de negócio e filtragem) e `data/` (fonte de dados mock). Isso facilita manutenção e futura substituição do JSON por um banco de dados real sem alterar as rotas.

A filtragem é feita em memória com `Array.filter()` encadeado, o que é adequado para 500 registros. Para volumes maiores, a mesma estrutura de parâmetros de query seria simplesmente repassada a um ORM/banco.

### Paginação server-side
A paginação é processada no back-end (`page` + `limit`) para que o front-end nunca carregue os 500 registros de uma vez, refletindo um padrão mais próximo de um cenário de produção real.

### Exportação com filtros espelhados
O endpoint `/exportar` recebe os mesmos parâmetros de filtro da listagem principal e retorna todos os registros filtrados sem paginação. O front-end usa esses dados para gerar CSV (com BOM UTF-8 para compatibilidade com Excel) e PDF via jsPDF-autoTable, garantindo que exportação e visualização sejam sempre consistentes.

### Debounce na busca textual
O hook `useAtendimentos` aplica debounce de 400ms na busca textual para evitar chamadas excessivas à API enquanto o usuário digita, sem uso de bibliotecas externas (apenas `useRef` + `setTimeout`).

### Design system com CSS custom properties
Toda a paleta e espaçamento são definidos via variáveis CSS em `:root`, o que facilita tematização futura (ex: modo escuro) sem reescrever componentes.

---

## 5. Estrutura de Pastas

```
juridico/
├── backend/
│   ├── controllers/
│   │   ├── atendimentosController.js
│   │   ├── authController.js
│   │   └── clientesController.js
│   ├── data/
│   │   ├── atendimentos.json
│   │   ├── clientes.json
│   │   └── users.json
│   ├── routes/
│   │   ├── atendimentos.js
│   │   ├── auth.js
│   │   └── clientes.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Clientes.jsx
    │   │   ├── DashboardCharts.jsx
    │   │   ├── FiltroAtivo.jsx
    │   │   ├── FiltrosBar.jsx
    │   │   ├── KPICard.jsx
    │   │   ├── Login.jsx
    │   │   ├── StatusBadge.jsx
    │   │   └── TabelaAtendimentos.jsx
    │   ├── hooks/
    │   │   └── useAtendimentos.js
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── exportUtils.js
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    └── package.json
```

---

## 6. Limitações Conhecidas e Melhorias Futuras

**Limitações atuais:**
- Dados armazenados em JSON em disco — adequado para mock, mas sem suporte a concorrência real
- Autenticação implementada via token simples (sem JWT assinado); em produção recomenda-se JWT com expiração
- Gráficos sem drill-down interativo
- Sem testes automatizados (unitários/integração)

**Melhorias futuras:**
- Substituir JSON por PostgreSQL + Prisma ORM
- Migrar autenticação para JWT assinado com refresh token e expiração
- Implementar ordenação de colunas na tabela
- Adicionar detalhes do atendimento em modal
- Testes com Jest (back-end) e Vitest + Testing Library (front-end)
- CI/CD com GitHub Actions
- Dark mode via toggle na topbar

***EXTRAS***

## Telas do sistema

### Login
A tela de login é a porta de entrada do sistema. Apenas usuários cadastrados conseguem acessar.

Para entrar, utilize um dos usuários abaixo:

| Nome | E-mail | Senha | Perfil |
|------|--------|-------|--------|
| Administrador | admin@lexPanel.com | admin123 | admin |


---

## Como editar os usuários

## Telas do sistema

### Login
A tela de login é a porta de entrada do sistema. Apenas usuários cadastrados conseguem acessar.

Para entrar, utilize um dos usuários abaixo:

| Nome | E-mail | Senha | Perfil |
|------|--------|-------|--------|
| Administrador | admin@lexPanel.com | admin123 | admin |


---

O arquivo tem esse formato:


[
  {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@lexPanel.com",
    "senha": "admin123",
    "role": "admin"
  }
]

Para adicionar ou editar um usuário, basta abrir esse arquivo e alterar diretamente. Depois reinicie o back-end para as mudanças surtirem efeito.

---

#Esses arquivos podem ser editados diretamente para adicionar, remover ou alterar registros. Após qualquer edição, reinicie o back-end.
