/**
 * Dados mockados do protótipo Zap-Tradutor CAR.
 * Todos os dados são 100% fictícios — nunca usar CPFs ou credenciais reais.
 * A solução funciona de forma autônoma; a integração com a etapa de Alertas e Pendências
 * é uma evolução futura, não um requisito.
 */

export const imovel = {
  nome: "Sítio Boa Esperança",
  produtor: "Raimundo Nonato (Seu Raimundo)",
  cpfMascarado: "***.***.***-**",
  municipio: "Riacho Verde / MA",
  bioma: "Cerrado",
  areaHa: 100,
  recibo: "MA-0000000-EXEMPLO-DEMO",
};

/** Severidade possível de um alerta */
export type Severidade = "aviso" | "impeditivo";

/** O alerta já vem pronto do sistema (entrada, não calculada) */
export const alerta = {
  id: "ALERTA-RL-01",
  severidade: "impeditivo" as Severidade,
  etapa: "Reserva Legal",
  textoTecnico:
    "A área de Reserva Legal vetorizada (18,00 ha) é inferior ao percentual mínimo exigido para o imóvel além da tolerância permitida.",
};

/** Tradução determinística (template, não LLM) */
export const traducao = {
  alertaId: "ALERTA-RL-01",
  textoSimples:
    "A área de mata que a lei pede para manter na propriedade (Reserva Legal) está 2 hectares abaixo do mínimo. Você declarou 18 ha e precisa de 20 ha.",
  fundamento: "Lei 12.651/2012, art. 12",
  conserto:
    "Ampliar a Reserva Legal em 2 ha, ou compensar em outra área conforme a lei.",
};

/** Mensagem de áudio enviada ao produtor */
export const mensagemAudio = {
  texto:
    "Bom dia, Seu Raimundo! Aqui é o assistente do CAR. A analista Luana olhou o seu cadastro. " +
    "Pra você não ter problema com multa e poder pegar crédito, falta acertar a sua Reserva Legal — " +
    "que é aquele pedaço de mata que a lei pede pra manter na propriedade. " +
    "Mostra essa mensagem pro técnico do seu sindicato, que ele corrige no sistema. " +
    "O número do seu recibo é MA-0000000-EXEMPLO-DEMO.",
  arquivo: "/audio/mensagem-seu-raimundo.mp3",
  duracaoSeg: 22,
};

/** Item individual do dossiê de evidências (apoio à análise, para acelerar a conferência) */
export interface ItemDossie {
  verificacao: string;
  resultado: string;
  fonte: string;
  versaoBase: string;
  consultaEm: string;
}

/** Conteúdo do dossiê — cada verificação é rastreável à fonte aberta e versão consultada */
export const dossie = {
  imovel: "Sítio Boa Esperança",
  recibo: "MA-0000000-EXEMPLO-DEMO",
  geradoEm: "28/06/2026",
  itens: [
    {
      verificacao: "Reserva Legal mínima",
      resultado: "PENDENTE — 18 ha declarados / 20 ha exigidos",
      fonte: "Regra por bioma (Cerrado) — Lei 12.651/2012, art. 12",
      versaoBase: "Código Florestal vigente",
      consultaEm: "28/06/2026",
    },
    {
      verificacao: "Divergência de área do imóvel",
      resultado: "OK — dentro da tolerância frente ao SNCR",
      fonte: "SNCR / SIGEF (INCRA)",
      versaoBase: "consulta SNCR",
      consultaEm: "28/06/2026",
    },
    {
      verificacao: "APP de margem de curso d'água",
      resultado: "OK — faixa preservada",
      fonte: "Hidrografia oficial",
      versaoBase: "base hidrográfica nacional",
      consultaEm: "28/06/2026",
    },
    {
      verificacao: "Sobreposição com outros imóveis",
      resultado: "OK — sem sobreposição",
      fonte: "Base pública do CAR / SICAR",
      versaoBase: "consulta pública do CAR",
      consultaEm: "28/06/2026",
    },
  ] as ItemDossie[],
};
