import twilio from "twilio";

const METODO_POST = "POST";
const STATUS_SUCESSO = 200;
const STATUS_METODO_NAO_PERMITIDO = 405;
const STATUS_ERRO_SERVIDOR = 500;

const MENSAGEM_ERRO_METODO = "Método HTTP não permitido. Utilize exclusivamente POST.";
const MENSAGEM_SUCESSO_SIMULADO = "Envio simulado com sucesso. Para envio real, configure as variáveis do Twilio no .env.";
const MENSAGEM_PADRAO_AUDIO = "Olá, Seu Raimundo! Aqui é o assistente do CAR. Segue a explicação sobre o seu cadastro:";
const VALOR_PADRAO_SID = "sua_account_sid_aqui";
const URL_AUDIO_CONTINGENCIA = "https://example.com/audio.mp3";

/**
 * Endpoint serverless para envio real via Twilio WhatsApp Sandbox (Fase 2.5).
 * Mantém as credenciais seguras no servidor, nunca expostas ao frontend.
 */
export default async function manipulador(requisicao, resposta) {
  if (requisicao.method !== METODO_POST) {
    return resposta.status(STATUS_METODO_NAO_PERMITIDO).json({ erro: MENSAGEM_ERRO_METODO });
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const remetente = process.env.TWILIO_WHATSAPP_FROM;
  const destinatario = process.env.DEMO_WHATSAPP_TO;
  const urlAudio = process.env.AUDIO_PUBLIC_URL;

  if (!sid || !token || !remetente || !destinatario || sid === VALOR_PADRAO_SID) {
    /* Retorna sucesso simulado se as chaves não estiverem configuradas, garantindo que a demonstração não quebre */
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
      mediaUrl: [urlAudio || URL_AUDIO_CONTINGENCIA],
    });

    return resposta.status(STATUS_SUCESSO).json({ sucesso: true, sid: mensagem.sid });
  } catch (erro) {
    /* Em caso de erro (ex: janela de 24h expirada), o frontend continua exibindo o mockup graciosamente */
    console.error("Erro no envio de mensagem via Twilio:", erro);
    return resposta.status(STATUS_ERRO_SERVIDOR).json({ erro: erro.message });
  }
}
