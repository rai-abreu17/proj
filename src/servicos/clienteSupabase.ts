import { createClient } from "@supabase/supabase-js";

const MENSAGEM_ERRO_URL_AUSENTE = "Variável de ambiente VITE_SUPABASE_URL não configurada no cliente.";
const MENSAGEM_ERRO_CHAVE_AUSENTE = "Variável de ambiente VITE_SUPABASE_KEY não configurada no cliente.";

const urlBanco = import.meta.env.VITE_SUPABASE_URL;
const chaveBanco = import.meta.env.VITE_SUPABASE_KEY;

if (!urlBanco) {
  throw new Error(MENSAGEM_ERRO_URL_AUSENTE);
}

if (!chaveBanco) {
  throw new Error(MENSAGEM_ERRO_CHAVE_AUSENTE);
}

export const clienteSupabase = createClient(urlBanco, chaveBanco);
