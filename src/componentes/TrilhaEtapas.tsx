/**
 * Trilha de etapas (stepper) horizontal no estilo gov.br.
 * A etapa "Alertas e Pendências" é destacada como ativa.
 */

const ETAPAS = [
  { rotulo: "Identificação", concluida: true },
  { rotulo: "Imóvel", concluida: true },
  { rotulo: "Documentação", concluida: true },
  { rotulo: "Representante", concluida: true },
  { rotulo: "GEO", concluida: true },
  { rotulo: "Alertas e Pendências", concluida: false, ativa: true },
  { rotulo: "Resumo", concluida: false },
];

export function TrilhaEtapas() {
  return (
    <div className="trilha-etapas" role="navigation" aria-label="Etapas do cadastro">
      {ETAPAS.map((etapa, indice) => {
        const ehUltima = indice === ETAPAS.length - 1;
        const classeCirculo = etapa.ativa
          ? "trilha-etapas__circulo trilha-etapas__circulo--ativa"
          : etapa.concluida
            ? "trilha-etapas__circulo trilha-etapas__circulo--concluida"
            : "trilha-etapas__circulo trilha-etapas__circulo--futura";

        const classeRotulo = etapa.ativa
          ? "trilha-etapas__rotulo trilha-etapas__rotulo--ativa"
          : "trilha-etapas__rotulo";

        const classeConector = etapa.concluida
          ? "trilha-etapas__conector trilha-etapas__conector--concluido"
          : "trilha-etapas__conector";

        return (
          <div key={etapa.rotulo} className="trilha-etapas__item">
            <div className={classeCirculo}>
              {etapa.concluida && !etapa.ativa ? "✓" : indice + 1}
            </div>
            <span className={classeRotulo}>{etapa.rotulo}</span>
            {!ehUltima && <div className={classeConector} />}
          </div>
        );
      })}
    </div>
  );
}
