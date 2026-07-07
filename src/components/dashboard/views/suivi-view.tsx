"use client";

import { useMemo, useState } from "react";
import {
  ClipboardList,
  ClipboardEdit,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  TrendingUp,
  Filter,
  CalendarX2,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/view-store";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/auth-store";
import {
  PageHeader,
  StatusBadge,
  Toolbar,
  FullWidthPage,
  FullWidthHeader,
  FullWidthKpiGrid,
  FullWidthSection,
  KpiCard,
  EmptyState,
  ActiveFilterChips,
  ResetFiltersButton,
  PersonAvatar,
  MobileCard,
  MobileOnly,
  DesktopOnly,
  filteredSubtitle,
  tableHeadClass,
  tableRowClass,
  noteSur20,
  type FilterChip,
} from "./shared";
import { usePagination, DataTablePagination } from "./data-table-pagination";

function noteColor(n: number) {
  if (n >= 14) return "text-blue-700";
  if (n >= 10) return "text-gray-700";
  return "text-red-500";
}

function studentInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2);
}

function uniques(values: string[]) {
  return ["Toutes", ...Array.from(new Set(values))];
}

export function SuiviView() {
  const openModal = useAppStore((s) => s.openModal);
  const session = useAuthStore((s) => s.session);
  const [tab, setTab] = useState("notes");

  const allNotes = useDataStore((s) => s.notes);
  const allAbsences = useDataStore((s) => s.absences);
  const deleteNote = useDataStore((s) => s.deleteNote);
  const deleteAbsence = useDataStore((s) => s.deleteAbsence);
  const enseignants = useDataStore((s) => s.enseignants);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "note" | "absence"; id: string } | null>(null);

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "note") void deleteNote(deleteTarget.id);
    else void deleteAbsence(deleteTarget.id);
    setDeleteTarget(null);
  }

  const role = session?.role;
  const isEtudiant = role === "etudiant";
  const canSaisir = role === "enseignant" || role === "admin";
  const canEdit = canSaisir;
  const fullName = session ? `${session.prenom} ${session.nom}` : "";

  const periodeOptions = useMemo(() => {
    const fromNotes = allNotes.map((n) => n.periode).filter(Boolean);
    const base = ["Toutes", "Semestre 1", "Semestre 2", `Année ${new Date().getFullYear()}`];
    return [...new Set([...base, ...fromNotes])];
  }, [allNotes]);

  const [notesPeriode, setNotesPeriode] = useState("Toutes");

  const monEnseignant =
    role === "enseignant"
      ? enseignants.find((e) => e.nom === session?.nom && e.prenom === session?.prenom)
      : undefined;

  // ─── Périmètre de données selon le rôle ────────────────────────────────────
  // Un enseignant ne doit voir que ses propres classes/matières — s'il n'a pas
  // de fiche enseignant correspondante, il ne doit voir aucune donnée plutôt
  // que la totalité de l'établissement (repli sécurisé, pas de fuite de données).
  const notesBase = useMemo(() => {
    if (isEtudiant) return allNotes.filter((n) => n.etudiant === fullName);
    if (role === "enseignant") {
      if (!monEnseignant) return [];
      return allNotes.filter(
        (n) =>
          monEnseignant.matieres.includes(n.matiere) &&
          monEnseignant.classes.includes(n.classe)
      );
    }
    return allNotes;
  }, [allNotes, isEtudiant, fullName, role, monEnseignant]);

  const absencesBase = useMemo(() => {
    if (isEtudiant) return allAbsences.filter((a) => a.etudiant === fullName);
    if (role === "enseignant") {
      if (!monEnseignant) return [];
      return allAbsences.filter(
        (a) =>
          monEnseignant.matieres.includes(a.matiere) &&
          monEnseignant.classes.includes(a.classe)
      );
    }
    return allAbsences;
  }, [allAbsences, isEtudiant, fullName, role, monEnseignant]);

  // ─── Filtres — onglet Notes ─────────────────────────────────────────────────
  const [notesSearch, setNotesSearch] = useState("");
  const [notesClasse, setNotesClasse] = useState("Toutes");
  const [notesMatiere, setNotesMatiere] = useState("Toutes");

  const classesNotes = useMemo(() => uniques(notesBase.map((n) => n.classe)), [notesBase]);
  const matieresNotes = useMemo(() => uniques(notesBase.map((n) => n.matiere)), [notesBase]);

  const notesFiltered = notesBase.filter((n) => {
    const matchSearch = n.etudiant.toLowerCase().includes(notesSearch.toLowerCase());
    const matchClasse = notesClasse === "Toutes" || n.classe === notesClasse;
    const matchMatiere = notesMatiere === "Toutes" || n.matiere === notesMatiere;
    const matchPeriode = notesPeriode === "Toutes" || n.periode === notesPeriode;
    return matchSearch && matchClasse && matchMatiere && matchPeriode;
  });
  const notesPagination = usePagination(notesFiltered);
  const notesHasFilters =
    notesSearch.length > 0 || notesClasse !== "Toutes" || notesMatiere !== "Toutes";

  function resetNotesFilters() {
    setNotesSearch("");
    setNotesClasse("Toutes");
    setNotesMatiere("Toutes");
    notesPagination.setPage(1);
  }

  const notesChips: FilterChip[] = [
    ...(notesSearch
      ? [{ id: "search", label: `« ${notesSearch} »`, tone: "gray" as const, onRemove: () => setNotesSearch("") }]
      : []),
    ...(notesClasse !== "Toutes"
      ? [{ id: "classe", label: notesClasse, tone: "blue" as const, onRemove: () => setNotesClasse("Toutes") }]
      : []),
    ...(notesMatiere !== "Toutes"
      ? [{ id: "matiere", label: notesMatiere, tone: "blue" as const, onRemove: () => setNotesMatiere("Toutes") }]
      : []),
  ];

  // ─── Filtres — onglet Absences ──────────────────────────────────────────────
  const [absSearch, setAbsSearch] = useState("");
  const [absClasse, setAbsClasse] = useState("Toutes");
  const [absStatut, setAbsStatut] = useState("Toutes");

  const classesAbs = useMemo(() => uniques(absencesBase.map((a) => a.classe)), [absencesBase]);

  const absencesFiltered = absencesBase.filter((a) => {
    const matchSearch = a.etudiant.toLowerCase().includes(absSearch.toLowerCase());
    const matchClasse = absClasse === "Toutes" || a.classe === absClasse;
    const matchStatut =
      absStatut === "Toutes" ||
      (absStatut === "Justifiées" ? a.justifiee : !a.justifiee);
    return matchSearch && matchClasse && matchStatut;
  });
  const absencesPagination = usePagination(absencesFiltered);
  const absHasFilters =
    absSearch.length > 0 || absClasse !== "Toutes" || absStatut !== "Toutes";

  function resetAbsFilters() {
    setAbsSearch("");
    setAbsClasse("Toutes");
    setAbsStatut("Toutes");
    absencesPagination.setPage(1);
  }

  const absChips: FilterChip[] = [
    ...(absSearch
      ? [{ id: "search", label: `« ${absSearch} »`, tone: "gray" as const, onRemove: () => setAbsSearch("") }]
      : []),
    ...(absClasse !== "Toutes"
      ? [{ id: "classe", label: absClasse, tone: "blue" as const, onRemove: () => setAbsClasse("Toutes") }]
      : []),
    ...(absStatut !== "Toutes"
      ? [{ id: "statut", label: absStatut, tone: "blue" as const, onRemove: () => setAbsStatut("Toutes") }]
      : []),
  ];

  // ─── KPIs (calculés sur le périmètre du rôle, non filtré par la recherche) ──
  const stats = useMemo(() => {
    const notees = notesBase.filter((n) => n.note !== null);
    const sommeCoef = notees.reduce((s, n) => s + n.coefficient, 0);
    const moyenne =
      sommeCoef > 0
        ? notees.reduce((s, n) => s + noteSur20(n.note, n.sur) * n.coefficient, 0) / sommeCoef
        : null;
    const nonJustifiees = absencesBase.filter((a) => !a.justifiee).length;
    const justifiees = absencesBase.length - nonJustifiees;
    const tauxJustification =
      absencesBase.length > 0 ? Math.round((justifiees / absencesBase.length) * 100) : 100;
    return {
      notes: notesBase.length,
      moyenne,
      absences: absencesBase.length,
      nonJustifiees,
      tauxJustification,
    };
  }, [notesBase, absencesBase]);

  const pageTitle = isEtudiant ? "Mon suivi pédagogique" : "Suivi pédagogique";
  const pageDescription = isEtudiant
    ? "Vos notes et absences enregistrées par vos enseignants."
    : monEnseignant
      ? "Saisie des notes et consultation des absences pour vos classes (F4.1)."
      : "Notes et absences — saisie enseignant, consultation responsable (F4.1, F4.3)";

  return (
    <FullWidthPage>
      <FullWidthHeader>
        <PageHeader
          className="mb-0"
          title={pageTitle}
          badge="Module F4"
          description={pageDescription}
          icon={ClipboardList}
          actionLabel={canSaisir ? "Saisir une note" : undefined}
          onAction={canSaisir ? () => openModal({ type: "note" }) : undefined}
        />
      </FullWidthHeader>

      <FullWidthKpiGrid cols={4}>
        <KpiCard
          label={isEtudiant ? "Mes notes" : "Notes enregistrées"}
          value={stats.notes}
          icon={FileText}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <KpiCard
          label={isEtudiant ? "Ma moyenne" : "Moyenne générale"}
          value={stats.moyenne !== null ? `${stats.moyenne.toFixed(1)}/20` : "—"}
          icon={TrendingUp}
          color={stats.moyenne !== null && stats.moyenne < 10 ? "text-red-600" : "text-emerald-600"}
          bg={stats.moyenne !== null && stats.moyenne < 10 ? "bg-red-50" : "bg-emerald-50"}
        />
        <KpiCard
          label={isEtudiant ? "Mes absences" : "Absences enregistrées"}
          value={stats.absences}
          icon={ClipboardList}
          color="text-gray-600"
          bg="bg-gray-100"
        />
        <KpiCard
          label="Non justifiées"
          value={stats.nonJustifiees}
          icon={AlertTriangle}
          color="text-red-600"
          bg="bg-red-50"
          pct={stats.absences ? 100 - stats.tauxJustification : undefined}
        />
      </FullWidthKpiGrid>

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 sm:px-4 lg:px-5">
          <TabsList className="h-10 bg-gray-100">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="absences">Absences</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="notes" className="mt-0 flex-1 data-[state=inactive]:hidden">
          <FullWidthSection
            title={`Grille de notes${notesPeriode !== "Toutes" ? ` — ${notesPeriode}` : ""}`}
            subtitle={filteredSubtitle(notesFiltered.length, notesHasFilters)}
            headerAction={
              <div className="flex items-center gap-2">
                {notesHasFilters && <ResetFiltersButton onClick={resetNotesFilters} />}
                {canSaisir && (
                  <Button
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-700"
                    onClick={() => openModal({ type: "note" })}
                  >
                    <ClipboardEdit className="size-4" />
                    Saisir
                  </Button>
                )}
              </div>
            }
            toolbar={
              !isEtudiant ? (
                <Toolbar
                  search={notesSearch}
                  onSearch={(v) => {
                    setNotesSearch(v);
                    notesPagination.setPage(1);
                  }}
                >
                  <Select
                    value={notesClasse}
                    onValueChange={(v) => {
                      setNotesClasse(v);
                      notesPagination.setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-full sm:w-[160px]">
                      <Filter className="mr-1.5 size-3.5 text-gray-400" />
                      <SelectValue placeholder="Classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classesNotes.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={notesPeriode}
                    onValueChange={(v) => {
                      setNotesPeriode(v);
                      notesPagination.setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-full sm:w-[140px]">
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodeOptions.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={notesMatiere}
                    onValueChange={(v) => {
                      setNotesMatiere(v);
                      notesPagination.setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-full sm:w-[180px]">
                      <SelectValue placeholder="Matière" />
                    </SelectTrigger>
                    <SelectContent>
                      {matieresNotes.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Toolbar>
              ) : undefined
            }
            footer={
              notesPagination.paged.length > 0 ? (
                <DataTablePagination
                  page={notesPagination.page}
                  pageSize={notesPagination.pageSize}
                  totalPages={notesPagination.totalPages}
                  total={notesPagination.total}
                  start={notesPagination.start}
                  end={notesPagination.end}
                  onPageChange={notesPagination.setPage}
                  onPageSizeChange={notesPagination.setPageSize}
                />
              ) : undefined
            }
          >
            <ActiveFilterChips chips={notesChips} />

            {notesPagination.paged.length > 0 ? (
              <>
                <MobileOnly>
                  {notesPagination.paged.map((n, idx) => (
                    <MobileCard
                      key={idx}
                      body={
                        <>
                          <div className="flex items-center gap-3">
                            <PersonAvatar
                              initials={studentInitials(n.etudiant)}
                              gradient={
                                n.note !== null && noteSur20(n.note, n.sur) < 10
                                  ? "from-orange-400 to-red-500"
                                  : "from-blue-500 to-blue-700"
                              }
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{n.etudiant}</p>
                              <p className="text-xs text-gray-400">
                                {n.classe} · {n.matiere}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <span className={`font-bold ${noteColor(noteSur20(n.note, n.sur))}`}>
                              {n.note !== null ? `${n.note}/${n.sur}` : "—"}
                            </span>
                            <Badge variant="secondary" className="bg-gray-100 font-normal text-gray-600">
                              ×{n.coefficient}
                            </Badge>
                          </div>
                        </>
                      }
                    />
                  ))}
                </MobileOnly>

                <DesktopOnly>
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="border-gray-100 hover:bg-transparent">
                          <TableHead className={tableHeadClass}>Étudiant</TableHead>
                          <TableHead className={tableHeadClass}>Classe</TableHead>
                          <TableHead className={tableHeadClass}>Matière</TableHead>
                          <TableHead className={tableHeadClass}>Coef.</TableHead>
                          <TableHead className={tableHeadClass}>Note</TableHead>
                          <TableHead className={tableHeadClass}>Période</TableHead>
                          {canEdit && <TableHead className={tableHeadClass}>Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notesPagination.paged.map((n, idx) => (
                          <TableRow key={n.id ?? idx} className={tableRowClass}>
                            <TableCell className="font-medium text-gray-900">
                              {n.etudiant}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{n.classe}</TableCell>
                            <TableCell className="text-sm text-gray-600">{n.matiere}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-gray-100 font-normal text-gray-600">
                                ×{n.coefficient}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={`text-sm font-bold ${noteColor(noteSur20(n.note, n.sur))}`}>
                                {n.note !== null ? `${n.note}/${n.sur}` : "—"}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">{n.periode}</TableCell>
                            {canEdit && n.id && (
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => openModal({ type: "note", editId: n.id })}
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-red-600"
                                    onClick={() => setDeleteTarget({ type: "note", id: n.id! })}
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </DesktopOnly>
              </>
            ) : (
              <EmptyState
                icon={FileText}
                title="Aucune note trouvée"
                description={
                  notesHasFilters
                    ? "Aucune note ne correspond à vos critères."
                    : isEtudiant
                      ? "Aucune note ne vous a encore été attribuée pour ce semestre."
                      : "Aucune note n'a encore été saisie."
                }
                action={
                  notesHasFilters ? (
                    <Button variant="outline" size="sm" onClick={resetNotesFilters}>
                      Effacer les filtres
                    </Button>
                  ) : canSaisir ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => openModal({ type: "note" })}
                    >
                      <ClipboardEdit className="size-4" />
                      Saisir une note
                    </Button>
                  ) : undefined
                }
              />
            )}
          </FullWidthSection>
        </TabsContent>

        <TabsContent value="absences" className="mt-0 flex-1 data-[state=inactive]:hidden">
          <FullWidthSection
            title="Registre des absences"
            subtitle={filteredSubtitle(absencesFiltered.length, absHasFilters)}
            headerAction={
              <div className="flex items-center gap-2">
                {absHasFilters && <ResetFiltersButton onClick={resetAbsFilters} />}
                {canSaisir && (
                  <Button
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-700"
                    onClick={() => openModal({ type: "absence" })}
                  >
                    <CalendarX2 className="size-4" />
                    Saisir
                  </Button>
                )}
              </div>
            }
            toolbar={
              !isEtudiant ? (
                <Toolbar
                  search={absSearch}
                  onSearch={(v) => {
                    setAbsSearch(v);
                    absencesPagination.setPage(1);
                  }}
                >
                  <Select
                    value={absClasse}
                    onValueChange={(v) => {
                      setAbsClasse(v);
                      absencesPagination.setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-full sm:w-[160px]">
                      <Filter className="mr-1.5 size-3.5 text-gray-400" />
                      <SelectValue placeholder="Classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classesAbs.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={absStatut}
                    onValueChange={(v) => {
                      setAbsStatut(v);
                      absencesPagination.setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-full sm:w-[160px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Toutes">Toutes</SelectItem>
                      <SelectItem value="Justifiées">Justifiées</SelectItem>
                      <SelectItem value="Non justifiées">Non justifiées</SelectItem>
                    </SelectContent>
                  </Select>
                </Toolbar>
              ) : undefined
            }
            footer={
              absencesPagination.paged.length > 0 ? (
                <>
                  <DataTablePagination
                    page={absencesPagination.page}
                    pageSize={absencesPagination.pageSize}
                    totalPages={absencesPagination.totalPages}
                    total={absencesPagination.total}
                    start={absencesPagination.start}
                    end={absencesPagination.end}
                    onPageChange={absencesPagination.setPage}
                    onPageSizeChange={absencesPagination.setPageSize}
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 text-blue-500" /> Absences justifiées
                    </span>
                    <span className="flex items-center gap-1.5">
                      <XCircle className="size-4 text-red-500" /> Non justifiées (alimentent l&apos;IA)
                    </span>
                  </div>
                </>
              ) : undefined
            }
          >
            <ActiveFilterChips chips={absChips} />

            {absencesPagination.paged.length > 0 ? (
              <>
                <MobileOnly>
                  {absencesPagination.paged.map((a, idx) => (
                    <MobileCard
                      key={idx}
                      body={
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <PersonAvatar
                                initials={studentInitials(a.etudiant)}
                                gradient={
                                  a.justifiee ? "from-blue-500 to-blue-700" : "from-orange-400 to-red-500"
                                }
                              />
                              <div>
                                <p className="font-semibold text-gray-900">{a.etudiant}</p>
                                <p className="text-xs text-gray-400">{a.classe}</p>
                              </div>
                            </div>
                            {a.justifiee ? (
                              <StatusBadge label="Justifiée" className="bg-blue-50 text-blue-700" />
                            ) : (
                              <StatusBadge label="Non justifiée" className="bg-red-50 text-red-500" />
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                            <span>{a.matiere}</span>
                            <span>{a.date}</span>
                          </div>
                        </>
                      }
                    />
                  ))}
                </MobileOnly>

                <DesktopOnly>
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="border-gray-100 hover:bg-transparent">
                          <TableHead className={tableHeadClass}>Étudiant</TableHead>
                          <TableHead className={tableHeadClass}>Classe</TableHead>
                          <TableHead className={tableHeadClass}>Matière</TableHead>
                          <TableHead className={tableHeadClass}>Date</TableHead>
                          <TableHead className={tableHeadClass}>Justifiée</TableHead>
                          {canEdit && <TableHead className={tableHeadClass}>Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {absencesPagination.paged.map((a, idx) => (
                          <TableRow key={a.id ?? idx} className={tableRowClass}>
                            <TableCell className="font-medium text-gray-900">
                              {a.etudiant}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{a.classe}</TableCell>
                            <TableCell className="text-sm text-gray-600">{a.matiere}</TableCell>
                            <TableCell className="text-sm text-gray-600">{a.date}</TableCell>
                            <TableCell>
                              {a.justifiee ? (
                                <StatusBadge label="Justifiée" className="bg-blue-50 text-blue-700" />
                              ) : (
                                <StatusBadge label="Non justifiée" className="bg-red-50 text-red-500" />
                              )}
                            </TableCell>
                            {canEdit && a.id && (
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => openModal({ type: "absence", editId: a.id })}
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-red-600"
                                    onClick={() => setDeleteTarget({ type: "absence", id: a.id! })}
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </DesktopOnly>
              </>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="Aucune absence trouvée"
                description={
                  absHasFilters
                    ? "Aucune absence ne correspond à vos critères."
                    : isEtudiant
                      ? "Vous n'avez aucune absence enregistrée. Continuez ainsi !"
                      : "Aucune absence n'a encore été enregistrée."
                }
                action={
                  absHasFilters ? (
                    <Button variant="outline" size="sm" onClick={resetAbsFilters}>
                      Effacer les filtres
                    </Button>
                  ) : undefined
                }
              />
            )}
          </FullWidthSection>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer {deleteTarget?.type === "note" ? "cette note" : "cette absence"} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible et journalisée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Annuler</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleConfirmDelete}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FullWidthPage>
  );
}
