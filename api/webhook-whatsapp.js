import { gerarRespostaParaProdutor } from "./_servicos/servicoInteligenciaArtificial.js";
import { URLSearchParams } from "url";

const METODO_POST = "POST";
const STATUS_SUCESSO = 200;
const STATUS_METODO_NAO_PERMITIDO = 405;

const CABECALHO_TIPO_CONTEUDO = "Content-Type";
const TIPO_CONTEUDO_XML = "text/xml";

const MENSAGEM_ERRO_METODO = "Método HTTP não permitido. Utilize exclusivamente POST.";
const RESPOSTA_FALHA_SISTEMA = "Seu Raimundo, estou com uma instabilidade técnica no meu sistema agora, mas não se preocupe! Pode procurar o sindicato rural ou o seu técnico responsável, pois eles já têm o resumo completo do seu cadastro e vão te ajudar a resolver tudo com tranquilidade.";
const RESPOSTA_MENSAGEM_VAZIA = "Olá, Seu Raimundo! Não consegui entender sua mensagem. Pode digitar sua dúvida sobre a sua Reserva Legal ou o alerta do CAR?";

const IMOVEL_DEMONSTRACAO = {
  nome: "Sítio Boa Esperança",
  produtor: "Raimundo Nonato (Seu Raimundo)",
  cpfMascarado: "***.***.***-**",
  municipio: "Riacho Verde / MA",
  bioma: "Cerrado",
  areaHa: 100,
  recibo: "MA-0000000-EXEMPLO-DEMO",
};

const ALERTA_DEMONSTRACAO = {
  id: "ALERTA-RL-01",
  severidade: "impeditivo",
  etapa: "Reserva Legal",
  textoTecnico: "A área de Reserva Legal vetorizada (18,00 ha) é inferior ao percentual mínimo exigido para o imóvel além da tolerância permitida.",
};

/**
 * Cria o XML no padrão TwiML do Twilio para responder via WhatsApp.
 */
function gerarXmlTwilio(textoMensagem) {
  // Escapar caracteres especiais de XML para evitar quebra do TwiML
  const textoSeguro = textoMensagem
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${textoSeguro}</Message>
</Response>`;
}

/**
 * Faz o parse manual do corpo da requisição quando o Twilio envia como
 * application/x-www-form-urlencoded (formato padrão do webhook do Twilio).
 * A Vercel nem sempre faz o parse automático desse content-type.
 */
async function extrairCorpoTwilio(requisicao) {
  // Se o body já foi parseado como objeto (ex: JSON ou form automático), usa direto
  if (requisicao.body && typeof requisicao.body === "object" && requisicao.body.Body !== undefined) {
    return requisicao.body;
  }

  // Se o body é uma string url-encoded, faz o parse manual
  if (requisicao.body && typeof requisicao.body === "string") {
    const parametros = new URLSearchParams(requisicao.body);
    const resultado = {};
    for (const [chave, valor] of parametros.entries()) {
      resultado[chave] = valor;
    }
    return resultado;
  }

  // Caso o body ainda não foi lido (stream), lê e parseia
  return new Promise((resolver, rejeitar) => {
    const pedacos = [];
    requisicao.on("data", (pedaco) => pedacos.push(pedaco));
    requisicao.on("end", () => {
      try {
        const corpoCru = Buffer.concat(pedacos).toString("utf-8");

        // Tenta JSON primeiro
        try {
          resolver(JSON.parse(corpoCru));
          return;
        } catch {
          // Não é JSON, tenta form-urlencoded
        }

        // Parse de form-urlencoded
        const parametros = new URLSearchParams(corpoCru);
        const resultado = {};
        for (const [chave, valor] of parametros.entries()) {
          resultado[chave] = valor;
        }
        resolver(resultado);
      } catch (erro) {
        rejeitar(erro);
      }
    });
    requisicao.on("error", rejeitar);
  });
}

/**
 * Webhook acionado pelo Twilio quando o produtor rural (Seu Raimundo) envia uma dúvida pelo WhatsApp.
 * Totalmente desacoplado de banco de dados, utilizando puramente a inteligência nativa do Gemini.
 */
export default async function manipulador(requisicao, resposta) {
  if (requisicao.method !== METODO_POST) {
    return resposta.status(STATUS_METODO_NAO_PERMITIDO).json({ erro: MENSAGEM_ERRO_METODO });
  }

  try {
    // Extrai o corpo tratando corretamente o content-type do Twilio (url-encoded)
    const corpoTwilio = await extrairCorpoTwilio(requisicao);

    console.log("Webhook Twilio recebido. Campos presentes:", Object.keys(corpoTwilio || {}));
    console.log("Body da mensagem:", corpoTwilio?.Body);
    console.log("Tipo da mídia (se houver):", corpoTwilio?.MediaContentType0);
    console.log("URL da mídia (se houver):", corpoTwilio?.MediaUrl0);

    const perguntaProdutor = corpoTwilio?.Body ? corpoTwilio.Body.trim() : "";

    // Detecta se é uma mensagem de áudio sem texto (o produtor enviou um áudio)
    const ehMensagemDeAudio = corpoTwilio?.NumMedia && parseInt(corpoTwilio.NumMedia, 10) > 0
      && (corpoTwilio?.MediaContentType0 || "").startsWith("audio/");

    if (!perguntaProdutor && ehMensagemDeAudio) {
      // O produtor enviou um áudio — informamos que ainda não conseguimos escutar áudios
      const respostaAudio = "Oi, Seu Raimundo! Recebi seu áudio, mas no momento eu só consigo ler mensagens de texto. Pode digitar sua dúvida aqui que eu te ajudo direitinho!";
      resposta.setHeader(CABECALHO_TIPO_CONTEUDO, TIPO_CONTEUDO_XML);
      return resposta.status(STATUS_SUCESSO).send(gerarXmlTwilio(respostaAudio));
    }

    if (!perguntaProdutor) {
      resposta.setHeader(CABECALHO_TIPO_CONTEUDO, TIPO_CONTEUDO_XML);
      return resposta.status(STATUS_SUCESSO).send(gerarXmlTwilio(RESPOSTA_MENSAGEM_VAZIA));
    }

    console.log("Consultando Gemini com a pergunta do produtor:", perguntaProdutor);

    // Consulta o Gemini diretamente com o prompt acolhedor e simples para o PRODUTOR RURAL
    const textoResposta = await gerarRespostaParaProdutor({
      pergunta: perguntaProdutor,
      contextoImovel: IMOVEL_DEMONSTRACAO,
      contextoAlerta: ALERTA_DEMONSTRACAO,
      trechosLegislacao: [],
    });

    console.log("Resposta do Gemini gerada com sucesso. Tamanho:", textoResposta?.length, "caracteres");

    // Retorna a resposta formatada em TwiML para o Twilio encaminhar ao WhatsApp do Seu Raimundo
    resposta.setHeader(CABECALHO_TIPO_CONTEUDO, TIPO_CONTEUDO_XML);
    return resposta.status(STATUS_SUCESSO).send(gerarXmlTwilio(textoResposta));
  } catch (erro) {
    // Segurança de Logs: O cliente/usuário recebe uma resposta acolhedora de contingência, erro no console
    console.error("Erro na execução do Webhook do Twilio WhatsApp:", erro);
    resposta.setHeader(CABECALHO_TIPO_CONTEUDO, TIPO_CONTEUDO_XML);
    return resposta.status(STATUS_SUCESSO).send(gerarXmlTwilio(RESPOSTA_FALHA_SISTEMA));
  }
}
