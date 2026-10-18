Add-Type -AssemblyName System.Speech

$scenes = @(
  @{
    index = 0
    id = "scene1"
    title = "Introduction"
    text = "Welcome to MediLens AI, an intelligent medical report understanding assistant built for the Google Cloud AI Builder Cup. Laboratory reports are filled with complex abbreviations and reference ranges that cause patient anxiety. MediLens AI bridges this healthcare communication gap safely and reliably."
  },
  @{
    index = 1
    id = "scene2"
    title = "1-Click Intake & Multimodal Gemini Extraction"
    text = "Patients can upload laboratory documents or test immediately using our convenient one-click sample report. Google Gemini 1.5 Flash multimodal understanding extracts multi-column biomarker tables, preserving raw values, units, and printed laboratory flags without hallucinating missing data."
  },
  @{
    index = 2
    id = "scene3"
    title = "Deterministic Numerical Range Evaluation"
    text = "Patient safety requires absolute mathematical certainty. MediLens AI uses deterministic application code to evaluate measurements against laboratory intervals. In our sample Complete Blood Count, Hemoglobin is 10.8 grams per deciliter, correctly classified as Below Range without relying on generic LLM guesses."
  },
  @{
    index = 3
    id = "scene4"
    title = "Grounded MedlinePlus & NIH Medical RAG"
    text = "For every extracted biomarker, our Retrieval-Augmented Generation agent retrieves authoritative clinical literature from MedlinePlus and the National Institutes of Health. Patient explanations translate clinical jargon into plain language with clickable citations and exact literature passages."
  },
  @{
    index = 4
    id = "scene5"
    title = "Doctor Consultation Preparation"
    text = "MediLens AI never diagnoses disease or prescribes treatment. Instead, it equips patients with a structured Doctor Consultation Checklist, suggesting prioritized questions and identifying missing context such as fasting status and current medications that affect laboratory results."
  },
  @{
    index = 5
    id = "scene6"
    title = "Longitudinal Trend & Verified Unit Conversions"
    text = "When comparing reports across dates, clinics often use different units. Our comparison engine applies verified conversion factors, converting Glucose from 5.5 millimoles per liter to 99.1 milligrams per deciliter, calculating safe mathematical deltas with clinically neutral trend descriptions."
  },
  @{
    index = 6
    id = "scene7"
    title = "Clinician-Reviewed Safety Escalation"
    text = "For critical panic values, such as a Potassium level of 6.8 millimoles per liter, our Safety Agent triggers a high-priority clinical alert based on College of American Pathologists consensus rules, immediately advising the patient to seek urgent emergency medical evaluation."
  },
  @{
    index = 7
    id = "scene8"
    title = "Google Cloud Run & Production Architecture"
    text = "MediLens AI is fully containerized on Google Cloud Run with Firebase Authentication and Cloud Firestore for user-isolated security. With 28 out of 28 passing automated tests, MediLens AI delivers enterprise-grade medical report intelligence ready to scale."
  }
)

$outputDir = "F:\APL\medilens-ai\video_assets"
if (!(Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$metadata = @()

foreach ($s in $scenes) {
  $wavPath = Join-Path $outputDir ($s.id + ".wav")
  $syn = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $syn.Rate = 0
  $syn.SetOutputToWaveFile($wavPath)
  $syn.Speak($s.text)
  $syn.Dispose()

  $bytes = (Get-Item $wavPath).Length
  $metadata += @{
    index = $s.index
    id = $s.id
    title = $s.title
    wavPath = $wavPath
    fileBytes = $bytes
  }
  Write-Host "Generated audio for $($s.id): $bytes bytes"
}

$jsonPath = Join-Path $outputDir "audio_scenes.json"
$metadata | ConvertTo-Json | Set-Content $jsonPath -Encoding UTF8
Write-Host "Audio generation complete. Metadata saved to $jsonPath"
