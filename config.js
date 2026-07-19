/* ============================================================
   config.js — O ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR.

   Preencha os valores ENTRE AS ASPAS, salve e envie ao GitHub.
   O Vercel roda o build sozinho e aplica tudo nas páginas.

   Regra de ouro: campo vazio "" NÃO quebra o site — o elemento
   que depende dele simplesmente não aparece (sem botão morto e
   sem mensagem técnica para o visitante).
============================================================ */
window.CONFIG = {

  /* --------------------------------------------------------
     WHATSAPP — só dígitos: 55 + DDD + número (12 ou 13 dígitos).
     Exemplo de formato: 5541987654321
     Com ele preenchido aparecem os botões de WhatsApp e, se o
     formEndpoint abaixo estiver vazio, o formulário passa a
     organizar a mensagem no WhatsApp do visitante.
  -------------------------------------------------------- */
  whatsapp: "",

  /* Telefone COMO DEVE APARECER NA TELA (com DDD).
     Exemplo de formato: (41) 3333-0000                       */
  telefoneExibicao: "",

  /* E-mail de contato (aparece nos botões, no rodapé e na
     Política de Privacidade).                                */
  email: "",

  /* --------------------------------------------------------
     DOMÍNIO deste site — sem "https://" e sem barra no final.
     Necessário para canonical, og:url, sitemap.xml e para o
     redirecionamento do formulário para /obrigado.
  -------------------------------------------------------- */
  dominio: "rodrigosouzafilho.adv.br",

  /* --------------------------------------------------------
     FRENTES ESPECÍFICAS — endereços completos, com https://.
     São os dois sites já publicados. Se algum mudar de
     endereço, atualize aqui.
  -------------------------------------------------------- */
  urlSaude: "https://saude.rodrigosouzafilho.adv.br",
  urlCarros: "https://carrosantigos.rodrigosouzafilho.adv.br",

  /* --------------------------------------------------------
     FORMULÁRIO — endereço do serviço de envio (opcional).
     Exemplo (Formspree): https://formspree.io/f/SEUCODIGO
     • Preenchido: o formulário envia as informações para o
       seu e-mail por esse serviço e redireciona para /obrigado.
     • Vazio: o formulário passa a organizar a mensagem no
       WhatsApp do visitante (se o whatsapp acima estiver
       preenchido). Sem os dois, o formulário fica oculto.
  -------------------------------------------------------- */
  formEndpoint: "",

  /* --------------------------------------------------------
     IDENTIFICAÇÃO PROFISSIONAL
     A OAB abaixo foi copiada dos dois sites já publicados
     (Direito à Saúde e Carros Antigos). CONFIRME o número
     antes da primeira publicação; se preferir não exibir,
     deixe "".
  -------------------------------------------------------- */
  oab: "OAB/PR 95.516",

  /* Cidade e estado de referência do atendimento. */
  cidade: "Curitiba",
  estado: "Paraná",
  uf: "PR",

  /* Endereço do escritório (opcional). Aparece no rodapé e nos
     dados estruturados quando preenchido.
     Exemplo de formato: Rua Exemplo, 100 — Centro             */
  endereco: "",

  /* Redes profissionais (opcionais) — endereços completos.    */
  linkedin: "",
  instagram: ""
};
