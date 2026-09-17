import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi di server. Pastikan API key Gemini tersedia.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// API endpoint to generate learning questions using Gemini
app.post("/api/generate-questions", async (req, res) => {
  try {
    const {
      topic = "Pengetahuan Umum & Sains",
      difficulty = "Campuran",
      questionTypes = ["multiple_choice", "short_answer", "matching", "true_false"],
      count = 10,
      customPrompt = "",
      language = "Indonesia",
      subjectMode = "single", // "single" | "multi_subject"
      subjects = [], // array of subjects e.g. ["Matematika", "Fisika", "Biologi"]
      groupingOrder = "grouped", // "grouped" | "shuffled"
      subjectDistribution = "equal", // "equal" | "custom"
      subjectDetails = "", // extra instructions per subject
    } = req.body;

    const parsedCount = Math.min(Math.max(Number(count) || 10, 1), 100);

    // Build subject instructions if multi_subject is selected
    let subjectInstructionText = "";
    if (subjectMode === "multi_subject" && Array.isArray(subjects) && subjects.length > 0) {
      subjectInstructionText = `
PENTING - KETENTUAN PENGELOMPOKAN MATA PELAJARAN:
Pembuat soal meminta soal dikelompokkan dan didistribusikan ke mata pelajaran berikut:
Daftar Mata Pelajaran yang WAJIB dimuat: ${subjects.join(", ")}.
- Total soal yang harus dibuat: ${parsedCount} soal.
- Distribusi: Bagi rata atau proporsional ke semua mata pelajaran tersebut. Setiap mata pelajaran minimal memiliki 1 soal.
- Setiap objek soal WAJIB menyertakan field "category" yang diisi PERSIS salah satu dari mata pelajaran di atas (${subjects.join(", ")}).
${
  groupingOrder === "grouped"
    ? "- Pengelompokan: Urutkan hasil soal BERKELOMPOK per mata pelajaran (contoh: semua soal mata pelajaran A berurutan dulu, kemudian mata pelajaran B, dst)."
    : "- Pengelompokan: Campur atau acak variasi mata pelajaran secara dinamis."
}
${subjectDetails ? `- Arahan / Spesifikasi Materi per Mata Pelajaran: ${subjectDetails}` : ""}
`;
    }

    const promptText = `Anda adalah master pembuat soal kuis game show cerdas cermat bergengsi "Class of Champions" (COC).
Buatkan ${parsedCount} soal pembelajaran berkualitas tinggi dan menarik dengan ketentuan:
- Topik / Materi Utama: ${topic}
- Tingkat Kesulitan: ${difficulty} (Mudah: 100 poin, Sedang: 200 poin, Sukar: 300 poin)
- Bahasa: ${language}
- Tipe Soal yang diizinkan: ${Array.isArray(questionTypes) && questionTypes.length > 0 ? questionTypes.join(", ") : "multiple_choice, short_answer, matching, true_false"}
${customPrompt ? `- Instruksi Tambahan Umum: ${customPrompt}` : ""}
${subjectInstructionText}

Ketentuan Format Tiap Tipe Soal:
1. "multiple_choice":
   - question: teks pertanyaan yang jelas, menantang, dan edukatif
   - options: array berisi 4 pilihan string (contoh: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"])
   - correctAnswer: jawaban yang benar persis sama dengan salah satu teks pilihan di options
2. "short_answer":
   - question: pertanyaan isian singkat (jawaban berupa 1-3 kata atau angka)
   - acceptedAnswers: array string variasi jawaban yang benar (huruf kecil/besar tidak masalah, contoh: ["Fotosintesis", "fotosintesa"])
   - correctAnswer: jawaban utama yang benar
3. "matching":
   - question: instruksi menjodohkan (contoh: "Jodohkan istilah berikut dengan penjelasannya!")
   - pairs: array objek minimal 3 sampai 4 pasang: [{ "left": "Istilah A", "right": "Arti A" }, { "left": "Istilah B", "right": "Arti B" }, ...]
4. "true_false":
   - question: pernyataan yang harus dinilai benar atau salah
   - correctAnswer: "Benar" atau "Salah"
   - options: ["Benar", "Salah"]

Berikan output murni dalam format JSON array tanpa markdown format triple backtick dan tanpa teks pengantar:
[
  {
    "question": "string teks soal",
    "category": "string nama mata pelajaran / bidang soal (misal: Matematika, Fisika, Biologi, Kimia, Geografi, Sejarah, Bahasa Indonesia, dll)",
    "type": "multiple_choice" | "short_answer" | "matching" | "true_false",
    "difficulty": "Mudah" | "Sedang" | "Sukar",
    "points": number (100 untuk Mudah, 200 untuk Sedang, 300 untuk Sukar),
    "timeLimit": number (dalam detik, misal 30 atau 45),
    "options": ["pilihan A", "pilihan B", "pilihan C", "pilihan D"] (hanya untuk multiple_choice & true_false),
    "correctAnswer": "jawaban benar",
    "acceptedAnswers": ["jawaban 1", "jawaban 2"] (untuk short_answer),
    "pairs": [{"left": "A", "right": "B"}] (hanya untuk matching),
    "explanation": "penjelasan singkat edukatif mengapa jawaban tersebut benar"
  }
]`;

    const ai = getGeminiClient();

    // Call Gemini with model fallback if needed
    let rawText = "";
    const modelsToTry = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptText,
          config: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        });
        rawText = response.text || "";
        if (rawText) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Gagal memanggil model ${modelName}:`, err.message || err);
      }
    }

    if (!rawText) {
      throw lastError || new Error("Gemini AI tidak memberikan respons yang valid.");
    }
    let questionsData = [];
    try {
      questionsData = JSON.parse(rawText);
    } catch (parseErr) {
      // Fallback: extract json from markdown
      const match = rawText.match(/\[[\s\S]*\]/);
      if (match) {
        questionsData = JSON.parse(match[0]);
      } else {
        throw new Error("Gagal mengurai respons JSON dari Gemini: " + rawText.slice(0, 100));
      }
    }

    // Sanitize and ensure IDs and numbering
    const formattedQuestions = (Array.isArray(questionsData) ? questionsData : []).map(
      (q: any, index: number) => {
        const diff = q.difficulty || "Sedang";
        let defaultPts = 200;
        if (diff === "Mudah") defaultPts = 100;
        if (diff === "Sukar") defaultPts = 300;

        return {
          id: `q_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
          number: index + 1,
          question: q.question || `Pertanyaan #${index + 1}`,
          category: q.category || q.field || q.subject || topic || "Umum",
          type: q.type || "multiple_choice",
          difficulty: diff,
          points: Number(q.points) || defaultPts,
          timeLimit: Number(q.timeLimit) || 30,
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: q.correctAnswer || "",
          acceptedAnswers: Array.isArray(q.acceptedAnswers)
            ? q.acceptedAnswers
            : q.correctAnswer
            ? [q.correctAnswer]
            : [],
          pairs: Array.isArray(q.pairs) ? q.pairs : [],
          explanation: q.explanation || "Pembahasan untuk soal ini.",
        };
      }
    );

    res.json({
      success: true,
      count: formattedQuestions.length,
      questions: formattedQuestions,
    });
  } catch (error: any) {
    console.error("Error generating questions with Gemini:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Terjadi kesalahan saat memproses permintaan ke Gemini AI.",
    });
  }
});

// Persistent Question Package Storage (Disk & JSON)
const DATA_DIR = path.join(process.cwd(), "data");
const PACKAGES_FILE = path.join(DATA_DIR, "saved_packages.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PACKAGES_FILE)) {
    fs.writeFileSync(PACKAGES_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function getSavedPackages(): any[] {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(PACKAGES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading saved packages file:", err);
    return [];
  }
}

function savePackagesToFile(packages: any[]): void {
  ensureDataFile();
  fs.writeFileSync(PACKAGES_FILE, JSON.stringify(packages, null, 2), "utf-8");
}

// 1. Get all saved question packages
app.get("/api/saved-packages", (_req, res) => {
  const packages = getSavedPackages();
  res.json({ success: true, packages });
});

// 2. Save or update a question package
app.post("/api/saved-packages", (req, res) => {
  try {
    const { id, name, topic, date, count, questions, source } = req.body;
    if (!name || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Nama paket dan daftar soal wajib diisi.",
      });
    }

    const packages = getSavedPackages();
    const pkgId = id || `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newPackage = {
      id: pkgId,
      name: String(name).trim(),
      topic: topic || "Umum",
      date: date || new Date().toISOString(),
      count: questions.length,
      source: source || "ai",
      questions,
    };

    const existingIdx = packages.findIndex((p: any) => p.id === pkgId);
    let updatedPackages;
    if (existingIdx >= 0) {
      updatedPackages = [...packages];
      updatedPackages[existingIdx] = newPackage;
    } else {
      updatedPackages = [newPackage, ...packages];
    }

    savePackagesToFile(updatedPackages);
    res.json({
      success: true,
      package: newPackage,
      packages: updatedPackages,
      message: `Paket soal "${newPackage.name}" berhasil disimpan permanen.`,
    });
  } catch (err: any) {
    console.error("Error saving package:", err);
    res.status(500).json({ success: false, message: err?.message || "Gagal menyimpan paket soal." });
  }
});

// 3. Delete a saved package
app.delete("/api/saved-packages/:id", (req, res) => {
  try {
    const { id } = req.params;
    const packages = getSavedPackages();
    const filtered = packages.filter((p: any) => p.id !== id);
    savePackagesToFile(filtered);
    res.json({
      success: true,
      packages: filtered,
      message: "Paket soal berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("Error deleting package:", err);
    res.status(500).json({ success: false, message: err?.message || "Gagal menghapus paket soal." });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Class of Champions server running on http://localhost:${PORT}`);
  });
}

startServer();
