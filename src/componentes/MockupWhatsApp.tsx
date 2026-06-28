/**
 * Mockup de conversa do WhatsApp hiper-realista, 100% focado em áudio.
 * Traz a vivência autêntica do produtor rural (Seu Raimundo) enviando áudios reais
 * e a IA (Assistente CAR) respondendo também em áudio de forma afetuosa e clara.
 */
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { mensagemAudio } from "../dados/mockDados";

interface PropriedadesMockupWhatsApp {
  aberto: boolean;
  aoFechar: () => void;
}

interface MensagemChat {
  id: string;
  autor: "usuario" | "assistente";
  texto: string;
  horario: string;
  duracaoFormatada: string;
  duracaoSeg: number;
}

/** Gera alturas pseudo-aleatórias para as barras de onda */
const QUANTIDADE_BARRAS = 28;
const SEMENTE_ALTURAS = Array.from({ length: QUANTIDADE_BARRAS }, (_, i) =>
  Math.round(6 + Math.abs(Math.sin(i * 1.3)) * 18)
);

/** Roteiro hiper-realista com a verdadeira voz e vivência do produtor rural */
const DUVIDAS_DISPONIVEIS = [
  {
    rotuloBotao: "🎙️ Áudio: 'Vou ter que pagar multa?'",
    pergunta: "Ô minha filha, bom dia! Olha, eu vi aqui esse negócio que você mandou pro meu zap... Mas vem cá, eu vou ter que pagar multa por causa dessa tal de Reserva Legal? Eu tô preocupado com isso aí!",
    resposta: "Bom dia, Seu Raimundo! Pode ficar sossegado. Se a gente corrigir o cadastro agora no sistema com o técnico do seu sindicato, não tem multa nenhuma! A lei dá esse prazo justamente para o produtor se regularizar sem prejuízo.",
    duracaoUsuario: 12,
    duracaoAssistente: 14,
  },
  {
    rotuloBotao: "🎙️ Áudio: 'Onde fica essa Reserva no sítio?'",
    pergunta: "Mas escuta aqui... onde que fica essa tal Reserva Legal aqui no meu sítio? Eu moro aqui tem trinta anos e não tô sabendo bem onde demarcaram isso.",
    resposta: "Ela fica bem no fundo da sua propriedade, Seu Raimundo, naquela área de mata nativa do Cerrado que o senhor já preserva! O mapa antigo apontava 18 hectares, mas a regra do bioma pede 20 hectares. É só pedir pro técnico ajustar esse desenho no sistema!",
    duracaoUsuario: 9,
    duracaoAssistente: 16,
  },
  {
    rotuloBotao: "🎙️ Áudio: 'Atrapalha meu financiamento no banco?'",
    pergunta: "E me diz uma coisa... isso aí atrapalha o meu financiamento e o crédito rural lá no Banco do Brasil?",
    resposta: "Atrapalha apenas se ficar pendente, Seu Raimundo. Mas no momento em que o técnico enviar a retificação do CAR, o recibo sai atualizado na hora e o banco libera o crédito rural sem nenhum problema!",
    duracaoUsuario: 8,
    duracaoAssistente: 15,
  },
];

export function MockupWhatsApp({ aberto, aoFechar }: PropriedadesMockupWhatsApp) {
  const [idTocando, definirIdTocando] = useState<string | null>(null);
  const [progresso, definirProgresso] = useState(0);
  const [duracaoAtual, definirDuracaoAtual] = useState(0);
  const [mensagens, definirMensagens] = useState<MensagemChat[]>([]);
  const [statusAcao, definirStatusAcao] = useState<string>("online");

  const referenciaAudio = useRef<HTMLAudioElement | null>(null);
  const referenciaSintese = useRef<SpeechSynthesisUtterance | null>(null);
  const referenciaIntervalo = useRef<ReturnType<typeof setInterval> | null>(null);
  const referenciaFimChat = useRef<HTMLDivElement | null>(null);

  /** Rola o chat para baixo automaticamente */
  useEffect(() => {
    referenciaFimChat.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, statusAcao]);

  /** Limpa o intervalo de atualização do progresso */
  const limparIntervalo = useCallback(() => {
    if (referenciaIntervalo.current) {
      clearInterval(referenciaIntervalo.current);
      referenciaIntervalo.current = null;
    }
  }, []);

  /** Busca voz feminina/oficial para o Assistente CAR */
  const obterVozAssistente = useCallback((): SpeechSynthesisVoice | null => {
    if (!window.speechSynthesis) return null;
    const vozes = window.speechSynthesis.getVoices();
    const vozNatural = vozes.find((v) => v.lang.startsWith("pt") && (v.name.includes("Francisca") || v.name.includes("Natural")));
    if (vozNatural) return vozNatural;
    const vozGoogle = vozes.find((v) => v.lang.startsWith("pt") && v.name.includes("Google"));
    return vozGoogle || vozes.find((v) => v.lang.startsWith("pt")) || vozes[0] || null;
  }, []);

  /** Busca voz masculina ou configura tom autêntico para o Seu Raimundo */
  const obterVozUsuario = useCallback((): SpeechSynthesisVoice | null => {
    if (!window.speechSynthesis) return null;
    const vozes = window.speechSynthesis.getVoices();
    const vozAntonio = vozes.find((v) => v.lang.startsWith("pt") && (v.name.includes("Antonio") || v.name.includes("Masculine")));
    if (vozAntonio) return vozAntonio;
    return vozes.find((v) => v.lang.startsWith("pt")) || vozes[0] || null;
  }, []);

  /** Toca um áudio via SpeechSynthesis (ou arquivo no caso da mensagem inicial) */
  const alternarReproducaoMensagem = useCallback((id: string, texto: string, autor: "usuario" | "assistente", arquivoMp3?: string, duracaoEstSeg?: number, aoTerminar?: () => void) => {
    if (idTocando === id) {
      window.speechSynthesis.cancel();
      referenciaAudio.current?.pause();
      definirIdTocando(null);
      limparIntervalo();
      return;
    }

    /* Parar qualquer áudio tocando anteriormente */
    window.speechSynthesis.cancel();
    if (referenciaAudio.current) {
      referenciaAudio.current.pause();
    }
    limparIntervalo();
    definirProgresso(0);
    definirDuracaoAtual(0);
    definirIdTocando(id);

    /* Se for a mensagem inicial com arquivo MP3, tenta tocar o arquivo primeiro */
    if (arquivoMp3) {
      const audio = new Audio(arquivoMp3);
      referenciaAudio.current = audio;

      audio.addEventListener("canplaythrough", () => {
        audio.play();
        const duracaoTotal = audio.duration || duracaoEstSeg || 22;
        referenciaIntervalo.current = setInterval(() => {
          const percentual = (audio.currentTime / duracaoTotal) * 100;
          definirProgresso(Math.min(percentual, 100));
          definirDuracaoAtual(Math.floor(audio.currentTime));
        }, 100);

        audio.addEventListener("ended", () => {
          definirIdTocando(null);
          definirProgresso(100);
          limparIntervalo();
          if (aoTerminar) aoTerminar();
        });
      });

      audio.addEventListener("error", () => {
        /* Fallback para SpeechSynthesis */
        iniciarSinteseFala(id, texto, autor, duracaoEstSeg || 22, aoTerminar);
      });

      audio.load();
      return;
    }

    /* Tocar via SpeechSynthesis */
    iniciarSinteseFala(id, texto, autor, duracaoEstSeg || 12, aoTerminar);
  }, [idTocando, limparIntervalo, obterVozAssistente, obterVozUsuario]);

  /** Lógica central de SpeechSynthesis com vozes realistas */
  const iniciarSinteseFala = (_id: string, texto: string, autor: "usuario" | "assistente", duracaoEstSeg: number, aoTerminar?: () => void) => {
    const fala = new SpeechSynthesisUtterance(texto);
    if (autor === "assistente") {
      const voz = obterVozAssistente();
      if (voz) fala.voice = voz;
      fala.rate = 0.92; /* Falar com calma e clareza, tom acolhedor */
      fala.pitch = 1.02;
    } else {
      const voz = obterVozUsuario();
      if (voz) fala.voice = voz;
      fala.rate = 0.94;
      fala.pitch = 0.86; /* Tom mais grave e cadenciado para representar o Seu Raimundo */
    }
    fala.lang = "pt-BR";
    referenciaSintese.current = fala;

    const inicioFala = Date.now();
    const duracaoEstimadaMs = duracaoEstSeg * 1000;

    fala.onstart = () => {
      referenciaIntervalo.current = setInterval(() => {
        const decorrido = Date.now() - inicioFala;
        const percentual = (decorrido / duracaoEstimadaMs) * 100;
        definirProgresso(Math.min(percentual, 100));
        definirDuracaoAtual(Math.floor(decorrido / 1000));
      }, 100);
    };

    fala.onend = () => {
      definirIdTocando(null);
      definirProgresso(100);
      limparIntervalo();
      if (aoTerminar) aoTerminar();
    };

    fala.onerror = () => {
      definirIdTocando(null);
      limparIntervalo();
      if (aoTerminar) aoTerminar();
    };

    window.speechSynthesis.speak(fala);
  };

  /** Dispara o envio do áudio do Seu Raimundo e, ao final, a resposta em áudio da IA */
  const dispararInteracaoAudio = useCallback((item: typeof DUVIDAS_DISPONIVEIS[0]) => {
    window.speechSynthesis.cancel();
    if (referenciaAudio.current) referenciaAudio.current.pause();
    definirIdTocando(null);
    limparIntervalo();

    const agora = new Date();
    const horarioStr = `${agora.getHours().toString().padStart(2, "0")}:${agora.getMinutes().toString().padStart(2, "0")}`;
    const idUsuario = Math.random().toString();
    const idAssistente = Math.random().toString();

    const msgUsuario: MensagemChat = {
      id: idUsuario,
      autor: "usuario",
      texto: item.pergunta,
      horario: horarioStr,
      duracaoFormatada: `0:${item.duracaoUsuario.toString().padStart(2, "0")}`,
      duracaoSeg: item.duracaoUsuario,
    };

    definirMensagens((antigas) => [...antigas, msgUsuario]);
    definirStatusAcao("online");

    /* Começa a tocar o áudio do Seu Raimundo imediatamente */
    setTimeout(() => {
      alternarReproducaoMensagem(idUsuario, item.pergunta, "usuario", undefined, item.duracaoUsuario, () => {
        /* Assim que o áudio do Seu Raimundo termina, a IA começa a "gravando áudio..." */
        definirStatusAcao("gravando áudio...");

        setTimeout(() => {
          definirStatusAcao("online");
          const msgAssistente: MensagemChat = {
            id: idAssistente,
            autor: "assistente",
            texto: item.resposta,
            horario: horarioStr,
            duracaoFormatada: `0:${item.duracaoAssistente.toString().padStart(2, "0")}`,
            duracaoSeg: item.duracaoAssistente,
          };
          definirMensagens((antigas) => [...antigas, msgAssistente]);

          /* Começa a tocar o áudio de resposta da IA automaticamente */
          setTimeout(() => {
            alternarReproducaoMensagem(idAssistente, item.resposta, "assistente", undefined, item.duracaoAssistente);
          }, 400);

        }, 2500); /* Tempo realista simulando a gravação do áudio da IA */
      });
    }, 400);

  }, [alternarReproducaoMensagem, limparIntervalo]);

  /** Resetar estado ao fechar */
  useEffect(() => {
    if (!aberto) {
      if (referenciaAudio.current) {
        referenciaAudio.current.pause();
        referenciaAudio.current = null;
      }
      window.speechSynthesis.cancel();
      definirIdTocando(null);
      definirProgresso(0);
      definirDuracaoAtual(0);
      definirMensagens([]);
      definirStatusAcao("online");
      limparIntervalo();
    }
  }, [aberto, limparIntervalo]);

  /** Formata segundos para mm:ss */
  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, "0")}`;
  };

  /** Calcula o índice da barra ativa com base no progresso */
  const indiceBarra = useMemo(
    () => Math.floor((progresso / 100) * QUANTIDADE_BARRAS),
    [progresso]
  );

  if (!aberto) return null;

  return (
    <div className="modal-overlay" onClick={aoFechar}>
      <button className="modal-fechar" onClick={aoFechar} aria-label="Fechar">
        ✕
      </button>

      <div className="moldura-celular" onClick={(e) => e.stopPropagation()}>
        <div className="moldura-celular__notch" />

        <div className="whatsapp">
          {/* Header do WhatsApp */}
          <div className="whatsapp__header">
            <button className="whatsapp__header-voltar" onClick={aoFechar} aria-label="Voltar">
              ←
            </button>
            <div className="whatsapp__avatar">🌱</div>
            <div>
              <div className="whatsapp__contato-nome">Assistente CAR</div>
              <div className="whatsapp__contato-status">
                {statusAcao === "online" ? (
                  "online"
                ) : (
                  <span style={{ color: "#25D366", fontStyle: "italic", fontWeight: 600 }}>🎙️ {statusAcao}</span>
                )}
              </div>
            </div>
          </div>

          {/* Área do chat */}
          <div className="whatsapp__chat">
            <div className="whatsapp__data">HOJE</div>

            {/* Bolha de áudio inicial (Assistente CAR) */}
            <div className="whatsapp__bolha whatsapp__bolha--audio">
              <div className="whatsapp__bolha-autor">🌱 Assistente CAR</div>
              <div className="whatsapp__audio-player">
                <button
                  className="whatsapp__audio-botao"
                  onClick={() => alternarReproducaoMensagem(
                    "inicial",
                    mensagemAudio.texto,
                    "assistente",
                    mensagemAudio.arquivo,
                    mensagemAudio.duracaoSeg
                  )}
                  aria-label={idTocando === "inicial" ? "Pausar" : "Reproduzir"}
                >
                  {idTocando === "inicial" ? "⏸" : "▶"}
                </button>
                <div className="whatsapp__audio-onda">
                  <div className="whatsapp__audio-barras-visuais">
                    {SEMENTE_ALTURAS.map((altura, i) => {
                      const ativa = idTocando === "inicial" && i < indiceBarra;
                      return (
                        <div
                          key={i}
                          className={`whatsapp__audio-barra-visual${ativa ? " whatsapp__audio-barra-visual--ativa" : ""}`}
                          style={{ height: `${altura}px` }}
                        />
                      );
                    })}
                  </div>
                  <div className="whatsapp__audio-duracao">
                    {idTocando === "inicial"
                      ? formatarTempo(duracaoAtual)
                      : formatarTempo(mensagemAudio.duracaoSeg)}
                  </div>
                </div>
              </div>
              <div className="whatsapp__bolha-horario">
                14:32 <span className="whatsapp__bolha-lido">✓✓</span>
              </div>
            </div>

            {/* Transcrição inicial */}
            <div className="whatsapp__transcricao">
              <div className="whatsapp__transcricao-titulo">📝 Transcrição</div>
              <div className="whatsapp__transcricao-texto">{mensagemAudio.texto}</div>
            </div>

            {/* Lista de mensagens interativas de áudio (Seu Raimundo ↔ IA) */}
            {mensagens.map((msg) => (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", width: "100%", gap: "4px" }}>
                {/* Bolha de Áudio */}
                <div className={`whatsapp__bolha whatsapp__bolha--audio ${msg.autor === "usuario" ? "whatsapp__bolha--usuario" : ""}`}>
                  <div className="whatsapp__bolha-autor">
                    {msg.autor === "usuario" ? "🤠 Seu Raimundo" : "🌱 Assistente CAR"}
                  </div>
                  <div className="whatsapp__audio-player">
                    <button
                      className="whatsapp__audio-botao"
                      onClick={() => alternarReproducaoMensagem(msg.id, msg.texto, msg.autor, undefined, msg.duracaoSeg)}
                      aria-label={idTocando === msg.id ? "Pausar" : "Reproduzir"}
                    >
                      {idTocando === msg.id ? "⏸" : "▶"}
                    </button>
                    <div className="whatsapp__audio-onda">
                      <div className="whatsapp__audio-barras-visuais">
                        {SEMENTE_ALTURAS.map((altura, i) => {
                          const ativa = idTocando === msg.id && i < indiceBarra;
                          return (
                            <div
                              key={i}
                              className={`whatsapp__audio-barra-visual${ativa ? " whatsapp__audio-barra-visual--ativa" : ""}`}
                              style={{ height: `${altura}px` }}
                            />
                          );
                        })}
                      </div>
                      <div className="whatsapp__audio-duracao">
                        {idTocando === msg.id ? formatarTempo(duracaoAtual) : msg.duracaoFormatada}
                      </div>
                    </div>
                  </div>
                  <div className="whatsapp__bolha-horario">
                    {msg.horario} {msg.autor === "assistente" && <span className="whatsapp__bolha-lido">✓✓</span>}
                  </div>
                </div>

                {/* Transcrição da Bolha */}
                <div className={`whatsapp__transcricao ${msg.autor === "usuario" ? "whatsapp__transcricao--usuario" : ""}`}>
                  <div className="whatsapp__transcricao-titulo">📝 Transcrição do Áudio</div>
                  <div className="whatsapp__transcricao-texto">{msg.texto}</div>
                </div>
              </div>
            ))}

            {statusAcao === "gravando áudio..." && (
              <div className="whatsapp__bolha" style={{ padding: "8px 16px", fontStyle: "italic", fontSize: "13px", opacity: 0.9, backgroundColor: "#005C4B" }}>
                🎙️ Assistente CAR gravando áudio...
              </div>
            )}

            <div ref={referenciaFimChat} />
          </div>

          {/* Área de botões para disparar os áudios autênticos do Seu Raimundo */}
          <div className="whatsapp__input-area">
            <div className="whatsapp__input-titulo">🎙️ Disparar áudio real do Seu Raimundo:</div>
            <div className="whatsapp__duvidas-lista">
              {DUVIDAS_DISPONIVEIS.map((item, index) => (
                <button
                  key={index}
                  className="whatsapp__duvida-botao"
                  onClick={() => dispararInteracaoAudio(item)}
                  disabled={statusAcao !== "online"}
                >
                  <span>{item.rotuloBotao}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
