import React, { useState, useEffect } from 'react';
import { Question, QuestionType, QuestionPackage } from '../types';
import { sound } from '../utils/sound';
import {
  Sparkles,
  Bot,
  ListOrdered,
  Save,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  FileJson,
  Download,
  Upload,
  RefreshCw,
  Clock,
  Layers,
  Award,
  Play,
  BookmarkCheck,
  FolderOpen,
  CheckCircle2,
  Calendar,
  Tag,
  ArrowRight,
  Search,
  Filter,
  BookOpen,
  Shuffle,
  Sliders,
  Grid,
} from 'lucide-react';

export const POPULAR_SUBJECT_PRESETS = [
  { name: 'Matematika', icon: '📐', desc: 'Aljabar, Geometri, Logika Hitung' },
  { name: 'Sains IPA', icon: '🔬', desc: 'Eksperimen & Fenomena Alam' },
  { name: 'Fisika', icon: '⚡', desc: 'Gaya, Energi, Gerak, Optika' },
  { name: 'Kimia', icon: '🧪', desc: 'Unsur, Reaksi, Senyawa' },
  { name: 'Biologi', icon: '🧬', desc: 'Sel, Ekosistem, Makhluk Hidup' },
  { name: 'Sejarah', icon: '🏛️', desc: 'Peristiwa Nasional & Dunia' },
  { name: 'Geografi', icon: '🌍', desc: 'Benua, Samudra, Iklim' },
  { name: 'Bahasa Indonesia', icon: '🇮🇩', desc: 'Tata Bahasa, EYD, Sastra' },
  { name: 'Bahasa Inggris', icon: '🇬🇧', desc: 'Vocabulary & Grammar' },
  { name: 'Logika & Penalaran', icon: '🧠', desc: 'Pola Angka, Analogi, Silogisme' },
  { name: 'Teknologi & IT', icon: '💻', desc: 'Komputer, Digital & AI' },
  { name: 'Seni & Budaya', icon: '🎨', desc: 'Musik, Tari, Warisan Budaya' },
  { name: 'Ekonomi & Finansial', icon: '💰', desc: 'Pasar, Uang, Perdagangan' },
];

interface QuestionManagerModalProps {
  questions: Question[];
  onSaveQuestions: (newQuestions: Question[]) => void;
  onClose: () => void;
}

export const QuestionManagerModal: React.FC<QuestionManagerModalProps> = ({
  questions,
  onSaveQuestions,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'gemini' | 'manual' | 'list' | 'presets'>('gemini');
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);

  // Gemini Form state
  const [topic, setTopic] = useState<string>('Sains IPA & Matematika');
  const [difficulty, setDifficulty] = useState<'Mudah' | 'Sedang' | 'Sukar' | 'Campuran'>('Campuran');
  const [questionCount, setQuestionCount] = useState<number>(30);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    'multiple_choice',
    'short_answer',
    'matching',
    'true_false',
  ]);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [appendMode, setAppendMode] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [geminiSuccessMessage, setGeminiSuccessMessage] = useState<string | null>(null);
  const [lastGeneratedPackage, setLastGeneratedPackage] = useState<QuestionPackage | null>(null);

  // Subject Grouping state for AI Generator
  const [subjectMode, setSubjectMode] = useState<'single' | 'multi_subject'>('multi_subject');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Matematika',
    'Sains IPA',
    'Fisika',
    'Sejarah',
  ]);
  const [customSubjectInput, setCustomSubjectInput] = useState<string>('');
  const [groupingOrder, setGroupingOrder] = useState<'grouped' | 'shuffled'>('grouped');
  const [subjectDetails, setSubjectDetails] = useState<string>('');

  // List tab filtering & grouping state
  const [listCategoryFilter, setListCategoryFilter] = useState<string>('all');
  const [listSearchQuery, setListSearchQuery] = useState<string>('');
  const [groupBySubjectView, setGroupBySubjectView] = useState<boolean>(true);

  // Manual Question creation state
  const [manualType, setManualType] = useState<QuestionType>('multiple_choice');
  const [manualCategory, setManualCategory] = useState<string>('Matematika');
  const [manualQuestion, setManualQuestion] = useState<string>('');
  const [manualDifficulty, setManualDifficulty] = useState<'Mudah' | 'Sedang' | 'Sukar'>('Sedang');
  const [manualPoints, setManualPoints] = useState<number>(200);
  const [manualTimeLimit, setManualTimeLimit] = useState<number>(30);
  const [manualExplanation, setManualExplanation] = useState<string>('');
  // For multiple_choice
  const [manualOptions, setManualOptions] = useState<string[]>(['', '', '', '']);
  const [manualCorrectIndex, setManualCorrectIndex] = useState<number>(0);
  // For short_answer
  const [manualCorrectAnswer, setManualCorrectAnswer] = useState<string>('');
  const [manualAcceptedAnswers, setManualAcceptedAnswers] = useState<string>('');
  // For matching
  const [manualPairs, setManualPairs] = useState<Array<{ left: string; right: string }>>([
    { left: '', right: '' },
    { left: '', right: '' },
    { left: '', right: '' },
  ]);
  // For true_false
  const [manualTrueFalse, setManualTrueFalse] = useState<'Benar' | 'Salah'>('Benar');
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string | null>(null);

  // Edit single question state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Bank Soal & Presets state (normalized QuestionPackage)
  const [presetName, setPresetName] = useState<string>('');
  const [packageSearch, setPackageSearch] = useState<string>('');
  const [packageFilter, setPackageFilter] = useState<'all' | 'ai' | 'manual'>('all');
  const [savedPackages, setSavedPackages] = useState<QuestionPackage[]>(() => {
    try {
      const stored = localStorage.getItem('coc_saved_question_presets');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any, idx: number) => {
            const qs: Question[] = Array.isArray(p.questions) ? p.questions : Array.isArray(p.data) ? p.data : [];
            return {
              id: p.id || `pkg_${idx}_${Date.now()}`,
              name: p.name || `Paket Soal #${idx + 1}`,
              topic: p.topic || 'Umum',
              date: p.date || new Date().toISOString(),
              count: qs.length,
              source: p.source || 'preset',
              questions: qs,
            };
          });
        }
      }
    } catch {}
    return [];
  });

  // Sync saved packages with server on mount
  useEffect(() => {
    const fetchServerPackages = async () => {
      try {
        const res = await fetch('/api/saved-packages');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.packages)) {
            setSavedPackages((prev) => {
              const map = new Map<string, QuestionPackage>();
              data.packages.forEach((sp: any) => {
                const qs: Question[] = Array.isArray(sp.questions) ? sp.questions : [];
                map.set(sp.id, {
                  id: sp.id,
                  name: sp.name,
                  topic: sp.topic || 'Umum',
                  date: sp.date || new Date().toISOString(),
                  count: qs.length,
                  source: sp.source || 'ai',
                  questions: qs,
                });
              });
              // Keep any local ones not in server
              prev.forEach((lp) => {
                if (!map.has(lp.id)) {
                  map.set(lp.id, lp);
                  // sync to server in background
                  fetch('/api/saved-packages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(lp),
                  }).catch(() => {});
                }
              });
              const combined = Array.from(map.values());
              localStorage.setItem('coc_saved_question_presets', JSON.stringify(combined));
              return combined;
            });
          }
        }
      } catch (err) {
        console.warn('Could not reach server packages endpoint:', err);
      }
    };
    fetchServerPackages();
  }, []);

  const toggleType = (t: QuestionType) => {
    if (selectedTypes.includes(t)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((item) => item !== t));
      }
    } else {
      setSelectedTypes([...selectedTypes, t]);
    }
  };

  // Handler for creating a question manually
  const handleCreateManualQuestion = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualQuestion.trim()) {
      sound.playWrong();
      alert('Teks pertanyaan tidak boleh kosong!');
      return;
    }

    let finalOptions: string[] | undefined = undefined;
    let finalCorrectAnswer = '';
    let finalAcceptedAnswers: string[] | undefined = undefined;
    let finalPairs: Array<{ left: string; right: string }> | undefined = undefined;

    if (manualType === 'multiple_choice') {
      const filledOptions = manualOptions.map((o) => o.trim()).filter(Boolean);
      if (filledOptions.length < 2) {
        sound.playWrong();
        alert('Minimal sediakan 2 opsi jawaban untuk pilihan ganda!');
        return;
      }
      finalOptions = manualOptions.map((o) => o.trim());
      finalCorrectAnswer = finalOptions[manualCorrectIndex] || finalOptions[0] || '';
    } else if (manualType === 'short_answer') {
      if (!manualCorrectAnswer.trim()) {
        sound.playWrong();
        alert('Masukkan kunci jawaban utama untuk isian singkat!');
        return;
      }
      finalCorrectAnswer = manualCorrectAnswer.trim();
      const alternatives = manualAcceptedAnswers
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      finalAcceptedAnswers = Array.from(new Set([finalCorrectAnswer, ...alternatives]));
    } else if (manualType === 'matching') {
      const validPairs = manualPairs.filter((p) => p.left.trim() && p.right.trim());
      if (validPairs.length < 2) {
        sound.playWrong();
        alert('Minimal buat 2 pasangan menjodohkan (kiri & kanan)!');
        return;
      }
      finalPairs = validPairs.map((p) => ({ left: p.left.trim(), right: p.right.trim() }));
      finalCorrectAnswer = validPairs.map((p) => `${p.left} -> ${p.right}`).join(', ');
    } else if (manualType === 'true_false') {
      finalOptions = ['Benar', 'Salah'];
      finalCorrectAnswer = manualTrueFalse;
    }

    const newQ: Question = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      number: localQuestions.length + 1,
      question: manualQuestion.trim(),
      category: manualCategory.trim() || 'Umum',
      type: manualType,
      difficulty: manualDifficulty,
      points: manualPoints || 200,
      timeLimit: manualTimeLimit || 30,
      options: finalOptions,
      correctAnswer: finalCorrectAnswer,
      acceptedAnswers: finalAcceptedAnswers,
      pairs: finalPairs,
      explanation: manualExplanation.trim() || 'Pembahasan kunci jawaban.',
    };

    const updated = [...localQuestions, newQ];
    setLocalQuestions(updated);
    onSaveQuestions(updated);
    sound.playCorrect();

    setManualSuccessMsg(`Berhasil menambahkan Soal #${newQ.number}! Total papan di arena sekarang: ${updated.length} soal.`);
    setTimeout(() => setManualSuccessMsg(null), 4000);

    // Reset input fields to allow rapid entry of unlimited questions
    setManualQuestion('');
    setManualExplanation('');
    if (manualType === 'multiple_choice') {
      setManualOptions(['', '', '', '']);
      setManualCorrectIndex(0);
    } else if (manualType === 'short_answer') {
      setManualCorrectAnswer('');
      setManualAcceptedAnswers('');
    } else if (manualType === 'matching') {
      setManualPairs([
        { left: '', right: '' },
        { left: '', right: '' },
        { left: '', right: '' },
      ]);
    }
  };

  // Helper to persist a package both to state/localStorage and backend
  const savePackageLocallyAndServer = async (pkg: QuestionPackage) => {
    setSavedPackages((prev) => {
      const idx = prev.findIndex((p) => p.id === pkg.id);
      let updated: QuestionPackage[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = pkg;
      } else {
        updated = [pkg, ...prev];
      }
      localStorage.setItem('coc_saved_question_presets', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch('/api/saved-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkg),
      });
    } catch (err) {
      console.warn('Gagal sync ke server, tersimpan di browser:', err);
    }
  };

  const toggleSubject = (subName: string) => {
    sound.playClick();
    setSelectedSubjects((prev) => {
      if (prev.includes(subName)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter((s) => s !== subName);
      } else {
        return [...prev, subName];
      }
    });
  };

  const handleAddCustomSubject = () => {
    const trimmed = customSubjectInput.trim();
    if (!trimmed) return;
    if (!selectedSubjects.includes(trimmed)) {
      setSelectedSubjects((prev) => [...prev, trimmed]);
      sound.playCorrect(100);
    }
    setCustomSubjectInput('');
  };

  // Call Gemini API server-side
  const handleGenerateWithGemini = async () => {
    setIsGenerating(true);
    setGeminiError(null);
    setGeminiSuccessMessage(null);
    sound.playClick();

    try {
      const isMulti = subjectMode === 'multi_subject' && selectedSubjects.length > 0;
      const requestTopic = isMulti
        ? `Multi-Mata Pelajaran (${selectedSubjects.join(', ')})`
        : topic;

      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: requestTopic,
          difficulty,
          count: questionCount,
          questionTypes: selectedTypes,
          customPrompt: customInstructions,
          language: 'Indonesia',
          subjectMode,
          subjects: selectedSubjects,
          groupingOrder,
          subjectDetails,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal membuat soal dari Gemini AI.');
      }

      const generatedList: Question[] = data.questions;

      // Create permanent QuestionPackage for this generation
      const nowStr = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const generatedPackageName = isMulti
        ? `Paket Multi-Mapel: ${selectedSubjects.slice(0, 3).join(', ')}${selectedSubjects.length > 3 ? ` +${selectedSubjects.length - 3}` : ''} (${generatedList.length} Soal - ${nowStr})`
        : `Paket AI: ${topic} (${generatedList.length} Soal - ${nowStr})`;

      const newPackage: QuestionPackage = {
        id: `pkg_ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: generatedPackageName,
        topic: isMulti ? selectedSubjects.join(', ') : (topic || 'Umum & Sains'),
        date: new Date().toISOString(),
        count: generatedList.length,
        source: 'ai',
        questions: generatedList,
      };

      // Auto-save permanently so questions are NEVER lost
      await savePackageLocallyAndServer(newPackage);
      setLastGeneratedPackage(newPackage);

      if (appendMode) {
        const startIndex = localQuestions.length;
        const renumbered = generatedList.map((q, i) => ({
          ...q,
          number: startIndex + i + 1,
        }));
        const combined = [...localQuestions, ...renumbered];
        setLocalQuestions(combined);
        onSaveQuestions(combined);
        setGeminiSuccessMessage(`Berhasil membuat & menyimpan ${generatedList.length} soal baru! Total arena: ${combined.length} soal.`);
      } else {
        setLocalQuestions(generatedList);
        onSaveQuestions(generatedList);
        setGeminiSuccessMessage(`Berhasil membuat & menyimpan ${generatedList.length} soal baru dari Gemini AI!`);
      }

      sound.playCorrect(100);
    } catch (err: any) {
      console.error(err);
      setGeminiError(err.message || 'Terjadi gangguan saat memanggil Gemini API.');
      sound.playWrong();
    } finally {
      setIsGenerating(false);
    }
  };

  // Load a package directly into the live Arena game
  const handleLoadPackageToArena = (pkg: QuestionPackage) => {
    sound.playCorrect(100);
    const freshQuestions: Question[] = pkg.questions.map((q, idx) => ({
      ...q,
      number: idx + 1,
      isAnswered: false,
      answeredByTeamId: null,
      isCorrect: undefined,
    }));
    setLocalQuestions(freshQuestions);
    onSaveQuestions(freshQuestions);
    alert(`Paket "${pkg.name}" (${freshQuestions.length} soal) berhasil diaktifkan ke Arena! Semua papan kuis kini siap dimainkan.`);
    onClose();
  };

  // Review a package in the list tab
  const handleReviewPackage = (pkg: QuestionPackage) => {
    sound.playClick();
    const freshQuestions: Question[] = pkg.questions.map((q, idx) => ({
      ...q,
      number: idx + 1,
    }));
    setLocalQuestions(freshQuestions);
    onSaveQuestions(freshQuestions);
    setActiveTab('list');
  };

  // Delete package from persistent library
  const handleDeletePackage = async (id: string, name: string) => {
    if (!confirm(`Hapus paket soal "${name}" dari Bank Soal?`)) return;
    sound.playClick();
    setSavedPackages((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      localStorage.setItem('coc_saved_question_presets', JSON.stringify(filtered));
      return filtered;
    });

    try {
      await fetch(`/api/saved-packages/${id}`, { method: 'DELETE' });
    } catch {}
  };

  // Rename a saved package
  const handleRenamePackage = async (pkg: QuestionPackage) => {
    const newName = prompt('Ubah nama paket soal:', pkg.name);
    if (!newName || !newName.trim() || newName.trim() === pkg.name) return;
    sound.playClick();
    const updatedPkg = { ...pkg, name: newName.trim() };
    await savePackageLocallyAndServer(updatedPkg);
  };

  // Export specific package JSON
  const handleExportPackageJSON = (pkg: QuestionPackage) => {
    sound.playClick();
    const blob = new Blob([JSON.stringify(pkg.questions, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = pkg.name.replace(/[^a-zA-Z0-9_\-]/g, '_');
    a.download = `${safeName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save active questions as a package
  const handleSaveCurrentAsPackage = async () => {
    if (localQuestions.length === 0) {
      alert('Tidak ada soal aktif untuk disimpan!');
      return;
    }
    const defaultName = `Paket Kuis (${localQuestions.length} Soal - ${new Date().toLocaleDateString('id-ID')})`;
    const name = prompt('Beri nama untuk paket soal ini agar tersimpan permanen di Bank Soal:', defaultName);
    if (!name || !name.trim()) return;
    sound.playClick();
    const newPkg: QuestionPackage = {
      id: `pkg_manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      topic: 'Umum & Campuran',
      date: new Date().toISOString(),
      count: localQuestions.length,
      source: 'manual',
      questions: localQuestions,
    };
    await savePackageLocallyAndServer(newPkg);
    sound.playCorrect(100);
    alert(`Paket soal "${newPkg.name}" berhasil disimpan permanen ke Bank Soal!`);
  };

  // Delete question
  const handleDeleteQuestion = (id: string) => {
    sound.playClick();
    const filtered = localQuestions.filter((q) => q.id !== id);
    const renumbered = filtered.map((q, idx) => ({ ...q, number: idx + 1 }));
    setLocalQuestions(renumbered);
    onSaveQuestions(renumbered);
  };

  // Save single question edit
  const handleSaveEditQuestion = () => {
    if (!editingQuestion) return;
    sound.playClick();
    const updated = localQuestions.map((q) =>
      q.id === editingQuestion.id ? editingQuestion : q
    );
    setLocalQuestions(updated);
    onSaveQuestions(updated);
    setEditingQuestion(null);
  };

  // Add a new blank question
  const handleAddNewQuestion = () => {
    sound.playClick();
    const newQ: Question = {
      id: `custom_${Date.now()}`,
      number: localQuestions.length + 1,
      question: 'Pertanyaan kustom baru',
      category: 'Matematika',
      type: 'multiple_choice',
      difficulty: 'Sedang',
      points: 200,
      timeLimit: 30,
      options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
      correctAnswer: 'Pilihan A',
      explanation: 'Penjelasan jawaban.',
    };
    const updated = [...localQuestions, newQ];
    setLocalQuestions(updated);
    onSaveQuestions(updated);
    setEditingQuestion(newQ);
  };

  // Save current preset
  const handleSavePreset = async () => {
    if (!presetName.trim()) return;
    sound.playClick();
    const newPkg: QuestionPackage = {
      id: `pkg_preset_${Date.now()}`,
      name: presetName.trim(),
      topic: 'Paket Kustom',
      date: new Date().toISOString(),
      count: localQuestions.length,
      source: 'manual',
      questions: localQuestions,
    };
    await savePackageLocallyAndServer(newPkg);
    setPresetName('');
    alert(`Paket "${newPkg.name}" berhasil disimpan ke Bank Soal!`);
  };

  // Load preset
  const handleLoadPreset = (presetData: Question[]) => {
    sound.playClick();
    setLocalQuestions(presetData);
    onSaveQuestions(presetData);
    alert(`Berhasil memuat ${presetData.length} soal dari preset!`);
    setActiveTab('list');
  };

  // Delete preset
  const handleDeletePreset = async (index: number) => {
    sound.playClick();
    const pkg = savedPackages[index];
    if (pkg) {
      await handleDeletePackage(pkg.id, pkg.name);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    sound.playClick();
    const blob = new Blob([JSON.stringify(localQuestions, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `COC_Bank_Soal_${localQuestions.length}_items.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          const sanitized: Question[] = imported.map((q, idx) => ({
            ...q,
            number: idx + 1,
            id: q.id || `imp_${Date.now()}_${idx}`,
          }));
          setLocalQuestions(sanitized);
          onSaveQuestions(sanitized);

          // Also save as an imported package in Bank Soal
          const importedPkg: QuestionPackage = {
            id: `pkg_imp_${Date.now()}`,
            name: file.name.replace('.json', '') || `Impor JSON (${sanitized.length} Soal)`,
            topic: 'Impor File',
            date: new Date().toISOString(),
            count: sanitized.length,
            source: 'manual',
            questions: sanitized,
          };
          await savePackageLocallyAndServer(importedPkg);

          sound.playCorrect(100);
          alert(`Berhasil mengimpor ${sanitized.length} soal dan menyimpannya ke Bank Soal!`);
          setActiveTab('list');
        } else {
          throw new Error('Format JSON tidak sesuai array soal.');
        }
      } catch (err: any) {
        sound.playWrong();
        alert('Gagal mengimpor file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-cyan-600 flex items-center justify-center text-slate-950 shadow-lg">
              <Bot className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <span>Manajemen Bank Soal & Generator AI Gemini</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  {localQuestions.length} Papan Soal
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Buat soal otomatis dengan Google Gemini, tinjau, edit bobot poin, dan simpan preset.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-4 pt-2 border-b border-slate-800 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('gemini')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'gemini'
                ? 'bg-slate-900 text-cyan-300 border-t-2 border-x border-cyan-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Buat via Gemini AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'manual'
                ? 'bg-slate-900 text-emerald-300 border-t-2 border-x border-emerald-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Buat Soal Manual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'list'
                ? 'bg-slate-900 text-amber-300 border-t-2 border-x border-amber-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-amber-400" />
            <span>Tinjau & Edit Soal ({localQuestions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'presets'
                ? 'bg-slate-900 text-purple-300 border-t-2 border-x border-purple-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-purple-400" />
            <span>Bank & Koleksi Soal ({savedPackages.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: GEMINI AI GENERATOR */}
          {activeTab === 'gemini' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {geminiError && (
                <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-sm flex items-center justify-between gap-3">
                  <span>{geminiError}</span>
                  <button
                    type="button"
                    onClick={() => setGeminiError(null)}
                    className="text-rose-400 hover:text-white text-xs underline"
                  >
                    Tutup
                  </button>
                </div>
              )}
              {geminiSuccessMessage && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-cyan-950/90 border border-emerald-500/60 shadow-xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                      <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>{geminiSuccessMessage}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                      💾 Tersimpan Permanen di Bank Soal
                    </span>
                  </div>

                  {lastGeneratedPackage && (
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-amber-300 text-xs sm:text-sm">
                          {lastGeneratedPackage.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Topik: {lastGeneratedPackage.topic} • {lastGeneratedPackage.count} Soal • Kategori bervariasi
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleLoadPackageToArena(lastGeneratedPackage)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Mulai Kuis di Arena Sekarang</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExportPackageJSON(lastGeneratedPackage)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                          title="Unduh Backup JSON"
                        >
                          <Download className="w-4 h-4 text-cyan-400" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('list');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold border border-cyan-500/40 flex items-center gap-1.5"
                    >
                      <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Tinjau & Edit Soal ({localQuestions.length} Soal)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('presets');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold border border-purple-500/40 flex items-center gap-1.5"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                      <span>Buka Bank & Koleksi Soal ({savedPackages.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mode Pemilihan: Multi-Mata Pelajaran vs Topik Bebas */}
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span>Mode Mata Pelajaran & Pengelompokan:</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Pilih apakah ingin membuat soal yang mencakup berbagai mata pelajaran sekaligus atau 1 topik bebas.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSubjectMode('multi_subject');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        subjectMode === 'multi_subject'
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Multi-Mata Pelajaran</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSubjectMode('single');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        subjectMode === 'single'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Topik Bebas / Khusus</span>
                    </button>
                  </div>
                </div>

                {/* TAB CONTENT: Multi-Subject Mode */}
                {subjectMode === 'multi_subject' ? (
                  <div className="space-y-3.5 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-300">
                          Pilih Mata Pelajaran yang Ingin Dimasukkan ({selectedSubjects.length} Terpilih):
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setSelectedSubjects([
                                'Matematika',
                                'Sains IPA',
                                'Fisika',
                                'Kimia',
                                'Biologi',
                                'Sejarah',
                                'Geografi',
                                'Bahasa Indonesia',
                                'Bahasa Inggris',
                                'Logika & Penalaran',
                              ]);
                            }}
                            className="text-cyan-400 hover:underline cursor-pointer"
                          >
                            Pilih Standar
                          </button>
                          <span className="text-slate-600">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setSelectedSubjects(POPULAR_SUBJECT_PRESETS.map((p) => p.name));
                            }}
                            className="text-amber-400 hover:underline cursor-pointer"
                          >
                            Pilih Semua
                          </button>
                        </div>
                      </div>

                      {/* Subject Chips Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {POPULAR_SUBJECT_PRESETS.map((subj) => {
                          const isSelected = selectedSubjects.includes(subj.name);
                          return (
                            <button
                              key={subj.name}
                              type="button"
                              onClick={() => toggleSubject(subj.name)}
                              className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected
                                  ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md ring-1 ring-cyan-400/40'
                                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-base shrink-0">{subj.icon}</span>
                                <div className="truncate">
                                  <div className="font-bold text-white text-xs truncate">{subj.name}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{subj.desc}</div>
                                </div>
                              </div>
                              {isSelected ? (
                                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add Custom Subject Input */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={customSubjectInput}
                        onChange={(e) => setCustomSubjectInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSubject();
                          }
                        }}
                        placeholder="Tambah mata pelajaran kustom (contoh: Astronomi, PKn, Musik, Robotika)..."
                        className="flex-1 w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSubject}
                        disabled={!customSubjectInput.trim()}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 font-bold text-xs border border-cyan-500/40 flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Mapel</span>
                      </button>
                    </div>

                    {/* Selected Subjects Tag Pills */}
                    {selectedSubjects.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="text-[11px] font-bold text-amber-400 mr-1">
                          Urutan Mapel Aktif:
                        </span>
                        {selectedSubjects.map((s, idx) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold"
                          >
                            <span className="text-[10px] text-cyan-400/80 font-mono">#{idx + 1}</span>
                            <span>{s}</span>
                            {selectedSubjects.length > 1 && (
                              <button
                                type="button"
                                onClick={() => toggleSubject(s)}
                                className="text-slate-400 hover:text-rose-400 ml-0.5 cursor-pointer"
                                title={`Hapus ${s}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Grouping Order Selector & Distribution Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-amber-400" />
                          <span>Aturan Urutan / Pengelompokan:</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setGroupingOrder('grouped');
                            }}
                            className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              groupingOrder === 'grouped'
                                ? 'bg-amber-950/70 border-amber-400 text-amber-200 ring-1 ring-amber-400/40'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-white flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-amber-400" />
                              <span>Berkelompok</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Rapi per mata pelajaran
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setGroupingOrder('shuffled');
                            }}
                            className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              groupingOrder === 'shuffled'
                                ? 'bg-purple-950/70 border-purple-400 text-purple-200 ring-1 ring-purple-400/40'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-white flex items-center gap-1">
                              <Shuffle className="w-3.5 h-3.5 text-purple-400" />
                              <span>Campur / Acak</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Selang-seling bervariasi
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Kalkulasi Distribusi Soal:</span>
                        </label>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col justify-center min-h-[58px]">
                          <div className="font-semibold text-white">
                            Total {questionCount} Soal ÷ {selectedSubjects.length} Mapel
                          </div>
                          <div className="text-[11px] text-cyan-300">
                            ~{Math.max(1, Math.floor(questionCount / (selectedSubjects.length || 1)))} soal per mata pelajaran ({groupingOrder === 'grouped' ? 'berurutan' : 'berselang-seling'}).
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Specific Subject Instructions */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400">
                        Arahan / Perintah Khusus Tiap Mata Pelajaran (Opsional):
                      </label>
                      <textarea
                        rows={2}
                        value={subjectDetails}
                        onChange={(e) => setSubjectDetails(e.target.value)}
                        placeholder="Contoh: 'Matematika fokus pada aljabar dan pecahan; Fisika fokus gerak lurus dan gravitasi; Sejarah fokus pada kemerdekaan RI 1945'..."
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  /* TAB CONTENT: Single Topic Mode */
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-amber-400">
                      Topik / Tema Pembelajaran Spesifik:
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Contoh: Tata Surya & Antariksa, Rumus Geometri Ruang, Revolusi Industri..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-cyan-400 focus:outline-none text-sm font-medium"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        'Sains IPA & Biologi',
                        'Matematika Aljabar & Logika',
                        'Sejarah Nasional & Dunia',
                        'Bahasa Inggris Cerdas Cermat',
                        'Teknologi Informasi & AI',
                      ].map((quickTopic) => (
                        <button
                          key={quickTopic}
                          type="button"
                          onClick={() => setTopic(quickTopic)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700 cursor-pointer"
                        >
                          {quickTopic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Grid: Difficulty & Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Tingkat Kesulitan:
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none text-sm font-medium"
                  >
                    <option value="Campuran">Campuran (Mudah 100, Sedang 200, Sukar 300 Pts)</option>
                    <option value="Mudah">Mudah (Standar 100 Pts)</option>
                    <option value="Sedang">Sedang (Standar 200 Pts)</option>
                    <option value="Sukar">Sukar (Standar 300 Pts)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Jumlah Soal per Pembuatan (Tanpa Batas Total):
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value) || 1)}
                      className="w-24 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-center font-bold text-base focus:border-cyan-400 focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1">
                      {[5, 10, 15, 20, 30, 50, 100].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setQuestionCount(num)}
                          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                            questionCount === num
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                          }`}
                        >
                          {num} Soal
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    *Admin bebas membuat soal tanpa batas jumlah. Gunakan mode tambah ke bank soal untuk menambah batch berikutnya!
                  </p>
                </div>
              </div>

              {/* Question Types checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Model / Tipe Soal yang Diinginkan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'multiple_choice', label: 'Pilihan Ganda' },
                    { id: 'short_answer', label: 'Isian Singkat (Keyboard)' },
                    { id: 'matching', label: 'Menjodohkan (Pasangan)' },
                    { id: 'true_false', label: 'Benar / Salah' },
                  ].map((t) => {
                    const checked = selectedTypes.includes(t.id as QuestionType);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleType(t.id as QuestionType)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                          checked
                            ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400'
                        }`}
                      >
                        <span>{t.label}</span>
                        {checked ? (
                          <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Instruksi Khusus untuk Gemini AI (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Misal: 'Buat soal untuk tingkat SMP/SMA kelas 10', 'Fokuskan pada rumus bangun ruang', dll."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none text-xs sm:text-sm"
                />
              </div>

              {/* Replace vs Append */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={appendMode}
                    onChange={(e) => setAppendMode(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700"
                  />
                  <span>
                    Tambahkan ke daftar soal yang sudah ada (jangan hapus {localQuestions.length} soal saat ini)
                  </span>
                </label>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  disabled={isGenerating || selectedTypes.length === 0}
                  onClick={handleGenerateWithGemini}
                  className="w-full max-w-md py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 hover:from-amber-400 hover:to-cyan-300 text-slate-950 font-black text-base shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                      <span>Gemini AI Sedang Meracik Soal...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-slate-950" />
                      <span>Buat {questionCount} Soal dengan Google Gemini AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Saved AI Packages History & Bank */}
              <div className="border-t border-slate-800 pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-cyan-400" />
                    <span>Riwayat & Bank Paket Soal AI Tersimpan ({savedPackages.length}):</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setActiveTab('presets');
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <span>Lihat Semua Bank Soal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {savedPackages.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                    <div className="text-xs text-slate-400">
                      Belum ada paket soal tersimpan.
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Setiap kali Anda menekan tombol "Buat Soal dengan Gemini AI", paket soal akan otomatis tersimpan aman di sini & tidak akan pernah hilang!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {savedPackages.slice(0, 5).map((pkg) => {
                      const uniqueCategories = Array.from(
                        new Set(pkg.questions.map((q) => q.category).filter(Boolean))
                      );
                      return (
                        <div
                          key={pkg.id}
                          className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {pkg.name}
                              </span>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                                  pkg.source === 'ai'
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                }`}
                              >
                                {pkg.source === 'ai' ? '🤖 Gemini AI' : '✏️ Manual'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                              <span className="text-amber-300 font-medium font-mono">
                                {pkg.count} Soal / Papan
                              </span>
                              <span>•</span>
                              <span>Topik: {pkg.topic}</span>
                              <span>•</span>
                              <span className="text-[11px] text-slate-500">
                                {new Date(pkg.date).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>

                            {uniqueCategories.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {uniqueCategories.slice(0, 5).map((cat, ci) => (
                                  <span
                                    key={ci}
                                    className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 border border-slate-700 font-medium"
                                  >
                                    {cat}
                                  </span>
                                ))}
                                {uniqueCategories.length > 5 && (
                                  <span className="text-[10px] text-slate-500 self-center">
                                    +{uniqueCategories.length - 5} lainnya
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleLoadPackageToArena(pkg)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow flex items-center gap-1 cursor-pointer"
                              title="Muat paket ini dan mulai permainan di Arena"
                            >
                              <Play className="w-3.5 h-3.5 fill-slate-950" />
                              <span>Gunakan di Arena</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReviewPackage(pkg)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs border border-slate-700"
                              title="Tinjau & Edit Soal"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleExportPackageJSON(pkg)}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700"
                              title="Unduh File JSON"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-400" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRenamePackage(pkg)}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 text-xs"
                              title="Ganti Nama Paket"
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                              className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-900"
                              title="Hapus Paket"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL QUESTION CREATION (BUAT SOAL SECARA MANUAL - UNLIMITED) */}
          {activeTab === 'manual' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {manualSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-sm flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="font-semibold">{manualSuccessMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="text-xs text-emerald-300 underline hover:text-white font-medium cursor-pointer"
                  >
                    Lihat di Daftar Soal
                  </button>
                </div>
              )}

              <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-white font-bold text-base flex items-center gap-2">
                      <Plus className="w-5 h-5 text-emerald-400" />
                      <span>Form Buat Soal Manual Baru</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Buat soal pembelajaran sendiri secara fleksibel. Bebas buat soal tanpa batas jumlah!
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono font-semibold">
                    Papan #{localQuestions.length + 1}
                  </span>
                </div>

                {/* Question Type Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Pilih Tipe / Model Soal:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'multiple_choice', label: 'Pilihan Ganda', desc: '4 Opsi Jawaban (A, B, C, D)' },
                      { id: 'short_answer', label: 'Isian Singkat', desc: 'Ketik Jawaban via Keyboard' },
                      { id: 'matching', label: 'Menjodohkan', desc: 'Pasangkan Kiri & Kanan' },
                      { id: 'true_false', label: 'Benar / Salah', desc: 'Pernyataan Logika' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setManualType(item.id as QuestionType);
                        }}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          manualType === item.id
                            ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-md ring-1 ring-emerald-400'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject / Category Selector */}
                <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Bidang Soal / Mata Pelajaran:
                    </label>
                    <span className="text-[11px] text-cyan-300 font-semibold">
                      *Tampil di papan kuis arena permainan
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {['Matematika', 'IPA', 'Biologi', 'Fisika', 'Kimia', 'Geografi', 'Sejarah', 'Bahasa', 'Teknologi', 'Astronomi', 'Umum'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setManualCategory(cat);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          manualCategory === cat
                            ? 'bg-amber-500/25 text-amber-300 border-amber-500/80 ring-1 ring-amber-400 shadow-sm'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-750'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    placeholder="Ketik atau pilih bidang soal (contoh: Matematika, Biologi, Sejarah, dll.)..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:border-amber-400 focus:outline-none placeholder-slate-500"
                  />
                </div>

                {/* Question Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Teks Pertanyaan / Soal:
                  </label>
                  <textarea
                    rows={3}
                    value={manualQuestion}
                    onChange={(e) => setManualQuestion(e.target.value)}
                    placeholder="Tuliskan teks pertanyaan soal di sini..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-emerald-400 focus:outline-none placeholder-slate-500"
                  />
                </div>

                {/* TYPE-SPECIFIC INPUTS */}
                {/* 1. Multiple Choice Options */}
                {manualType === 'multiple_choice' && (
                  <div className="space-y-2 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                    <label className="text-xs font-bold text-cyan-300 flex items-center justify-between">
                      <span>Pilihan Jawaban (Pilih radio untuk menentukan kunci jawaban yang benar):</span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Kunci: Opsi {['A', 'B', 'C', 'D'][manualCorrectIndex]}
                      </span>
                    </label>
                    <div className="space-y-2">
                      {manualOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                            <input
                              type="radio"
                              name="manualCorrectOption"
                              checked={manualCorrectIndex === idx}
                              onChange={() => setManualCorrectIndex(idx)}
                              className="w-4 h-4 text-emerald-500 focus:ring-emerald-400"
                            />
                            <span className="font-bold font-mono text-xs text-amber-400 w-5">
                              {['A', 'B', 'C', 'D'][idx]}.
                            </span>
                          </label>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const copy = [...manualOptions];
                              copy[idx] = e.target.value;
                              setManualOptions(copy);
                            }}
                            placeholder={`Teks pilihan ${['A', 'B', 'C', 'D'][idx]}...`}
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Short Answer Inputs */}
                {manualType === 'short_answer' && (
                  <div className="space-y-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-cyan-300">
                        Kunci Jawaban Utama (Benar):
                      </label>
                      <input
                        type="text"
                        value={manualCorrectAnswer}
                        onChange={(e) => setManualCorrectAnswer(e.target.value)}
                        placeholder="Contoh: Fotosintesis"
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-emerald-400 focus:outline-none font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Variasi Jawaban Diterima / Sinonim (Pisahkan dengan koma):
                      </label>
                      <input
                        type="text"
                        value={manualAcceptedAnswers}
                        onChange={(e) => setManualAcceptedAnswers(e.target.value)}
                        placeholder="Contoh: fotosintesa, photo synthesis, proses fotosintesis"
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-400">
                        *Peserta dapat mengetik jawaban melalui keyboard di layar atau keyboard fisik. Huruf besar/kecil tidak dibedakan.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Matching Pairs Inputs */}
                {manualType === 'matching' && (
                  <div className="space-y-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-cyan-300">
                        Pasangan Jawaban (Item Kiri ⟷ Item Kanan):
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setManualPairs([...manualPairs, { left: '', right: '' }]);
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Pasangan</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {manualPairs.map((pair, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400 w-4">{pIdx + 1}.</span>
                          <input
                            type="text"
                            value={pair.left}
                            onChange={(e) => {
                              const copy = [...manualPairs];
                              copy[pIdx].left = e.target.value;
                              setManualPairs(copy);
                            }}
                            placeholder="Kiri (Contoh: Indonesia)"
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
                          />
                          <span className="text-slate-500 font-bold">⟷</span>
                          <input
                            type="text"
                            value={pair.right}
                            onChange={(e) => {
                              const copy = [...manualPairs];
                              copy[pIdx].right = e.target.value;
                              setManualPairs(copy);
                            }}
                            placeholder="Kanan (Contoh: Jakarta)"
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
                          />
                          {manualPairs.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                setManualPairs(manualPairs.filter((_, i) => i !== pIdx));
                              }}
                              className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800"
                              title="Hapus pasangan"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. True / False Inputs */}
                {manualType === 'true_false' && (
                  <div className="space-y-2 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                    <label className="text-xs font-bold text-cyan-300">
                      Kunci Jawaban yang Benar:
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setManualTrueFalse('Benar');
                        }}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                          manualTrueFalse === 'Benar'
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        ✓ BENAR
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setManualTrueFalse('Salah');
                        }}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                          manualTrueFalse === 'Salah'
                            ? 'bg-rose-600 text-white border-rose-400 shadow-md ring-2 ring-rose-400/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        ✗ SALAH
                      </button>
                    </div>
                  </div>
                )}

                {/* Parameters Grid: Difficulty, Points, Time Limit */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-400">Tingkat Kesulitan:</label>
                    <select
                      value={manualDifficulty}
                      onChange={(e: any) => {
                        const d = e.target.value;
                        setManualDifficulty(d);
                        if (d === 'Mudah') setManualPoints(100);
                        if (d === 'Sedang') setManualPoints(200);
                        if (d === 'Sukar') setManualPoints(300);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="Mudah">Mudah (100 Poin)</option>
                      <option value="Sedang">Sedang (200 Poin)</option>
                      <option value="Sukar">Sukar (300 Poin)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-400">Bobot Poin Soal:</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={10}
                        step={10}
                        value={manualPoints}
                        onChange={(e) => setManualPoints(Number(e.target.value) || 100)}
                        className="w-20 px-2 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-center text-xs font-bold focus:border-emerald-400 focus:outline-none"
                      />
                      <div className="flex gap-1">
                        {[100, 200, 300, 500].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setManualPoints(p)}
                            className={`px-1.5 py-1 text-[11px] rounded font-mono font-bold ${
                              manualPoints === p
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-400">Batas Waktu Timer (Detik):</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={5}
                        max={600}
                        value={manualTimeLimit}
                        onChange={(e) => setManualTimeLimit(Number(e.target.value) || 30)}
                        className="w-20 px-2 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-center text-xs font-bold focus:border-emerald-400 focus:outline-none"
                      />
                      <div className="flex gap-1">
                        {[15, 30, 60, 120].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setManualTimeLimit(s)}
                            className={`px-1.5 py-1 text-[11px] rounded font-mono ${
                              manualTimeLimit === s
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {s}s
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Pembahasan / Penjelasan Edukatif (Opsional):
                  </label>
                  <input
                    type="text"
                    value={manualExplanation}
                    onChange={(e) => setManualExplanation(e.target.value)}
                    placeholder="Contoh: Fotosintesis adalah proses tumbuhan hijau membuat makanan..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">
                    Total papan soal kuis saat ini: <strong className="text-cyan-300">{localQuestions.length} Soal</strong>. Tidak ada batasan jumlah soal!
                  </p>
                  <button
                    type="button"
                    onClick={handleCreateManualQuestion}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Simpan & Tambahkan Soal ke Arena (+1 Soal)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEW & EDIT QUESTIONS */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Search, Filter & Grouping Toolbar */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Total Soal Aktif:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/40">
                      {localQuestions.length} Soal
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Switcher: Grouped by Subject vs Flat List */}
                    <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setGroupBySubjectView(true);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          groupBySubjectView
                            ? 'bg-cyan-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Grup Mapel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setGroupBySubjectView(false);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          !groupBySubjectView
                            ? 'bg-cyan-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ListOrdered className="w-3.5 h-3.5" />
                        <span>Nomor Urut</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveCurrentAsPackage}
                      className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Simpan daftar soal saat ini ke Bank Soal permanen"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan ke Bank</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('manual');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Buat Manual</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Search and Subject Filter Chips */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-slate-900">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={listSearchQuery}
                      onChange={(e) => setListSearchQuery(e.target.value)}
                      placeholder="Cari teks pertanyaan soal..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    />
                    {listSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setListSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Category filter pills */}
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setListCategoryFilter('all')}
                      className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                        listCategoryFilter === 'all'
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Semua ({localQuestions.length})
                    </button>
                    {Array.from(new Set(localQuestions.map((q) => q.category || 'Umum'))).map((cat) => {
                      const countInCat = localQuestions.filter((q) => (q.category || 'Umum') === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setListCategoryFilter(cat)}
                          className={`px-2 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                            listCategoryFilter === cat
                              ? 'bg-cyan-500 text-slate-950 shadow'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {cat} ({countInCat})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Questions List Rendered */}
              {(() => {
                const filtered = localQuestions.filter((q) => {
                  const matchCat = listCategoryFilter === 'all' || (q.category || 'Umum') === listCategoryFilter;
                  const matchSearch = !listSearchQuery.trim() || q.question.toLowerCase().includes(listSearchQuery.toLowerCase());
                  return matchCat && matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                      Tidak ada soal yang cocok dengan filter / pencarian.
                    </div>
                  );
                }

                if (groupBySubjectView) {
                  // Group by category
                  const groupedMap = new Map<string, Question[]>();
                  filtered.forEach((q) => {
                    const cat = q.category || 'Umum';
                    if (!groupedMap.has(cat)) groupedMap.set(cat, []);
                    groupedMap.get(cat)!.push(q);
                  });

                  return (
                    <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                      {Array.from(groupedMap.entries()).map(([cat, qList]) => (
                        <div key={cat} className="space-y-2">
                          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sticky top-0 backdrop-blur-md z-10">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                              <span className="font-bold text-amber-300 uppercase tracking-wide">
                                Mata Pelajaran: {cat}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[11px] border border-cyan-500/30">
                              {qList.length} Soal
                            </span>
                          </div>

                          <div className="space-y-2">
                            {qList.map((q) => (
                              <div
                                key={q.id}
                                className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                              >
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 font-mono text-sm shrink-0">
                                    #{q.number}
                                  </div>
                                  <div className="space-y-1 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                        📖 {q.category || 'Umum'}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-cyan-300 font-mono border border-cyan-500/30">
                                        {q.type === 'multiple_choice'
                                          ? 'Pilihan Ganda'
                                          : q.type === 'short_answer'
                                          ? 'Isian Singkat'
                                          : q.type === 'matching'
                                          ? 'Menjodohkan'
                                          : 'Benar / Salah'}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                        +{q.points} Poin
                                      </span>
                                      <span className="text-slate-400">Waktu: {q.timeLimit}s</span>
                                      <span className="text-slate-400">({q.difficulty})</span>
                                    </div>
                                    <p className="text-white text-sm font-medium line-clamp-2">
                                      {q.question}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                  <button
                                    type="button"
                                    onClick={() => setEditingQuestion({ ...q })}
                                    className="p-2 rounded-lg bg-slate-700 hover:bg-amber-600 text-slate-200 hover:text-white transition-colors cursor-pointer"
                                    title="Edit Soal"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="p-2 rounded-lg bg-slate-700 hover:bg-rose-600 text-slate-200 hover:text-white transition-colors cursor-pointer"
                                    title="Hapus Soal"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                // Flat ordered list
                return (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {filtered.map((q) => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 font-mono text-sm shrink-0">
                            #{q.number}
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                📖 {q.category || 'Umum'}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-cyan-300 font-mono border border-cyan-500/30">
                                {q.type === 'multiple_choice'
                                  ? 'Pilihan Ganda'
                                  : q.type === 'short_answer'
                                  ? 'Isian Singkat'
                                  : q.type === 'matching'
                                  ? 'Menjodohkan'
                                  : 'Benar / Salah'}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                +{q.points} Poin
                              </span>
                              <span className="text-slate-400">Waktu: {q.timeLimit}s</span>
                              <span className="text-slate-400">({q.difficulty})</span>
                            </div>
                            <p className="text-white text-sm font-medium line-clamp-2">
                              {q.question}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setEditingQuestion({ ...q })}
                            className="p-2 rounded-lg bg-slate-700 hover:bg-amber-600 text-slate-200 hover:text-white transition-colors cursor-pointer"
                            title="Edit Soal"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-2 rounded-lg bg-slate-700 hover:bg-rose-600 text-slate-200 hover:text-white transition-colors cursor-pointer"
                            title="Hapus Soal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: BANK & KOLEKSI PAKET SOAL TERSIMPAN */}
          {activeTab === 'presets' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Save active questions form */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span>Simpan {localQuestions.length} Soal Aktif ke Bank Soal:</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Tersimpan permanen & siap digunakan kapan saja
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Beri nama paket soal (misal: 'Babak Penyisihan Sains & Matematika')..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={!presetName.trim() || localQuestions.length === 0}
                    onClick={handleSavePreset}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 shadow cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Paket Permanen</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-purple-400" />
                    <span>Koleksi Bank Soal ({savedPackages.length} Paket)</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={packageSearch}
                      onChange={(e) => setPackageSearch(e.target.value)}
                      placeholder="Cari paket atau topik..."
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none w-44 sm:w-56"
                    />
                  </div>

                  <div className="flex rounded-xl bg-slate-800 p-0.5 border border-slate-700 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPackageFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        packageFilter === 'all'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Semua ({savedPackages.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPackageFilter('ai')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        packageFilter === 'ai'
                          ? 'bg-cyan-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🤖 AI ({savedPackages.filter((p) => p.source === 'ai').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPackageFilter('manual')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        packageFilter === 'manual'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ✏️ Manual ({savedPackages.filter((p) => p.source !== 'ai').length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Saved Packages List */}
              <div className="space-y-3">
                {(() => {
                  const filtered = savedPackages.filter((p) => {
                    const matchFilter =
                      packageFilter === 'all' ||
                      (packageFilter === 'ai' && p.source === 'ai') ||
                      (packageFilter === 'manual' && p.source !== 'ai');
                    const matchSearch =
                      !packageSearch.trim() ||
                      p.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
                      p.topic.toLowerCase().includes(packageSearch.toLowerCase());
                    return matchFilter && matchSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                        <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
                        <div className="text-sm font-semibold text-slate-400">
                          {packageSearch
                            ? `Tidak ada paket soal yang cocok dengan "${packageSearch}"`
                            : 'Belum ada paket soal tersimpan'}
                        </div>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Buat soal baru dengan Gemini AI pada Tab 1 (akan otomatis tersimpan), buat manual pada Tab 2, atau simpan daftar soal saat ini.
                        </p>
                      </div>
                    );
                  }

                  return filtered.map((pkg) => {
                    const uniqueCategories = Array.from(
                      new Set(pkg.questions.map((q) => q.category).filter(Boolean))
                    );

                    return (
                      <div
                        key={pkg.id}
                        className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg group"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-white text-base">
                              {pkg.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                                pkg.source === 'ai'
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                  : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              }`}
                            >
                              {pkg.source === 'ai' ? '🤖 Gemini AI' : '✏️ Manual / Preset'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                            <span className="text-amber-300 font-bold font-mono">
                              {pkg.count} Soal Papan
                            </span>
                            <span>•</span>
                            <span>Topik: <strong className="text-slate-200">{pkg.topic}</strong></span>
                            <span>•</span>
                            <span className="text-slate-500">
                              {new Date(pkg.date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {uniqueCategories.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {uniqueCategories.slice(0, 6).map((cat, ci) => (
                                <span
                                  key={ci}
                                  className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 border border-slate-700 font-medium"
                                >
                                  {cat}
                                </span>
                              ))}
                              {uniqueCategories.length > 6 && (
                                <span className="text-[10px] text-slate-500 self-center">
                                  +{uniqueCategories.length - 6} lainnya
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleLoadPackageToArena(pkg)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                            title="Aktifkan paket ini ke Arena sekarang"
                          >
                            <Play className="w-4 h-4 fill-slate-950" />
                            <span>Gunakan di Arena</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReviewPackage(pkg)}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1"
                            title="Tinjau & Edit Soal"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Tinjau</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExportPackageJSON(pkg)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700"
                            title="Unduh Cadangan JSON"
                          >
                            <Download className="w-4 h-4 text-amber-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRenamePackage(pkg)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 text-xs"
                            title="Ganti Nama Paket"
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                            className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-900"
                            title="Hapus dari Bank Soal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                })()}
              </div>

              {/* Import / Export JSON */}
              <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3">
                <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 cursor-pointer">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Impor Bank Soal dari File JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Ekspor Semua ke File JSON</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            *Semua perubahan tersimpan otomatis ke permainan aktif.
          </span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-extrabold text-sm border border-amber-300 shadow-lg cursor-pointer"
          >
            Selesai & Tutup Pengaturan Soal
          </button>
        </div>
      </div>

      {/* SUB-MODAL: Edit Single Question Details */}
      {editingQuestion && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border-2 border-cyan-500 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Edit Soal #{editingQuestion.number}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-amber-400 uppercase">Bidang Soal / Mata Pelajaran:</label>
                <input
                  type="text"
                  value={editingQuestion.category || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, category: e.target.value })
                  }
                  placeholder="Contoh: Matematika, Biologi, Fisika, Sejarah"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-400 uppercase">Teks Pertanyaan:</label>
                <textarea
                  rows={3}
                  value={editingQuestion.question}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Tipe:</label>
                  <select
                    value={editingQuestion.type}
                    onChange={(e: any) =>
                      setEditingQuestion({ ...editingQuestion, type: e.target.value })
                    }
                    className="w-full px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs mt-1"
                  >
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="short_answer">Isian Singkat</option>
                    <option value="matching">Menjodohkan</option>
                    <option value="true_false">Benar/Salah</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Poin:</label>
                  <input
                    type="number"
                    value={editingQuestion.points}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        points: Number(e.target.value) || 100,
                      })
                    }
                    className="w-full px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Waktu (Detik):</label>
                  <input
                    type="number"
                    value={editingQuestion.timeLimit}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        timeLimit: Number(e.target.value) || 30,
                      })
                    }
                    className="w-full px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs mt-1"
                  />
                </div>
              </div>

              {/* Options for Multiple Choice */}
              {editingQuestion.type === 'multiple_choice' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-400">Pilihan Jawaban (A, B, C, D):</label>
                  {(editingQuestion.options || []).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-300 w-5">
                        {String.fromCharCode(65 + idx)}:
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(editingQuestion.options || [])];
                          newOpts[idx] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: newOpts });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                      <input
                        type="radio"
                        name="correct_radio"
                        checked={editingQuestion.correctAnswer === opt}
                        onChange={() =>
                          setEditingQuestion({ ...editingQuestion, correctAnswer: opt })
                        }
                        title="Tandai sebagai jawaban benar"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Correct Answer / Accepted Answers */}
              <div>
                <label className="text-xs font-semibold text-amber-400">Jawaban Benar Utama:</label>
                <input
                  type="text"
                  value={editingQuestion.correctAnswer || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Penjelasan / Pembahasan:</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditQuestion}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
