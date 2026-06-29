import { clienteSupabase, validarConexaoSupabase } from "./clienteSupabase.js";

const TABELA_LEI_CHUNKS = "lei_chunks";
const FUNCAO_RPC_SIMILARIDADE = "match_lei_chunks";
const COLUNA_TRECHO = "chunk";
const LIMITE_RETORNO_TRECHOS = 5;
const LIMITE_SIMILARIDADE_MINIMA = 0.5;

const MENSAGEM_ERRO_BUSCA_RECENTES = "Falha ao buscar trechos recentes da legislação no banco de dados.";
const MENSAGEM_ERRO_BUSCA_PALAVRA = "Falha ao buscar trechos da legislação por palavra-chave.";
const MENSAGEM_ALERTA_RPC_INDISPONIVEL = "Função RPC de similaridade não disponível ou falhou. Utilizando busca de contingência.";

/**
 * Busca os trechos mais recentes ou principais da tabela lei_chunks como contingência.
 */
export async function buscarTrechosRecentes() {
  try {
    validarConexaoSupabase();
    const { data: trechos, error: erroBusca } = await clienteSupabase
      .from(TABELA_LEI_CHUNKS)
      .select("*")
      .limit(LIMITE_RETORNO_TRECHOS);

    if (erroBusca) {
      throw new Error(`${MENSAGEM_ERRO_BUSCA_RECENTES} Detalhe: ${erroBusca.message}`);
    }

    return trechos || [];
  } catch (erro) {
    throw new Error(`${MENSAGEM_ERRO_BUSCA_RECENTES} Erro original: ${erro.message}`);
  }
}

/**
 * Busca trechos da legislação utilizando similaridade de vetores (embeddings).
 * Caso a função RPC não esteja configurada no banco, aciona contingência automática.
 */
export async function buscarTrechosPorSimilaridade(vetorBusca) {
  try {
    validarConexaoSupabase();
    const { data: trechos, error: erroRpc } = await clienteSupabase.rpc(FUNCAO_RPC_SIMILARIDADE, {
      query_embedding: vetorBusca,
      match_threshold: LIMITE_SIMILARIDADE_MINIMA,
      match_count: LIMITE_RETORNO_TRECHOS,
    });

    if (erroRpc) {
      console.warn(MENSAGEM_ALERTA_RPC_INDISPONIVEL, erroRpc.message);
      return await buscarTrechosRecentes();
    }

    return trechos || [];
  } catch (erro) {
    console.warn(MENSAGEM_ALERTA_RPC_INDISPONIVEL, erro.message);
    return await buscarTrechosRecentes();
  }
}

/**
 * Busca trechos da legislação correspondentes a uma palavra-chave de texto.
 */
export async function buscarTrechosPorPalavraChave(palavraChave) {
  try {
    validarConexaoSupabase();
    const { data: trechos, error: erroBusca } = await clienteSupabase
      .from(TABELA_LEI_CHUNKS)
      .select("*")
      .ilike(COLUNA_TRECHO, `%${palavraChave}%`)
      .limit(LIMITE_RETORNO_TRECHOS);

    if (erroBusca) {
      throw new Error(`${MENSAGEM_ERRO_BUSCA_PALAVRA} Detalhe: ${erroBusca.message}`);
    }

    return trechos || [];
  } catch (erro) {
    throw new Error(`${MENSAGEM_ERRO_BUSCA_PALAVRA} Erro original: ${erro.message}`);
  }
}
