/* ============================================================
   app.js — melhoria progressiva do site institucional.

   Nada de essencial depende deste arquivo. Se ele não carregar:
   - o conteúdo continua visível (o failsafe do <head> remove a
     classe "js" do <html> quando este arquivo não confirma);
   - o menu móvel continua abrindo (é um <details> nativo);
   - o FAQ continua abrindo (details/summary nativo);
   - no modo "endpoint", o formulário envia por POST comum do
     navegador, sem JavaScript nenhum.

   O que ele faz:
   1. avisos técnicos de config.js vazio (só no console)
   2. menu móvel: fecha ao navegar, com Esc ou clique fora
   3. sombra do cabeçalho ao rolar
   4. aria-current na navegação conforme a seção visível
   5. animação de entrada (respeitando prefers-reduced-motion)
   6. FAQ: sincroniza aria-expanded no summary
   7. formulário: validação acessível + envio conforme o modo
      (serviço de envio OU mensagem organizada no WhatsApp)
   8. ano do rodapé

   Este site NÃO grava nada no navegador do visitante: nenhum
   cookie, nenhum localStorage, nenhum sessionStorage. O que a
   pessoa escreve no formulário não é armazenado em lugar algum.
   Configuração: config.js. Nenhum dado de contato fica aqui.
============================================================ */
(function () {
  "use strict";

  /* Confirma ao failsafe do <head> que o script rodou. */
  window.__rsfOk = true;

  var C = window.CONFIG || {};
  var doc = document;

  /* ------------------------------------------------------------
     1. Avisos técnicos — só no console; o visitante nunca vê
        mensagem de configuração pendente.
  ------------------------------------------------------------ */
  (function avisosDev() {
    var faltando = [];
    if (!(C.whatsapp || "").trim()) faltando.push("whatsapp (nenhum botão de WhatsApp aparece)");
    if (!(C.email || "").trim()) faltando.push("email");
    if (!(C.telefoneExibicao || "").trim()) faltando.push("telefoneExibicao");
    if (!(C.dominio || "").trim()) faltando.push("dominio (sem canonical/og:url/sitemap)");
    if (!(C.formEndpoint || "").trim() && !(C.whatsapp || "").trim()) faltando.push("formEndpoint OU whatsapp (sem os dois, o formulário fica oculto)");
    if (faltando.length && window.console && console.warn) {
      console.warn("[config.js] Campos ainda vazios: " + faltando.join(", ") +
        ". Preencha em config.js e publique — o Vercel aplica no build.");
    }
  })();

  /* ------------------------------------------------------------
     2. Menu móvel (<details>) — fecha ao navegar, com Esc ou
        clique fora; espelha o estado em aria-expanded.
  ------------------------------------------------------------ */
  var menu = doc.getElementById("menuMobile");
  if (menu) {
    var resumo = menu.querySelector("summary");
    var sincronizar = function () {
      if (resumo) resumo.setAttribute("aria-expanded", menu.open ? "true" : "false");
    };
    sincronizar();
    menu.addEventListener("toggle", sincronizar);
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) menu.removeAttribute("open");
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.open) {
        menu.removeAttribute("open");
        if (resumo) resumo.focus();
      }
    });
    doc.addEventListener("click", function (e) {
      if (menu.open && !menu.contains(e.target)) menu.removeAttribute("open");
    });
  }

  /* ------------------------------------------------------------
     3. Sombra do cabeçalho ao rolar
  ------------------------------------------------------------ */
  var topo = doc.getElementById("topo");
  if (topo) {
    var sombra = function () { topo.classList.toggle("rolou", window.scrollY > 8); };
    sombra();
    window.addEventListener("scroll", sombra, { passive: true });
  }

  /* ------------------------------------------------------------
     4. aria-current na navegação, conforme a seção em vista
        (apenas na página inicial, onde as seções existem)
  ------------------------------------------------------------ */
  (function espiarSecoes() {
    if (!("IntersectionObserver" in window)) return;
    var links = doc.querySelectorAll('.nav a[href^="#"], .menu-mobile-painel a[href^="#"]');
    if (!links.length) return;
    var mapa = {};
    Array.prototype.forEach.call(links, function (a) {
      var id = a.getAttribute("href").slice(1);
      (mapa[id] = mapa[id] || []).push(a);
    });
    var alvos = Object.keys(mapa)
      .map(function (id) { return doc.getElementById(id); })
      .filter(Boolean);
    if (!alvos.length) return;
    var atual = null;
    var marcar = function (id) {
      if (id === atual) return;
      atual = id;
      Array.prototype.forEach.call(links, function (a) { a.removeAttribute("aria-current"); });
      (mapa[id] || []).forEach(function (a) { a.setAttribute("aria-current", "location"); });
    };
    var visiveis = {};
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { visiveis[e.target.id] = e.isIntersecting; });
      for (var i = alvos.length - 1; i >= 0; i--) {
        if (visiveis[alvos[i].id]) { marcar(alvos[i].id); return; }
      }
    }, { rootMargin: "-40% 0px -50% 0px" });
    alvos.forEach(function (s) { obs.observe(s); });
  })();

  /* ------------------------------------------------------------
     5. Animação de entrada — respeita prefers-reduced-motion
  ------------------------------------------------------------ */
  var animaveis = doc.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var obsReveal = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visivel"); obsReveal.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    Array.prototype.forEach.call(animaveis, function (el) { obsReveal.observe(el); });
  } else {
    Array.prototype.forEach.call(animaveis, function (el) { el.classList.add("visivel"); });
  }

  /* ------------------------------------------------------------
     6. FAQ — espelha o estado aberto/fechado em aria-expanded
  ------------------------------------------------------------ */
  Array.prototype.forEach.call(doc.querySelectorAll(".faq details"), function (d) {
    var s = d.querySelector("summary");
    if (!s) return;
    var refletir = function () { s.setAttribute("aria-expanded", d.open ? "true" : "false"); };
    refletir();
    d.addEventListener("toggle", refletir);
  });

  /* ------------------------------------------------------------
     7. Formulário de contato
        modo "endpoint": envia ao serviço configurado (fetch) e
          redireciona para /obrigado; sem JS, o POST nativo do
          navegador cumpre o mesmo papel.
        modo "whatsapp": organiza a mensagem e a abre no WhatsApp
          do visitante (nada é gravado em lugar nenhum).
        Proteções: campo-armadilha, tempo mínimo de preenchimento
        e trava contra envio duplicado.
  ------------------------------------------------------------ */
  var form = doc.getElementById("formContato");
  if (form) {
    var modo = form.getAttribute("data-modo") || "endpoint";
    var caixaErro = doc.getElementById("formErro");
    var botao = form.querySelector('button[type="submit"]');
    var abriuEm = Date.now();
    var enviando = false;

    form.setAttribute("novalidate", "novalidate"); /* com JS, a validação é a nossa */

    var campos = function () {
      return {
        nome: doc.getElementById("fNome"),
        email: doc.getElementById("fEmail"),
        telefone: doc.getElementById("fTelefone"),
        assunto: doc.getElementById("fAssunto"),
        mensagem: doc.getElementById("fMensagem"),
        consent: doc.getElementById("fConsent"),
        armadilha: doc.getElementById("fEmpresa")
      };
    };

    var mostrarErro = function (texto, campoFoco) {
      if (caixaErro) {
        caixaErro.textContent = texto;
        caixaErro.classList.add("ativa");
        caixaErro.focus();
      }
      if (campoFoco) campoFoco.focus();
    };
    var limparErro = function () {
      if (caixaErro) { caixaErro.textContent = ""; caixaErro.classList.remove("ativa"); }
    };

    var validar = function (f) {
      var invalidos = [];
      var marcar = function (el, condicao) {
        if (!el) return;
        if (condicao) { el.setAttribute("aria-invalid", "true"); invalidos.push(el); }
        else el.removeAttribute("aria-invalid");
      };
      marcar(f.nome, !f.nome.value.trim());
      marcar(f.email, !f.email.value.trim() || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(f.email.value.trim()));
      marcar(f.telefone, !f.telefone.value.trim() || f.telefone.value.replace(/\D/g, "").length < 8);
      marcar(f.assunto, !f.assunto.value);
      marcar(f.mensagem, !f.mensagem.value.trim());
      if (f.consent && !f.consent.checked) invalidos.push(f.consent);
      return invalidos;
    };

    Array.prototype.forEach.call(form.querySelectorAll("input, select, textarea"), function (el) {
      el.addEventListener("input", function () { el.removeAttribute("aria-invalid"); limparErro(); });
    });

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      if (enviando) return;
      var f = campos();

      /* armadilha antisspam: humanos não veem este campo */
      if (f.armadilha && f.armadilha.value) return;
      /* formulário respondido rápido demais costuma ser robô */
      if (Date.now() - abriuEm < 4000) {
        mostrarErro("Confira os campos com calma antes de enviar.");
        return;
      }

      var invalidos = validar(f);
      if (invalidos.length) {
        mostrarErro(
          f.consent && !f.consent.checked && invalidos.length === 1
            ? "Para enviar, é preciso concordar com a Política de Privacidade."
            : "Alguns campos precisam de atenção. Os itens destacados devem ser preenchidos corretamente.",
          invalidos[0]
        );
        return;
      }
      limparErro();

      if (modo === "whatsapp") {
        var numero = (C.whatsapp || "").trim();
        if (!numero) return; /* sem número, o build nem gera este formulário */
        var texto =
          "Olá. Encaminho informações iniciais pelo site.\n\n" +
          "Nome: " + f.nome.value.trim() + "\n" +
          "E-mail: " + f.email.value.trim() + "\n" +
          "Telefone: " + f.telefone.value.trim() + "\n" +
          "Assunto: " + f.assunto.value + "\n\n" +
          f.mensagem.value.trim();
        window.open("https://wa.me/" + numero + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
        return;
      }

      /* modo endpoint */
      enviando = true;
      if (botao) { botao.disabled = true; botao.textContent = "Enviando…"; }
      var dados = new FormData(form);
      fetch(form.action, {
        method: "POST",
        body: dados,
        headers: { Accept: "application/json" }
      }).then(function (resposta) {
        if (resposta.ok) {
          /* URL limpa: o Vercel serve /obrigado com cleanUrls */
          location.href = "/obrigado";
          return;
        }
        throw new Error("resposta " + resposta.status);
      }).catch(function () {
        enviando = false;
        if (botao) { botao.disabled = false; botao.textContent = "Enviar informações iniciais"; }
        mostrarErro("Não foi possível enviar agora. Tente novamente em instantes ou utilize o WhatsApp ou o e-mail indicados ao lado.");
      });
    });
  }

  /* ------------------------------------------------------------
     8. Ano do rodapé (o build já grava o ano como reserva)
  ------------------------------------------------------------ */
  var ano = doc.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
