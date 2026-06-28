/**
 * Componente do Assistente de IA ao vivo (Fase 4).
 * Permite ao técnico tirar dúvidas em tempo real sobre o imóvel e o alerta.
 */
import { useState, useCallback } from "react";
import { imovel, alerta } from "../dados/mockDados";

export function AssistenteIA() {
  const [pergunta, definirPergunta] = useState("");
  const [resposta, definirResposta] = useState("");
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState("");

  /** Envia a pergunta para a função serverless */
  const enviarPergunta = useCallback(async (textoConsulta?: string) => {
    const consulta = textoConsulta || pergunta;
    if (!consulta.trim()) return;

    definirCarregando(true);
    definirErro("");
    definirResposta("");

    try {
      const requisicao = await fetch("/api/tirar-duvida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pergunta: consulta,
          contextoImovel: imovel,
          contextoAlerta: alerta,
        }),
      });

      const dados = await requisicao.json();

      if (!requisicao.ok) {
        throw new Error(dados.erro || "Erro ao consultar o assistente de IA.");
      }

      definirResposta(dados.resposta);
    } catch (e) {
      const erroMensagem = e instanceof Error ? e.message : "Erro desconhecido";
      definirErro(erroMensagem);
    } finally {
      definirCarregando(false);
    }
  }, [pergunta]);

  return (
    <section className="assistente-ia">
      <div className="assistente-ia__cabecalho">
        <span className="assistente-ia__icone">✨</span>
        <h3 className="assistente-ia__titulo">Tirar dúvida com IA sobre este imóvel</h3>
      </div>

      <div className="assistente-ia__corpo">
        <p className="assistente-ia__descricao">
          Faça perguntas sobre penalidades, base legal ou impactos no crédito rural específicos para o <strong>{imovel.nome}</strong>.
        </p>

        {/* Sugestões rápidas */}
        <div className="assistente-ia__sugestoes">
          <span className="assistente-ia__sugestoes-rotulo">Perguntas rápidas:</span>
          <button
            className="assistente-ia__botao-sugestao"
            onClick={() => {
              definirPergunta("Qual a multa prevista se o produtor não corrigir a Reserva Legal?");
              enviarPergunta("Qual a multa prevista se o produtor não corrigir a Reserva Legal?");
            }}
            disabled={carregando}
          >
            Qual a multa se não corrigir?
          </button>
          <button
            className="assistente-ia__botao-sugestao"
            onClick={() => {
              definirPergunta("O déficit de Reserva Legal impacta no acesso a crédito rural no banco?");
              enviarPergunta("O déficit de Reserva Legal impacta no acesso a crédito rural no banco?");
            }}
            disabled={carregando}
          >
            Impacta no crédito rural?
          </button>
        </div>

        {/* Campo de busca */}
        <div className="assistente-ia__formulario">
          <input
            type="text"
            className="assistente-ia__entrada"
            placeholder="Digite sua dúvida sobre o alerta ou a legislação..."
            value={pergunta}
            onChange={(e) => definirPergunta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") enviarPergunta();
            }}
            disabled={carregando}
          />
          <button
            className="assistente-ia__botao-enviar"
            onClick={() => enviarPergunta()}
            disabled={carregando || !pergunta.trim()}
          >
            {carregando ? "Consultando..." : "Perguntar"}
          </button>
        </div>

        {/* Exibição do loading, erro ou resposta */}
        {carregando && (
          <div className="assistente-ia__carregando">
            <div className="assistente-ia__spinner" />
            <span>Analisando legislação e dados do SICAR...</span>
          </div>
        )}

        {erro && (
          <div className="assistente-ia__erro">
            ⚠️ <strong>Erro:</strong> {erro}
          </div>
        )}

        {resposta && !carregando && (
          <div className="assistente-ia__resposta">
            <div className="assistente-ia__resposta-cabecalho">
              <span className="assistente-ia__resposta-icone">🤖</span>
              <strong>Resposta do Assistente Virtual:</strong>
            </div>
            <div className="assistente-ia__resposta-texto">{resposta}</div>
          </div>
        )}
      </div>
    </section>
  );
}
