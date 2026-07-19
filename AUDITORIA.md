# Auditoria final — rodrigosouzafilho.adv.br

Data da auditoria: julho de 2026 (build de entrega).
Método: verificação automatizada sobre as páginas **geradas** (`public/`) em
três cenários de configuração (entrega, WhatsApp preenchido, serviço de envio
preenchido), além de conferência manual de conteúdo, ética e design.

## A. Checklist de validação

| # | Item | Resultado |
|---|---|---|
| 1 | Nome correto "Rodrigo Souza Filho" em todos os arquivos | ✔ conferido em todas as páginas, meta tags, dados estruturados e documentos |
| 2 | Nenhuma ocorrência do nome do projeto musical | ✔ o build **bloqueia a publicação** se o texto aparecer (guarda automática em `aplicar-config.js`) |
| 3 | Direito Civil como atuação principal | ✔ H1, hero, seção-base, 6 áreas civis e sumário; frentes vêm depois, como seção própria |
| 4 | Saúde e Carros Antigos como frentes específicas | ✔ seção destacada (faixa escura) com botões para os dois subdomínios, sem alterar os sites atuais |
| 5 | Ética OAB: sem promessa de resultado, "especialista", depoimentos, números de êxito, urgência ou consulta gratuita | ✔ conferência manual de todo o texto; princípio "Responsabilidade" explicita a ausência de promessas |
| 6 | Sem clichês visuais (martelo, balança, colunas, dourado excessivo) | ✔ identidade: papel marfim, verde-pinheiro, filetes de latão discretos, sumário de volume jurídico |
| 7 | TITLE e META DESCRIPTION exatos | ✔ "Rodrigo Souza Filho \| Advocacia Civil em Curitiba" + descrição especificada |
| 8 | H1 único e exato | ✔ "Direito Civil com estratégia, clareza e atenção pessoal." — 1 h1 por página, sem saltos de hierarquia |
| 9 | Canonical, og:url, og:image, twitter card | ✔ com o domínio final e URLs limpas; og-image própria 1200×630 gerada na identidade do site |
| 10 | JSON-LD LegalService/Attorney só com dados reais | ✔ JSON validado nos 3 cenários; telefone/e-mail/endereço só entram quando preenchidos em `config.js` |
| 11 | FAQPage idêntico ao FAQ visível | ✔ as 4 perguntas e respostas conferidas caractere a caractere |
| 12 | sitemap.xml correto | ✔ apenas `/` e `/privacidade`; obrigado e 404 fora |
| 13 | Página de obrigado com noindex e fora do sitemap | ✔ `noindex, follow`; redirecionamento do formulário usa a URL final `/obrigado` |
| 14 | robots.txt | ✔ `Allow: /` + linha `Sitemap:` com o domínio final |
| 15 | URLs limpas, sem `.html` em nenhum link interno | ✔ `cleanUrls` no `vercel.json` + varredura automática dos links gerados |
| 16 | Página 404 própria | ✔ sóbria, com retorno à página inicial (a Vercel serve `404.html` com o status correto) |
| 17 | Formulário completo (nome, e-mail, telefone, assunto com 8 opções, mensagem, consentimento) | ✔ com `maxlength` (80/120/30/1500), validação acessível, campo-armadilha, tempo mínimo e trava de reenvio |
| 18 | Redirecionamento do formulário com a URL final | ✔ `_next` = `https://rodrigosouzafilho.adv.br/obrigado` (modo serviço de envio), testado no cenário 2 |
| 19 | Mensagem inicial de WhatsApp exata | ✔ "Olá. Acessei o site de Rodrigo Souza Filho e gostaria de encaminhar informações iniciais sobre uma questão jurídica." |
| 20 | Segurança: CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, anti-iframe | ✔ CSP estrita com hash do único script embutido (o build confere o hash a cada publicação); sem chave ou segredo no frontend |
| 21 | Acessibilidade: skip link, foco visível, labels reais, erros acessíveis, aria-expanded, aria-current, botões ≥44 px, reduced-motion, HTML semântico | ✔ menu móvel e FAQ funcionam **sem JavaScript** (elemento `<details>` nativo); contraste medido: todos os pares em AA, maioria em AAA |
| 22 | Funciona sem JavaScript nas funções essenciais | ✔ conteúdo visível (failsafe no `<head>`), navegação, menu móvel, FAQ e envio do formulário por POST nativo no modo serviço de envio |
| 23 | Responsivo 320–ultrawide, sem overflow horizontal | ✔ grades fluidas com `minmax(0, …)`, quebras em 1024/900/640/380 px, botões em largura total abaixo de 380 px |
| 24 | Performance | ✔ primeira carga ≈ 160 KB no total (sem nenhuma requisição externa, fontes auto-hospedadas com preload, zero imagens na página, JS de 12 KB); base compatível com Lighthouse > 95 |
| 25 | Pronto para Vercel | ✔ `vercel.json` + `package.json` + build testado; `npm run build` gera `public/` sem erros nos 3 cenários |

## B. Decisões técnicas (e por quê)

1. **Mesma arquitetura dos dois sites existentes** (`modelos/` + `config.js` +
   `aplicar-config.js` → `public/`). O dono já mantém dois projetos assim; o
   terceiro seguir o mesmo fluxo significa um único hábito: editar `config.js`
   e publicar. Por isso também os nomes `assets/estilo.css` e `assets/app.js`
   (em vez de `styles.css`/`script.js` na raiz): consistência entre os três
   repositórios. A estrutura mínima pedida foi adaptada com essa justificativa.
2. **Formulário híbrido por build.** Com `formEndpoint` preenchido, o envio é
   por serviço de formulários (funciona até sem JavaScript, com POST nativo e
   redirecionamento para `/obrigado`). Sem endpoint, reaproveita a solução já
   validada dos outros dois sites: a mensagem é organizada e aberta no
   WhatsApp do visitante, sem nada armazenado. Sem os dois dados, o
   formulário não é publicado — nunca aparece botão morto.
3. **Sem GTM, Ads, analytics, cookies ou armazenamento no navegador.** O
   institucional não é página de campanha; o brief pede a eliminação de
   scripts de terceiros desnecessários. Resultado: sem banner de cookies
   (não há o que consentir), carregamento mais rápido e uma Política de
   Privacidade verdadeira ao afirmar que o site não usa cookies. O sistema de
   consentimento + GTM dos outros dois sites pode ser portado no futuro, se
   um dia houver medição — a política deverá ser atualizada junto.
4. **CSP estrita com hash.** `style-src 'self'` exigiu remover todos os
   atributos `style=` (viraram classes utilitárias). O único script embutido
   (o failsafe anti-conteúdo-invisível do `<head>`) é autorizado pelo hash
   sha256 no `vercel.json`; o build recalcula o hash a cada publicação e
   **interrompe** se alguém alterar o script sem atualizar a CSP.
5. **Menu móvel com `<details>` nativo** — correção de uma limitação dos dois
   sites de referência (que apenas ocultam os links no celular). Abre e fecha
   sem JavaScript; o JS só aprimora (fechar ao navegar, tecla Esc, clique
   fora, `aria-expanded`).
6. **Assinatura visual própria dentro da mesma família.** Verde-pinheiro,
   latão e Newsreader/Albert Sans preservados; o fundo passa de porcelana
   fria (landing pages) para **marfim aquecido** (institucional). O elemento
   distintivo é o **"Sumário da atuação"** no hero — um índice de volume
   jurídico com numeração romana I–VI que também é navegação real por
   âncoras para as seis áreas e para as duas frentes.
7. **OAB pré-preenchida com o número usado nos dois sites publicados**
   (nenhum número foi inventado; o valor veio dos projetos de referência do
   próprio advogado). Está sinalizado no `config.js` e no README para
   **confirmação** antes da primeira publicação — e pode ser esvaziado.
8. **FAQ com "Curitiba" literal** (no texto e no schema), como no brief; o
   campo `cidade` de `config.js` alimenta rodapé, hero, ficha e dados
   estruturados. Assim o FAQPage nunca dessincroniza do texto visível.
9. **Fontes auto-hospedadas** (mesmos arquivos dos irmãos): velocidade e
   LGPD — nenhum IP de visitante é enviado ao Google Fonts.
10. **`robots.txt` e `sitemap.xml` gerados no build**, nunca com URL
    fictícia: sem domínio em `config.js`, o sitemap simplesmente não é
    criado e o robots sai sem a linha `Sitemap:`.
11. **Guardas de publicação**: além do hash da CSP, o build barra marcadores
    não resolvidos e uma lista de textos proibidos (incluindo o nome do
    projeto musical e sobras de exemplo) em qualquer página gerada.

## C. O que falta preencher (tudo em `config.js`)

| Campo | Efeito quando preenchido |
|---|---|
| `whatsapp` | botões de WhatsApp no contato e no rodapé; formulário no modo WhatsApp (se não houver endpoint) |
| `email` | botão "Enviar e-mail", linhas de e-mail e canal de direitos LGPD na Política de Privacidade |
| `telefoneExibicao` | linha de telefone clicável no contato e no rodapé; `telephone` nos dados estruturados |
| `formEndpoint` (opcional) | formulário passa ao modo serviço de envio, com redirecionamento para `/obrigado` |
| `oab` | **já preenchida — confirmar o número** antes da primeira publicação |
| `endereco`, `linkedin`, `instagram` (opcionais) | linhas adicionais no rodapé e endereço nos dados estruturados |

Fotografia profissional (opcional): instruções comentadas em
`modelos/index.html`, bloco "FOTOGRAFIA PROFISSIONAL".

## D. Verificações automatizadas executadas

Sintaxe do `app.js` (Node), validade dos dois blocos JSON-LD nos três
cenários, igualdade FAQ visível × FAQPage, ausência de links `.html` e de
`http://`, `noindex` correto por página, canonical/og por página, conteúdo do
sitemap e do robots, alvo de todas as âncoras internas, ausência de `id`
duplicado, hierarquia de títulos (1 `h1`, sem saltos), ausência de atributo
`style=`, presença dos `maxlength`, hash da CSP idêntico nas quatro páginas,
contraste de 12 pares de cores (todos ≥ AA), palavras proibidas ausentes e
peso total da primeira carga (≈ 160 KB, zero requisições externas).
