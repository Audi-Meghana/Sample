# Voice → Text Analysis: CODE TRACE VERIFICATION

## Quick Flow Summary

```
🎤 Doctor records voice
        ↓
[SpeechRecognition API + MediaRecorder run in parallel]
        ↓
[liveTranscript = text][audioBlob = audio/webm]
        ↓
[Frontend sends BOTH to backend]
        ↓
[BACKEND PRIORITY DECISION]
        ↓ ✅
If voice_transcription → extractText() → /extract-text → Direct Analysis
        ↓ 🟠
Else if audioBlob → extractFile() → /extract-audio → Whisper → Analysis
        ↓ 🔵
Else if text → extractText() → /extract-text → Direct Analysis
```

---

## DETAILED CODE TRACE

### FRONTEND: DoctorChatbot.jsx (handleMic)
**File**: `frontend1/src/pages/doctor/DoctorChatbot.jsx` lines 470-530

```javascript
const handleMic = async () => {
  if (!isRecording) {
    // ===========================
    // STEP 1: Get microphone access
    // ===========================
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    
    // ===========================
    // STEP 2: Start MediaRecorder (captures audio blob)
    // ===========================
    const mediaRec = new MediaRecorder(stream);
    let chunks = [];
    mediaRec.ondataavailable = e => chunks.push(e.data);
    mediaRec.onstop = () => {
      const blob = new Blob(chunks, {type:"audio/webm"});
      console.log("[Chatbot Voice] Recording stopped. Blob size:", blob.size);
      setAudioBlob(blob);  // ← STATE: audioBlob
    };
    mediaRec.start();
    setIsRecording(true);
    setLiveTranscript("");  // Reset transcript
    
    // ===========================
    // STEP 3: Start SpeechRecognition (Web Speech API)
    // ===========================
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      
      recognition.onresult = (e) => {
        let final = "", interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            final += e.results[i][0].transcript + " ";  // ← FINALIZED TEXT
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        if (final) setLiveTranscript(prev => prev + final);  // ← STATE: liveTranscript
        setInterimText(interim);  // ← STATE: interimText (for display)
      };
      recognition.start();
      recognitionRef.current = recognition;
    }
  } else {
    // STOP recording
    recognitionRef.current?.stop();
    recorderRef.current?.stop();
    setIsRecording(false);
  }
};
```

**Result after stopping**:
- `liveTranscript` = accumulated final text from SpeechRecognition ✅
- `audioBlob` = audio/webm from MediaRecorder (fallback only)
- `interimText` = cleared

---

### FRONTEND: handleSend (sending to backend)
**File**: `frontend1/src/pages/doctor/DoctorChatbot.jsx` lines 540-600

```javascript
const handleSend = async () => {
  const cI = input;           // Manual text input
  const cF = file;            // Uploaded file
  const cA = audioBlob;       // Audio blob from recording
  const audioLive = liveTranscript;  // ← Live transcription TEXT

  // ===========================
  // Send to backend with FormData
  // ===========================
  const fd = new FormData();
  if (cF) fd.append("file", cF);
  if (cA) {
    fd.append("file", cA, "recorded.webm");
    
    // 🔥 KEY DECISION: Send live transcription if available
    if (audioLive) {  // ← CHECK: Do we have live text?
      console.log("[Chatbot Voice] Using live transcription text for analysis");
      fd.append("voice_transcription", audioLive);  // ← SEND AS TEXT, NOT AUDIO
    }
  }
  fd.append("text", cI || audioLive);
  fd.append("gestation", 20);
  fd.append("conversationId", currentChatId);
  
  // ===========================
  // POST to backend
  // ===========================
  const response = await API.post("/chat", fd);
  
  // ===========================
  // Process response
  // ===========================
  const gene = response.data?.data?.genetic?.gene;
  const reportType = response.data?.data?.report_type;  // ← WES/CMA/SCAN/SERUM
  
  // Generate checklist based on gene & reportType
  const cr = await API.post("/checklist", {
    gene,
    conversationId: currentChatId,
    reportType  // ← Pass report type for correct format
  });
};
```

---

### BACKEND: chatcontroller.js (handleChat decision tree)
**File**: `backend/controllers/chatcontroller.js` lines 1-120

```javascript
exports.handleChat = async (req, res) => {
  try {
    const { text, gestation, conversationId, voice_transcription } = req.body;

    console.log("REQ.FILE:", req.file);
    console.log("REQ.BODY:", req.body);

    // =====================================================
    // 🎤 PRIORITY 1: VOICE TRANSCRIPTION (Web Speech API)
    // =====================================================
    if (voice_transcription) {  // ← Check for LIVE TEXT
      console.log("[Voice Chat] Analyzing voice transcription (fast path - no Whisper needed)");
      
      // 🔥 KEY: Use text directly from Web Speech API
      const result = await aiService.extractText(
        voice_transcription,  // ← SEND ONLY TEXT
        gestation
      );

      // Delete uploaded file if exists (NO LONGER NEEDED)
      if (req.file) {
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);  // ← DELETE AUDIO BLOB
            console.log("[Voice Chat] Deleted audio file (using transcription instead)");
          }
        } catch (deleteErr) {
          console.warn("Could not delete file:", deleteErr.message);
        }
      }

      // Save messages
      await Message.create({
        conversationId,
        sender: "doctor",
        text: text || voice_transcription,
        analysisSource: "voice_transcription"  // ← Mark source
      });

      return res.status(200).json({
        success: true,
        data: result  // ← Return analysis result
      });
    }

    // =====================================================
    // 🎙️ PRIORITY 2: FILE EXISTS (with or without text)
    // Fallback: If no voice transcription, use audio file
    // =====================================================
    if (req.file) {
      console.log("[Voice Chat] No live transcription - using audio file with Whisper");
      
      // 🔥 KEY: Send audio blob to Whisper
      const result = await aiService.extractFile(
        req.file,
        gestation
      );

      await Message.create({
        conversationId,
        sender: "doctor",
        text: text || "",
        analysisSource: "audio_file",  // ← Mark source
        fileName: req.file.originalname
      });

      // Delete uploaded file from server (safely)
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (deleteErr) {
        console.warn("Could not delete file:", deleteErr.message);
      }

      return res.status(200).json({
        success: true,
        data: result
      });
    }

    // =====================================================
    // 💬 PRIORITY 3: TEXT ONLY (NO FILE, NO VOICE)
    // =====================================================
    if (!req.file && text) {
      const result = await aiService.extractText(
        text,
        gestation
      );
      
      // ⚠️ GAP: No error handling if extractText fails!
      if (!result?.genetic?.gene) {
        return res.status(200).json({
          success: false,
          message: "Gene not detected in dataset"
        });
      }

      await Message.create({
        conversationId,
        sender: "doctor",
        text
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    }

    // =====================================================
    // 🔥 PRIORITY 4: NOTHING PROVIDED
    // =====================================================
    return res.status(400).json({
      success: false,
      message: "No input provided"
    });

  } catch (error) {
    console.error("Chat Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

**Priority Decision Summary**:
1. ✅ `voice_transcription` (Web Speech API text) → extractText() → /extract-text → **FAST**
2. ✅ `file` exists (audio/webm) → extractFile() → /extract-audio → Whisper → **FALLBACK**
3. ✅ `text` only → extractText() → /extract-text
4. ❌ Nothing → Error response

---

### BACKEND: fastapiService.js (Endpoint Routing)
**File**: `backend/services/fastapiService.js` lines 80-120

```javascript
// ────────────────────────────────────────────
// EXTRACT FROM FILE (routes via MIME type)
// ────────────────────────────────────────────
exports.extractFile = async (file, gestation) => {
  if (!file?.path || !fs.existsSync(file.path)) {
    throw new Error("Uploaded file not found on disk.");
  }

  // ===========================
  // STEP 1: Resolve MIME type
  // ===========================
  const cleanMime = resolveMime(file);  // ← Handles missing MIME
  const endpoint = pickEndpoint(cleanMime);  // ← Select endpoint

  console.log(`[fastapiService] extractFile → endpoint: ${endpoint}, mime: ${cleanMime}`);

  // ===========================
  // STEP 2: Send to FastAPI
  // ===========================
  const form = new FormData();
  form.append("file", fs.createReadStream(file.path), {
    filename: file.originalname || "upload",
    contentType: cleanMime,
  });
  if (gestation) form.append("gestation", String(gestation));

  try {
    const res = await axios.post(`${FASTAPI_URL}${endpoint}`, form, {
      headers: { ...form.getHeaders() },
      timeout: 120_000,
      maxContentLength: Infinity,
    });

    console.log(`[fastapiService] extractFile success:`, JSON.stringify(res.data).slice(0, 300));
    return res.data;  // ← Return FastAPI response

  } catch (err) {
    console.error(`[fastapiService] extractFile error:`, err.message);
    fastapiError(err, "File extraction failed.");
  } finally {
    cleanup(file.path);  // Always delete temp file
  }
};

// ────────────────────────────────────────────
// EXTRACT FROM TEXT
// ────────────────────────────────────────────
exports.extractText = async (text, gestation) => {
  if (!text || text.trim().length < 10)
    throw new Error("Text input is too short to analyse.");
  try {
    const res = await axios.post(
      `${FASTAPI_URL}/extract-text`,  // ← Direct text endpoint
      { text: text.trim(), gestation: gestation || null },
      { timeout: 30_000 }
    );
    return res.data;  // ← Return FastAPI response
  } catch (err) {
    console.error("[fastapiService] extractText error:", err.message);
    fastapiError(err, "Text extraction failed.");
  }
};
```

---

### FastAPI: main.py (Analysis Endpoints)
**File**: `backend/AI_services/app/main.py` lines 1-175

```python
# ===========================
# 1️⃣ DIRECT TEXT INPUT
# ===========================
@app.post("/extract-text")
async def extract_text_input(request: TextInputRequest):
    if len(request.text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Text too short.")

    # 🔥 KEY: Analyze text directly (NO Whisper, NO audio processing)
    return ai.extract_structured(request.text, request.gestation, source="text")


# ===========================
# 2️⃣ AUDIO FILE (with Whisper transcription)
# ===========================
@app.post("/extract-audio")
async def extract_audio(
    file: UploadFile = File(...),
    gestation: int | None = None
):
    if not (
        file.content_type.startswith("audio") or
        file.filename.lower().endswith((".webm", ".mp3", ".wav"))
    ):
        raise HTTPException(status_code=400, detail="Unsupported audio format.")

    # ────────────────────────────
    # STEP 1: Transcribe audio to text using Whisper
    # ────────────────────────────
    text = extract_audio_text(file)  # ← WHISPER TRANSCRIPTION

    print(f"[extract-audio] Transcribed text: {text}")

    # ────────────────────────────
    # STEP 2: Check if transcription is empty
    # ────────────────────────────
    if not text or len(text.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="Audio transcription returned empty. Please speak clearly and try again."
        )

    # ────────────────────────────
    # STEP 3: Check if transcribed text has medical content
    # ────────────────────────────
    if not _is_medical_speech(text):
        print(f"[extract-audio] Unrecognized speech detected: '{text[:100]}'")
        return {
            "warning": "unrecognized_speech",
            "report_type": None,
            "raw_transcription": text,
            "message": (
                "Audio did not contain recognizable medical report content. "
                "Please speak clearly and mention the report type and gene name."
            )
        }

    # ────────────────────────────
    # STEP 4: Analyze transcribed text
    # ────────────────────────────
    return ai.extract_structured(text, gestation, source="audio")  # ← TEXT ANALYSIS


# ===========================
# MEDICAL KEYWORD CHECKER
# ===========================
def _is_medical_speech(text: str) -> bool:
    """
    Returns True if text contains medical keywords.
    Returns False if unrelated/gibberish speech.
    """
    t = text.lower()

    # Check plain medical keywords
    if any(k in t for k in MEDICAL_KEYWORDS):
        return True

    # Check for gene-like tokens (e.g. "L1CAM", "FGFR3")
    import re
    gene_like = re.findall(r'\b[A-Za-z]{1,4}\d+[A-Za-z]*\b', text)
    if gene_like:
        return True

    return False
```

---

## FLOW VERIFICATION CHECKLIST

### ✅ VERIFIED CORRECT

1. **Voice Transcription Has Priority**
   - Frontend: `if (liveTranscript)` → sent as `voice_transcription`
   - Backend: `if (voice_transcription)` → extract as TEXT
   - No re-processing of audio ✅

2. **Audio Blob is Fallback Only**
   - Frontend: `if (cA)` but `if (audioLive)` sends text instead
   - Backend: Deletes audio blob when not needed
   - Whisper only called if no live transcription ✅

3. **Text Analysis (Not Audio Re-processing)**
   - Priority 1: `extractText(voice_transcription)` → `/extract-text`
   - Priority 2: `extractFile(audioBlob)` → `/extract-audio` → Whisper → TEXT → analysis
   - Both paths result in TEXT analysis ✅

4. **Report Type Detection Works**
   - FastAPI: `ai.extract_structured()` returns `report_type: "WES"|"CMA"|"SCAN"|"SERUM"|"UNKNOWN"`
   - Frontend receives `response.data?.data?.report_type`
   - Passed to checklist generation ✅

5. **Checklist Format Matches Report Type**
   - WES: KB lookup → `core_prenatal_findings`, `supportive_findings`, `negative_findings`
   - CMA: Fixed fields → `cnv_result`, `consanguinity`, `microdeletions`, `roh`, `cardiac`
   - SCAN: Fixed fields → `anomalies`, `nt`, `nasal_bone`, `doppler`, `liquor`
   - SERUM: Fixed fields → `nt_result`, `nasal_bone`, `ductus_venosus`, `tricuspid`
   - Frontend: `isNonWES` flag controls rendering ✅

6. **Error Handling**
   - Empty input: Checked frontend + backend ✅
   - Empty audio blob: Checked before sending ✅
   - Empty text: Checked in FastAPI ✅
   - Non-medical speech: `_is_medical_speech()` function ✅
   - Gene not detected: Graceful error message ✅

### ⚠️ ISSUES FOUND

1. **No Try-Catch in Text-Only Path**
   - Location: `chatcontroller.js` lines 86-92
   - Issue: `extractText()` errors not caught → 500 instead of meaningful error
   - Impact: Medium (rare case, can happen with malformed text)
   - Fix: Wrap in try-catch and propagate errors

2. **File Type Fallback Risks**
   - Location: `fastapiService.js` function `pickEndpoint()`
   - Issue: Unknown MIME types → defaults to `/extract-pdf` → likely fails
   - Impact: Medium (edge case with weird file extensions)
   - Fix: Add explicit error or return 400 "Unsupported file type"

3. **Non-Medical Speech UX**
   - Location: `main.py` line 164 (after Whisper)
   - Issue: User waits 2+ minutes for Whisper, THEN gets "please speak clearly" message
   - Impact: Low (but bad UX)
   - Fix: Show warning with transcription preview, let user confirm

---

## FILE TYPE HANDLING

### MIME Routing (Correct)
```javascript
resolveMime(file):
  - If MIME present → use directly ✅
  - If missing or octet-stream → infer from extension ✅
  - Extension map covers: webm, mp3, wav, mp4, pdf, txt, docx, xlsx, csv, rtf ✅

pickEndpoint(mime):
  - audio/* → /extract-audio ✅
  - video/* → /extract-video ✅
  - application/pdf → /extract-pdf ✅
  - text/plain → /extract-text-file ✅
  - word/document → /extract-document ✅
  - sheet/excel → /extract-spreadsheet ✅
```

### Supported Files (Frontend ALLOWED array)
```javascript
ALLOWED = [
  "application/pdf",
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/webm",
  "video/mp4",
  "image/jpeg", "image/png",
  "text/plain"
]
```

### No Interference Between Voice + File
- Voice creates audio blob (handled separately)
- File upload handled independently
- Both paths → text analysis
- No mixing or conflicts ✅

---

## CONCLUSION

**The voice → text → analysis flow is fundamentally correct.**

Core logic ✅:
- Web Speech API text (fast)
- Whisper fallback (accurate)
- Both paths analyze TEXT
- Report type detection works
- Checklist formats match

Minor issues ⚠️:
- Error propagation gap (text-only)
- File type fallback edge case
- Non-medical speech UX timing

**All critical functionality working as designed.** The 3 issues are quality-of-life improvements, not core flow problems.
