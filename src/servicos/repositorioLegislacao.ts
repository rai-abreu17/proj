import { clienteSupabase } from "./clienteSupabase";

const TABELA_LEI_CHUNKS = "lei_chunks";
const COLUNA_TRECHO = "chunk";
const LIMITE_RETORNO_TRECHOS = 5;

const MENSAGEM_ERRO_BUSCA_RECENTES = "Falha ao buscar trechos recentes da legislação no banco de dados pelo frontend.";
const MENSAGEM_ERRO_BUSCA_PALAVRA = "Falha ao buscar trechos da legislação por palavra-chave pelo frontend.";

/**
 * Estrutura exata da tabela no banco Supabase (lei_chunks)
 */
export interface TrechoLeiBanco {
  id: string;
  documento: string;
  pagina: number;
  chunk: string;
  embedding?: number[];
  chunk_hash: string;
}

/**
 * Estrutura de domínio em português claro para a aplicação
 */
export interface TrechoLei {
  identificador: string;
  nomeDocumento: string;
  numeroPagina: number;
  textoTrecho: string;
  assinaturaHash: string;
}

/**
 * Converte a entidade do banco para o modelo de domínio em português.
 */
function mapearParaDominio(registro: TrechoLeiBanco): TrechoLei {
  return {
    identificador: registro.id,
    nomeDocumento: registro.documento,
    numeroPagina: registro.pagina,
    textoTrecho: registro.chunk,
    assinaturaHash: registro.chunk_hash,
  };
}

/**
 * Busca os trechos mais recentes ou principais da tabela lei_chunks no banco de dados.
 */
export async function buscarTrechosRecentes(): Promise<TrechoLei[]> {
  try {
    const { data: trechos, error: erroBusca } = await clienteSupabase
      .from(TABELA_LEI_CHUNKS)
      .select("*")
      .limit(LIMITE_RETORNO_TRECHOS);

    if (erroBusca) {
      throw new Error(`${MENSAGEM_ERRO_BUSCA_RECENTES} Detalhe: ${erroBusca.message}`);
    }

    if (!trechos) {
      return [];
    }

    return (trechos as TrechoLeiBanco[]).map(mapearParaDominio);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro desconhecido";
    throw new Error(`${MENSAGEM_ERRO_BUSCA_RECENTES} Erro original: ${mensagem}`);
  }
}

/**
 * Busca trechos da legislação correspondentes a uma palavra-chave de texto.
 */
export async function buscarTrechosPorPalavraChave(palavraChave: string): Promise<TrechoLei[]> {
  try {
    const { data: trechos, error: erroBusca } = await clienteSupabase
      .from(TABELA_LEI_CHUNKS)
      .select("*")
      .ilike(COLUNA_TRECHO, `%${palavraChave}%`)
      .limit(LIMITE_RETORNO_TRECHOS);

    if (erroBusca) {
      throw new Error(`${MENSAGEM_ERRO_BUSCA_PALAVRA} Detalhe: ${erroBusca.message}`);
    }

    if (!trechos) {
      return [];
    }

    return (trechos as TrechoLeiBanco[]).map(mapearParaDominio);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro desconhecido";
    throw new Error(`${MENSAGEM_ERRO_BUSCA_PALAVRA} Erro original: ${mensagem}`);
  }
}
