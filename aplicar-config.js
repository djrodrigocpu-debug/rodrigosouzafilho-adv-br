#!/usr/bin/env node
/* ============================================================
   aplicar-config.js — escreve os dados de config.js dentro do HTML.

   VOCÊ NÃO PRECISA RODAR ESTE ARQUIVO.
   O Vercel executa "npm run build" (que chama este script) a cada
   publicação no GitHub. O fluxo é: editar config.js -> enviar ao
   GitHub -> aguardar o Vercel publicar. Só isso.

   (Rodar "node aplicar-config.js" localmente continua possível,
   para quem quiser conferir o resultado antes de publicar.)

   O que ele faz:
   1. lê config.js e valida os dados (dado errado interrompe o
      build com mensagem clara; dado VAZIO é permitido — o elemento
      correspondente simplesmente não aparece no site);
   2. remonta index.html, privacidade.html, obrigado.html e
      404.html a partir de modelos/ (por isso os HTML da raiz não
      devem ser editados à mão: qualquer build os sobrescreve);
   3. grava o resultado na raiz (para conferência local) e em
      public/ (a pasta que o Vercel publica), junto com assets/ e
      config.js;
   4. gera robots.txt e sitemap.xml dentro de public/ — o sitemap
      só quando há domínio em config.js, e só com as páginas
      indexáveis ("/" e "/privacidade");
   5. confere que o pequeno script de segurança do <head> continua
      idêntico ao hash autorizado na CSP do vercel.json;
   6. barra nomes e textos que jamais podem ir ao ar (proteção
      contra sobras de exemplo).

   Condicionais nos modelos (fechamento leva o nome da chave, o que
   permite blocos aninhados de chaves diferentes):
       <!--SE:whatsapp--> ... <!--/SE:whatsapp-->
       <!--SENAO:email--> ... <!--/SENAO:email-->
   Chaves: whatsapp, telefone, email, dominio, urlSaude, urlCarros,
   formEndpoint, endereco, oab, cidade, linkedin, instagram.
============================================================ */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const PAGINAS = ["index.html", "privacidade.html", "obrigado.html", "404.html"];

/* Páginas indexáveis (entram no sitemap.xml). obrigado e 404 são
   noindex e ficam de fora, de propósito. */
const PAGINAS_INDEXAVEIS = ["/", "/privacidade"];
const MODELOS = path.join(__dirname, "modelos");
const PUBLICO = path.join(__dirname, "public");

/* Palavras que NUNCA podem aparecer nas páginas publicadas. */
const PROIBIDAS = [/hamelin/i, /lorem/i, /exemplo\.com/i, /example\.com/i, /seudominio/i];

function lerConfig() {
  const src = fs.readFileSync(path.join(__dirname, "config.js"), "utf8");
  const janela = {};
  vm.createContext(janela);
  vm.runInContext(src.replace(/window\./g, "this."), janela);
  return janela.CONFIG || {};
}

function validar(cfg) {
  const erros = [];
  const wa = (cfg.whatsapp || "").trim();
  if (wa) {
    if (!/^\d+$/.test(wa)) erros.push('whatsapp: use só dígitos (sem +, espaço, parêntese ou traço).');
    else if (wa.length < 12 || wa.length > 13) erros.push('whatsapp: "' + wa + '" tem ' + wa.length + ' dígitos; o esperado é 12 ou 13 (55 + DDD + número).');
    else if (!wa.startsWith("55")) erros.push('whatsapp: deve começar com 55 (código do Brasil).');
    else if (wa.includes("999999999") || /^55(\d)\1{8,}$/.test(wa)) erros.push('whatsapp: "' + wa + '" parece um número de exemplo.');
  }
  const dom = (cfg.dominio || "").trim();
  if (dom) {
    if (/^https?:\/\//i.test(dom)) erros.push('dominio: tire o "https://", informe só o domínio.');
    if (dom.includes("/")) erros.push('dominio: sem barras. Informe só o domínio, na forma nomedosite.com.br.');
    if (/seu-?dominio|exemplo\./i.test(dom)) erros.push('dominio: "' + dom + '" parece um domínio de exemplo.');
  }
  const em = (cfg.email || "").trim();
  if (em) {
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(em)) erros.push('email: "' + em + '" não parece um e-mail válido.');
    if (/seu-?dominio|exemplo\./i.test(em)) erros.push('email: "' + em + '" parece um e-mail de exemplo.');
  }
  ["urlSaude", "urlCarros", "formEndpoint", "linkedin", "instagram"].forEach(function (chave) {
    const u = (cfg[chave] || "").trim();
    if (!u) return;
    if (!/^https:\/\/[^\s"'<>]+$/i.test(u)) erros.push(chave + ': use o endereço completo, começando com https:// e sem espaços.');
    if (/seu-?dominio|exemplo\.|SEUCODIGO/i.test(u)) erros.push(chave + ': "' + u + '" parece um endereço de exemplo.');
  });
  const tel = (cfg.telefoneExibicao || "").trim();
  if (tel) {
    const dig = tel.replace(/\D/g, "");
    if (dig.length < 10 || dig.length > 11) erros.push('telefoneExibicao: "' + tel + '" deveria ter DDD + número (10 ou 11 dígitos).');
  }
  return erros;
}

function decodeEntidades(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

/* motor de tokens: condicionais com fechamento nomeado + substituições */
function resolver(txt, cfg) {
  const limpaUrl = function (u) { return (u || "").trim().replace(/\/+$/, ""); };
  const urlSaude = limpaUrl(cfg.urlSaude);
  const urlCarros = limpaUrl(cfg.urlCarros);
  const formEndpoint = (cfg.formEndpoint || "").trim();
  const tem = {
    whatsapp: !!(cfg.whatsapp || "").trim(),
    telefone: !!(cfg.telefoneExibicao || "").trim(),
    email: !!(cfg.email || "").trim(),
    dominio: !!(cfg.dominio || "").trim(),
    urlSaude: !!urlSaude,
    urlCarros: !!urlCarros,
    formEndpoint: !!formEndpoint,
    endereco: !!(cfg.endereco || "").trim(),
    oab: !!(cfg.oab || "").trim(),
    cidade: !!(cfg.cidade || "").trim(),
    linkedin: !!limpaUrl(cfg.linkedin),
    instagram: !!limpaUrl(cfg.instagram)
  };
  for (const chave of Object.keys(tem)) {
    const k = escapeRegExp(chave);
    txt = txt.replace(new RegExp("<!--SE:" + k + "-->([\\s\\S]*?)<!--/SE:" + k + "-->", "g"), tem[chave] ? "$1" : "");
    txt = txt.replace(new RegExp("<!--SENAO:" + k + "-->([\\s\\S]*?)<!--/SENAO:" + k + "-->", "g"), tem[chave] ? "" : "$1");
  }
  if (tem.whatsapp) {
    txt = txt.replace(/__WA:([\s\S]*?)__/g, function (m, msg) {
      return "https://wa.me/" + cfg.whatsapp.trim() + "?text=" + encodeURIComponent(decodeEntidades(msg));
    });
  }
  if (tem.telefone) {
    const dig = cfg.telefoneExibicao.replace(/\D/g, "");
    txt = txt.split("__TEL_E164__").join("+55" + dig)
             .split("__TEL_TXT__").join(cfg.telefoneExibicao.trim())
             .split("__TEL__").join("tel:+55" + dig);
  }
  if (tem.email) {
    txt = txt.split("__EMAIL_LINK__").join("mailto:" + cfg.email.trim()).split("__EMAIL__").join(cfg.email.trim());
  }
  if (tem.dominio) {
    txt = txt.split("__URL__").join("https://" + limpaUrl(cfg.dominio));
  }
  if (tem.urlSaude) txt = txt.split("__URL_SAUDE__").join(urlSaude);
  if (tem.urlCarros) txt = txt.split("__URL_CARROS__").join(urlCarros);
  if (tem.formEndpoint) txt = txt.split("__FORM_ENDPOINT__").join(formEndpoint);
  if (tem.endereco) txt = txt.split("__ENDERECO__").join(cfg.endereco.trim());
  if (tem.oab) txt = txt.split("__OAB__").join(cfg.oab.trim());
  if (tem.cidade) {
    txt = txt.split("__CIDADE__").join(cfg.cidade.trim())
             .split("__ESTADO__").join((cfg.estado || "").trim() || cfg.cidade.trim())
             .split("__UF__").join((cfg.uf || "").trim() || "PR");
  }
  if (tem.linkedin) txt = txt.split("__LINKEDIN__").join(limpaUrl(cfg.linkedin));
  if (tem.instagram) txt = txt.split("__INSTAGRAM__").join(limpaUrl(cfg.instagram));
  txt = txt.split("__ANO__").join(String(new Date().getFullYear()));
  return txt;
}

/* nenhum marcador pode sobrar no HTML publicado */
function conferirSobras(nome, txt) {
  const sobras = txt.match(/<!--\/?(?:SE|SENAO):[a-zA-Z]+-->|__(?:WA:|TEL__|TEL_TXT__|TEL_E164__|EMAIL__|EMAIL_LINK__|URL__|URL_SAUDE__|URL_CARROS__|FORM_ENDPOINT__|OAB__|CIDADE__|ESTADO__|UF__|ENDERECO__|LINKEDIN__|INSTAGRAM__|ANO__)/g);
  if (sobras) {
    console.error("  ATENÇÃO em " + nome + ": marcadores não resolvidos: " + Array.from(new Set(sobras)).join(", "));
    return false;
  }
  return true;
}

/* nomes e textos que jamais podem ir ao ar */
function conferirProibidas(nome, txt) {
  const achadas = PROIBIDAS.filter(function (re) { return re.test(txt); });
  if (achadas.length) {
    console.error("  ERRO em " + nome + ": texto proibido encontrado (" +
      achadas.map(String).join(", ") + "). Corrija antes de publicar.");
    return false;
  }
  return true;
}

/* O pequeno script do <head> (que evita conteúdo invisível quando o
   app.js não carrega) é o ÚNICO script embutido nas páginas, e a CSP
   do vercel.json só autoriza exatamente ele, pelo hash. Se alguém
   alterar o script sem atualizar o vercel.json, o build para aqui —
   melhor falhar no build do que publicar página que o navegador
   bloqueia. */
function conferirHashCSP() {
  const vercel = fs.readFileSync(path.join(__dirname, "vercel.json"), "utf8");
  const hashesAutorizados = Array.from(vercel.matchAll(/'sha256-([A-Za-z0-9+/=]+)'/g)).map(function (m) { return m[1]; });
  if (!hashesAutorizados.length) {
    console.error("  ERRO: nenhum hash sha256 encontrado na CSP do vercel.json.");
    return false;
  }
  let ok = true;
  let assinaturaAnterior = null;
  PAGINAS.forEach(function (nome) {
    const modelo = path.join(MODELOS, nome);
    if (!fs.existsSync(modelo)) return;
    const html = fs.readFileSync(modelo, "utf8");
    const m = html.match(/<script>([\s\S]*?)<\/script>/); /* primeiro <script> sem atributos = failsafe */
    if (!m) { console.error("  ERRO em " + nome + ": script de segurança do <head> não encontrado."); ok = false; return; }
    const hash = crypto.createHash("sha256").update(m[1], "utf8").digest("base64");
    if (assinaturaAnterior && assinaturaAnterior !== hash) {
      console.error("  ERRO em " + nome + ": o script do <head> difere do usado nas outras páginas. Ele precisa ser idêntico em todas.");
      ok = false;
    }
    assinaturaAnterior = hash;
    if (hashesAutorizados.indexOf(hash) === -1) {
      console.error("  ERRO em " + nome + ": o script do <head> foi alterado. Atualize a CSP do vercel.json para 'sha256-" + hash + "' (ou desfaça a alteração).");
      ok = false;
    }
  });
  if (ok) console.log("  ok  script do <head> confere com a CSP do vercel.json");
  return ok;
}

function copiarParaPublico() {
  fs.rmSync(PUBLICO, { recursive: true, force: true });
  fs.mkdirSync(PUBLICO, { recursive: true });
  fs.cpSync(path.join(__dirname, "assets"), path.join(PUBLICO, "assets"), { recursive: true });
  fs.copyFileSync(path.join(__dirname, "config.js"), path.join(PUBLICO, "config.js"));
}

/* robots.txt + sitemap.xml — gerados só em public/ (a pasta publicada).
   Sem domínio em config.js: o robots sai sem a linha "Sitemap:" e o
   sitemap.xml nem é criado — nunca se publica URL fictícia ou token. */
function gerarRobotsESitemap(cfg) {
  const dom = (cfg.dominio || "").trim().replace(/\/+$/, "");
  let robots = "User-agent: *\nAllow: /\n";
  if (dom) robots += "\nSitemap: https://" + dom + "/sitemap.xml\n";
  fs.writeFileSync(path.join(PUBLICO, "robots.txt"), robots, "utf8");
  console.log("  ok  robots.txt" + (dom ? "" : " (sem linha Sitemap: domínio vazio)"));

  if (!dom) {
    console.log("  --  sitemap.xml não gerado (domínio vazio em config.js)");
    return;
  }
  const base = "https://" + dom;
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    PAGINAS_INDEXAVEIS.map(function (u) {
      return "  <url><loc>" + base + u + "</loc></url>";
    }).join("\n") +
    "\n</urlset>\n";
  fs.writeFileSync(path.join(PUBLICO, "sitemap.xml"), xml, "utf8");
  console.log("  ok  sitemap.xml (" + PAGINAS_INDEXAVEIS.length + " páginas indexáveis)");
}

function principal() {
  const cfg = lerConfig();
  const erros = validar(cfg);
  if (erros.length) {
    console.error("\n  Configuração com problema — nada foi publicado:\n");
    erros.forEach(function (e) { console.error("   • " + e); });
    console.error("");
    process.exit(1);
  }
  if (!fs.existsSync(MODELOS)) {
    console.error("\n  Pasta modelos/ não encontrada. Ela faz parte do projeto e é necessária para o build.\n");
    process.exit(1);
  }

  if (!conferirHashCSP()) process.exit(1);

  copiarParaPublico();

  console.log("");
  let tudoOk = true;
  PAGINAS.forEach(function (nome) {
    const modelo = path.join(MODELOS, nome);
    if (!fs.existsSync(modelo)) { console.error("  FALTA modelo: " + nome); tudoOk = false; return; }
    const html = resolver(fs.readFileSync(modelo, "utf8"), cfg);
    if (!conferirSobras(nome, html)) tudoOk = false;
    if (!conferirProibidas(nome, html)) tudoOk = false;
    fs.writeFileSync(path.join(__dirname, nome), html, "utf8");      /* raiz: conferência local  */
    fs.writeFileSync(path.join(PUBLICO, nome), html, "utf8");        /* public/: o que o Vercel publica */
    console.log("  ok  " + nome);
  });
  if (!tudoOk) process.exit(1);

  gerarRobotsESitemap(cfg);

  /* Avisos para o DESENVOLVEDOR (console do build). O visitante do
     site nunca vê mensagem de configuração pendente: os elementos
     que dependem de dado vazio simplesmente não são gerados. */
  const faltando = [];
  if (!(cfg.whatsapp || "").trim()) faltando.push("whatsapp — sem ele, nenhum botão de WhatsApp aparece");
  if (!(cfg.telefoneExibicao || "").trim()) faltando.push("telefoneExibicao — nenhum telefone é exibido");
  if (!(cfg.email || "").trim()) faltando.push("email — nenhum e-mail é exibido");
  if (!(cfg.dominio || "").trim()) faltando.push("dominio — sem canonical, og:url nem sitemap (prejudica o SEO)");
  if (!(cfg.formEndpoint || "").trim() && !(cfg.whatsapp || "").trim()) faltando.push("formEndpoint OU whatsapp — sem os dois, o formulário fica oculto");
  if (!(cfg.urlSaude || "").trim()) faltando.push("urlSaude — a frente de Direito à Saúde fica sem botão/link");
  if (!(cfg.urlCarros || "").trim()) faltando.push("urlCarros — a frente de carros antigos fica sem botão/link");
  if (!(cfg.oab || "").trim()) faltando.push("oab — a identificação profissional não aparece");

  if (faltando.length) {
    console.log("\n  Ainda vazio em config.js (o site publica normalmente, sem esses elementos):");
    faltando.forEach(function (f) { console.log("   • " + f); });
  } else {
    console.log("\n  Tudo preenchido.");
  }
  console.log("\n  Publicação pronta em public/.\n");
}

principal();
