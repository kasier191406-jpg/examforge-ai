import { motion } from "framer-motion";
import { Download, FileText, RefreshCcw, Save, Trash2, UploadCloud, Wand2 } from "lucide-react";
import { FormEvent, ReactNode, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  downloadExport,
  examforgeApi,
  type Module,
  type Paper,
  type Question,
  type QuestionPayload,
  type Settings,
  type Subject,
} from "../services/examforgeApi";

const chartColors = ["#0891b2", "#7c3aed", "#db2777", "#059669", "#f59e0b", "#ef4444"];
const difficulties = ["Easy", "Medium", "Hard"];
const blooms = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const navigate = useNavigate();
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">ExamForge AI</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={() => navigate("/generate")}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background"
      >
        <Wand2 className="h-4 w-4" />
        Generate Paper
      </button>
    </div>
  );
}

function Surface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-lg border border-white/50 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-card/75 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function useCoreData() {
  const subjects = useQuery({ queryKey: ["subjects"], queryFn: examforgeApi.subjects });
  const modules = useQuery({ queryKey: ["modules"], queryFn: examforgeApi.modules });
  return { subjects, modules };
}

function statusText(error: unknown) {
  return error instanceof Error ? error.message : "Action failed";
}

export function DashboardPage() {
  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: examforgeApi.dashboard });
  const data = dashboard.data;
  return (
    <div>
      <PageHeader title="Command Center" subtitle="Database-backed view of question bank quality, generation activity, and Bloom coverage." />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(data?.kpis ?? []).map((item: { label: string; value: number; trend: string }) => (
          <Surface key={item.label}>
            <div className="mb-4 h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500" />
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{item.trend}</p>
          </Surface>
        ))}
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <Surface>
          <h3 className="mb-4 font-semibold">Bloom Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.bloom_distribution ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {(data?.bloom_distribution ?? []).map((entry: { name: string }, index: number) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Surface>
        <Surface>
          <h3 className="mb-4 font-semibold">Recent Activity</h3>
          <div className="space-y-3">
            {(data?.recent_activity ?? []).map((item: { action: string; detail: string; created_at: string }) => (
              <div key={`${item.action}-${item.created_at}`} className="rounded-md border bg-background/70 p-3 text-sm">
                <p className="font-medium">{item.action}</p>
                <p className="text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </Surface>
      </section>
    </div>
  );
}

const emptyQuestion = (subjects: Subject[], modules: Module[]): QuestionPayload => ({
  subject_id: subjects[0]?.id ?? 0,
  module_id: modules[0]?.id ?? 0,
  text: "",
  marks: 5,
  difficulty: "Medium",
  bloom_level: "Understand",
  question_type: "descriptive",
  keywords: "",
  model_answer: "",
  is_active: true,
});

export function QuestionsPage() {
  const queryClient = useQueryClient();
  const { subjects, modules } = useCoreData();
  const questions = useQuery({ queryKey: ["questions"], queryFn: examforgeApi.questions });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<QuestionPayload>(emptyQuestion(subjects.data ?? [], modules.data ?? []));
  const [message, setMessage] = useState("");

  const saveQuestion = useMutation({
    mutationFn: () => (editingId ? examforgeApi.updateQuestion(editingId, form) : examforgeApi.createQuestion(form)),
    onSuccess: () => {
      setMessage(editingId ? "Question updated" : "Question created");
      setEditingId(null);
      setForm(emptyQuestion(subjects.data ?? [], modules.data ?? []));
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => setMessage(statusText(error)),
  });
  const deleteQuestion = useMutation({
    mutationFn: examforgeApi.deleteQuestion,
    onSuccess: () => {
      setMessage("Question deleted");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (error) => setMessage(statusText(error)),
  });

  const startEdit = (question: Question) => {
    setEditingId(question.id);
    setForm({
      subject_id: question.subject_id,
      module_id: question.module_id,
      text: question.text,
      marks: question.marks,
      difficulty: question.difficulty,
      bloom_level: question.bloom_level,
      question_type: question.question_type,
      keywords: question.keywords,
      model_answer: question.model_answer,
      is_active: question.is_active,
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveQuestion.mutate();
  };

  return (
    <div>
      <PageHeader title="Question Bank" subtitle="Create, update, delete, and persist Bloom-tagged questions in the FastAPI database." />
      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.4fr]">
        <Surface>
          <h3 className="mb-4 font-semibold">{editingId ? "Edit Question" : "Create Question"}</h3>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <select className="h-10 w-full rounded-md border bg-background px-3" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: Number(e.target.value) })}>
              {(subjects.data ?? []).map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
            <select className="h-10 w-full rounded-md border bg-background px-3" value={form.module_id} onChange={(e) => setForm({ ...form, module_id: Number(e.target.value) })}>
              {(modules.data ?? []).filter((module) => module.subject_id === form.subject_id).map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
            </select>
            <textarea className="min-h-28 w-full rounded-md border bg-background p-3" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Question text" />
            <div className="grid grid-cols-3 gap-2">
              <input className="h-10 rounded-md border bg-background px-3" type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })} />
              <select className="h-10 rounded-md border bg-background px-3" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>{difficulties.map((item) => <option key={item}>{item}</option>)}</select>
              <select className="h-10 rounded-md border bg-background px-3" value={form.bloom_level} onChange={(e) => setForm({ ...form, bloom_level: e.target.value })}>{blooms.map((item) => <option key={item}>{item}</option>)}</select>
            </div>
            <input className="h-10 w-full rounded-md border bg-background px-3" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="Keywords" />
            <textarea className="min-h-20 w-full rounded-md border bg-background p-3" value={form.model_answer} onChange={(e) => setForm({ ...form, model_answer: e.target.value })} placeholder="Model answer" />
            <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary font-medium text-primary-foreground" type="submit">
              <Save className="h-4 w-4" /> {editingId ? "Update Question" : "Create Question"}
            </button>
            {editingId && <button className="h-10 w-full rounded-md border bg-background" type="button" onClick={() => { setEditingId(null); setForm(emptyQuestion(subjects.data ?? [], modules.data ?? [])); }}>Cancel Edit</button>}
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </form>
        </Surface>
        <Surface>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr><th className="py-3">Question</th><th>Subject</th><th>Bloom</th><th>Difficulty</th><th>Marks</th><th>Usage</th><th>Actions</th></tr>
              </thead>
              <tbody className="divide-y">
                {(questions.data ?? []).map((question) => (
                  <tr key={question.id}>
                    <td className="max-w-xl py-3 pr-4">{question.text}</td>
                    <td>{question.subject_name}</td>
                    <td>{question.bloom_level}</td>
                    <td>{question.difficulty}</td>
                    <td>{question.marks}</td>
                    <td>{question.usage_count}</td>
                    <td className="space-x-2">
                      <button className="rounded-md border px-2 py-1" type="button" onClick={() => startEdit(question)}>Edit</button>
                      <button className="rounded-md border px-2 py-1 text-rose-600" type="button" onClick={() => deleteQuestion.mutate(question.id)}><Trash2 className="inline h-3 w-3" /> Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </section>
    </div>
  );
}

export function ImportPage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const importMutation = useMutation({
    mutationFn: (selected: File) => examforgeApi.importQuestions(selected),
    onSuccess: (data) => {
      setResult(`Imported ${data.imported}, skipped ${data.skipped}${data.errors.length ? `: ${data.errors.join("; ")}` : ""}`);
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => setResult(statusText(error)),
  });
  return (
    <div>
      <PageHeader title="Excel Import" subtitle="Upload Excel or CSV files; rows are validated and persisted to the question bank." />
      <Surface className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <label className="grid min-h-72 cursor-pointer place-items-center rounded-lg border border-dashed bg-background/70 p-8 text-center">
          <input className="hidden" type="file" accept=".xlsx,.xls,.csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <div>
            <UploadCloud className="mx-auto h-10 w-10 text-cyan-600" />
            <h3 className="mt-4 font-semibold">{file ? file.name : "Choose Excel or CSV file"}</h3>
            <p className="mt-2 text-sm text-muted-foreground">Required: subject, module, text, marks, difficulty, bloom_level.</p>
          </div>
        </label>
        <div className="space-y-3">
          <button className="h-10 w-full rounded-md bg-primary text-primary-foreground" type="button" disabled={!file} onClick={() => file && importMutation.mutate(file)}>Validate and Import</button>
          <a className="block rounded-md border bg-background/70 p-3 text-sm" href="/samples/questions_import_template.csv">Download CSV template</a>
          {result && <p className="rounded-md border bg-background/70 p-3 text-sm">{result}</p>}
        </div>
      </Surface>
    </div>
  );
}

export function TemplatesPage() {
  const queryClient = useQueryClient();
  const templates = useQuery({ queryKey: ["templates"], queryFn: examforgeApi.templates });
  const [name, setName] = useState("");
  const createTemplate = useMutation({
    mutationFn: () => examforgeApi.createTemplate({ name, duration_minutes: 90, total_marks: 40, sections: 3, instructions: "Generated by ExamForge AI." }),
    onSuccess: () => { setName(""); queryClient.invalidateQueries({ queryKey: ["templates"] }); },
  });
  return (
    <div>
      <PageHeader title="Exam Templates" subtitle="Reusable persisted blueprints for assessment formats." />
      <Surface className="mb-4">
        <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); createTemplate.mutate(); }}>
          <input className="h-10 flex-1 rounded-md border bg-background px-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="New template name" />
          <button className="h-10 rounded-md bg-primary px-4 text-primary-foreground" type="submit">Create</button>
        </form>
      </Surface>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(templates.data ?? []).map((template) => (
          <Surface key={template.id}>
            <h3 className="text-lg font-semibold">{template.name}</h3>
            <p className="mt-4 text-3xl font-semibold">{template.total_marks}</p>
            <p className="text-sm text-muted-foreground">marks | {template.duration_minutes} min | {template.sections} sections</p>
          </Surface>
        ))}
      </section>
    </div>
  );
}

export function GeneratePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { subjects, modules } = useCoreData();
  const [subjectId, setSubjectId] = useState(0);
  const [title, setTitle] = useState("Generated End Semester Paper");
  const [marks, setMarks] = useState(40);
  const [duration, setDuration] = useState(90);
  const [sections, setSections] = useState(3);
  const effectiveSubject = subjectId || subjects.data?.[0]?.id || 0;
  const generate = useMutation({
    mutationFn: () => examforgeApi.generatePaper({
      title,
      subject_id: effectiveSubject,
      module_ids: (modules.data ?? []).filter((module) => module.subject_id === effectiveSubject).map((module) => module.id),
      total_marks: marks,
      duration_minutes: duration,
      sections,
      difficulty_distribution: { Easy: 30, Medium: 50, Hard: 20 },
      bloom_distribution: { Remember: 15, Understand: 20, Apply: 25, Analyze: 20, Evaluate: 10, Create: 10 },
      internal_choices: false,
    }),
    onSuccess: (paper) => {
      queryClient.invalidateQueries({ queryKey: ["papers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate(`/preview?paperId=${paper.id}`);
    },
  });
  return (
    <div>
      <PageHeader title="Generate Paper" subtitle="Create and persist a real question paper with exact total marks." />
      <Surface className="grid gap-4 lg:grid-cols-2">
        <label><span className="text-sm font-medium">Title</span><input className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label><span className="text-sm font-medium">Subject</span><select className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={effectiveSubject} onChange={(e) => setSubjectId(Number(e.target.value))}>{(subjects.data ?? []).map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
        <label><span className="text-sm font-medium">Total marks</span><input className="mt-1 h-10 w-full rounded-md border bg-background px-3" type="number" value={marks} onChange={(e) => setMarks(Number(e.target.value))} /></label>
        <label><span className="text-sm font-medium">Duration minutes</span><input className="mt-1 h-10 w-full rounded-md border bg-background px-3" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></label>
        <label><span className="text-sm font-medium">Sections</span><input className="mt-1 h-10 w-full rounded-md border bg-background px-3" type="number" value={sections} onChange={(e) => setSections(Number(e.target.value))} /></label>
        <button className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 font-medium text-primary-foreground" type="button" onClick={() => generate.mutate()}>
          <RefreshCcw className="h-4 w-4" /> Generate Balanced Draft
        </button>
        {generate.error && <p className="text-sm text-rose-600 lg:col-span-2">{statusText(generate.error)}</p>}
      </Surface>
    </div>
  );
}

export function PreviewPage() {
  const params = new URLSearchParams(window.location.search);
  const requestedPaperId = Number(params.get("paperId") ?? 0);
  const papers = useQuery({ queryKey: ["papers"], queryFn: examforgeApi.papers });
  const selected = useMemo<Paper | undefined>(() => papers.data?.find((paper) => paper.id === requestedPaperId) ?? papers.data?.[0], [papers.data, requestedPaperId]);
  const [exporting, setExporting] = useState("");
  const handleExport = async (type: "pdf" | "docx") => {
    if (!selected) return;
    setExporting(`Exporting ${type.toUpperCase()}...`);
    await downloadExport(selected.id, type);
    setExporting(`${type.toUpperCase()} exported`);
  };
  return (
    <div>
      <PageHeader title="Preview Editor" subtitle="Preview real generated papers and export actual PDF or DOCX files." />
      <Surface>
        <div className="mb-4 flex gap-2">
          <button className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm" type="button" onClick={() => handleExport("pdf")}><Download className="h-4 w-4" />PDF</button>
          <button className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm" type="button" onClick={() => handleExport("docx")}><FileText className="h-4 w-4" />DOCX</button>
          {exporting && <span className="self-center text-sm text-muted-foreground">{exporting}</span>}
        </div>
        <div className="rounded-lg border bg-background p-6">
          <h3 className="text-center text-xl font-semibold">Tech University</h3>
          <p className="text-center text-sm text-muted-foreground">{selected?.title} | {selected?.subject_name} | {selected?.total_marks} Marks</p>
          <ol className="mt-6 space-y-4 text-sm">
            {(selected?.items ?? []).map((item) => <li key={item.id}>{item.sequence}. {item.text} <span className="font-medium">[{item.marks}]</span></li>)}
          </ol>
        </div>
      </Surface>
    </div>
  );
}

export function HistoryPage() {
  const navigate = useNavigate();
  const papers = useQuery({ queryKey: ["papers"], queryFn: examforgeApi.papers });
  return (
    <div>
      <PageHeader title="Paper History" subtitle="Load real generated papers from the database and reopen or export them." />
      <Surface>
        <div className="grid gap-3">
          {(papers.data ?? []).map((paper) => (
            <div key={paper.id} className="flex flex-col justify-between gap-2 rounded-md border bg-background/70 p-3 sm:flex-row sm:items-center">
              <div><p className="font-medium">{paper.title}</p><p className="text-sm text-muted-foreground">{paper.subject_name} | {paper.total_marks} marks</p></div>
              <div className="flex gap-2">
                <button className="rounded-md border px-3 py-1 text-sm" type="button" onClick={() => navigate(`/preview?paperId=${paper.id}`)}>Open</button>
                <button className="rounded-md border px-3 py-1 text-sm" type="button" onClick={() => downloadExport(paper.id, "pdf")}>PDF</button>
                <button className="rounded-md border px-3 py-1 text-sm" type="button" onClick={() => downloadExport(paper.id, "docx")}>DOCX</button>
              </div>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}

export function AnalyticsPage() {
  const analytics = useQuery({ queryKey: ["analytics"], queryFn: examforgeApi.analytics });
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Charts are computed from live database records." />
      <section className="grid gap-4 xl:grid-cols-3">
        <Surface className="xl:col-span-2">
          <h3 className="mb-4 font-semibold">Generation Trend</h3>
          <div className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={analytics.data?.generation_trends ?? []}><XAxis dataKey="name" /><YAxis /><Tooltip /><Area dataKey="value" fill="#0891b2" stroke="#0891b2" fillOpacity={0.25} /></AreaChart></ResponsiveContainer></div>
        </Surface>
        <Surface>
          <h3 className="mb-4 font-semibold">Difficulty</h3>
          <div className="h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analytics.data?.difficulty_breakdown ?? []} dataKey="value" nameKey="name" innerRadius={55}>{(analytics.data?.difficulty_breakdown ?? []).map((entry: { name: string }, index: number) => <Cell key={entry.name} fill={chartColors[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        </Surface>
      </section>
    </div>
  );
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["settings"], queryFn: examforgeApi.settings });
  const [form, setForm] = useState<Settings | null>(null);
  const active = form ?? settings.data;
  const save = useMutation({
    mutationFn: () => examforgeApi.updateSettings(active!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });
  if (!active) return <PageHeader title="Settings" subtitle="Loading settings..." />;
  return (
    <div>
      <PageHeader title="Settings" subtitle="Persist institution branding, similarity policy, and export instructions." />
      <Surface>
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
          <label><span className="text-sm font-medium">Institution</span><input className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={active.institution_name} onChange={(e) => setForm({ ...active, institution_name: e.target.value })} /></label>
          <label><span className="text-sm font-medium">Logo URL</span><input className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={active.logo_url} onChange={(e) => setForm({ ...active, logo_url: e.target.value })} /></label>
          <label><span className="text-sm font-medium">Similarity threshold</span><input className="mt-1 h-10 w-full rounded-md border bg-background px-3" type="number" step="0.01" min="0" max="1" value={active.similarity_threshold} onChange={(e) => setForm({ ...active, similarity_threshold: Number(e.target.value) })} /></label>
          <label className="lg:col-span-2"><span className="text-sm font-medium">Default instructions</span><textarea className="mt-1 min-h-28 w-full rounded-md border bg-background p-3" value={active.default_instructions} onChange={(e) => setForm({ ...active, default_instructions: e.target.value })} /></label>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-primary-foreground lg:col-span-2" type="submit"><Save className="h-4 w-4" />Save Settings</button>
        </form>
      </Surface>
    </div>
  );
}
