import { gerarRespostaParaTecnico } from "./_servicos/servicoInteligenciaArtificial.js";

const METODO_POST = "POST";
const STATUS_SUCESSO = 200;
const STATUS_REQUISICAO_INVALIDA = 400;
const STATUS_METODO_NAO_PERMITIDO = 405;
const STATUS_ERRO_SERVIDOR = 500;

const MENSAGEM_ERRO_METODO = "Método HTTP não permitido. Utilize exclusivamente POST.";
const MENSAGEM_ERRO_PERGUNTA_AUSENTE = "O parâmetro pergunta é obrigatório no corpo da requisição.";
const MENSAGEM_ERRO_PADRONIZADA = "Erro ao processar a consulta de inteligência artificial. Tente novamente mais tarde.";

const TEMPO_ESPERA_SIMULACAO_MS = 1500;
const CHAVE_PADRAO_EXEMPLO = "sua_chave_api_gemini_aqui";

const RESPOSTA_FALLBACK_MULTA = "De acordo com a Lei 12.651/2012 (Código Florestal), a ausência ou déficit de Reserva Legal pode impedir a obtenção de certidões negativas e acesso a crédito rural, além de sujeitar o imóvel a sanções administrativas e multas ambientais caso o produtor não inicie a regularização (como a recomposição ou compensação dos 2 ha faltantes).";
const RESPOSTA_FALLBACK_CREDITO = "Sim, as resoluções do Banco Central e o Conselho Monetário Nacional (CMN) condicionam a concessão de crédito rural agrícola à regularidade da inscrição no CAR. Regularizar os 2 ha de Reserva Legal no Sítio Boa Esperança é indispensável para destravar ou manter o financiamento bancário.";
const RESPOSTA_FALLBACK_PADRAO = "Com base nos dados do imóvel Sítio Boa Esperança (Recibo: MA-0000000-EXEMPLO-DEMO) e no alerta ALERTA-RL-01: o produtor Seu Raimundo declarou 18 ha de Reserva Legal, mas o cálculo por bioma (Cerrado) exige 20 ha. A solução recomendada é retificar o polígono no sistema ou apresentar proposta de compensação ambiental de 2 ha.";

/**
 * Endpoint serverless para tirar dúvidas com IA ao vivo (Fase 4).
 * Conecta-se diretamente ao Google Gemini, utilizando a vasta inteligência do modelo
 * sobre o Código Florestal, sem depender de respostas ou buscas em banco de dados.
 */
export default async function manipulador(requisicao, resposta) {
  if (requisicao.method !== METODO_POST) {
    return resposta.status(STATUS_METODO_NAO_PERMITIDO).json({ erro: MENSAGEM_ERRO_METODO });
  }

  const { pergunta, contextoImovel, contextoAlerta } = requisicao.body || {};
  const chaveApi = process.env.GEMINI_API_KEY;

  if (!pergunta) {
    return resposta.status(STATUS_REQUISICAO_INVALIDA).json({ erro: MENSAGEM_ERRO_PERGUNTA_AUSENTE });
  }

  /* Fallback inteligente caso a chave de API não esteja configurada no ambiente de demonstração */
  if (!chaveApi || chaveApi === CHAVE_PADRAO_EXEMPLO) {
    await new Promise((resolver) => setTimeout(resolver, TEMPO_ESPERA_SIMULACAO_MS));
    
    const perguntaMinuscula = pergunta.toLowerCase();
    if (perguntaMinuscula.includes("multa") || perguntaMinuscula.includes("penalidade")) {
      return resposta.status(STATUS_SUCESSO).json({ resposta: RESPOSTA_FALLBACK_MULTA });
    }

    if (perguntaMinuscula.includes("crédito") || perguntaMinuscula.includes("banco") || perguntaMinuscula.includes("financiamento")) {
      return resposta.status(STATUS_SUCESSO).json({ resposta: RESPOSTA_FALLBACK_CREDITO });
    }

    return resposta.status(STATUS_SUCESSO).json({ resposta: RESPOSTA_FALLBACK_PADRAO });
  }

  try {
    // Consulta direta e puramente executada pelo Google Gemini, sem passar por banco de dados
    const textoResposta = await gerarRespostaParaTecnico({
      pergunta,
      contextoImovel,
      contextoAlerta,
    });

    return resposta.status(STATUS_SUCESSO).json({ resposta: textoResposta });
  } catch (erro) {
    // Segurança de Logs: O cliente recebe apenas mensagem padronizada, erro real no log do servidor
    console.error("Erro interno na execução do manipulador tirar-duvida:", erro);
    return resposta.status(STATUS_ERRO_SERVIDOR).json({ erro: MENSAGEM_ERRO_PADRONIZADA });
  }
}
