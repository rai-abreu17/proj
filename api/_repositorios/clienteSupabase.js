import { createClient } from "@supabase/supabase-js";

const MENSAGEM_ERRO_URL_AUSENTE = "Variável de ambiente SUPABASE_URL ou VITE_SUPABASE_URL não configurada.";
const MENSAGEM_ERRO_CHAVE_AUSENTE = "Variável de ambiente SUPABASE_KEY ou VITE_SUPABASE_KEY não configurada.";

const urlBanco = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const chaveBanco = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY;

if (!urlBanco) {
  throw new Error(MENSAGEM_ERRO_URL_AUSENTE);
}

if (!chaveBanco) {
  throw new Error(MENSAGEM_ERRO_CHAVE_AUSENTE);
}

export const clienteSupabase = createClient(urlBanco, chaveBanco);
