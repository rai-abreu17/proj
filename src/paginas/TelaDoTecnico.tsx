/**
 * Tela do Técnico — Etapa "Alertas e Pendências" evoluída.
 * É a tela mais importante do protótipo, onde o critério
 * "usabilidade e design" se demonstra.
 * A solução funciona de forma autônoma; a integração com a etapa de Alertas e Pendências
 * é uma evolução futura, não um requisito.
 */
import { useState, useCallback } from "react";
import { CabecalhoGovBr } from "../componentes/CabecalhoGovBr";
import { TrilhaEtapas } from "../componentes/TrilhaEtapas";
import { ResumoImovel } from "../componentes/ResumoImovel";
import { CardAlerta } from "../componentes/CardAlerta";
import { MockupWhatsApp } from "../componentes/MockupWhatsApp";
import { AssistenteIA } from "../componentes/AssistenteIA";
import { gerarDossiePdf } from "../servicos/geradorDossie";

export function TelaDoTecnico() {
  const [mostrarWhatsApp, definirMostrarWhatsApp] = useState(false);
  const [gerandoPdf, definirGerandoPdf] = useState(false);

  /**
   * Abre o mockup do WhatsApp (sempre — é o fallback à prova de falha)
   * e dispara em paralelo a chamada serverless para envio real no Twilio (Fase 2.5).
   */
  const enviarAoProdutor = useCallback(async () => {
    definirMostrarWhatsApp(true);
    try {
      await fetch("/api/send-whatsapp", { method: "POST" });
    } catch {
      /* Falhas de rede/Twilio são ignoradas silenciosamente para garantir a fluidez do demo no mockup */
    }
  }, []);

  /** Gera o PDF do dossiê de evidências */
  const gerarDossie = useCallback(() => {
    definirGerandoPdf(true);
    try {
      gerarDossiePdf();
    } finally {
      setTimeout(() => definirGerandoPdf(false), 1000);
    }
  }, []);

  return (
    <>
      <CabecalhoGovBr />
      <TrilhaEtapas />

      <main className="conteudo-principal">
        <ResumoImovel />
        <CardAlerta />

        <div className="acoes-container">
          <div className="acao-grupo">
            <button
              id="botao-enviar-produtor"
              className="botao botao--verde"
              onClick={enviarAoProdutor}
              title="Traduz o alerta para linguagem simples e envia mensagem de áudio ao produtor"
            >
              <span className="botao__icone">📱</span>
              Enviar explicação ao produtor
            </button>
          </div>

          <div className="acao-grupo">
            <button
              id="botao-gerar-dossie"
              className="botao botao--primario"
              onClick={gerarDossie}
              disabled={gerandoPdf}
              title="Gera um pacote de evidências que acelera a conferência do analista"
            >
              <span className="botao__icone">📋</span>
              {gerandoPdf ? "Gerando..." : "Gerar dossiê"}
            </button>
          </div>
        </div>

        {/* Descrição explicativa do papel das ferramentas no protótipo */}
        <div className="acoes-descricao" style={{ textAlign: "center", fontSize: "13px", color: "var(--cor-texto-claro)", marginTop: "-8px", marginBottom: "24px", padding: "0 16px" }}>
          💡 <em><strong>Nota conceitual:</strong> O dossiê gera um pacote de evidências que acelera a conferência do analista e reduz o tempo de reanálise. A decisão final permanece do órgão ambiental. A solução funciona de forma autônoma; a integração com a etapa de Alertas e Pendências do SICAR é uma evolução futura, não um requisito.</em>
        </div>

        {/* Assistente de IA ao vivo (Fase 4 - Opcional) */}
        <AssistenteIA />
      </main>

      {/* Selo discreto de protótipo indicando autonomia */}
      <div className="selo-prototipo" title="A solução funciona de forma autônoma. A integração com a etapa de Alertas e Pendências é uma evolução futura, não um requisito.">
        Solução autônoma — integração com Alertas e Pendências é evolução futura
      </div>

      {/* Modal do mockup WhatsApp */}
      <MockupWhatsApp
        aberto={mostrarWhatsApp}
        aoFechar={() => definirMostrarWhatsApp(false)}
      />
    </>
  );
}
