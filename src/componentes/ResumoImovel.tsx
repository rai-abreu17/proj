/**
 * Linha resumo com os dados do imóvel rural.
 * Exibe nome, produtor (CPF mascarado), município, bioma e área.
 */
import { imovel } from "../dados/mockDados";

export function ResumoImovel() {
  const campos = [
    { rotulo: "Imóvel", valor: imovel.nome },
    { rotulo: "Produtor", valor: imovel.produtor },
    { rotulo: "CPF", valor: imovel.cpfMascarado },
    { rotulo: "Município / UF", valor: imovel.municipio },
    { rotulo: "Bioma", valor: imovel.bioma },
    { rotulo: "Área", valor: `${imovel.areaHa} ha` },
    { rotulo: "Recibo", valor: imovel.recibo },
  ];

  return (
    <section className="resumo-imovel" aria-label="Dados do imóvel">
      {campos.map((campo) => (
        <div key={campo.rotulo} className="resumo-imovel__campo">
          <span className="resumo-imovel__rotulo">{campo.rotulo}</span>
          <span className="resumo-imovel__valor">{campo.valor}</span>
        </div>
      ))}
    </section>
  );
}
