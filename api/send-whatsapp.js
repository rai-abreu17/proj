import twilio from "twilio";

const METODO_POST = "POST";
const STATUS_SUCESSO = 200;
const STATUS_METODO_NAO_PERMITIDO = 405;
const STATUS_ERRO_SERVIDOR = 500;

const MENSAGEM_ERRO_METODO = "Método HTTP não permitido. Utilize exclusivamente POST.";
const MENSAGEM_SUCESSO_SIMULADO = "Envio simulado com sucesso. Para envio real, configure as variáveis do Twilio no painel da Vercel.";
const MENSAGEM_PADRAO_AUDIO = "Olá, Seu Raimundo! Aqui é o assistente do CAR. O analista revisou seu cadastro e notou que falta regularizar 2 hectares de Reserva Legal no Sítio Boa Esperança para evitar multas e liberar seu crédito rural. Segue o áudio explicativo:";
const VALOR_PADRAO_SID = "sua_account_sid_aqui";

/* URL pública do áudio na Vercel (Fase 2.5) */
const URL_AUDIO_PRODUCAO = "https://proj-alpha-five.vercel.app/audio/explicacao.mp3";

/**
 * Endpoint serverless para envio real via Twilio WhatsApp Sandbox (Fase 2.5).
 * Mantém as credenciais seguras no servidor Vercel.
 */
export default async function manipulador(requisicao, resposta) {
  if (requisicao.method !== METODO_POST) {
    return resposta.status(STATUS_METODO_NAO_PERMITIDO).json({ erro: MENSAGEM_ERRO_METODO });
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const remetente = process.env.TWILIO_WHATSAPP_FROM;
  const destinatario = process.env.DEMO_WHATSAPP_TO;
  const urlAudio = process.env.AUDIO_PUBLIC_URL || URL_AUDIO_PRODUCAO;

  if (!sid || !token || !remetente || !destinatario || sid === VALOR_PADRAO_SID) {
    console.warn("AVISO VERCEL: Chaves do Twilio (SID, TOKEN, FROM, TO) ausentes no ambiente. Executando retorno simulado (200 OK).");
    return resposta.status(STATUS_SUCESSO).json({
      sucesso: true,
      simulado: true,
      mensagem: MENSAGEM_SUCESSO_SIMULADO,
    });
  }

  try {
    const cliente = twilio(sid, token);
    const mensagem = await cliente.messages.create({
      from: remetente,
      to: destinatario,
      body: MENSAGEM_PADRAO_AUDIO,
      mediaUrl: [urlAudio],
    });

    console.log("Mensagem enviada com sucesso ao Twilio! SID:", mensagem.sid);
    return resposta.status(STATUS_SUCESSO).json({ sucesso: true, simulado: false, sid: mensagem.sid });
  } catch (erro) {
    console.error("Erro fatal no envio de mensagem via Twilio:", erro);
    return resposta.status(STATUS_ERRO_SERVIDOR).json({ erro: erro.message });
  }
}
