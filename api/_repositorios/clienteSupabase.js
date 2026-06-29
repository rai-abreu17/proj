import { createClient } from "@supabase/supabase-js";

const MENSAGEM_ERRO_URL_AUSENTE = "Variável de ambiente SUPABASE_URL ou VITE_SUPABASE_URL não configurada no painel da Vercel.";
const MENSAGEM_ERRO_CHAVE_AUSENTE = "Variável de ambiente SUPABASE_KEY ou VITE_SUPABASE_KEY não configurada no painel da Vercel.";
const URL_DUMMY = "https://dummy.supabase.co";
const CHAVE_DUMMY = "dummy-key";

const urlBanco = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const chaveBanco = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY;

/**
 * Cria o cliente Supabase. Se as chaves não estiverem no ambiente da Vercel,
 * inicializa com valores dummy para evitar crash no cold start (500) e permitir
 * tratamento gracioso de erros dentro dos manipuladores de rota.
 */
export const clienteSupabase = createClient(urlBanco || URL_DUMMY, chaveBanco || CHAVE_DUMMY);

export function validarConexaoSupabase() {
  if (!urlBanco) throw new Error(MENSAGEM_ERRO_URL_AUSENTE);
  if (!chaveBanco) throw new Error(MENSAGEM_ERRO_CHAVE_AUSENTE);
}
