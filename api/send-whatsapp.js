import twilio from "twilio";
import { gerarRespostaParaProdutor } from "./_servicos/servicoInteligenciaArtificial.js";

const METODO_POST = "POST";
const STATUS_SUCESSO = 200;
const STATUS_METODO_NAO_PERMITIDO = 405;
const STATUS_ERRO_SERVIDOR = 500;

const MENSAGEM_ERRO_METODO = "Método HTTP não permitido. Utilize exclusivamente POST.";
const MENSAGEM_SUCESSO_SIMULADO = "Envio simulado com sucesso. Para envio real, configure as variáveis do Twilio no painel da Vercel.";
const VALOR_PADRAO_SID = "sua_account_sid_aqui";

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
 * Endpoint serverless para envio proativo via Twilio WhatsApp Sandbox (Fase 2.5).
 * Como concebido originalmente: o Gemini analisa o contexto do analista (o que precisa consertar)
 * e gera uma mensagem explicativa simples e acolhedora para o produtor rural.
 */
export default async function manipulador(requisicao, resposta) {
  if (requisicao.method !== METODO_POST) {
    return resposta.status(STATUS_METODO_NAO_PERMITIDO).json({ erro: MENSAGEM_ERRO_METODO });
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const remetente = process.env.TWILIO_WHATSAPP_FROM;
  const destinatario = process.env.DEMO_WHATSAPP_TO;
  const urlAudio = process.env.AUDIO_PUBLIC_URL; // Só anexa se existir um áudio real configurado

  if (!sid || !token || !remetente || !destinatario || sid === VALOR_PADRAO_SID) {
    console.warn("AVISO VERCEL: Chaves do Twilio ausentes no ambiente. Executando retorno simulado (200 OK).");
    return resposta.status(STATUS_SUCESSO).json({
      sucesso: true,
      simulado: true,
      mensagem: MENSAGEM_SUCESSO_SIMULADO,
    });
  }

  try {
    // Consulta o Gemini dinamicamente para gerar a explicação com base no contexto da página do analista
    const explicacaoInteligente = await gerarRespostaParaProdutor({
      pergunta: "Olá Gemini, resuma o problema do meu cadastro ambiental e o que preciso consertar no Sítio Boa Esperança para evitar multas.",
      contextoImovel: IMOVEL_DEMONSTRACAO,
      contextoAlerta: ALERTA_DEMONSTRACAO,
      trechosLegislacao: [], // Sem dependência de banco de dados
    });

    const cliente = twilio(sid, token);
    
    // Constrói o payload do Twilio de forma inteligente:
    // Se não existe áudio hospedado, enviamos apenas o texto explicativo gerado pelo Gemini para não falhar o envio!
    const payloadEnvio = {
      from: remetente,
      to: destinatario,
      body: explicacaoInteligente,
    };

    if (urlAudio && urlAudio.startsWith("http")) {
      payloadEnvio.mediaUrl = [urlAudio];
    }

    const mensagem = await cliente.messages.create(payloadEnvio);

    console.log("Mensagem explicativa do Gemini enviada com sucesso ao Twilio! SID:", mensagem.sid);
    return resposta.status(STATUS_SUCESSO).json({ sucesso: true, simulado: false, sid: mensagem.sid });
  } catch (erro) {
    console.error("Erro fatal no envio de mensagem via Twilio:", erro);
    return resposta.status(STATUS_ERRO_SERVIDOR).json({ erro: erro.message });
  }
}
