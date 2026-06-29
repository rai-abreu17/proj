const URL_BASE_GEMINI = "https://generativelanguage.googleapis.com/v1beta/models";
const MODELO_GEMINI_TEXTO = "gemini-2.5-flash";
const MODELO_GEMINI_VETOR = "text-embedding-004";

const METODO_POST = "POST";
const CABECALHO_CONTEUDO = "application/json";

const PAPEL_USUARIO = "user";
const MENSAGEM_ERRO_CHAVE_AUSENTE = "Chave de API do Gemini não configurada no ambiente.";
const MENSAGEM_ERRO_API_VETOR = "Falha ao consultar API de geração de vetores do Gemini.";
const MENSAGEM_ERRO_API_TEXTO = "Falha ao consultar API de geração de texto do Gemini.";
const MENSAGEM_RESPOSTA_VAZIA = "Não foi possível gerar uma resposta no momento.";

const TEMPERATURA_BAIXA = 0.2;
const MAXIMO_TOKENS = 300;

/**
 * Gera o vetor de incorporação (embedding) para um texto fornecido (usado por webhooks se necessário).
 */
export async function gerarVetorIncorporacao(textoBusca) {
  const chaveApi = process.env.GEMINI_API_KEY;
  if (!chaveApi || chaveApi.includes("sua_chave")) {
    throw new Error(MENSAGEM_ERRO_CHAVE_AUSENTE);
  }

  const urlCompletada = `${URL_BASE_GEMINI}/${MODELO_GEMINI_VETOR}:embedContent?key=${chaveApi}`;
  const corpoRequisicao = {
    model: `models/${MODELO_GEMINI_VETOR}`,
    content: {
      parts: [{ text: textoBusca }],
    },
  };

  const requisicao = await fetch(urlCompletada, {
    method: METODO_POST,
    headers: { "Content-Type": CABECALHO_CONTEUDO },
    body: JSON.stringify(corpoRequisicao),
  });

  if (!requisicao.ok) {
    throw new Error(`${MENSAGEM_ERRO_API_VETOR} Status: ${requisicao.statusText}`);
  }

  const dados = await requisicao.json();
  const vetor = dados.embedding?.values;

  if (!vetor || !Array.isArray(vetor)) {
    throw new Error(MENSAGEM_ERRO_API_VETOR);
  }

  return vetor;
}

/**
 * Helper interno para executar a chamada HTTP à API de geração de texto do Gemini com temperatura reduzida (DRY).
 */
async function executarChamadaGeminiTexto(promptCompleto) {
  const chaveApi = process.env.GEMINI_API_KEY;
  if (!chaveApi || chaveApi.includes("sua_chave")) {
    throw new Error(MENSAGEM_ERRO_CHAVE_AUSENTE);
  }

  const urlCompletada = `${URL_BASE_GEMINI}/${MODELO_GEMINI_TEXTO}:generateContent?key=${chaveApi}`;
  const corpoRequisicao = {
    contents: [
      { role: PAPEL_USUARIO, parts: [{ text: promptCompleto }] }
    ],
    generationConfig: {
      temperature: TEMPERATURA_BAIXA,
      maxOutputTokens: MAXIMO_TOKENS,
    },
  };

  const requisicao = await fetch(urlCompletada, {
    method: METODO_POST,
    headers: { "Content-Type": CABECALHO_CONTEUDO },
    body: JSON.stringify(corpoRequisicao),
  });

  if (!requisicao.ok) {
    throw new Error(`${MENSAGEM_ERRO_API_TEXTO} Status: ${requisicao.statusText}`);
  }

  const dados = await requisicao.json();
  return dados.candidates?.[0]?.content?.parts?.[0]?.text || MENSAGEM_RESPOSTA_VAZIA;
}

/**
 * Gera a resposta baseada em IA formatada especificamente para o TÉCNICO ou ANALISTA DO SICAR.
 * Foco na vasta inteligência do Gemini sobre o Código Florestal, com ordem estrita de concisão e textos curtos.
 */
export async function gerarRespostaParaTecnico({ pergunta, contextoImovel, contextoAlerta }) {
  const promptSistema = `Você é um assistente especialista no Sistema de Cadastro Ambiental Rural (SICAR) e no Código Florestal Brasileiro (Lei 12.651/2012).
Objetivo: Responder à dúvida do analista/técnico sobre o imóvel e o alerta detectado com base no seu conhecimento avançado da legislação brasileira.
Dados do Imóvel: ${JSON.stringify(contextoImovel)}
Dados do Alerta: ${JSON.stringify(contextoAlerta)}

Regras: Responda em português (pt-BR), de forma extremamente concisa, direta e em linguagem técnica acessível ao analista, citando a base legal apropriada. É expressamente proibido trazer textos grandes ou discursos longos. Resuma a resposta ao máximo, utilizando no máximo 2 ou 3 parágrafos curtos ou tópicos objetivos.

Pergunta do usuário: ${pergunta}`;

  return await executarChamadaGeminiTexto(promptSistema);
}

/**
 * Gera a resposta baseada em IA formatada especificamente para o PRODUTOR RURAL (ex: Seu Raimundo).
 * Foco em linguagem extremamente humana, simples, calorosa, sem jargões complexos e com textos curtos.
 */
export async function gerarRespostaParaProdutor({ pergunta, contextoImovel, contextoAlerta, trechosLegislacao }) {
  const trechosFormatados = (trechosLegislacao || [])
    .map((item) => `[Doc: ${item.documento}, Pág: ${item.pagina}] ${item.chunk}`)
    .join("\n\n");

  const promptSistema = `Você é um assistente acolhedor, empático e paciente do Cadastro Ambiental Rural (CAR), focado em ajudar produtores rurais.
Público-alvo: Seu Raimundo (ou outro produtor rural), uma pessoa simples da roça que não entende jargões técnicos, jurídicos ou siglas complexas, e fica perdido sem saber como resolver a situação do seu cadastro.
Dados do Imóvel: ${JSON.stringify(contextoImovel)}
Dados do Alerta que gerou a pendência: ${JSON.stringify(contextoAlerta)}
Trechos da Legislação de Apoio (se aplicável):
${trechosFormatados || "Nenhum trecho em anexo, utilize seu conhecimento nativo do Código Florestal."}

Objetivo:
1. Responder à dúvida do produtor rural com tom caloroso, atencioso e respeitoso (como se estivesse conversando no WhatsApp ou na varanda de casa).
2. Explicar o problema de forma incrivelmente simples, traduzindo qualquer jargão técnico para o cotidiano do campo.
3. Explicar exatamente o que ele precisa fazer para resolver a situação (ex: procurar o técnico do sindicato ou engenheiro para ajustar o polígono ou compensar a reserva legal), tranquilizando-o sobre multas e crédito rural.
4. Jamais utilize termos em inglês, códigos cruas ou citações de artigos de lei difíceis de ler. Traduza a essência da lei para linguagem cidadã.
5. Responda de forma curta, direta e amigável em português (pt-BR). É expressamente proibido enviar textos grandes. Seja breve e objetivo, como em uma mensagem rápida de WhatsApp.

Dúvida enviada pelo produtor no WhatsApp: "${pergunta}"`;

  return await executarChamadaGeminiTexto(promptSistema);
}
