export interface CuratedMedicalArticle {
  id: string;
  testKeywords: string[];
  title: string;
  publisher: string;
  url: string;
  reviewedDate: string;
  accessedDate: string;
  passage: string;
}

export const CURATED_MEDICAL_KNOWLEDGE: CuratedMedicalArticle[] = [
  {
    id: 'MEDLINE-HGB-01',
    testKeywords: ['hemoglobin', 'hgb', 'hb', 'anemia', 'red blood cells'],
    title: 'Hemoglobin Test: MedlinePlus Medical Test',
    publisher: 'U.S. National Library of Medicine (MedlinePlus)',
    url: 'https://medlineplus.gov/lab-tests/hemoglobin-test/',
    reviewedDate: '2023-08-15',
    accessedDate: '2024-10-15',
    passage: 'Hemoglobin is an iron-rich protein in red blood cells that carries oxygen from your lungs to the rest of your body. Low hemoglobin levels may indicate anemia, blood loss, kidney disease, nutritional deficiencies (such as iron or vitamin B12), or chronic illness. High hemoglobin levels can be caused by dehydration, smoking, living at high altitudes, or lung conditions. Reference intervals differ between laboratories, biological sex, and age.'
  },
  {
    id: 'MEDLINE-WBC-01',
    testKeywords: ['white blood cell', 'wbc', 'leukocyte', 'infection'],
    title: 'White Blood Count (WBC): MedlinePlus Medical Test',
    publisher: 'U.S. National Library of Medicine (MedlinePlus)',
    url: 'https://medlineplus.gov/lab-tests/white-blood-count-wbc/',
    reviewedDate: '2023-09-20',
    accessedDate: '2024-10-15',
    passage: 'White blood cells (leukocytes) are part of your immune system that helps your body fight infections and other diseases. A high WBC count (leukocytosis) commonly results from infection, physical inflammation, severe physical stress, tissue damage, or certain medications (such as corticosteroids). A low WBC count (leukopenia) may be associated with viral infections, autoimmune conditions, bone marrow disorders, or severe nutritional deficiencies.'
  },
  {
    id: 'MEDLINE-PLT-01',
    testKeywords: ['platelet', 'platelets', 'plt', 'thrombocyte', 'bleeding'],
    title: 'Platelet Tests: MedlinePlus Medical Test',
    publisher: 'U.S. National Library of Medicine (MedlinePlus)',
    url: 'https://medlineplus.gov/lab-tests/platelet-tests/',
    reviewedDate: '2023-10-05',
    accessedDate: '2024-10-15',
    passage: 'Platelets are tiny, disc-shaped cell fragments in blood that help form clots to slow or stop bleeding. A low platelet count (thrombocytopenia) can cause easy bruising or prolonged bleeding and can be associated with medications, viral infections, enlarged spleen, or autoimmune destruction. A high platelet count (thrombocytosis) is frequently a reactive response to inflammation, iron deficiency, or infection.'
  },
  {
    id: 'MEDLINE-GLU-01',
    testKeywords: ['glucose', 'blood sugar', 'fasting glucose', 'diabetes'],
    title: 'Blood Glucose Test: MedlinePlus Medical Test',
    publisher: 'U.S. National Library of Medicine (MedlinePlus)',
    url: 'https://medlineplus.gov/lab-tests/blood-glucose-test/',
    reviewedDate: '2023-11-12',
    accessedDate: '2024-10-15',
    passage: 'A blood glucose test measures the amount of glucose (sugar) in your blood. Glucose is the main type of sugar in the blood and major source of energy for the body. Elevated fasting glucose may point toward insulin resistance, prediabetes, or diabetes, but can also temporarily rise due to acute stress, recent eating (if not fasting), or medications like steroids. Low blood glucose (hypoglycemia) can occur with certain diabetes medications, prolonged fasting, or liver conditions.'
  },
  {
    id: 'MEDLINE-K-01',
    testKeywords: ['potassium', 'k', 'k+', 'electrolyte', 'heart rhythm'],
    title: 'Potassium Blood Test: MedlinePlus Medical Test',
    publisher: 'U.S. National Library of Medicine (MedlinePlus)',
    url: 'https://medlineplus.gov/lab-tests/potassium-blood-test/',
    reviewedDate: '2023-07-19',
    accessedDate: '2024-10-15',
    passage: 'Potassium is an essential electrolyte that helps your nerves and muscles communicate and ensures proper heart rhythm. A high potassium level (hyperkalemia) can stem from reduced kidney function, certain blood pressure medications (e.g., ACE inhibitors), or cellular breakdown. A low potassium level (hypokalemia) often results from diuretic use, vomiting, diarrhea, or excessive sweating. Both high and low levels can affect cardiac stability and warrant clinical attention.'
  },
  {
    id: 'MEDLINE-NA-01',
    testKeywords: ['sodium', 'na', 'na+', 'electrolyte', 'hydration'],
    title: 'Sodium Blood Test: MedlinePlus Medical Test',
    publisher: 'U.S. National Library of Medicine (MedlinePlus)',
    url: 'https://medlineplus.gov/lab-tests/sodium-blood-test/',
    reviewedDate: '2023-08-01',
    accessedDate: '2024-10-15',
    passage: 'Sodium is a crucial electrolyte that balances water in your body and supports nerve and muscle function. High sodium (hypernatremia) is usually associated with dehydration, inadequate fluid intake, or excessive water loss. Low sodium (hyponatremia) can occur with fluid retention, heart failure, kidney disease, liver cirrhosis, severe diarrhea, or certain diuretic medications.'
  },
  {
    id: 'MEDLINE-CREAT-01',
    testKeywords: ['creatinine', 'kidney', 'renal', 'egfr', 'bun'],
    title: 'Creatinine Test: MedlinePlus Medical Test',
    publisher: 'U.S. National Library of Medicine (MedlinePlus)',
    url: 'https://medlineplus.gov/lab-tests/creatinine-test/',
    reviewedDate: '2023-10-22',
    accessedDate: '2024-10-15',
    passage: 'Creatinine is a chemical waste byproduct produced by normal muscle metabolism that healthy kidneys filter out of the blood and excrete in urine. Higher blood creatinine levels can indicate decreased kidney filtration efficiency, dehydration, high protein intake, or heavy muscular exercise. Lower levels may occur with lower muscle mass or pregnancy.'
  },
  {
    id: 'MEDLINE-LIPID-01',
    testKeywords: ['cholesterol', 'ldl', 'hdl', 'triglycerides', 'lipid'],
    title: 'Cholesterol Levels: What You Need to Know: MedlinePlus',
    publisher: 'U.S. National Library of Medicine (MedlinePlus)',
    url: 'https://medlineplus.gov/cholesterollevelswhatyouneedtoknow.html',
    reviewedDate: '2024-01-10',
    accessedDate: '2024-10-15',
    passage: 'A lipid panel measures total cholesterol, LDL (often referred to as low-density lipoprotein), HDL (high-density lipoprotein), and triglycerides. LDL carries cholesterol to tissues and higher levels can contribute to arterial plaque, whereas HDL helps clear cholesterol from arteries back to the liver. Optimal targets depend on overall cardiovascular risk, personal medical history, and clinical guidance rather than a single cutoff.'
  },
  {
    id: 'MEDLINE-ALT-01',
    testKeywords: ['alt', 'ast', 'alanine aminotransferase', 'liver enzymes', 'sgpt', 'sgot'],
    title: 'ALT Blood Test: MedlinePlus Medical Test',
    publisher: 'U.S. National Library of Medicine (MedlinePlus)',
    url: 'https://medlineplus.gov/lab-tests/alt-blood-test/',
    reviewedDate: '2023-11-01',
    accessedDate: '2024-10-15',
    passage: 'ALT (alanine aminotransferase) is an enzyme found mostly in liver cells. When liver cells are stressed or injured, ALT leaks into the bloodstream. Mild to moderate elevations can be associated with fatty liver disease, alcohol use, certain prescription medications or over-the-counter pain relievers, or viral hepatitis. Mild variations are common and need clinical review alongside other liver markers.'
  },
  {
    id: 'MEDLINE-TROP-01',
    testKeywords: ['troponin', 'cardiac', 'heart attack', 'myocardial'],
    title: 'Troponin Test: MedlinePlus Medical Test',
    publisher: 'U.S. National Library of Medicine (MedlinePlus)',
    url: 'https://medlineplus.gov/lab-tests/troponin-test/',
    reviewedDate: '2023-12-05',
    accessedDate: '2024-10-15',
    passage: 'Troponin proteins are released when heart muscle becomes damaged, such as during acute coronary syndromes or myocarditis. Normal circulating levels are typically extremely low or undetectable. Even small elevations above the upper reference limit indicate cardiac strain or injury and require prompt clinical evaluation in an emergency or acute care setting.'
  }
];
