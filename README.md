# Rodrigo Souza Filho — Advocacia (site institucional)

Site institucional principal de **rodrigosouzafilho.adv.br**: Direito Civil como
atuação principal e os dois sites já publicados — Direito à Saúde e
Regularização de Carros Antigos — apresentados como frentes de atuação
específica. Estático: HTML, CSS e um arquivo de JavaScript, sem framework.
**Você nunca precisa abrir terminal**: o Vercel executa o build sozinho a cada
alteração enviada ao GitHub.

---

## Como publicar uma alteração (o único fluxo que você precisa saber)

1. Abra o arquivo **`config.js`** (no site do GitHub mesmo: clique no arquivo
   e depois no lápis de editar).
2. Preencha o campo desejado **entre as aspas** e salve (botão *Commit changes*).
3. Aguarde 1–2 minutos: o Vercel percebe a mudança, roda o build e publica.

Nada além disso. Sem `node`, sem `npm`, sem comando manual.

## Onde inserir cada dado (tudo em `config.js`)

| O que | Campo em `config.js` | Formato | Situação na entrega |
|---|---|---|---|
| WhatsApp | `whatsapp` | 55 + DDD + número, só dígitos (12 ou 13 no total) | **vazio — preencher** |
| Telefone exibido | `telefoneExibicao` | como deve aparecer na tela, com DDD | **vazio — preencher (opcional)** |
| E-mail | `email` | endereço completo | **vazio — preencher** |
| Domínio deste site | `dominio` | sem `https://` e sem barra | preenchido: `rodrigosouzafilho.adv.br` |
| Site de Direito à Saúde | `urlSaude` | endereço completo, com `https://` | preenchido |
| Site de Carros Antigos | `urlCarros` | endereço completo, com `https://` | preenchido |
| Serviço de envio do formulário | `formEndpoint` | endereço completo (ex.: Formspree) | **vazio — opcional** |
| Número da OAB | `oab` | como deve aparecer (ex.: OAB/PR 00.000) | preenchido com o número usado nos dois sites atuais — **confirmar** |
| Cidade / Estado / UF | `cidade`, `estado`, `uf` | texto | preenchidos (Curitiba / Paraná / PR) |
| Endereço do escritório | `endereco` | texto livre | **vazio — opcional** |
| LinkedIn / Instagram | `linkedin`, `instagram` | endereços completos | **vazios — opcionais** |

**Enquanto um campo estiver vazio, o elemento que depende dele não aparece**
— sem botão quebrado e sem mensagem técnica para o visitante:

- `whatsapp` vazio → nenhum botão de WhatsApp aparece.
- `formEndpoint` vazio **e** `whatsapp` preenchido → o formulário passa a
  organizar a mensagem e abri-la no WhatsApp do visitante (mesma solução dos
  outros dois sites). Com `formEndpoint` preenchido, o formulário envia por
  esse serviço e redireciona para `/obrigado` — inclusive sem JavaScript.
- `formEndpoint` **e** `whatsapp` vazios → o formulário inteiro fica oculto.
- `email` vazio → nenhum botão/linha de e-mail aparece (inclusive na
  Política de Privacidade, que passa a apontar para a página de contato).
- `dominio` vazio → o site publica, mas sem canonical, og:url nem sitemap.

Os avisos de "campo vazio" existem, mas **só para o desenvolvedor**: no log de
build do Vercel e no console do navegador (F12).

## Primeira publicação (uma vez só)

1. Crie um repositório no GitHub e envie os arquivos deste projeto
   (pode ser por *Add file → Upload files*, arrastando a pasta inteira —
   as pastas `public/` e `node_modules/` não precisam ir; o `.gitignore`
   já as exclui).
2. Em [vercel.com](https://vercel.com), *Add New → Project*, escolha o
   repositório e clique em *Deploy*. O `vercel.json` já traz toda a
   configuração (build automático, pasta de publicação `public/`, URLs
   limpas e cabeçalhos de segurança).
3. Preencha `whatsapp` e `email` em `config.js` e confirme o número da OAB.

## Conectar o domínio `rodrigosouzafilho.adv.br`

1. No painel do projeto na Vercel: *Settings → Domains → Add* e digite
   `rodrigosouzafilho.adv.br`.
2. A Vercel mostrará o apontamento a criar no seu provedor de DNS
   (em geral, um registro `A` para o domínio raiz e um `CNAME` para `www`,
   com os valores exibidos na própria tela).
3. Os subdomínios **saude** e **carrosantigos** já pertencem aos outros dois
   projetos e **não mudam**: cada um continua conectado ao seu próprio
   projeto na Vercel. Este site apenas aponta links para eles.
4. Após a propagação do DNS, confira `https://rodrigosouzafilho.adv.br/`,
   `/privacidade`, `/obrigado` e um endereço inexistente (para ver a
   página 404).

## Como o projeto se organiza

| Arquivo/pasta | Papel |
|---|---|
| `config.js` | **o único arquivo que você edita** — todos os dados de contato |
| `modelos/` | os modelos das páginas (o build escreve os dados neles) |
| `aplicar-config.js` | o build: valida os dados, gera as páginas, o robots.txt e o sitemap.xml |
| `assets/` | estilo, script, fontes auto-hospedadas, favicon e imagem de compartilhamento |
| `vercel.json` | URLs limpas, cabeçalhos de segurança (com CSP) e cache |
| `public/` | resultado do build — é o que a Vercel publica (não editar) |
| `index.html` etc. na raiz | cópias de conferência geradas pelo build (não editar) |
| `AUDITORIA.md` | relatório da auditoria final + decisões técnicas da construção |

## Fotografia profissional

O espaço da foto na seção "Sobre" exibe, por enquanto, uma ficha
institucional elegante — nenhum "espaço reservado" aparece ao visitante.
Quando houver fotografia, siga as instruções comentadas dentro de
`modelos/index.html` (bloco "FOTOGRAFIA PROFISSIONAL"): salvar o arquivo em
`assets/images/` e trocar o bloco da ficha pela tag de imagem indicada.

## Decisões técnicas

O registro completo — com o resultado dos 25 itens da auditoria final e a
justificativa de cada decisão de construção — está em **`AUDITORIA.md`**.
