/**
 * Gerador do dossiê de evidências em PDF.
 * Usa jsPDF + jspdf-autotable para criar um PDF com tabela versionada.
 * Atua como ferramenta complementar que acelera a análise do órgão ambiental,
 * organizando a evidência e registrando a versão da base consultada.
 * A solução funciona de forma autônoma; a integração com a etapa de Alertas e Pendências
 * é uma evolução futura, não um requisito.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { dossie } from "../dados/mockDados";

/** Cores gov.br em RGB */
const COR_AZUL_GOVBR: [number, number, number] = [19, 81, 180];
const COR_VERDE_GOVBR: [number, number, number] = [22, 136, 33];
const COR_VERMELHO_IMPEDITIVO: [number, number, number] = [229, 34, 7];
const COR_FUNDO_CLARO: [number, number, number] = [248, 248, 248];

/** Gera e faz download do PDF do dossiê de evidências */
export function gerarDossiePdf() {
  const documento = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const larguraPagina = documento.internal.pageSize.getWidth();

  /* ── Cabeçalho ─────────────────────────────── */
  documento.setFillColor(...COR_AZUL_GOVBR);
  documento.rect(0, 0, larguraPagina, 28, "F");

  documento.setTextColor(255, 255, 255);
  documento.setFontSize(14);
  documento.setFont("helvetica", "bold");
  documento.text("Dossiê de Evidências — apoio à análise (não substitui a validação do órgão ambiental)", 14, 13);

  documento.setFontSize(10);
  documento.setFont("helvetica", "normal");
  documento.text(
    `Imóvel: ${dossie.imovel}  |  Recibo: ${dossie.recibo}  |  Gerado em: ${dossie.geradoEm}`,
    14,
    22
  );

  /* ── Faixa verde ───────────────────────────── */
  documento.setFillColor(...COR_VERDE_GOVBR);
  documento.rect(0, 28, larguraPagina, 6, "F");
  documento.setFontSize(8);
  documento.setTextColor(255, 255, 255);
  documento.text("ZAP-TRADUTOR CAR — EVIDÊNCIA VERSIONADA E RASTREÁVEL", larguraPagina / 2, 32, {
    align: "center",
  });

  /* ── Aviso Legal em Destaque ───────────────── */
  documento.setTextColor(60, 60, 60);
  documento.setFontSize(10);
  documento.setFont("helvetica", "italic");
  documento.text(
    "Este dossiê organiza as evidências e suas fontes para agilizar a conferência. A validação técnica e a decisão final permanecem a cargo do analista do órgão ambiental, conforme exige a legislação.",
    14,
    42
  );

  /* ── Tabela de verificações ────────────────── */
  const cabecalhoTabela = [
    "Verificação",
    "Resultado",
    "Fonte aberta",
    "Versão da base",
    "Consulta em",
  ];

  const linhasTabela = dossie.itens.map((item) => [
    item.verificacao,
    item.resultado,
    item.fonte,
    item.versaoBase,
    item.consultaEm,
  ]);

  autoTable(documento, {
    startY: 48,
    head: [cabecalhoTabela],
    body: linhasTabela,
    theme: "grid",
    headStyles: {
      fillColor: COR_AZUL_GOVBR,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      halign: "center",
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [200, 200, 200],
      lineWidth: 0.3,
    },
    alternateRowStyles: {
      fillColor: COR_FUNDO_CLARO,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 65 },
      2: { cellWidth: 70 },
      3: { cellWidth: 50 },
      4: { cellWidth: 30, halign: "center" },
    },
    didParseCell: (dados) => {
      /* Colorir "PENDENTE" em vermelho e "OK" em verde */
      if (dados.section === "body" && dados.column.index === 1) {
        const valor = String(dados.cell.raw);
        if (valor.startsWith("PENDENTE")) {
          dados.cell.styles.textColor = COR_VERMELHO_IMPEDITIVO;
          dados.cell.styles.fontStyle = "bold";
        } else if (valor.startsWith("OK")) {
          dados.cell.styles.textColor = COR_VERDE_GOVBR;
          dados.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  /* ── Rodapé ────────────────────────────────── */
  const alturaFinal = documento.internal.pageSize.getHeight() - 12;

  documento.setDrawColor(...COR_AZUL_GOVBR);
  documento.setLineWidth(0.5);
  documento.line(14, alturaFinal - 6, larguraPagina - 14, alturaFinal - 6);

  documento.setFontSize(8);
  documento.setTextColor(100, 100, 100);
  documento.setFont("helvetica", "italic");
  documento.text(
    "Evidência gerada pelo Zap-Tradutor CAR — cada verificação é rastreável à fonte aberta e à versão consultada, para reduzir o tempo de análise. A decisão é do órgão ambiental.",
    larguraPagina / 2,
    alturaFinal,
    { align: "center" }
  );

  /* ── Download ──────────────────────────────── */
  documento.save(`dossie-evidencias-${dossie.recibo}.pdf`);
}
