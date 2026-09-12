import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { LiveMonitoringView } from "./components/LiveMonitoringView";
import { GroupsView } from "./components/GroupsView";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { ResultsView } from "./components/ResultsView";
import { StudentDetailModal } from "./components/StudentDetailModal";
import { QuestionsView } from "./components/QuestionsView";
import { QuestionModal } from "./components/QuestionModal";
import { ExamConfigView } from "./components/ExamConfigView";
import { AdminLogin } from "./components/AdminLogin";
import { supabase } from "./lib/supabase";
import { readStorage, writeStorage, removeStorage } from "./lib/storage";
import type { ExamResult, Question, TabType, ExamSettings, ExamGroup, LiveStudentTelemetry } from "./types";
import { Bell } from "lucide-react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return readStorage("monday_admin_auth") === "true";
  });
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [results, setResults] = useState<ExamResult[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [groups, setGroups] = useState<ExamGroup[]>([]);
  const [liveStudents, setLiveStudents] = useState<Record<string, LiveStudentTelemetry>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);


  // Realtime Live Toast Notification
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);

  // Group Filter for Results
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("all");

  // Inspector Modal
  const [inspectingResult, setInspectingResult] = useState<ExamResult | null>(null);

  // Question CRUD Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Group Create Modal
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Settings
  const [settings, setSettings] = useState<ExamSettings>(() => {
    const saved = readStorage("monday_exam_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return {
      counts: { HTML: 30, CSS: 30, JavaScript: 30, Python: 30 },
      durationMinutes: 60,
      maxViolations: 3,
      penaltyPerViolation: 1,
      enforceFullscreen: true,
      shuffleQuestions: true,
      shuffleOptions: true,
    };
  });

  function showNotification(msg: string) {
    setRealtimeNotification(msg);
    setTimeout(() => setRealtimeNotification(null), 4000);
  }

  async function loadData() {
    setIsRefreshing(true);
    try {
      // 1. Fetch results
      const { data: resultsData, error: resultsError } = await supabase
        .from("results")
        .select("*")
        .order("id", { ascending: false });

      if (!resultsError && resultsData) {
        const parsedResults = resultsData.map((r: any): ExamResult => {
          const answers = typeof r.answers === "string" ? (() => { try { return JSON.parse(r.answers); } catch { return {}; } })() : (r.answers || {});
          const categoryOrder = typeof r.category_order === "string" ? (() => { try { return JSON.parse(r.category_order); } catch { return undefined; } })() : r.category_order;
          const optionOrders = typeof r.option_orders === "string" ? (() => { try { return JSON.parse(r.option_orders); } catch { return undefined; } })() : r.option_orders;
          const dragOrders = typeof r.drag_orders === "string" ? (() => { try { return JSON.parse(r.drag_orders); } catch { return undefined; } })() : r.drag_orders;
          const rawGroup = r.group_code || (answers as any)?._meta?.group_code;
          const cleanGroup = rawGroup ? String(rawGroup).trim().toUpperCase() : undefined;

          return {
            ...r,
            answers,
            category_order: categoryOrder,
            option_orders: optionOrders,
            drag_orders: dragOrders,
            group_code: cleanGroup,
          };
        });
        setResults(parsedResults);
      }

      // 2. Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .order("id", { ascending: true });

      if (!questionsError && questionsData) {
        setQuestions(
          questionsData.map((row: any): Question => {
            let answerVal = row.answer;
            if (row.type === "truefalse") {
              answerVal = row.answer === "true" || row.answer === true;
            }
            return {
              id: Number(row.id),
              type: row.type,
              category: row.category,
              topic: row.topic,
              question: row.question,
              options: row.options || undefined,
              answer: answerVal,
              hint: row.hint || "",
              points: Number(row.points) || 1,
              placeholder: row.placeholder || undefined,
              accepted: row.accepted || undefined,
              tokens: row.tokens || undefined,
              correctOrder: row.correct_order || row.correctOrder || undefined,
              brokenCode: row.broken_code || row.brokenCode || undefined,
            } as Question;
          })
        );
      }

      // 3. Fetch groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("exam_groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (!groupsError && groupsData) {
        const parsed = groupsData.map((g: any) => ({
          id: g.id,
          group_name: g.group_name,
          group_code: g.group_code ? g.group_code.trim().toUpperCase() : "",
          counts: typeof g.counts === "string" ? JSON.parse(g.counts) : g.counts,
          duration_minutes: Number(g.duration_minutes) || 60,
          max_students: Number(g.max_students) || 30,
          is_active: g.is_active !== false,
          created_at: g.created_at,
        }));
        setGroups(parsed);
        writeStorage("monday_exam_groups_cache", JSON.stringify(parsed));
      } else {
        const cached = readStorage("monday_exam_groups_cache");
        if (cached) setGroups(JSON.parse(cached));
      }

      // 4. Fetch settings
      const { data: settingsData } = await supabase
        .from("exam_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (settingsData) {
        const loadedSettings: ExamSettings = {
          counts: typeof settingsData.counts === "string" ? JSON.parse(settingsData.counts) : settingsData.counts,
          durationMinutes: Number(settingsData.duration_minutes) || 60,
          maxViolations: Number(settingsData.max_violations) || 3,
          penaltyPerViolation: Number(settingsData.penalty_per_violation) || 1,
          enforceFullscreen: settingsData.enforce_fullscreen !== false,
          shuffleQuestions: settingsData.shuffle_questions !== false,
          shuffleOptions: settingsData.shuffle_options !== false,
        };
        setSettings(loadedSettings);
        writeStorage("monday_exam_settings", JSON.stringify(loadedSettings));
      }
    } catch (err) {
      console.error("Data load failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }

  // Initial Load and Supabase Realtime Channels
  useEffect(() => {
    loadData();

    // ⚡ 1. Realtime channel for RESULTS
    const resultsChannel = supabase
      .channel("admin_realtime_results")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "results" },
        (payload) => {
          const raw = payload.new as any;
          const answers = typeof raw.answers === "string" ? (() => { try { return JSON.parse(raw.answers); } catch { return {}; } })() : (raw.answers || {});
          const categoryOrder = typeof raw.category_order === "string" ? (() => { try { return JSON.parse(raw.category_order); } catch { return undefined; } })() : raw.category_order;
          const optionOrders = typeof raw.option_orders === "string" ? (() => { try { return JSON.parse(raw.option_orders); } catch { return undefined; } })() : raw.option_orders;
          const dragOrders = typeof raw.drag_orders === "string" ? (() => { try { return JSON.parse(raw.drag_orders); } catch { return undefined; } })() : raw.drag_orders;
          const rawGroup = raw.group_code || (answers as any)?._meta?.group_code;
          const cleanGroup = rawGroup ? String(rawGroup).trim().toUpperCase() : undefined;

          const newResult: ExamResult = {
            ...raw,
            answers,
            category_order: categoryOrder,
            option_orders: optionOrders,
            drag_orders: dragOrders,
            group_code: cleanGroup,
          };

          setResults((prev) => {
            if (prev.some((r) => r.id === newResult.id)) return prev;
            return [newResult, ...prev];
          });

          // Remove from live active list if present (using composite key or name match)
          setLiveStudents((prev) => {
            const updated = { ...prev };
            const cleanCode = (newResult.group_code || "GENERAL").toUpperCase();
            const compositeKey = `${cleanCode}::${newResult.student_name.trim()}`;
            delete updated[compositeKey];
            delete updated[newResult.student_name];
            return updated;
          });

          showNotification(`Yangi natija: ${newResult.student_name} (${newResult.score} ball)`);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "results" },
        (payload) => {
          const deletedId = (payload.old as any)?.id;
          if (deletedId) {
            setResults((prev) => prev.filter((r) => r.id !== deletedId));
          }
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") console.warn("Realtime status:", status);
      });

    // ⚡ 2. Realtime channel for LIVE STUDENTS TELEMETRY & PRESENCE
    const liveChannel = supabase
      .channel("exam_live_stream_global")
      .on("broadcast", { event: "student_live_telemetry" }, ({ payload }) => {
        const telemetry = payload as LiveStudentTelemetry;
        if (!telemetry || !telemetry.studentName) return;

        const cleanGroup = (telemetry.groupCode || "GENERAL").trim().toUpperCase();
        const studentKey = `${cleanGroup}::${telemetry.studentName.trim()}`;

        setLiveStudents((prev) => {
          if (telemetry.status === "submitted") {
            const next = { ...prev };
            delete next[studentKey];
            delete next[telemetry.studentName];
            return next;
          }
          return {
            ...prev,
            [studentKey]: {
              ...telemetry,
              groupCode: cleanGroup === "GENERAL" ? "" : cleanGroup,
              lastActiveAt: Date.now(),
            },
          };
        });
      })
      .subscribe();

    // ⚡ Periodic cleanup of stale offline students (older than 45 seconds)
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setLiveStudents((prev) => {
        let changed = false;
        const updated = { ...prev };
        for (const [key, data] of Object.entries(prev)) {
          if (now - (data.lastActiveAt || 0) > 45000) {
            if (data.status !== "inactive") {
              updated[key] = { ...data, status: "inactive" };
              changed = true;
            }
          }
        }
        return changed ? updated : prev;
      });
    }, 5000);

    // ⚡ 3. Realtime channel for EXAM_GROUPS
    const groupsChannel = supabase
      .channel("admin_realtime_groups")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exam_groups" },
        async () => {
          const { data } = await supabase.from("exam_groups").select("*").order("created_at", { ascending: false });
          if (data) {
            const parsed = data.map((g: any): ExamGroup => ({
              ...g,
              counts: typeof g.counts === "string" ? JSON.parse(g.counts) : g.counts,
              duration_minutes: Number(g.duration_minutes) || 60,
              max_students: Number(g.max_students) || 30,
              is_active: g.is_active !== false,
            }));
            setGroups(parsed);
            writeStorage("monday_exam_groups_cache", JSON.stringify(parsed));
          }
        }
      )
      .subscribe();

    // ⚡ 4. Realtime channel for QUESTIONS
    const questionsChannel = supabase
      .channel("admin_realtime_questions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "questions" },
        () => {
          loadData();
        }
      )
      .subscribe();

    // Cleanup channels on unmount
    return () => {
      clearInterval(cleanupInterval);
      supabase.removeChannel(resultsChannel);
      supabase.removeChannel(liveChannel);
      supabase.removeChannel(groupsChannel);
      supabase.removeChannel(questionsChannel);
    };
  }, []);


  async function handleCreateGroup(newGroup: Omit<ExamGroup, "id">) {
    const generatedId = `grp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const { data, error } = await supabase
      .from("exam_groups")
      .insert({
        id: generatedId,
        group_name: newGroup.group_name,
        group_code: newGroup.group_code,
        counts: newGroup.counts,
        duration_minutes: newGroup.duration_minutes,
        max_students: newGroup.max_students,
        is_active: newGroup.is_active,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating group:", error);
      alert("Guruh yaratishda xatolik: " + error.message);
      return;
    }

    const createdGroup: ExamGroup = {
      id: data.id,
      group_name: data.group_name,
      group_code: data.group_code,
      counts: typeof data.counts === "string" ? JSON.parse(data.counts) : data.counts,
      duration_minutes: Number(data.duration_minutes) || 60,
      max_students: Number(data.max_students) || 30,
      is_active: data.is_active !== false,
      created_at: data.created_at,
    };

    setGroups((prev) => {
      const updated = [createdGroup, ...prev.filter((g) => g.group_code !== createdGroup.group_code)];
      writeStorage("monday_exam_groups_cache", JSON.stringify(updated));
      return updated;
    });

    showNotification(`Guruh yaratildi: ${createdGroup.group_name} (${createdGroup.group_code})`);
  }

  async function handleToggleGroupStatus(groupCode: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    const cleanCode = groupCode.trim().toUpperCase();
    const { error } = await supabase
      .from("exam_groups")
      .update({ is_active: newStatus })
      .ilike("group_code", cleanCode);

    if (error) {
      console.error("Error toggling group status:", error);
    }

    setGroups((prev) => {
      const updated = prev.map((g) => g.group_code.toUpperCase() === cleanCode ? { ...g, is_active: newStatus } : g);
      writeStorage("monday_exam_groups_cache", JSON.stringify(updated));
      return updated;
    });
  }

  async function handleDeleteGroup(groupCode: string, deleteResults: boolean = true) {
    const cleanCode = groupCode.trim().toUpperCase();

    // 1. Delete from exam_groups table
    try {
      await supabase
        .from("exam_groups")
        .delete()
        .ilike("group_code", cleanCode);
    } catch (err) {
      console.warn("Error deleting from exam_groups:", err);
    }

    // 2. If deleteResults is true, delete from results table
    if (deleteResults) {
      try {
        await supabase
          .from("results")
          .delete()
          .ilike("group_code", cleanCode);
      } catch (err) {
        console.warn("Error deleting from results:", err);
      }

      setResults((prev) =>
        prev.filter((r) => {
          const rCode = (r.group_code || r.answers?._meta?.group_code || "").toString().trim().toUpperCase();
          return rCode !== cleanCode;
        })
      );
    }

    // 3. Update groups state and cache
    setGroups((prev) => {
      const updated = prev.filter((g) => g.group_code.toUpperCase() !== cleanCode);
      writeStorage("monday_exam_groups_cache", JSON.stringify(updated));
      return updated;
    });

    showNotification(`Guruh o'chirildi: ${cleanCode}`);
  }

  function handleViewResultsForGroup(groupCode: string) {
    setSelectedGroupFilter(groupCode);
    setActiveTab("results");
  }


  async function handleSaveQuestion(q: Question) {
    const record = {
      id: q.id,
      type: q.type,
      category: q.category,
      topic: q.topic,
      question: q.question,
      options: (q as any).options || null,
      answer: (q as any).answer !== undefined ? String((q as any).answer) : null,
      hint: q.hint || null,
      points: q.points || 1,
      placeholder: (q as any).placeholder || null,
      accepted: (q as any).accepted || null,
      tokens: (q as any).tokens || null,
      correct_order: (q as any).correctOrder || null,
      broken_code: (q as any).brokenCode || null,
    };

    const { error } = await supabase.from("questions").upsert(record, { onConflict: "id" });
    if (error) throw error;
    await loadData();
  }

  async function handleImportQuestions(importedQuestions: Question[]) {
    const records = importedQuestions.map((q) => ({
      id: q.id,
      type: q.type,
      category: q.category,
      topic: q.topic,
      question: q.question,
      options: (q as any).options || null,
      answer: (q as any).answer !== undefined ? String((q as any).answer) : null,
      hint: q.hint || null,
      points: q.points || 1,
      placeholder: (q as any).placeholder || null,
      accepted: (q as any).accepted || null,
      tokens: (q as any).tokens || null,
      correct_order: (q as any).correctOrder || null,
      broken_code: (q as any).brokenCode || null,
    }));

    const { error } = await supabase.from("questions").upsert(records, { onConflict: "id" });
    if (error) throw error;
    await loadData();
    showNotification(`${importedQuestions.length} ta savol bazaga qo'shildi`);
  }

  async function handleDeleteQuestion(id: number) {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) {
      alert("Savolni o'chirishda xatolik yuz berdi");
    } else {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  }

  async function handleDeleteResult(id: number) {
    const { error } = await supabase.from("results").delete().eq("id", id);
    if (error) {
      alert("Natijani o'chirishda xatolik yuz berdi");
    } else {
      setResults((prev) => prev.filter((r) => r.id !== id));
    }
  }

  async function handleSaveCorrection(
    resultId: number,
    questionId: number,
    override: boolean | null,
    scoreDelta: number,
  ) {
    const currentResult = results.find((item) => item.id === resultId);
    if (!currentResult) return;

    const currentAnswers = typeof currentResult.answers === "string"
      ? (() => { try { return JSON.parse(currentResult.answers); } catch { return {}; } })()
      : currentResult.answers || {};
    const nextMeta = { ...(currentAnswers._meta || {}), admin_overrides: { ...(currentAnswers._meta?.admin_overrides || {}) } };

    if (override === null) delete nextMeta.admin_overrides[String(questionId)];
    else nextMeta.admin_overrides[String(questionId)] = override;

    const nextAnswers = { ...currentAnswers, _meta: nextMeta };
    const nextScore = Math.max(0, Number(currentResult.score) + scoreDelta);
    const { error } = await supabase
      .from("results")
      .update({ answers: nextAnswers, score: nextScore })
      .eq("id", resultId);

    if (error) {
      alert("Natijani tuzatishda xatolik yuz berdi");
      return;
    }

    const updatedResult = { ...currentResult, answers: nextAnswers, score: nextScore };
    setResults((prev) => prev.map((item) => item.id === resultId ? updatedResult : item));
    setInspectingResult((current) => current?.id === resultId ? updatedResult : current);
  }

  async function handleSaveSettings(newSettings: ExamSettings) {
    setSettings(newSettings);
    writeStorage("monday_exam_settings", JSON.stringify(newSettings));

    try {
      await supabase.from("exam_settings").upsert({
        id: 1,
        counts: newSettings.counts,
        duration_minutes: newSettings.durationMinutes,
        max_violations: newSettings.maxViolations ?? 3,
        penalty_per_violation: newSettings.penaltyPerViolation ?? 1,
        enforce_fullscreen: newSettings.enforceFullscreen !== false,
        shuffle_questions: newSettings.shuffleQuestions !== false,
        shuffle_options: newSettings.shuffleOptions !== false,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Could not save to remote exam_settings:", err);
    }
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased relative">
      {/* Realtime Toast Notification */}
      {realtimeNotification && (
        <div className="fixed top-5 right-5 z-50 animate-slide-down bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center">
            <Bell size={18} className="text-emerald-200" />
          </div>
          <span className="text-sm font-semibold">{realtimeNotification}</span>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        resultCount={results.length}
        questionCount={questions.length}
        groupCount={groups.length}
        liveCount={Object.values(liveStudents).filter((s) => s.status !== "submitted" && s.status !== "inactive").length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <Header
          activeTab={activeTab}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          onLogout={() => {
            removeStorage("monday_admin_auth");
            setIsAuthenticated(false);
          }}
        />

        <main className="p-8 max-w-7xl w-full mx-auto flex-1">
          {inspectingResult ? (
            <StudentDetailModal
              result={inspectingResult}
              questions={questions}
              fullPage
              onClose={() => setInspectingResult(null)}
              onSaveCorrection={handleSaveCorrection}
            />
          ) : <>
            {activeTab === "dashboard" && (
              <DashboardView
                results={results}
                questions={questions}
                liveStudents={Object.values(liveStudents)}
                setActiveTab={setActiveTab}
                onInspectStudent={setInspectingResult}
              />
            )}

            {activeTab === "live" && (
              <LiveMonitoringView
                liveStudents={Object.values(liveStudents)}
                groups={groups}
              />
            )}

            {activeTab === "groups" && (

              <GroupsView
                groups={groups}
                results={results}
                onAddGroup={() => setIsGroupModalOpen(true)}
                onToggleGroupStatus={handleToggleGroupStatus}
                onDeleteGroup={handleDeleteGroup}
                onViewResultsForGroup={handleViewResultsForGroup}
              />
            )}

            {activeTab === "results" && (
              <ResultsView
                results={results}
                groups={groups}
                selectedGroupFilter={selectedGroupFilter}
                onGroupFilterChange={setSelectedGroupFilter}
                onInspectStudent={setInspectingResult}
                onDeleteResult={handleDeleteResult}
              />
            )}

            {activeTab === "questions" && (
              <QuestionsView
                questions={questions}
                onAddQuestion={() => {
                  setEditingQuestion(null);
                  setIsQuestionModalOpen(true);
                }}
                onEditQuestion={(q) => {
                  setEditingQuestion(q);
                  setIsQuestionModalOpen(true);
                }}
                onDeleteQuestion={handleDeleteQuestion}
                onImportQuestions={handleImportQuestions}
              />
            )}

            {activeTab === "settings" && (
              <ExamConfigView
                settings={settings}
                questions={questions}
                onSaveSettings={handleSaveSettings}
              />
            )}
          </>}
        </main>
      </div>

      {/* Add / Edit Question Modal */}
      <QuestionModal
        key={editingQuestion?.id ?? "new-question"}
        isOpen={isQuestionModalOpen}
        question={editingQuestion}
        existingQuestions={questions}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSave={handleCreateGroup}
      />
    </div>
  );
}
