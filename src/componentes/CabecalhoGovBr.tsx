/**
 * Cabeçalho no padrão visual gov.br.
 * Inclui logo, título, faixa verde e breadcrumb.
 */
export function CabecalhoGovBr() {
  return (
    <header>
      <div className="cabecalho-govbr">
        <div className="cabecalho-govbr__logo">
          <div className="cabecalho-govbr__logo-icone">
            BR
          </div>
          <div>
            <div className="cabecalho-govbr__titulo">
              SICAR — Sistema de Cadastro Ambiental Rural
            </div>
            <div className="cabecalho-govbr__subtitulo">
              Ministério do Meio Ambiente e Mudança do Clima
            </div>
          </div>
        </div>
      </div>

      <div className="faixa-verde">
        Cadastro Pré-Preenchido
      </div>

      <nav className="breadcrumb" aria-label="Navegação">
        <span>Início</span>
        <span className="breadcrumb__separador">›</span>
        <span>CAR</span>
        <span className="breadcrumb__separador">›</span>
        <span>Inscrição</span>
        <span className="breadcrumb__separador">›</span>
        <span className="breadcrumb__ativo">Alertas e Pendências</span>
      </nav>
    </header>
  );
}
