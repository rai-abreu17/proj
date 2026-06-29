import { gerarRespostaParaProdutor } from "./_servicos/servicoInteligenciaArtificial.js";

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
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${textoMensagem}</Message>
</Response>`;
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
    // O Twilio envia os dados no corpo da requisição, onde a propriedade Body contém a mensagem do WhatsApp
    const corpoTwilio = requisicao.body || {};
    const perguntaProdutor = corpoTwilio.Body ? corpoTwilio.Body.trim() : "";

    if (!perguntaProdutor) {
      resposta.setHeader(CABECALHO_TIPO_CONTEUDO, TIPO_CONTEUDO_XML);
      return resposta.status(STATUS_SUCESSO).send(gerarXmlTwilio(RESPOSTA_MENSAGEM_VAZIA));
    }

    // Consulta o Gemini diretamente com o prompt acolhedor e simples para o PRODUTOR RURAL
    const textoResposta = await gerarRespostaParaProdutor({
      pergunta: perguntaProdutor,
      contextoImovel: IMOVEL_DEMONSTRACAO,
      contextoAlerta: ALERTA_DEMONSTRACAO,
      trechosLegislacao: [], // Sem dependência de banco de dados
    });

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
