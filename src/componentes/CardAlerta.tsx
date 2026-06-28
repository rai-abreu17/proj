/**
 * Card de alerta — o coração do protótipo.
 * Exibe o alerta técnico do SICAR lado a lado com a tradução humanizada.
 * O contraste visual entre as duas colunas é a demonstração central.
 */
import { alerta, traducao } from "../dados/mockDados";

export function CardAlerta() {
  const ehImpeditivo = alerta.severidade === "impeditivo";
  const rotuloSeveridade = ehImpeditivo ? "Impeditivo" : "Aviso";
  const iconeSeveridade = ehImpeditivo ? "✕" : "!";

  return (
    <article className="card-alerta" aria-label="Alerta de conformidade">
      {/* Cabeçalho com severidade */}
      <div
        className={`card-alerta__cabecalho card-alerta__cabecalho--${alerta.severidade}`}
      >
        <div
          className={`card-alerta__icone-severidade card-alerta__icone-severidade--${alerta.severidade}`}
        >
          {iconeSeveridade}
        </div>
        <span>
          {rotuloSeveridade} — {alerta.etapa} ({alerta.id})
        </span>
      </div>

      {/* Corpo: duas colunas lado a lado */}
      <div className="card-alerta__corpo">
        {/* Coluna esquerda — Alerta técnico original */}
        <div className="card-alerta__coluna card-alerta__coluna--tecnico">
          <div className="card-alerta__coluna-titulo card-alerta__coluna-titulo--tecnico">
            <span>🖥️</span> Alerta do sistema
          </div>
          <div className="card-alerta__texto-tecnico">
            {alerta.textoTecnico}
          </div>
        </div>

        {/* Coluna direita — Tradução humanizada */}
        <div className="card-alerta__coluna card-alerta__coluna--traducao">
          <div className="card-alerta__coluna-titulo card-alerta__coluna-titulo--traducao">
            <span>💬</span> Tradução Zap-Tradutor
          </div>
          <p className="card-alerta__texto-simples">
            {traducao.textoSimples}
          </p>
          <div className="card-alerta__fundamento">
            📜 {traducao.fundamento}
          </div>
          <div className="card-alerta__conserto">
            <div className="card-alerta__conserto-titulo">
              ✅ Como resolver
            </div>
            {traducao.conserto}
          </div>
        </div>
      </div>
    </article>
  );
}
