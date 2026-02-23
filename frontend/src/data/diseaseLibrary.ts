export interface Disease {
  id: string;
  name: string;
  type: "Fish" | "Shrimp";
  description: string;
  symptoms: string;
  causes: string;
  treatment: string;
  prevention: string;
}

export const diseaseLibraryData: Disease[] = [
  // Fish Diseases
  {
    id: "fish-red-spot",
    name: "Red Spot Disease",
    type: "Fish",
    description: "A common bacterial condition where red lesions spread on skin and fins, often after stress or sudden water-quality changes.",
    symptoms: "Red lesions on body, loss of appetite, lethargy",
    causes: "Bacterial infection, poor water quality, stress",
    treatment: "Use antibacterial medicines, improve water quality, isolate infected fish",
    prevention: "Maintain clean water, avoid overcrowding, regular health checks",
  },
  {
    id: "fish-hemorrhagic",
    name: "Hemorrhagic Septicemia",
    type: "Fish",
    description: "A fast-progressing bacterial disease that causes internal bleeding, red streaks, and weakness, especially in crowded tanks or ponds.",
    symptoms: "Bleeding, red streaks on body and fins, rapid breathing",
    causes: "Severe bacterial infection, poor water conditions",
    treatment: "Antibiotics + water treatment, salt baths, quarantine",
    prevention: "Avoid overcrowding, maintain proper filtration, regular monitoring",
  },
  {
    id: "fish-gill",
    name: "Gill Disease",
    type: "Fish",
    description: "A respiratory disorder linked to gill damage, making fish gasp at the surface due to low oxygen uptake.",
    symptoms: "Damaged gills, breathing issues, gasping at surface",
    causes: "Poor water quality, parasites, bacteria",
    treatment: "Salt bath treatment, improve oxygenation, water changes",
    prevention: "Maintain oxygen levels, clean water, proper filtration",
  },
  {
    id: "fish-fungal",
    name: "Fungal Infection",
    type: "Fish",
    description: "An opportunistic fungal attack that appears as cotton-like white patches, usually after injury or poor hygiene.",
    symptoms: "White cotton-like patches, skin damage, lethargy",
    causes: "Fungal growth, injuries, poor water quality",
    treatment: "Antifungal medicine, salt baths, isolate infected fish",
    prevention: "Avoid injuries, maintain water quality, quarantine new fish",
  },
  {
    id: "fish-parasitic",
    name: "Parasitic Infection",
    type: "Fish",
    description: "Infestation by external or internal parasites that irritates skin and gills, reducing growth and appetite.",
    symptoms: "Scratching behavior, white spots, weight loss",
    causes: "Parasites, contaminated water, infected fish",
    treatment: "Anti-parasitic drugs, medicated food, water treatment",
    prevention: "Quarantine new fish, maintain hygiene, regular inspection",
  },
  {
    id: "fish-fin-rot",
    name: "Fin Rot / Tail Rot",
    type: "Fish",
    description: "A bacterial disease that slowly erodes fin and tail tissue, often starting at edges and progressing inward.",
    symptoms: "Damaged fins/tail, frayed edges, discoloration",
    causes: "Bacteria, poor water, injuries, stress",
    treatment: "Antibiotics, improve water quality, salt treatment",
    prevention: "Clean environment, avoid fin damage, proper feeding",
  },

  // Shrimp Diseases
  {
    id: "shrimp-black-spot",
    name: "Black Spot Disease",
    type: "Shrimp",
    description: "A shell-health issue where dark spots form on the exoskeleton, often linked to bacterial pressure and stressful pond conditions.",
    symptoms: "Black spots on shell, lethargy, reduced feeding",
    causes: "Bacterial infection, poor water quality, stress",
    treatment: "Water treatment, antibacterial agents, improve pond hygiene",
    prevention: "Clean pond, maintain water quality, avoid overcrowding",
  },
  {
    id: "shrimp-white-syndrome",
    name: "White Syndrome (Shell Damage)",
    type: "Shrimp",
    description: "A syndrome marked by white shell patches and shell weakening, commonly associated with pathogen load and poor biosecurity.",
    symptoms: "White patches, shell damage, reduced activity",
    causes: "Virus or bacteria, contaminated water, stress",
    treatment: "Isolate infected shrimp, improve water quality, biosecurity",
    prevention: "Avoid contamination, maintain biosecurity, regular monitoring",
  },
  {
    id: "shrimp-red-body",
    name: "Red Body Disease",
    type: "Shrimp",
    description: "A stress-related or infectious condition where the shrimp body turns reddish and activity drops sharply.",
    symptoms: "Red body color, lethargy, reduced feeding",
    causes: "Stress, infection, poor water quality",
    treatment: "Improve water quality, reduce stress factors, proper feeding",
    prevention: "Maintain pH, avoid sudden changes, proper pond management",
  },
  {
    id: "shrimp-white-muscle",
    name: "White Muscle Disease",
    type: "Shrimp",
    description: "A serious condition with whitening of muscle tissue and high mortality risk, frequently linked to viral infection.",
    symptoms: "White muscle tissue, lethargy, mortality",
    causes: "Viral infection, contaminated stock",
    treatment: "No cure, isolate infected shrimp, cull if necessary",
    prevention: "Biosecurity measures, quality stock, regular testing",
  },
];
