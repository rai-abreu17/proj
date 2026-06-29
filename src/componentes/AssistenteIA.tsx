/**
 * Componente do Assistente de IA ao vivo (Fase 4).
 * Interface premium flutuante (bolinha expansível com botão fechar X),
 * mantendo o design system do Gov.br e regras estritas de Clean Code.
 */
import { useState, useCallback } from "react";
import { imovel, alerta } from "../dados/mockDados";

interface Mensagem {
  id: string;
  remetente: "usuario" | "ia";
  texto: string;
}

const METODO_POST = "POST";
const CABECALHO_CONTEUDO = "application/json";
const MENSAGEM_INICIAL_IA = `Olá! Sou o Assistente de IA do CAR. Estou pronto para tirar suas dúvidas sobre penalidades, base legal ou impactos no crédito rural específicos para o ${imovel.nome}.`;

export function AssistenteIA() {
  const [aberto, definirAberto] = useState(false);
  const [mensagens, definirMensagens] = useState<Mensagem[]>([
    { id: "1", remetente: "ia", texto: MENSAGEM_INICIAL_IA },
  ]);
  const [pergunta, definirPergunta] = useState("");
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState("");

  /** Envia a pergunta para a função serverless e atualiza o histórico do chat */
  const enviarPergunta = useCallback(async (textoConsulta?: string) => {
    const consulta = textoConsulta || pergunta;
    if (!consulta.trim()) return;

    const novaMensagemUsuario: Mensagem = {
      id: String(Date.now()),
      remetente: "usuario",
      texto: consulta,
    };

    definirMensagens((mensagensAnteriores) => [...mensagensAnteriores, novaMensagemUsuario]);
    definirPergunta("");
    definirCarregando(true);
    definirErro("");

    try {
      const requisicao = await fetch("/api/tirar-duvida", {
        method: METODO_POST,
        headers: { "Content-Type": CABECALHO_CONTEUDO },
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

      const novaMensagemIA: Mensagem = {
        id: String(Date.now() + 1),
        remetente: "ia",
        texto: dados.resposta,
      };

      definirMensagens((mensagensAnteriores) => [...mensagensAnteriores, novaMensagemIA]);
    } catch (e) {
      const erroMensagem = e instanceof Error ? e.message : "Erro desconhecido ao consultar IA.";
      definirErro(erroMensagem);
    } finally {
      definirCarregando(false);
    }
  }, [pergunta]);

  if (!aberto) {
    return (
      <button
        className="assistente-ia__bolinha"
        onClick={() => definirAberto(true)}
        title="Abrir Assistente de IA"
      >
        <span className="assistente-ia__bolinha-icone">✨</span>
        <span className="assistente-ia__bolinha-texto">Assistente IA</span>
      </button>
    );
  }

  return (
    <section className="assistente-ia assistente-ia--flutuante">
      <div className="assistente-ia__cabecalho">
        <span className="assistente-ia__icone">✨</span>
        <h3 className="assistente-ia__titulo">Assistente de IA</h3>
        <span className="assistente-ia__status">Ao Vivo</span>
        <button
          className="assistente-ia__botao-fechar"
          onClick={() => definirAberto(false)}
          title="Fechar Assistente"
        >
          ✖
        </button>
      </div>

      <div className="assistente-ia__chat">
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className={`assistente-ia__bolha assistente-ia__bolha--${msg.remetente}`}
          >
            <div className="assistente-ia__bolha-cabecalho">
              {msg.remetente === "ia" ? "🤖 Inteligência Artificial" : "👤 Você"}
            </div>
            {msg.texto}
          </div>
        ))}

        {carregando && (
          <div className="assistente-ia__carregando">
            <div className="assistente-ia__spinner" />
            <span>Analisando legislação e dados SICAR...</span>
          </div>
        )}

        {erro && (
          <div className="assistente-ia__erro">
            ⚠️ <strong>Erro:</strong> {erro}
          </div>
        )}
      </div>

      <div className="assistente-ia__rodape">
        <div className="assistente-ia__sugestoes">
          <span className="assistente-ia__sugestoes-rotulo">Perguntas rápidas:</span>
          <button
            className="assistente-ia__botao-sugestao"
            onClick={() => enviarPergunta("Qual a multa prevista se o produtor não corrigir a Reserva Legal?")}
            disabled={carregando}
          >
            Qual a multa se não corrigir?
          </button>
          <button
            className="assistente-ia__botao-sugestao"
            onClick={() => enviarPergunta("O déficit de Reserva Legal impacta no acesso a crédito rural no banco?")}
            disabled={carregando}
          >
            Impacta no crédito rural?
          </button>
        </div>

        <div className="assistente-ia__formulario">
          <input
            type="text"
            className="assistente-ia__entrada"
            placeholder="Digite sua dúvida sobre a lei..."
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
            {carregando ? "..." : "Enviar"}
          </button>
        </div>
      </div>
    </section>
  );
}
