import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type RapportPdfData = {
  etablissementNom: string;
  titre: string;
  periode: string;
  type: string;
  generePar: string;
  dateGeneration: string;
  kpis: { label: string; value: string }[];
  etudiants?: { nom: string; filiere: string; moyenne: number; assiduite: number }[];
};

export function generateRapportPdf(data: RapportPdfData): Uint8Array {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`${data.etablissementNom} — Rapport pédagogique`, 14, 20);
  doc.setFontSize(12);
  doc.text(data.titre, 14, 30);
  doc.setFontSize(10);
  doc.text(`Période : ${data.periode}`, 14, 38);
  doc.text(`Type : ${data.type}`, 14, 44);
  doc.text(`Généré le : ${data.dateGeneration}`, 14, 50);
  doc.text(`Généré par : ${data.generePar}`, 14, 56);

  autoTable(doc, {
    startY: 64,
    head: [["Indicateur", "Valeur"]],
    body: data.kpis.map((k) => [k.label, k.value]),
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
  });

  if (data.etudiants && data.etudiants.length > 0) {
    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 100;
    autoTable(doc, {
      startY: finalY + 10,
      head: [["Étudiant", "Filière", "Moyenne", "Assiduité"]],
      body: data.etudiants.slice(0, 30).map((e) => [
        e.nom,
        e.filiere,
        String(e.moyenne),
        `${e.assiduite} %`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
    });
  }

  return new Uint8Array(doc.output("arraybuffer"));
}

export function formatTaille(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}
