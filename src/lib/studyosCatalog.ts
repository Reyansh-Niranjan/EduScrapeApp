// Auto-generated full StudyOS catalog across all grades 5-12
export type ClassNumber = "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";
export type StreamKey = "all" | "science" | "commerce" | "humanities";

export interface ChapterItem {
  code: string;
  name: string;
}

export interface ChapterGroup {
  label: string | null;
  chapters: ChapterItem[];
}

export interface SubjectData {
  icon: string;
  label: string;
  cacheKey: string;
  chapters?: ChapterItem[];
  groups?: ChapterGroup[];
}

export const CLASS_SUBJECT_ORDERS: Record<string, string[]> = {
  "5": ["c5_mathematics", "c5_evs", "c5_english", "c5_hindi"],
  "6": ["c6_science", "c6_mathematics", "c6_social_science", "c6_english", "c6_hindi"],
  "7": ["c7_science", "c7_mathematics", "c7_social_science", "c7_english", "c7_hindi"],
  "8": ["c8_science", "c8_mathematics", "c8_social_science", "c8_english", "c8_hindi"],
  "9": ["c9_science", "c9_mathematics", "c9_social_science", "c9_english", "c9_hindi"],
  "10": ["science", "mathematics", "social_science", "english", "hindi_a", "hindi_b"],
  "11": [
    "c11_physics", "c11_chemistry", "c11_biology", "c11_mathematics",
    "c11_accountancy", "c11_business_studies", "c11_economics",
    "c11_history", "c11_political_science", "c11_geography", "c11_sociology", "c11_psychology",
    "c11_english", "c11_hindi"
  ],
  "12": [
    "c12_physics", "c12_chemistry", "c12_biology", "c12_mathematics",
    "c12_accountancy", "c12_business_studies", "c12_economics",
    "c12_history", "c12_political_science", "c12_geography", "c12_sociology", "c12_psychology",
    "c12_english", "c12_hindi"
  ],
};

export const STREAM_SUBJECT_ORDERS: Record<string, Record<StreamKey, string[]>> = {
  "11": {
    all: CLASS_SUBJECT_ORDERS["11"],
    science: ["c11_physics", "c11_chemistry", "c11_biology", "c11_mathematics", "c11_english", "c11_hindi"],
    commerce: ["c11_accountancy", "c11_business_studies", "c11_economics", "c11_mathematics", "c11_english", "c11_hindi"],
    humanities: ["c11_history", "c11_political_science", "c11_geography", "c11_sociology", "c11_psychology", "c11_economics", "c11_english", "c11_hindi"],
  },
  "12": {
    all: CLASS_SUBJECT_ORDERS["12"],
    science: ["c12_physics", "c12_chemistry", "c12_biology", "c12_mathematics", "c12_english", "c12_hindi"],
    commerce: ["c12_accountancy", "c12_business_studies", "c12_economics", "c12_mathematics", "c12_english", "c12_hindi"],
    humanities: ["c12_history", "c12_political_science", "c12_geography", "c12_sociology", "c12_psychology", "c12_economics", "c12_english", "c12_hindi"],
  },
};

export function isBoardClass(classNum: string | number): boolean {
  const num = String(classNum).replace(/\D/g, "");
  return num === "10" || num === "12";
}


export const STUDYOS_CATALOG: Record<string, SubjectData> = {
  "science": {
    "icon": "🔬",
    "label": "Science",
    "cacheKey": "science",
    "groups": [
      {
        "label": null,
        "chapters": [
          {
            "code": "jesc101",
            "name": "Chemical Reactions and Equations"
          },
          {
            "code": "jesc102",
            "name": "Acids, Bases and Salts"
          },
          {
            "code": "jesc103",
            "name": "Metals and Non-metals"
          },
          {
            "code": "jesc104",
            "name": "Carbon and its Compounds"
          },
          {
            "code": "jesc105",
            "name": "Life Processes"
          },
          {
            "code": "jesc106",
            "name": "Control and Coordination"
          },
          {
            "code": "jesc107",
            "name": "How do Organisms Reproduce?"
          },
          {
            "code": "jesc108",
            "name": "Heredity"
          },
          {
            "code": "jesc109",
            "name": "Light — Reflection and Refraction"
          },
          {
            "code": "jesc110",
            "name": "The Human Eye and the Colourful World"
          },
          {
            "code": "jesc111",
            "name": "Electricity"
          },
          {
            "code": "jesc112",
            "name": "Magnetic Effects of Electric Current"
          },
          {
            "code": "jesc113",
            "name": "Our Environment"
          }
        ]
      }
    ]
  },
  "mathematics": {
    "icon": "📐",
    "label": "Mathematics",
    "cacheKey": "mathematics",
    "groups": [
      {
        "label": null,
        "chapters": [
          {
            "code": "jemh101",
            "name": "Real Numbers"
          },
          {
            "code": "jemh102",
            "name": "Polynomials"
          },
          {
            "code": "jemh103",
            "name": "Pair of Linear Equations in Two Variables"
          },
          {
            "code": "jemh104",
            "name": "Quadratic Equations"
          },
          {
            "code": "jemh105",
            "name": "Arithmetic Progressions"
          },
          {
            "code": "jemh106",
            "name": "Triangles"
          },
          {
            "code": "jemh107",
            "name": "Coordinate Geometry"
          },
          {
            "code": "jemh108",
            "name": "Introduction to Trigonometry"
          },
          {
            "code": "jemh109",
            "name": "Some Applications of Trigonometry"
          },
          {
            "code": "jemh110",
            "name": "Circles"
          },
          {
            "code": "jemh111",
            "name": "Areas Related to Circles"
          },
          {
            "code": "jemh112",
            "name": "Surface Areas and Volumes"
          },
          {
            "code": "jemh113",
            "name": "Statistics"
          },
          {
            "code": "jemh114",
            "name": "Probability"
          }
        ]
      }
    ]
  },
  "social_science": {
    "icon": "🌍",
    "label": "Social Science",
    "cacheKey": "social_science",
    "groups": [
      {
        "label": "Geography — Contemporary India",
        "chapters": [
          {
            "code": "jess101",
            "name": "Resources and Development"
          },
          {
            "code": "jess102",
            "name": "Forest and Wildlife Resources"
          },
          {
            "code": "jess103",
            "name": "Water Resources"
          },
          {
            "code": "jess104",
            "name": "Agriculture"
          },
          {
            "code": "jess105",
            "name": "Minerals and Energy Resources"
          },
          {
            "code": "jess106",
            "name": "Manufacturing Industries"
          },
          {
            "code": "jess107",
            "name": "Lifelines of National Economy"
          }
        ]
      },
      {
        "label": "Economics — Understanding Economic Development",
        "chapters": [
          {
            "code": "jess201",
            "name": "Development"
          },
          {
            "code": "jess202",
            "name": "Sectors of the Indian Economy"
          },
          {
            "code": "jess203",
            "name": "Money and Credit"
          },
          {
            "code": "jess204",
            "name": "Globalisation and the Indian Economy"
          },
          {
            "code": "jess205",
            "name": "Consumer Rights"
          }
        ]
      },
      {
        "label": "History — India and the Contemporary World",
        "chapters": [
          {
            "code": "jess301",
            "name": "The Rise of Nationalism in Europe"
          },
          {
            "code": "jess302",
            "name": "Nationalism in India"
          },
          {
            "code": "jess303",
            "name": "The Making of a Global World"
          },
          {
            "code": "jess304",
            "name": "The Age of Industrialisation"
          },
          {
            "code": "jess305",
            "name": "Print Culture and the Modern World"
          }
        ]
      },
      {
        "label": "Political Science — Democratic Politics",
        "chapters": [
          {
            "code": "jess401",
            "name": "Power Sharing"
          },
          {
            "code": "jess402",
            "name": "Federalism"
          },
          {
            "code": "jess403",
            "name": "Gender, Religion and Caste"
          },
          {
            "code": "jess404",
            "name": "Political Parties"
          },
          {
            "code": "jess405",
            "name": "Outcomes of Democracy"
          }
        ]
      }
    ]
  },
  "english": {
    "icon": "📖",
    "label": "English",
    "cacheKey": "english",
    "groups": [
      {
        "label": "First Flight",
        "chapters": [
          {
            "code": "jeff101",
            "name": "A Letter to God"
          },
          {
            "code": "jeff102",
            "name": "Nelson Mandela: Long Walk to Freedom"
          },
          {
            "code": "jeff103",
            "name": "Two Stories about Flying"
          },
          {
            "code": "jeff104",
            "name": "From the Diary of Anne Frank"
          },
          {
            "code": "jeff105",
            "name": "Glimpses of India"
          },
          {
            "code": "jeff106",
            "name": "Mijbil the Otter"
          },
          {
            "code": "jeff107",
            "name": "Madam Rides the Bus"
          },
          {
            "code": "jeff108",
            "name": "The Sermon at Benares"
          },
          {
            "code": "jeff109",
            "name": "The Proposal"
          }
        ]
      },
      {
        "label": "First Flight — Poetry",
        "chapters": [
          {
            "code": "jeff110",
            "name": "Dust of Snow / Fire and Ice"
          },
          {
            "code": "jeff111",
            "name": "A Tiger in the Zoo"
          },
          {
            "code": "jeff112",
            "name": "How to Tell Wild Animals"
          },
          {
            "code": "jeff113",
            "name": "The Ball Poem"
          },
          {
            "code": "jeff114",
            "name": "Amanda!"
          },
          {
            "code": "jeff115",
            "name": "The Trees"
          },
          {
            "code": "jeff116",
            "name": "Fog"
          },
          {
            "code": "jeff117",
            "name": "The Tale of Custard the Dragon"
          },
          {
            "code": "jeff118",
            "name": "For Anne Gregory"
          }
        ]
      },
      {
        "label": "Footprints Without Feet",
        "chapters": [
          {
            "code": "jefp101",
            "name": "A Triumph of Surgery"
          },
          {
            "code": "jefp102",
            "name": "The Thief’s Story"
          },
          {
            "code": "jefp103",
            "name": "The Midnight Visitor"
          },
          {
            "code": "jefp104",
            "name": "A Question of Trust"
          },
          {
            "code": "jefp105",
            "name": "Footprints without Feet"
          },
          {
            "code": "jefp106",
            "name": "The Making of a Scientist"
          },
          {
            "code": "jefp107",
            "name": "The Necklace"
          },
          {
            "code": "jefp108",
            "name": "Bholi"
          },
          {
            "code": "jefp109",
            "name": "The Book That Saved the Earth"
          }
        ]
      }
    ]
  },
  "hindi_a": {
    "icon": "🇮🇳",
    "label": "Hindi A",
    "cacheKey": "hindi_a",
    "groups": [
      {
        "label": "Kshitij — Kavya Khand (Poetry)",
        "chapters": [
          {
            "code": "jhks101",
            "name": "Surdas — Pad"
          },
          {
            "code": "jhks102",
            "name": "Tulsidas — Ram-Lakshman-Parshuram Samvad"
          },
          {
            "code": "jhks103",
            "name": "Jaishankar Prasad — Aatmakathya"
          },
          {
            "code": "jhks104",
            "name": "Suryakant Tripathi Nirala — Utsah, Ath Nahin Rahi Hai"
          },
          {
            "code": "jhks105",
            "name": "Nagarjun — Yeh Danturhit Muskan aur Fasal"
          },
          {
            "code": "jhks106",
            "name": "Manglesh Dabral — Sangatkaar"
          }
        ]
      },
      {
        "label": "Kshitij — Gadya Khand (Prose)",
        "chapters": [
          {
            "code": "jhks107",
            "name": "Swayam Prakash — Netaji Ka Chashma"
          },
          {
            "code": "jhks108",
            "name": "Ram Vriksha Benipuri — Balgobin Bhagat"
          },
          {
            "code": "jhks109",
            "name": "Yashpal — Lakhnavi Andaz"
          },
          {
            "code": "jhks110",
            "name": "Mannu Bhandari — Ek Kahani Yeh Bhi"
          },
          {
            "code": "jhks111",
            "name": "Yatindra Mishra — Naubatkhane mein Ibadatein"
          },
          {
            "code": "jhks112",
            "name": "Bhadant Anand Kausalyayan — Sanskriti"
          }
        ]
      },
      {
        "label": "Kritika",
        "chapters": [
          {
            "code": "jhkr101",
            "name": "Shivpujan Sahay — Mata Ka Anchal"
          },
          {
            "code": "jhkr102",
            "name": "Madhu Kankaria — Sana Sana Hath Jodi"
          },
          {
            "code": "jhkr103",
            "name": "Main Kyun Likhta Hoon"
          }
        ]
      }
    ]
  },
  "hindi_b": {
    "icon": "🇮🇳",
    "label": "Hindi B",
    "cacheKey": "hindi_b",
    "groups": [
      {
        "label": "Sparsh — Kavya Khand (Poetry)",
        "chapters": [
          {
            "code": "jhsp101",
            "name": "Kabir — Saakhi"
          },
          {
            "code": "jhsp102",
            "name": "Meerabai — Pad"
          },
          {
            "code": "jhsp103",
            "name": "Maithilisharan Gupt — Manushyata"
          },
          {
            "code": "jhsp104",
            "name": "Sumitranandan Pant — Parvat Pradesh mein Paavs"
          },
          {
            "code": "jhsp105",
            "name": "Viren Dangwal — Top"
          },
          {
            "code": "jhsp106",
            "name": "Kaifi Azmi — Kar Chale Hum Fida"
          },
          {
            "code": "jhsp107",
            "name": "Rabindranath Tagore — Aatmtran"
          }
        ]
      },
      {
        "label": "Sparsh — Gadya Khand (Prose)",
        "chapters": [
          {
            "code": "jhsp108",
            "name": "Premchand — Bade Bhai Sahab"
          },
          {
            "code": "jhsp109",
            "name": "Sita Ram Seksariya — Diary Ka Ek Panna"
          },
          {
            "code": "jhsp110",
            "name": "Leeladhar Mandloi — Tatara-Vamiro Katha"
          },
          {
            "code": "jhsp111",
            "name": "Teesri Kasam ke Shilpkaar Shailendra"
          },
          {
            "code": "jhsp112",
            "name": "Ab Kahan Dusron ke Dukh se Dukhi Hone Wale"
          },
          {
            "code": "jhsp113",
            "name": "Patjhar mein Tooti Pattiyaan"
          },
          {
            "code": "jhsp114",
            "name": "Habib Tanvir — Kartoos"
          }
        ]
      },
      {
        "label": "Sanchayan",
        "chapters": [
          {
            "code": "jhsy101",
            "name": "Harihar Kaka"
          },
          {
            "code": "jhsy102",
            "name": "Sapnon ke se Din"
          },
          {
            "code": "jhsy103",
            "name": "Topi Shukla"
          }
        ]
      }
    ]
  },
  "c5_mathematics": {
    "icon": "📐",
    "label": "Maths",
    "cacheKey": "c5_mathematics",
    "groups": [
      {
        "label": "Math Mela",
        "chapters": [
          {
            "code": "eemm101",
            "name": "Reading and Writing Large Numbers"
          },
          {
            "code": "eemm102",
            "name": "Fractions"
          },
          {
            "code": "eemm103",
            "name": "Angles"
          },
          {
            "code": "eemm104",
            "name": "Addition and Subtraction"
          },
          {
            "code": "eemm105",
            "name": "Measurement of Length"
          },
          {
            "code": "eemm106",
            "name": "Multiplication"
          },
          {
            "code": "eemm107",
            "name": "Shapes and Patterns"
          },
          {
            "code": "eemm108",
            "name": "Weight and Capacity"
          },
          {
            "code": "eemm109",
            "name": "Division"
          },
          {
            "code": "eemm110",
            "name": "Symmetry"
          },
          {
            "code": "eemm111",
            "name": "Perimeter and Area"
          },
          {
            "code": "eemm112",
            "name": "Measurement of Time"
          },
          {
            "code": "eemm113",
            "name": "Factors and Multiples"
          },
          {
            "code": "eemm114",
            "name": "Maps and Directions"
          },
          {
            "code": "eemm115",
            "name": "Data Handling"
          }
        ]
      }
    ]
  },
  "c5_evs": {
    "icon": "🌿",
    "label": "EVS",
    "cacheKey": "c5_evs",
    "groups": [
      {
        "label": "The World Around Us",
        "chapters": [
          {
            "code": "eeev101",
            "name": "Water"
          },
          {
            "code": "eeev102",
            "name": "Rivers"
          },
          {
            "code": "eeev103",
            "name": "Food and Preservation"
          },
          {
            "code": "eeev104",
            "name": "Our School"
          },
          {
            "code": "eeev105",
            "name": "India: Unity in Diversity"
          },
          {
            "code": "eeev106",
            "name": "India's Special Places"
          },
          {
            "code": "eeev107",
            "name": "Energy"
          },
          {
            "code": "eeev108",
            "name": "Cloth and Weaving"
          },
          {
            "code": "eeev109",
            "name": "Earth: Seasons and Changes"
          },
          {
            "code": "eeev110",
            "name": "Earth is Our Home"
          }
        ]
      }
    ]
  },
  "c5_english": {
    "icon": "📖",
    "label": "English",
    "cacheKey": "c5_english",
    "groups": [
      {
        "label": "Santoor",
        "chapters": [
          {
            "code": "eesa101",
            "name": "Papa's Spectacles"
          },
          {
            "code": "eesa102",
            "name": "The Hockey Ball"
          },
          {
            "code": "eesa103",
            "name": "Rainbow"
          },
          {
            "code": "eesa104",
            "name": "Freedom"
          },
          {
            "code": "eesa105",
            "name": "The Frog"
          },
          {
            "code": "eesa106",
            "name": "Water Tanks"
          },
          {
            "code": "eesa107",
            "name": "Gilli Danda"
          },
          {
            "code": "eesa108",
            "name": "The Farmer and the Well"
          },
          {
            "code": "eesa109",
            "name": "The Hawker"
          },
          {
            "code": "eesa110",
            "name": "Glass Bangles"
          }
        ]
      }
    ]
  },
  "c5_hindi": {
    "icon": "🇮🇳",
    "label": "Hindi",
    "cacheKey": "c5_hindi",
    "groups": [
      {
        "label": "Veena",
        "chapters": [
          {
            "code": "ehve101",
            "name": "Kiran"
          },
          {
            "code": "ehve102",
            "name": "Nyay Ki Kusi"
          },
          {
            "code": "ehve103",
            "name": "Chaand Ka Kurta"
          },
          {
            "code": "ehve104",
            "name": "Sanken"
          },
          {
            "code": "ehve105",
            "name": "Pyaar aur Wafadaari"
          },
          {
            "code": "ehve106",
            "name": "Chalak Kalakar"
          },
          {
            "code": "ehve107",
            "name": "Mera Bachpan"
          },
          {
            "code": "ehve108",
            "name": "Kaziranga"
          },
          {
            "code": "ehve109",
            "name": "Asli Insaaf"
          },
          {
            "code": "ehve110",
            "name": "Tiseen Machliyan"
          },
          {
            "code": "ehve111",
            "name": "Ajanta aur Elora"
          },
          {
            "code": "ehve112",
            "name": "Ganga"
          }
        ]
      }
    ]
  },
  "c8_science": {
    "icon": "🔬",
    "label": "Science",
    "cacheKey": "c8_science",
    "groups": [
      {
        "label": "Curiosity",
        "chapters": [
          {
            "code": "hecu101",
            "name": "The Investigative World of Science"
          },
          {
            "code": "hecu102",
            "name": "The Invisible Living World: Microorganisms"
          },
          {
            "code": "hecu103",
            "name": "Health: The Ultimate Treasure"
          },
          {
            "code": "hecu104",
            "name": "Electricity: Magnetic and Heating Effects"
          },
          {
            "code": "hecu105",
            "name": "Exploring Forces"
          },
          {
            "code": "hecu106",
            "name": "Pressure, Winds, Storms, and Cyclones"
          },
          {
            "code": "hecu107",
            "name": "Particulate Nature of Matter"
          },
          {
            "code": "hecu108",
            "name": "Elements, Compounds, and Mixtures"
          },
          {
            "code": "hecu109",
            "name": "Solutions: Solutes and Solvents"
          },
          {
            "code": "hecu110",
            "name": "Light: Mirrors and Lenses"
          },
          {
            "code": "hecu111",
            "name": "Keeping Time with the Skies"
          },
          {
            "code": "hecu112",
            "name": "How Nature Works in Harmony"
          },
          {
            "code": "hecu113",
            "name": "Earth: A Life-Sustaining Planet"
          }
        ]
      }
    ]
  },
  "c8_mathematics": {
    "icon": "📐",
    "label": "Maths",
    "cacheKey": "c8_mathematics",
    "groups": [
      {
        "label": "Part 1",
        "chapters": [
          {
            "code": "hegp101",
            "name": "A Square and a Cube"
          },
          {
            "code": "hegp102",
            "name": "Power Play"
          },
          {
            "code": "hegp103",
            "name": "A Story of Numbers"
          },
          {
            "code": "hegp104",
            "name": "Quadrilaterals"
          },
          {
            "code": "hegp105",
            "name": "Number Play"
          },
          {
            "code": "hegp106",
            "name": "We Distribute, Yet Things Multiply"
          },
          {
            "code": "hegp107",
            "name": "Proportional Reasoning 1"
          }
        ]
      },
      {
        "label": "Part 2",
        "chapters": [
          {
            "code": "hegp201",
            "name": "Fractions in Disguise"
          },
          {
            "code": "hegp202",
            "name": "The Baudhāyana–Pythagoras Theorem"
          },
          {
            "code": "hegp203",
            "name": "Proportional Reasoning 2"
          },
          {
            "code": "hegp204",
            "name": "Exploring Some Geometric Themes"
          },
          {
            "code": "hegp205",
            "name": "Tales by Dots and Lines"
          },
          {
            "code": "hegp206",
            "name": "Algebra Play"
          },
          {
            "code": "hegp207",
            "name": "Area"
          }
        ]
      }
    ]
  },
  "c8_social_science": {
    "icon": "🌍",
    "label": "Social Science",
    "cacheKey": "c8_social_science",
    "groups": [
      {
        "label": "Exploring Society",
        "chapters": [
          {
            "code": "hees101",
            "name": "Natural Resources and Their Use"
          },
          {
            "code": "hees102",
            "name": "Reshaping India's Political Map"
          },
          {
            "code": "hees103",
            "name": "The Rise of the Marathas"
          },
          {
            "code": "hees104",
            "name": "The Colonial Era in India"
          },
          {
            "code": "hees105",
            "name": "Universal Franchise and India's Electoral System"
          },
          {
            "code": "hees106",
            "name": "The Parliamentary System: Legislature and Executive"
          },
          {
            "code": "hees107",
            "name": "Factors of Production"
          }
        ]
      }
    ]
  },
  "c8_english": {
    "icon": "📖",
    "label": "English",
    "cacheKey": "c8_english",
    "groups": [
      {
        "label": "Poorvi",
        "chapters": [
          {
            "code": "hepr101",
            "name": "The Wit that Won Hearts"
          },
          {
            "code": "hepr102",
            "name": "A Concrete Example"
          },
          {
            "code": "hepr103",
            "name": "Wisdom Paves the Way"
          },
          {
            "code": "hepr104",
            "name": "A Tale of Valour"
          },
          {
            "code": "hepr105",
            "name": "Somebody's Mother"
          },
          {
            "code": "hepr106",
            "name": "Verghese Kurien — I Too Had A Dream"
          },
          {
            "code": "hepr107",
            "name": "The Case of the Fifth Word"
          },
          {
            "code": "hepr108",
            "name": "The Magic Brush of Dreams"
          },
          {
            "code": "hepr109",
            "name": "Spectacular Wonders"
          },
          {
            "code": "hepr110",
            "name": "The Cherry Tree"
          },
          {
            "code": "hepr111",
            "name": "Harvest Hymn"
          },
          {
            "code": "hepr112",
            "name": "Waiting for the Rain"
          },
          {
            "code": "hepr113",
            "name": "Feathered Friend"
          },
          {
            "code": "hepr114",
            "name": "Magnifying Glass"
          },
          {
            "code": "hepr115",
            "name": "Bibha Chowdhuri: The Beam of Light"
          }
        ]
      }
    ]
  },
  "c8_hindi": {
    "icon": "🇮🇳",
    "label": "Hindi",
    "cacheKey": "c8_hindi",
    "groups": [
      {
        "label": "Malhaar",
        "chapters": [
          {
            "code": "hhml101",
            "name": "Swadesh"
          },
          {
            "code": "hhml102",
            "name": "Do Gauraiya"
          },
          {
            "code": "hhml103",
            "name": "Ek Aashirvaad"
          },
          {
            "code": "hhml104",
            "name": "Haridwar"
          },
          {
            "code": "hhml105",
            "name": "Kabir ke Dohe"
          },
          {
            "code": "hhml106",
            "name": "Ek Tokri Bhar Mitti"
          },
          {
            "code": "hhml107",
            "name": "Mat Bandho"
          },
          {
            "code": "hhml108",
            "name": "Naye Mehman"
          },
          {
            "code": "hhml109",
            "name": "Aadmi ka Anupat"
          },
          {
            "code": "hhml110",
            "name": "Netaji Subhash Chandra Bose"
          }
        ]
      }
    ]
  },
  "c9_science": {
    "icon": "🔬",
    "label": "Science",
    "cacheKey": "c9_science",
    "groups": [
      {
        "label": "Exploration",
        "chapters": [
          {
            "code": "iesc101",
            "name": "Exploration: Entering the World of Secondary Science"
          },
          {
            "code": "iesc102",
            "name": "Cell: The Building Block of Life"
          },
          {
            "code": "iesc103",
            "name": "Tissues in Action"
          },
          {
            "code": "iesc104",
            "name": "Describing Motion Around Us"
          },
          {
            "code": "iesc105",
            "name": "Exploring Mixtures and their Separation"
          },
          {
            "code": "iesc106",
            "name": "How Forces Affect Motion"
          },
          {
            "code": "iesc107",
            "name": "Work, Energy, and Simple Machines"
          },
          {
            "code": "iesc108",
            "name": "Journey Inside the Atom"
          },
          {
            "code": "iesc109",
            "name": "Atomic Foundations of Matter"
          },
          {
            "code": "iesc110",
            "name": "Sound Waves: Characteristics and Applications"
          },
          {
            "code": "iesc111",
            "name": "Reproduction: How Life Continues"
          },
          {
            "code": "iesc112",
            "name": "Patterns in Life: Diversity and Classification"
          },
          {
            "code": "iesc113",
            "name": "Earth as a System: Energy, Matter, and Life"
          }
        ]
      }
    ]
  },
  "c9_mathematics": {
    "icon": "📐",
    "label": "Maths",
    "cacheKey": "c9_mathematics",
    "groups": [
      {
        "label": "Ganita Manjari",
        "chapters": [
          {
            "code": "iemh101",
            "name": "Orienting Yourself: The Use of Coordinates"
          },
          {
            "code": "iemh102",
            "name": "Introduction to Linear Polynomials"
          },
          {
            "code": "iemh103",
            "name": "The World of Numbers"
          },
          {
            "code": "iemh104",
            "name": "Exploring Algebraic Identities"
          },
          {
            "code": "iemh105",
            "name": "I'm Up and Down, and Round and Round"
          },
          {
            "code": "iemh106",
            "name": "Measuring Space: Perimeter and Area"
          },
          {
            "code": "iemh107",
            "name": "The Mathematics of Maybe: Introduction to Probability"
          },
          {
            "code": "iemh108",
            "name": "Predicting What Comes Next: Exploring Sequences and Progressions"
          }
        ]
      }
    ]
  },
  "c9_english": {
    "icon": "📖",
    "label": "English",
    "cacheKey": "c9_english",
    "groups": [
      {
        "label": "Prose",
        "chapters": [
          {
            "code": "iebe101",
            "name": "How I Taught My Grandmother to Read"
          },
          {
            "code": "iebe102",
            "name": "The Pot Maker"
          },
          {
            "code": "iebe103",
            "name": "Winds of Change"
          },
          {
            "code": "iebe104",
            "name": "Vitamin-M"
          },
          {
            "code": "iebe105",
            "name": "The World of Limitless Possibilities"
          },
          {
            "code": "iebe106",
            "name": "Twin Melodies"
          },
          {
            "code": "iebe107",
            "name": "Carrier of Words"
          },
          {
            "code": "iebe108",
            "name": "Follow That Dream"
          }
        ]
      },
      {
        "label": "Poetry",
        "chapters": [
          {
            "code": "iebe109",
            "name": "Bharat Our Land"
          },
          {
            "code": "iebe110",
            "name": "Gifts of Grace"
          },
          {
            "code": "iebe111",
            "name": "Canvas of Soil"
          },
          {
            "code": "iebe112",
            "name": "I Cannot Remember My Mother"
          },
          {
            "code": "iebe113",
            "name": "Nine Gold Medals"
          },
          {
            "code": "iebe114",
            "name": "A Friend Found in Music"
          },
          {
            "code": "iebe115",
            "name": "Words"
          },
          {
            "code": "iebe116",
            "name": "Always Believe in Yourself"
          }
        ]
      }
    ]
  },
  "c9_hindi": {
    "icon": "🇮🇳",
    "label": "Hindi",
    "cacheKey": "c9_hindi",
    "groups": [
      {
        "label": "Prose",
        "chapters": [
          {
            "code": "ihga101",
            "name": "Do Bailon Ki Katha"
          },
          {
            "code": "ihga102",
            "name": "Kya Likhu"
          },
          {
            "code": "ihga103",
            "name": "Samvadhin"
          },
          {
            "code": "ihga104",
            "name": "Aisi Bhi Batein Hoti Hain"
          },
          {
            "code": "ihga105",
            "name": "Aakhri Chattan Tak"
          },
          {
            "code": "ihga106",
            "name": "Ridh Ki Haddi"
          },
          {
            "code": "ihga107",
            "name": "Main Aur Mera Desh"
          }
        ]
      },
      {
        "label": "Poetry",
        "chapters": [
          {
            "code": "ihga108",
            "name": "Raidas Ke Pad"
          },
          {
            "code": "ihga109",
            "name": "Ram Lakshman Parshuram Samvad"
          },
          {
            "code": "ihga110",
            "name": "Bharati Jai Vijayakare"
          },
          {
            "code": "ihga111",
            "name": "Jhansi Ki Rani"
          },
          {
            "code": "ihga112",
            "name": "Ghar Ki Yaad"
          }
        ]
      }
    ]
  },
  "c9_social_science": {
    "icon": "🌍",
    "label": "Social Science",
    "cacheKey": "c9_social_science",
    "groups": [
      {
        "label": "Introduction",
        "chapters": [
          {
            "code": "iest101",
            "name": "Understanding Social Science"
          }
        ]
      },
      {
        "label": "Geography",
        "chapters": [
          {
            "code": "iest102",
            "name": "Shaping of the Earth's Surface"
          },
          {
            "code": "iest103",
            "name": "Atmosphere and Climate"
          }
        ]
      },
      {
        "label": "History",
        "chapters": [
          {
            "code": "iest104",
            "name": "Early Humans and Beginning of Civilisation"
          },
          {
            "code": "iest105",
            "name": "State and Society up to 1000 CE"
          }
        ]
      },
      {
        "label": "Political Science",
        "chapters": [
          {
            "code": "iest106",
            "name": "Democracy"
          },
          {
            "code": "iest107",
            "name": "Elections"
          }
        ]
      },
      {
        "label": "Economics",
        "chapters": [
          {
            "code": "iest108",
            "name": "Building Blocks in Economics: The Problem of Choice"
          },
          {
            "code": "iest109",
            "name": "The Price Puzzle: What Drives the Market"
          }
        ]
      }
    ]
  },
  "c7_science": {
    "icon": "🔬",
    "label": "Science",
    "cacheKey": "c7_science",
    "groups": [
      {
        "label": "Curiosity",
        "chapters": [
          {
            "code": "gecu101",
            "name": "The Ever-Evolving World of Science"
          },
          {
            "code": "gecu102",
            "name": "Exploring Substances: Acidic, Basic, and Neutral"
          },
          {
            "code": "gecu103",
            "name": "Electricity: Circuits and Their Components"
          },
          {
            "code": "gecu104",
            "name": "The World of Metals and Non-Metals"
          },
          {
            "code": "gecu105",
            "name": "Changes Around Us: Physical and Chemical"
          },
          {
            "code": "gecu106",
            "name": "Adolescence: A Stage of Growth and Change"
          },
          {
            "code": "gecu107",
            "name": "Heat Transfer in Nature"
          },
          {
            "code": "gecu108",
            "name": "Measurement of Time and Motion"
          },
          {
            "code": "gecu109",
            "name": "Life Processes in Animals"
          },
          {
            "code": "gecu110",
            "name": "Life Processes in Plants"
          },
          {
            "code": "gecu111",
            "name": "Light: Shadows and Reflections"
          },
          {
            "code": "gecu112",
            "name": "Earth, Moon, and the Sun"
          }
        ]
      }
    ]
  },
  "c7_mathematics": {
    "icon": "📐",
    "label": "Maths",
    "cacheKey": "c7_mathematics",
    "groups": [
      {
        "label": "Part 1",
        "chapters": [
          {
            "code": "gegp101",
            "name": "Large Numbers Around Us"
          },
          {
            "code": "gegp102",
            "name": "Arithmetic Expressions"
          },
          {
            "code": "gegp103",
            "name": "A Peek Beyond the Point"
          },
          {
            "code": "gegp104",
            "name": "Expressions Using Letter-Numbers"
          },
          {
            "code": "gegp105",
            "name": "Parallel and Intersecting Lines"
          },
          {
            "code": "gegp106",
            "name": "Number Play"
          },
          {
            "code": "gegp107",
            "name": "A Tale of Three Intersecting Lines"
          },
          {
            "code": "gegp108",
            "name": "Working with Fractions"
          }
        ]
      },
      {
        "label": "Part 2",
        "chapters": [
          {
            "code": "gegp201",
            "name": "Geometric Twins"
          },
          {
            "code": "gegp202",
            "name": "Operations with Integers"
          },
          {
            "code": "gegp203",
            "name": "Finding Common Ground"
          },
          {
            "code": "gegp204",
            "name": "Another Peek Beyond the Point"
          },
          {
            "code": "gegp205",
            "name": "Connecting the Dots"
          },
          {
            "code": "gegp206",
            "name": "Constructions and Tilings"
          },
          {
            "code": "gegp207",
            "name": "Finding the Unknown"
          }
        ]
      }
    ]
  },
  "c7_social_science": {
    "icon": "🌍",
    "label": "Social Science",
    "cacheKey": "c7_social_science",
    "groups": [
      {
        "label": "Part 1",
        "chapters": [
          {
            "code": "gees101",
            "name": "Geographical Diversity of India"
          },
          {
            "code": "gees102",
            "name": "Understanding the Weather"
          },
          {
            "code": "gees103",
            "name": "Climates of India"
          },
          {
            "code": "gees104",
            "name": "New Beginnings: Cities and States"
          },
          {
            "code": "gees105",
            "name": "The Rise of Empires"
          },
          {
            "code": "gees106",
            "name": "The Age of Reorganisation"
          },
          {
            "code": "gees107",
            "name": "The Gupta Era"
          },
          {
            "code": "gees108",
            "name": "How the Land Becomes Sacred"
          },
          {
            "code": "gees109",
            "name": "From the Rulers to the Ruled: Types of Government"
          },
          {
            "code": "gees110",
            "name": "The Constitution of India: An Introduction"
          },
          {
            "code": "gees111",
            "name": "From Barter to Money"
          },
          {
            "code": "gees112",
            "name": "Understanding Markets"
          }
        ]
      },
      {
        "label": "Part 2",
        "chapters": [
          {
            "code": "gees201",
            "name": "The Story of Indian Farming"
          },
          {
            "code": "gees202",
            "name": "India and Her Neighbours"
          },
          {
            "code": "gees203",
            "name": "Empires and Kingdoms: 6th to 10th Centuries"
          },
          {
            "code": "gees204",
            "name": "Turning Tides: 11th and 12th Centuries"
          },
          {
            "code": "gees205",
            "name": "India, A Home to Many"
          },
          {
            "code": "gees206",
            "name": "The State, the Government, and You"
          },
          {
            "code": "gees207",
            "name": "Infrastructure: Engine of India's Development"
          },
          {
            "code": "gees208",
            "name": "Banks and the Magic of Finance"
          }
        ]
      }
    ]
  },
  "c7_english": {
    "icon": "📖",
    "label": "English",
    "cacheKey": "c7_english",
    "groups": [
      {
        "label": "Poorvi",
        "chapters": [
          {
            "code": "gepr101",
            "name": "The Day the River Spoke"
          },
          {
            "code": "gepr102",
            "name": "Try Again"
          },
          {
            "code": "gepr103",
            "name": "Three Days to See"
          },
          {
            "code": "gepr104",
            "name": "Animals, Birds, and Dr. Dolittle"
          },
          {
            "code": "gepr105",
            "name": "A Funny Man"
          },
          {
            "code": "gepr106",
            "name": "Say the Right Thing"
          },
          {
            "code": "gepr107",
            "name": "My Brother's Great Invention"
          },
          {
            "code": "gepr108",
            "name": "Paper Boats"
          },
          {
            "code": "gepr109",
            "name": "North, South, East, West"
          },
          {
            "code": "gepr110",
            "name": "The Tunnel"
          },
          {
            "code": "gepr111",
            "name": "Travel"
          },
          {
            "code": "gepr112",
            "name": "Conquering the Summit"
          },
          {
            "code": "gepr113",
            "name": "A Homage to Our Brave Soldiers"
          },
          {
            "code": "gepr114",
            "name": "My Dear Soldiers"
          },
          {
            "code": "gepr115",
            "name": "Rani Abbakka"
          }
        ]
      }
    ]
  },
  "c7_hindi": {
    "icon": "🇮🇳",
    "label": "Hindi",
    "cacheKey": "c7_hindi",
    "groups": [
      {
        "label": "Malhaar",
        "chapters": [
          {
            "code": "ghml101",
            "name": "Maa, Kah Ek Kahani"
          },
          {
            "code": "ghml102",
            "name": "Teen Buddhiman"
          },
          {
            "code": "ghml103",
            "name": "Phool aur Kaanta"
          },
          {
            "code": "ghml104",
            "name": "Paani Re Paani"
          },
          {
            "code": "ghml105",
            "name": "Nahi Hona Bimaar"
          },
          {
            "code": "ghml106",
            "name": "Giridhar Kaviray ki Kundaliya"
          },
          {
            "code": "ghml107",
            "name": "Varsha-Bahar"
          },
          {
            "code": "ghml108",
            "name": "Shreya"
          },
          {
            "code": "ghml109",
            "name": "Chidiya"
          },
          {
            "code": "ghml110",
            "name": "Meera ke Pad"
          }
        ]
      }
    ]
  },
  "c6_science": {
    "icon": "🔬",
    "label": "Science",
    "cacheKey": "c6_science",
    "groups": [
      {
        "label": "Curiosity",
        "chapters": [
          {
            "code": "fecu101",
            "name": "The Wonderful World of Science"
          },
          {
            "code": "fecu102",
            "name": "Diversity in the Living World"
          },
          {
            "code": "fecu103",
            "name": "Mindful Eating: A Path to a Healthy Body"
          },
          {
            "code": "fecu104",
            "name": "Exploring Magnets"
          },
          {
            "code": "fecu105",
            "name": "Measurement of Length and Motion"
          },
          {
            "code": "fecu106",
            "name": "Materials Around Us"
          },
          {
            "code": "fecu107",
            "name": "Temperature and its Measurement"
          },
          {
            "code": "fecu108",
            "name": "A Journey through States of Water"
          },
          {
            "code": "fecu109",
            "name": "Methods of Separation in Everyday Life"
          },
          {
            "code": "fecu110",
            "name": "Living Creatures: Exploring their Characteristics"
          },
          {
            "code": "fecu111",
            "name": "Nature's Treasures"
          },
          {
            "code": "fecu112",
            "name": "Beyond Earth"
          }
        ]
      }
    ]
  },
  "c6_mathematics": {
    "icon": "📐",
    "label": "Maths",
    "cacheKey": "c6_mathematics",
    "groups": [
      {
        "label": "Ganita Prakash",
        "chapters": [
          {
            "code": "fegp101",
            "name": "Patterns in Mathematics"
          },
          {
            "code": "fegp102",
            "name": "Lines and Angles"
          },
          {
            "code": "fegp103",
            "name": "Number Play"
          },
          {
            "code": "fegp104",
            "name": "Data Handling and Presentation"
          },
          {
            "code": "fegp105",
            "name": "Prime Time"
          },
          {
            "code": "fegp106",
            "name": "Perimeter and Area"
          },
          {
            "code": "fegp107",
            "name": "Fractions"
          },
          {
            "code": "fegp108",
            "name": "Playing with Constructions"
          },
          {
            "code": "fegp109",
            "name": "Symmetry"
          },
          {
            "code": "fegp110",
            "name": "The Other Side of Zero"
          },
          {
            "code": "fegp1ps",
            "name": "Problem Sets"
          }
        ]
      }
    ]
  },
  "c6_social_science": {
    "icon": "🌍",
    "label": "Social Science",
    "cacheKey": "c6_social_science",
    "groups": [
      {
        "label": "Exploring Society: India and Beyond",
        "chapters": [
          {
            "code": "fees101",
            "name": "Locating Places on the Earth"
          },
          {
            "code": "fees102",
            "name": "Oceans and Continents"
          },
          {
            "code": "fees103",
            "name": "Landforms and Life"
          },
          {
            "code": "fees104",
            "name": "Timeline and Sources of History"
          },
          {
            "code": "fees105",
            "name": "India, That Is Bharat"
          },
          {
            "code": "fees106",
            "name": "The Beginnings of Indian Civilisation"
          },
          {
            "code": "fees107",
            "name": "India's Cultural Roots"
          },
          {
            "code": "fees108",
            "name": "Unity in Diversity"
          },
          {
            "code": "fees109",
            "name": "Family and Community"
          },
          {
            "code": "fees110",
            "name": "Grassroots Democracy — Part 1: Governance"
          },
          {
            "code": "fees111",
            "name": "Grassroots Democracy — Part 2: Rural Local Government"
          },
          {
            "code": "fees112",
            "name": "Grassroots Democracy — Part 3: Urban Local Government"
          },
          {
            "code": "fees113",
            "name": "The Value of Work"
          },
          {
            "code": "fees114",
            "name": "Economic Activities Around Us"
          }
        ]
      }
    ]
  },
  "c6_english": {
    "icon": "📖",
    "label": "English",
    "cacheKey": "c6_english",
    "groups": [
      {
        "label": "Poorvi",
        "chapters": [
          {
            "code": "fepr101",
            "name": "A Bottle of Dew"
          },
          {
            "code": "fepr102",
            "name": "The Raven and the Fox"
          },
          {
            "code": "fepr103",
            "name": "Rama to the Rescue"
          },
          {
            "code": "fepr104",
            "name": "The Unlikely Best Friends"
          },
          {
            "code": "fepr105",
            "name": "A Friend's Prayer"
          },
          {
            "code": "fepr106",
            "name": "The Chair"
          },
          {
            "code": "fepr107",
            "name": "Neem Baba"
          },
          {
            "code": "fepr108",
            "name": "What a Bird Thought"
          },
          {
            "code": "fepr109",
            "name": "Spices that Heal Us"
          },
          {
            "code": "fepr110",
            "name": "Change of Heart"
          },
          {
            "code": "fepr111",
            "name": "The Winner"
          },
          {
            "code": "fepr112",
            "name": "Yoga — A Way of Life"
          },
          {
            "code": "fepr113",
            "name": "Hamara Bharat — Incredible India!"
          },
          {
            "code": "fepr114",
            "name": "The Kites"
          },
          {
            "code": "fepr115",
            "name": "Ila Sachani: Embroidering Dreams with her Feet"
          }
        ]
      }
    ]
  },
  "c6_hindi": {
    "icon": "🇮🇳",
    "label": "Hindi",
    "cacheKey": "c6_hindi",
    "groups": [
      {
        "label": "Malhar",
        "chapters": [
          {
            "code": "fhml101",
            "name": "Matrabhoomi"
          },
          {
            "code": "fhml102",
            "name": "Goal"
          },
          {
            "code": "fhml103",
            "name": "Pehli Bund"
          },
          {
            "code": "fhml104",
            "name": "Haar Ki Jeet"
          },
          {
            "code": "fhml105",
            "name": "Rahim Ke Dohe"
          },
          {
            "code": "fhml106",
            "name": "Meri Maa"
          },
          {
            "code": "fhml107",
            "name": "Jalate Chalo"
          },
          {
            "code": "fhml108",
            "name": "Satriya Aur Bihu Nritya"
          },
          {
            "code": "fhml109",
            "name": "Maiya Main Nahin Makhan Khayo"
          },
          {
            "code": "fhml110",
            "name": "Pariksha"
          },
          {
            "code": "fhml111",
            "name": "Chetak Ki Veerta"
          },
          {
            "code": "fhml112",
            "name": "Hind Mahasagar Mein Chhota-Sa Hindustan"
          },
          {
            "code": "fhml113",
            "name": "Ped Ki Baat"
          }
        ]
      }
    ]
  },
  "c11_physics": {
    "icon": "⚡",
    "label": "Physics",
    "cacheKey": "c11_physics",
    "groups": [
      {
        "label": "Part 1",
        "chapters": [
          {
            "code": "keph101",
            "name": "Units and Measurements"
          },
          {
            "code": "keph102",
            "name": "Motion in a Straight Line"
          },
          {
            "code": "keph103",
            "name": "Motion in a Plane"
          },
          {
            "code": "keph104",
            "name": "Laws of Motion"
          },
          {
            "code": "keph105",
            "name": "Work, Energy and Power"
          },
          {
            "code": "keph106",
            "name": "System of Particles and Rotational Motion"
          },
          {
            "code": "keph107",
            "name": "Gravitation"
          }
        ]
      },
      {
        "label": "Part 2",
        "chapters": [
          {
            "code": "keph201",
            "name": "Mechanical Properties of Solids"
          },
          {
            "code": "keph202",
            "name": "Mechanical Properties of Fluids"
          },
          {
            "code": "keph203",
            "name": "Thermal Properties of Matter"
          },
          {
            "code": "keph204",
            "name": "Thermodynamics"
          },
          {
            "code": "keph205",
            "name": "Kinetic Theory"
          },
          {
            "code": "keph206",
            "name": "Oscillations"
          },
          {
            "code": "keph207",
            "name": "Waves"
          }
        ]
      }
    ]
  },
  "c11_chemistry": {
    "icon": "🧪",
    "label": "Chemistry",
    "cacheKey": "c11_chemistry",
    "groups": [
      {
        "label": "Part 1",
        "chapters": [
          {
            "code": "kech101",
            "name": "Some Basic Concepts of Chemistry"
          },
          {
            "code": "kech102",
            "name": "Structure of Atom"
          },
          {
            "code": "kech103",
            "name": "Classification of Elements and Periodicity in Properties"
          },
          {
            "code": "kech104",
            "name": "Chemical Bonding and Molecular Structure"
          },
          {
            "code": "kech105",
            "name": "Thermodynamics"
          },
          {
            "code": "kech106",
            "name": "Equilibrium"
          }
        ]
      },
      {
        "label": "Part 2",
        "chapters": [
          {
            "code": "kech201",
            "name": "Redox Reactions"
          },
          {
            "code": "kech202",
            "name": "Organic Chemistry: Some Basic Principles and Techniques"
          },
          {
            "code": "kech203",
            "name": "Hydrocarbons"
          }
        ]
      }
    ]
  },
  "c11_biology": {
    "icon": "🌿",
    "label": "Biology",
    "cacheKey": "c11_biology",
    "groups": [
      {
        "label": "Unit 1 — Diversity in Living World",
        "chapters": [
          {
            "code": "kebo101",
            "name": "The Living World"
          },
          {
            "code": "kebo102",
            "name": "Biological Classification"
          },
          {
            "code": "kebo103",
            "name": "Plant Kingdom"
          },
          {
            "code": "kebo104",
            "name": "Animal Kingdom"
          }
        ]
      },
      {
        "label": "Unit 2 — Structural Organisation",
        "chapters": [
          {
            "code": "kebo105",
            "name": "Morphology of Flowering Plants"
          },
          {
            "code": "kebo106",
            "name": "Anatomy of Flowering Plants"
          },
          {
            "code": "kebo107",
            "name": "Structural Organisation in Animals"
          }
        ]
      },
      {
        "label": "Unit 3 — Cell: Structure and Function",
        "chapters": [
          {
            "code": "kebo108",
            "name": "Cell: The Unit of Life"
          },
          {
            "code": "kebo109",
            "name": "Biomolecules"
          },
          {
            "code": "kebo110",
            "name": "Cell Cycle and Cell Division"
          }
        ]
      },
      {
        "label": "Unit 4 — Plant Physiology",
        "chapters": [
          {
            "code": "kebo111",
            "name": "Photosynthesis in Higher Plants"
          },
          {
            "code": "kebo112",
            "name": "Respiration in Plants"
          },
          {
            "code": "kebo113",
            "name": "Plant Growth and Development"
          }
        ]
      },
      {
        "label": "Unit 5 — Human Physiology",
        "chapters": [
          {
            "code": "kebo114",
            "name": "Breathing and Exchange of Gases"
          },
          {
            "code": "kebo115",
            "name": "Body Fluids and Circulation"
          },
          {
            "code": "kebo116",
            "name": "Excretory Products and their Elimination"
          },
          {
            "code": "kebo117",
            "name": "Locomotion and Movement"
          },
          {
            "code": "kebo118",
            "name": "Neural Control and Coordination"
          },
          {
            "code": "kebo119",
            "name": "Chemical Coordination and Integration"
          }
        ]
      }
    ]
  },
  "c11_mathematics": {
    "icon": "📐",
    "label": "Mathematics",
    "cacheKey": "c11_mathematics",
    "groups": [
      {
        "label": "Chapters",
        "chapters": [
          {
            "code": "kemh101",
            "name": "Sets"
          },
          {
            "code": "kemh102",
            "name": "Relations and Functions"
          },
          {
            "code": "kemh103",
            "name": "Trigonometric Functions"
          },
          {
            "code": "kemh104",
            "name": "Complex Numbers and Quadratic Equations"
          },
          {
            "code": "kemh105",
            "name": "Linear Inequalities"
          },
          {
            "code": "kemh106",
            "name": "Permutations and Combinations"
          },
          {
            "code": "kemh107",
            "name": "Binomial Theorem"
          },
          {
            "code": "kemh108",
            "name": "Sequences and Series"
          },
          {
            "code": "kemh109",
            "name": "Straight Lines"
          },
          {
            "code": "kemh110",
            "name": "Conic Sections"
          },
          {
            "code": "kemh111",
            "name": "Introduction to Three Dimensional Geometry"
          },
          {
            "code": "kemh112",
            "name": "Limits and Derivatives"
          },
          {
            "code": "kemh113",
            "name": "Statistics"
          },
          {
            "code": "kemh114",
            "name": "Probability"
          }
        ]
      }
    ]
  },
  "c11_english": {
    "icon": "📖",
    "label": "English",
    "cacheKey": "c11_english",
    "groups": [
      {
        "label": "Hornbill — Prose",
        "chapters": [
          {
            "code": "kehb101",
            "name": "The Portrait of a Lady"
          },
          {
            "code": "kehb102",
            "name": "We're Not Afraid to Die... if We Can All Be Together"
          },
          {
            "code": "kehb103",
            "name": "Discovering Tut: the Saga Continues"
          },
          {
            "code": "kehb104",
            "name": "The Ailing Planet: the Green Movement's Role"
          },
          {
            "code": "kehb105",
            "name": "The Adventure"
          },
          {
            "code": "kehb106",
            "name": "Silk Road"
          }
        ]
      },
      {
        "label": "Hornbill — Writing Skills",
        "chapters": [
          {
            "code": "kehb111",
            "name": "Note-making"
          },
          {
            "code": "kehb112",
            "name": "Summarising"
          },
          {
            "code": "kehb113",
            "name": "Sub-titling"
          },
          {
            "code": "kehb114",
            "name": "Essay-writing"
          }
        ]
      },
      {
        "label": "Woven Words — Short Stories",
        "chapters": [
          {
            "code": "keww101",
            "name": "The Lament"
          },
          {
            "code": "keww102",
            "name": "A Pair of Mustachios"
          },
          {
            "code": "keww103",
            "name": "The Rocking-horse Winner"
          },
          {
            "code": "keww104",
            "name": "The Adventure of the Three Garridebs"
          },
          {
            "code": "keww105",
            "name": "Pappachi's Moth"
          },
          {
            "code": "keww106",
            "name": "The Third and Final Continent"
          },
          {
            "code": "keww107",
            "name": "Glory at Twilight"
          },
          {
            "code": "keww108",
            "name": "The Luncheon"
          }
        ]
      },
      {
        "label": "Woven Words — Poetry",
        "chapters": [
          {
            "code": "keww111",
            "name": "Poetry: Introduction"
          },
          {
            "code": "keww112",
            "name": "Let Me Not to the Marriage of True Minds"
          },
          {
            "code": "keww113",
            "name": "Coming"
          },
          {
            "code": "keww114",
            "name": "Telephone Conversation"
          },
          {
            "code": "keww115",
            "name": "The World is too Much With Us"
          },
          {
            "code": "keww116",
            "name": "Mother Tongue"
          },
          {
            "code": "keww117",
            "name": "Hawk Roosting"
          },
          {
            "code": "keww118",
            "name": "For Elkana"
          },
          {
            "code": "keww119",
            "name": "Refugee Blues"
          },
          {
            "code": "keww120",
            "name": "Felling of the Banyan Tree"
          },
          {
            "code": "keww121",
            "name": "Ode to a Nightingale"
          },
          {
            "code": "keww122",
            "name": "Ajamil and the Tigers"
          }
        ]
      },
      {
        "label": "Woven Words — Essays",
        "chapters": [
          {
            "code": "keww131",
            "name": "Essays: Introduction"
          },
          {
            "code": "keww132",
            "name": "My Three Passions"
          },
          {
            "code": "keww133",
            "name": "Patterns of Creativity"
          },
          {
            "code": "keww134",
            "name": "Tribal Verse"
          },
          {
            "code": "keww135",
            "name": "What is a Good Book?"
          },
          {
            "code": "keww136",
            "name": "The Story"
          },
          {
            "code": "keww137",
            "name": "Bridges"
          }
        ]
      }
    ]
  },
  "c11_hindi": {
    "icon": "🇮🇳",
    "label": "Hindi",
    "cacheKey": "c11_hindi",
    "groups": [
      {
        "label": "Aaroh Bhag 1 — Gadya Khand",
        "chapters": [
          {
            "code": "khar101",
            "name": "Namak Ka Daroga"
          },
          {
            "code": "khar102",
            "name": "Miyan Nasiruddin"
          },
          {
            "code": "khar103",
            "name": "Apu Ke Saath Dhaai Saal"
          },
          {
            "code": "khar104",
            "name": "Vidai Sambhaashan"
          },
          {
            "code": "khar105",
            "name": "Galta Iron"
          },
          {
            "code": "khar106",
            "name": "Rajni"
          },
          {
            "code": "khar107",
            "name": "Jamun Ka Ped"
          },
          {
            "code": "khar108",
            "name": "Bharat Mata"
          }
        ]
      },
      {
        "label": "Aaroh Bhag 1 — Padya Khand",
        "chapters": [
          {
            "code": "khar109",
            "name": "Kabir"
          },
          {
            "code": "khar110",
            "name": "Meera Ke Pad"
          },
          {
            "code": "khar111",
            "name": "Ghar Ki Yaad"
          },
          {
            "code": "khar112",
            "name": "Champa"
          },
          {
            "code": "khar113",
            "name": "Ghazal"
          },
          {
            "code": "khar114",
            "name": "Akkamahadevi"
          },
          {
            "code": "khar115",
            "name": "Sabse Khatarnak"
          },
          {
            "code": "khar116",
            "name": "Aao Milkar Bachayein"
          }
        ]
      },
      {
        "label": "Vitan Bhag 1",
        "chapters": [
          {
            "code": "khvt101",
            "name": "Bhartiya Gayikaon Mein Bejod — Lata Mangeshkar"
          },
          {
            "code": "khvt102",
            "name": "Rajasthan ki Rajat Bundein"
          },
          {
            "code": "khvt103",
            "name": "Aalo-Andhari"
          },
          {
            "code": "khvt104",
            "name": "Bhartiya Kalaen"
          },
          {
            "code": "khvt105",
            "name": "Lekhakon ke Bare Mein"
          }
        ]
      }
    ]
  },
  "c11_geography": {
    "icon": "🗺️",
    "label": "Geography",
    "cacheKey": "c11_geography",
    "groups": [
      {
        "label": "India — Physical Environment (Book 1)",
        "chapters": [
          {
            "code": "kegy101",
            "name": "Location: Space Relations and India's Place in the World"
          },
          {
            "code": "kegy102",
            "name": "Structure and Physiography of India"
          },
          {
            "code": "kegy103",
            "name": "Drainage and Drainage System"
          },
          {
            "code": "kegy104",
            "name": "Weather and Climate"
          },
          {
            "code": "kegy105",
            "name": "Natural Vegetation"
          },
          {
            "code": "kegy106",
            "name": "Natural Hazards and Disasters"
          }
        ]
      },
      {
        "label": "Fundamentals of Physical Geography (Book 2)",
        "chapters": [
          {
            "code": "kegy201",
            "name": "Geography as a Discipline"
          },
          {
            "code": "kegy202",
            "name": "The Origin and Evolution of the Earth"
          },
          {
            "code": "kegy203",
            "name": "Interior of the Earth"
          },
          {
            "code": "kegy204",
            "name": "Distribution of Oceans and Continents"
          },
          {
            "code": "kegy205",
            "name": "Geomorphic Processes"
          },
          {
            "code": "kegy206",
            "name": "Landforms and Their Evolution"
          },
          {
            "code": "kegy207",
            "name": "Composition and Structure of Atmosphere"
          },
          {
            "code": "kegy208",
            "name": "Solar Radiation, Heat Balance and Temperature"
          },
          {
            "code": "kegy209",
            "name": "Atmospheric Pressure and Winds"
          },
          {
            "code": "kegy210",
            "name": "Water in the Atmosphere"
          },
          {
            "code": "kegy211",
            "name": "World Climate and Climate Change"
          },
          {
            "code": "kegy212",
            "name": "Water (Oceans)"
          },
          {
            "code": "kegy213",
            "name": "Movements of Ocean Water"
          },
          {
            "code": "kegy214",
            "name": "Biodiversity and Conservation"
          }
        ]
      }
    ]
  },
  "c11_history": {
    "icon": "📜",
    "label": "History",
    "cacheKey": "c11_history",
    "groups": [
      {
        "label": "Themes in World History",
        "chapters": [
          {
            "code": "kehs101",
            "name": "Early Societies: From Hunter-Gatherers to Urban Centres"
          },
          {
            "code": "kehs102",
            "name": "An Empire Across Three Continents"
          },
          {
            "code": "kehs108",
            "name": "Nomadic Empires"
          },
          {
            "code": "kehs103",
            "name": "Changing Traditions"
          },
          {
            "code": "kehs104",
            "name": "The Three Orders"
          },
          {
            "code": "kehs105",
            "name": "Changing Cultural Traditions"
          },
          {
            "code": "kehs106",
            "name": "Confrontation of Cultures"
          },
          {
            "code": "kehs107",
            "name": "Paths to Modernisation"
          }
        ]
      }
    ]
  },
  "c11_political_science": {
    "icon": "🏛️",
    "label": "Political Science",
    "cacheKey": "c11_political_science",
    "groups": [
      {
        "label": "Political Theory (Book 1)",
        "chapters": [
          {
            "code": "keps101",
            "name": "Political Theory: An Introduction"
          },
          {
            "code": "keps102",
            "name": "Freedom"
          },
          {
            "code": "keps103",
            "name": "Equality"
          },
          {
            "code": "keps104",
            "name": "Social Justice"
          },
          {
            "code": "keps105",
            "name": "Rights"
          },
          {
            "code": "keps106",
            "name": "Citizenship"
          },
          {
            "code": "keps107",
            "name": "Nationalism"
          },
          {
            "code": "keps108",
            "name": "Secularism"
          }
        ]
      },
      {
        "label": "Indian Constitution at Work (Book 2)",
        "chapters": [
          {
            "code": "keps201",
            "name": "Constitution: Why and How?"
          },
          {
            "code": "keps202",
            "name": "Rights in the Indian Constitution"
          },
          {
            "code": "keps203",
            "name": "Election and Representation"
          },
          {
            "code": "keps204",
            "name": "Executive"
          },
          {
            "code": "keps205",
            "name": "Legislature"
          },
          {
            "code": "keps206",
            "name": "Judiciary"
          },
          {
            "code": "keps207",
            "name": "Federalism"
          },
          {
            "code": "keps208",
            "name": "Local Governments"
          },
          {
            "code": "keps209",
            "name": "Constitution as a Living Document"
          },
          {
            "code": "keps210",
            "name": "The Philosophy of the Constitution"
          }
        ]
      }
    ]
  },
  "c11_sociology": {
    "icon": "👥",
    "label": "Sociology",
    "cacheKey": "c11_sociology",
    "groups": [
      {
        "label": "Introducing Sociology (Book 1)",
        "chapters": [
          {
            "code": "kesy101",
            "name": "Sociology and Society"
          },
          {
            "code": "kesy102",
            "name": "Terms, Concepts and their Use in Sociology"
          },
          {
            "code": "kesy103",
            "name": "Understanding Social Institutions"
          },
          {
            "code": "kesy104",
            "name": "Culture and Socialisation"
          },
          {
            "code": "kesy105",
            "name": "Doing Sociology: Research Methods"
          }
        ]
      },
      {
        "label": "Understanding Society (Book 2)",
        "chapters": [
          {
            "code": "kesy201",
            "name": "Structure, Agency and Social Transformation"
          },
          {
            "code": "kesy202",
            "name": "Social Change and Social Order in Rural and Urban Society"
          },
          {
            "code": "kesy203",
            "name": "Environment and Society"
          },
          {
            "code": "kesy204",
            "name": "Introducing Western Sociologists"
          },
          {
            "code": "kesy205",
            "name": "Indian Sociologists"
          }
        ]
      }
    ]
  },
  "c11_psychology": {
    "icon": "🧠",
    "label": "Psychology",
    "cacheKey": "c11_psychology",
    "groups": [
      {
        "label": "Introduction to Psychology",
        "chapters": [
          {
            "code": "kepy101",
            "name": "What is Psychology?"
          },
          {
            "code": "kepy102",
            "name": "Methods of Enquiry in Psychology"
          },
          {
            "code": "kepy103",
            "name": "Human Development"
          },
          {
            "code": "kepy104",
            "name": "Sensory, Attentional and Perceptual Processes"
          },
          {
            "code": "kepy105",
            "name": "Learning"
          },
          {
            "code": "kepy106",
            "name": "Human Memory"
          },
          {
            "code": "kepy107",
            "name": "Thinking"
          },
          {
            "code": "kepy108",
            "name": "Motivation and Emotion"
          }
        ]
      }
    ]
  },
  "c11_accountancy": {
    "icon": "📊",
    "label": "Accountancy",
    "cacheKey": "c11_accountancy",
    "groups": [
      {
        "label": "Financial Accounting — Part 1",
        "chapters": [
          {
            "code": "keac101",
            "name": "Introduction to Accounting"
          },
          {
            "code": "keac102",
            "name": "Theory Base of Accounting"
          },
          {
            "code": "keac103",
            "name": "Recording of Transactions - I"
          },
          {
            "code": "keac104",
            "name": "Recording of Transactions - II"
          },
          {
            "code": "keac105",
            "name": "Bank Reconciliation Statement"
          },
          {
            "code": "keac106",
            "name": "Trial Balance and Rectification of Errors"
          },
          {
            "code": "keac107",
            "name": "Depreciation, Provisions and Reserves"
          }
        ]
      },
      {
        "label": "Financial Accounting — Part 2",
        "chapters": [
          {
            "code": "keac201",
            "name": "Financial Statements - I"
          },
          {
            "code": "keac202",
            "name": "Financial Statements - II"
          }
        ]
      }
    ]
  },
  "c11_business_studies": {
    "icon": "💼",
    "label": "Business Studies",
    "cacheKey": "c11_business_studies",
    "groups": [
      {
        "label": "Part 1 — Foundations of Business",
        "chapters": [
          {
            "code": "kebs101",
            "name": "Business, Trade and Commerce"
          },
          {
            "code": "kebs102",
            "name": "Forms of Business Organisation"
          },
          {
            "code": "kebs103",
            "name": "Private, Public and Global Enterprises"
          },
          {
            "code": "kebs104",
            "name": "Business Services"
          },
          {
            "code": "kebs105",
            "name": "Emerging Modes of Business"
          },
          {
            "code": "kebs106",
            "name": "Social Responsibility of Business and Business Ethics"
          }
        ]
      },
      {
        "label": "Part 2 — Business Finance and Trade",
        "chapters": [
          {
            "code": "kebs107",
            "name": "Formation of a Company"
          },
          {
            "code": "kebs108",
            "name": "Sources of Business Finance"
          },
          {
            "code": "kebs109",
            "name": "Small Business and Entrepreneurship"
          },
          {
            "code": "kebs110",
            "name": "Internal Trade"
          },
          {
            "code": "kebs111",
            "name": "International Business"
          }
        ]
      }
    ]
  },
  "c11_economics": {
    "icon": "📈",
    "label": "Economics",
    "cacheKey": "c11_economics",
    "groups": [
      {
        "label": "Statistics for Economics",
        "chapters": [
          {
            "code": "kest101",
            "name": "Introduction"
          },
          {
            "code": "kest102",
            "name": "Collection of Data"
          },
          {
            "code": "kest103",
            "name": "Organisation of Data"
          },
          {
            "code": "kest104",
            "name": "Presentation of Data"
          },
          {
            "code": "kest105",
            "name": "Measures of Central Tendency"
          },
          {
            "code": "kest106",
            "name": "Correlation"
          },
          {
            "code": "kest107",
            "name": "Index Numbers"
          },
          {
            "code": "kest108",
            "name": "Introduction to Statistical Investigation"
          }
        ]
      },
      {
        "label": "Indian Economic Development",
        "chapters": [
          {
            "code": "keec101",
            "name": "Indian Economy on the Eve of Independence"
          },
          {
            "code": "keec102",
            "name": "Indian Economy 1950–1990"
          },
          {
            "code": "keec103",
            "name": "Liberalisation, Privatisation and Globalisation"
          },
          {
            "code": "keec104",
            "name": "Human Capital Formation in India"
          },
          {
            "code": "keec105",
            "name": "Rural Development"
          },
          {
            "code": "keec106",
            "name": "Employment: Growth, Informalisation and Other Issues"
          },
          {
            "code": "keec107",
            "name": "Environment and Sustainable Development"
          },
          {
            "code": "keec108",
            "name": "Comparative Development Experiences"
          }
        ]
      }
    ]
  },
  "c12_physics": {
    "icon": "⚡",
    "label": "Physics",
    "cacheKey": "c12_physics",
    "groups": [
      {
        "label": "Part 1",
        "chapters": [
          {
            "code": "leph101",
            "name": "Electric Charges and Fields"
          },
          {
            "code": "leph102",
            "name": "Electrostatic Potential and Capacitance"
          },
          {
            "code": "leph103",
            "name": "Current Electricity"
          },
          {
            "code": "leph104",
            "name": "Moving Charges and Magnetism"
          },
          {
            "code": "leph105",
            "name": "Magnetism and Matter"
          },
          {
            "code": "leph106",
            "name": "Electromagnetic Induction"
          },
          {
            "code": "leph107",
            "name": "Alternating Current"
          },
          {
            "code": "leph108",
            "name": "Electromagnetic Waves"
          }
        ]
      },
      {
        "label": "Part 2",
        "chapters": [
          {
            "code": "leph201",
            "name": "Ray Optics and Optical Instruments"
          },
          {
            "code": "leph202",
            "name": "Wave Optics"
          },
          {
            "code": "leph203",
            "name": "Dual Nature of Radiation and Matter"
          },
          {
            "code": "leph204",
            "name": "Atoms"
          },
          {
            "code": "leph205",
            "name": "Nuclei"
          },
          {
            "code": "leph206",
            "name": "Semiconductor Electronics"
          }
        ]
      }
    ]
  },
  "c12_chemistry": {
    "icon": "🧪",
    "label": "Chemistry",
    "cacheKey": "c12_chemistry",
    "groups": [
      {
        "label": "Part 1",
        "chapters": [
          {
            "code": "lech101",
            "name": "Solutions"
          },
          {
            "code": "lech102",
            "name": "Electrochemistry"
          },
          {
            "code": "lech103",
            "name": "Chemical Kinetics"
          },
          {
            "code": "lech104",
            "name": "The d and f Block Elements"
          },
          {
            "code": "lech105",
            "name": "Coordination Compounds"
          }
        ]
      },
      {
        "label": "Part 2",
        "chapters": [
          {
            "code": "lech201",
            "name": "Haloalkanes and Haloarenes"
          },
          {
            "code": "lech202",
            "name": "Alcohols, Phenols and Ethers"
          },
          {
            "code": "lech203",
            "name": "Aldehydes, Ketones and Carboxylic Acids"
          },
          {
            "code": "lech204",
            "name": "Amines"
          },
          {
            "code": "lech205",
            "name": "Biomolecules"
          }
        ]
      }
    ]
  },
  "c12_biology": {
    "icon": "🌿",
    "label": "Biology",
    "cacheKey": "c12_biology",
    "groups": [
      {
        "label": "Unit VI — Reproduction",
        "chapters": [
          {
            "code": "lebo101",
            "name": "Sexual Reproduction in Flowering Plants"
          },
          {
            "code": "lebo102",
            "name": "Human Reproduction"
          },
          {
            "code": "lebo103",
            "name": "Reproductive Health"
          }
        ]
      },
      {
        "label": "Unit VII — Genetics and Evolution",
        "chapters": [
          {
            "code": "lebo104",
            "name": "Principles of Inheritance and Variation"
          },
          {
            "code": "lebo105",
            "name": "Molecular Basis of Inheritance"
          },
          {
            "code": "lebo106",
            "name": "Evolution"
          }
        ]
      },
      {
        "label": "Unit VIII — Biology and Human Welfare",
        "chapters": [
          {
            "code": "lebo107",
            "name": "Human Health and Disease"
          },
          {
            "code": "lebo108",
            "name": "Microbes in Human Welfare"
          }
        ]
      },
      {
        "label": "Unit IX — Biotechnology",
        "chapters": [
          {
            "code": "lebo109",
            "name": "Biotechnology: Principles and Processes"
          },
          {
            "code": "lebo110",
            "name": "Biotechnology and its Applications"
          }
        ]
      },
      {
        "label": "Unit X — Ecology",
        "chapters": [
          {
            "code": "lebo111",
            "name": "Organisms and Populations"
          },
          {
            "code": "lebo112",
            "name": "Ecosystem"
          },
          {
            "code": "lebo113",
            "name": "Biodiversity and Conservation"
          }
        ]
      }
    ]
  },
  "c12_mathematics": {
    "icon": "📐",
    "label": "Mathematics",
    "cacheKey": "c12_mathematics",
    "groups": [
      {
        "label": "Part 1",
        "chapters": [
          {
            "code": "lemh101",
            "name": "Relations and Functions"
          },
          {
            "code": "lemh102",
            "name": "Inverse Trigonometric Functions"
          },
          {
            "code": "lemh103",
            "name": "Matrices"
          },
          {
            "code": "lemh104",
            "name": "Determinants"
          },
          {
            "code": "lemh105",
            "name": "Continuity and Differentiability"
          },
          {
            "code": "lemh106",
            "name": "Application of Derivatives"
          }
        ]
      },
      {
        "label": "Part 2",
        "chapters": [
          {
            "code": "lemh201",
            "name": "Integrals"
          },
          {
            "code": "lemh202",
            "name": "Application of Integrals"
          },
          {
            "code": "lemh203",
            "name": "Differential Equations"
          },
          {
            "code": "lemh204",
            "name": "Vector Algebra"
          },
          {
            "code": "lemh205",
            "name": "Three Dimensional Geometry"
          },
          {
            "code": "lemh206",
            "name": "Linear Programming"
          },
          {
            "code": "lemh207",
            "name": "Probability"
          }
        ]
      }
    ]
  },
  "c12_english": {
    "icon": "📖",
    "label": "English",
    "cacheKey": "c12_english",
    "groups": [
      {
        "label": "Flamingo — Prose",
        "chapters": [
          {
            "code": "lefl101",
            "name": "The Last Lesson"
          },
          {
            "code": "lefl102",
            "name": "Lost Spring"
          },
          {
            "code": "lefl103",
            "name": "Deep Water"
          },
          {
            "code": "lefl104",
            "name": "The Rattrap"
          },
          {
            "code": "lefl105",
            "name": "Indigo"
          },
          {
            "code": "lefl106",
            "name": "Poets and Pancakes"
          },
          {
            "code": "lefl107",
            "name": "The Interview"
          },
          {
            "code": "lefl108",
            "name": "Going Places"
          }
        ]
      },
      {
        "label": "Flamingo — Poetry",
        "chapters": [
          {
            "code": "lefl111",
            "name": "My Mother at Sixty-Six"
          },
          {
            "code": "lefl112",
            "name": "Keeping Quiet"
          },
          {
            "code": "lefl113",
            "name": "A Thing of Beauty"
          },
          {
            "code": "lefl114",
            "name": "A Roadside Stand"
          },
          {
            "code": "lefl115",
            "name": "Aunt Jennifer's Tigers"
          }
        ]
      },
      {
        "label": "Vistas — Supplementary Reader",
        "chapters": [
          {
            "code": "levt101",
            "name": "The Third Level"
          },
          {
            "code": "levt102",
            "name": "The Tiger King"
          },
          {
            "code": "levt103",
            "name": "Journey to the End of the Earth"
          },
          {
            "code": "levt104",
            "name": "The Enemy"
          },
          {
            "code": "levt105",
            "name": "On the Face of It"
          },
          {
            "code": "levt106",
            "name": "Memories of Childhood"
          }
        ]
      }
    ]
  },
  "c12_hindi": {
    "icon": "🇮🇳",
    "label": "Hindi",
    "cacheKey": "c12_hindi",
    "groups": [
      {
        "label": "Aaroh Bhag 2 — Kavya Khand",
        "chapters": [
          {
            "code": "lhar101",
            "name": "Aatmparichay, Ek Geet — Harivansh Rai Bachchan"
          },
          {
            "code": "lhar102",
            "name": "Patang — Alok Dhanwa"
          },
          {
            "code": "lhar103",
            "name": "Kavita ke Bahaane, Baat Seedhi Thi Par — Kunwar Narayan"
          },
          {
            "code": "lhar104",
            "name": "Camera mein Band Apahij — Raghuvir Sahay"
          },
          {
            "code": "lhar105",
            "name": "Usha — Shamsher Bahadur Singh"
          },
          {
            "code": "lhar106",
            "name": "Baadal Raag — Suryakant Tripathi 'Nirala'"
          },
          {
            "code": "lhar107",
            "name": "Lakshman-Parshuram Samvad — Tulsidas"
          },
          {
            "code": "lhar108",
            "name": "Rubaiyan, Ghazal — Firaq Gorakhpuri"
          }
        ]
      },
      {
        "label": "Aaroh Bhag 2 — Gadya Khand",
        "chapters": [
          {
            "code": "lhar110",
            "name": "Bhaktin — Mahadevi Verma"
          },
          {
            "code": "lhar111",
            "name": "Bazaar Darshan — Jainendra Kumar"
          },
          {
            "code": "lhar112",
            "name": "Kaale Megha Pani De — Dharmvir Bharati"
          },
          {
            "code": "lhar113",
            "name": "Pehlevan Ki Dholak — Phanishwar Nath Renu"
          },
          {
            "code": "lhar114",
            "name": "Shirish Ke Phool — Hazari Prasad Dwivedi"
          },
          {
            "code": "lhar115",
            "name": "Shramvibhajan aur Jatipradha — B.R. Ambedkar"
          }
        ]
      },
      {
        "label": "Vitan Bhag 2",
        "chapters": [
          {
            "code": "lhvt101",
            "name": "Silver Wedding — Manohar Shyam Joshi"
          },
          {
            "code": "lhvt102",
            "name": "Jujh — Anand Yadav"
          },
          {
            "code": "lhvt103",
            "name": "Ateet Mein Dabe Paon — Om Thanvi"
          }
        ]
      }
    ]
  },
  "c12_accountancy": {
    "icon": "🧾",
    "label": "Accountancy",
    "cacheKey": "c12_accountancy",
    "groups": [
      {
        "label": "Part 1 — Not-for-Profit Organisations and Partnership",
        "chapters": [
          {
            "code": "leac101",
            "name": "Accounting for Partnership: Basic Concepts"
          },
          {
            "code": "leac102",
            "name": "Reconstitution of a Partnership Firm – Admission of a Partner"
          },
          {
            "code": "leac103",
            "name": "Reconstitution of a Partnership Firm – Retirement/Death of a Partner"
          },
          {
            "code": "leac104",
            "name": "Dissolution of Partnership Firm"
          }
        ]
      },
      {
        "label": "Part 2 — Company Accounts and Analysis",
        "chapters": [
          {
            "code": "leac201",
            "name": "Accounting for Share Capital"
          },
          {
            "code": "leac202",
            "name": "Issue and Redemption of Debentures"
          },
          {
            "code": "leac203",
            "name": "Financial Statements of a Company"
          },
          {
            "code": "leac204",
            "name": "Analysis of Financial Statements"
          },
          {
            "code": "leac205",
            "name": "Accounting Ratios"
          },
          {
            "code": "leac206",
            "name": "Cash Flow Statement"
          }
        ]
      },
      {
        "label": "Part 3 — Computerised Accounting System",
        "chapters": [
          {
            "code": "leca101",
            "name": "Overview of Computerised Accounting System"
          },
          {
            "code": "leca102",
            "name": "Spreadsheet"
          },
          {
            "code": "leca103",
            "name": "Use of Spreadsheet in Business Applications"
          },
          {
            "code": "leca104",
            "name": "Graphs and Charts for Business Data"
          }
        ]
      }
    ]
  },
  "c12_business_studies": {
    "icon": "💼",
    "label": "Business Studies",
    "cacheKey": "c12_business_studies",
    "groups": [
      {
        "label": "Part 1 — Principles and Functions of Management",
        "chapters": [
          {
            "code": "lebs101",
            "name": "Nature and Significance of Management"
          },
          {
            "code": "lebs102",
            "name": "Principles of Management"
          },
          {
            "code": "lebs103",
            "name": "Business Environment"
          },
          {
            "code": "lebs104",
            "name": "Planning"
          },
          {
            "code": "lebs105",
            "name": "Organising"
          },
          {
            "code": "lebs106",
            "name": "Staffing"
          },
          {
            "code": "lebs107",
            "name": "Directing"
          },
          {
            "code": "lebs108",
            "name": "Controlling"
          }
        ]
      },
      {
        "label": "Part 2 — Business Finance and Marketing",
        "chapters": [
          {
            "code": "lebs201",
            "name": "Financial Management"
          },
          {
            "code": "lebs202",
            "name": "Marketing Management"
          },
          {
            "code": "lebs203",
            "name": "Consumer Protection"
          }
        ]
      }
    ]
  },
  "c12_economics": {
    "icon": "📊",
    "label": "Economics",
    "cacheKey": "c12_economics",
    "groups": [
      {
        "label": "Introductory Macroeconomics",
        "chapters": [
          {
            "code": "leec101",
            "name": "Introduction to Macroeconomics"
          },
          {
            "code": "leec102",
            "name": "National Income Accounting"
          },
          {
            "code": "leec103",
            "name": "Money and Banking"
          },
          {
            "code": "leec104",
            "name": "Determination of Income and Employment"
          },
          {
            "code": "leec105",
            "name": "Government Budget and the Economy"
          },
          {
            "code": "leec106",
            "name": "Open Economy"
          }
        ]
      },
      {
        "label": "Introductory Microeconomics",
        "chapters": [
          {
            "code": "leec201",
            "name": "Introduction to Micro Economics"
          },
          {
            "code": "leec202",
            "name": "Theory of Consumer Behaviour"
          },
          {
            "code": "leec203",
            "name": "Production and Costs"
          },
          {
            "code": "leec204",
            "name": "The Theory of the Firm under Perfect Competition"
          },
          {
            "code": "leec205",
            "name": "Market Equilibrium"
          }
        ]
      }
    ]
  },
  "c12_geography": {
    "icon": "🗺️",
    "label": "Geography",
    "cacheKey": "c12_geography",
    "groups": [
      {
        "label": "Fundamentals of Human Geography (Book 1)",
        "chapters": [
          {
            "code": "legy101",
            "name": "Human Geography: Nature and Scope"
          },
          {
            "code": "legy102",
            "name": "The World Population: Distribution, Density and Growth"
          },
          {
            "code": "legy103",
            "name": "Human Development"
          },
          {
            "code": "legy104",
            "name": "Primary Activities"
          },
          {
            "code": "legy105",
            "name": "Secondary Activities"
          },
          {
            "code": "legy106",
            "name": "Tertiary and Quaternary Activities"
          },
          {
            "code": "legy107",
            "name": "Transport and Communication"
          },
          {
            "code": "legy108",
            "name": "International Trade"
          }
        ]
      },
      {
        "label": "India — People and Economy (Book 2)",
        "chapters": [
          {
            "code": "legy201",
            "name": "Population: Distribution, Density, Growth and Composition"
          },
          {
            "code": "legy202",
            "name": "Human Settlements"
          },
          {
            "code": "legy203",
            "name": "Land Resources and Agriculture"
          },
          {
            "code": "legy204",
            "name": "Water Resources"
          },
          {
            "code": "legy205",
            "name": "Mineral and Energy Resources"
          },
          {
            "code": "legy206",
            "name": "Planning and Sustainable Development in Indian Context"
          },
          {
            "code": "legy207",
            "name": "Transport and Communication"
          },
          {
            "code": "legy208",
            "name": "International Trade"
          },
          {
            "code": "legy209",
            "name": "Geographical Perspective on Selected Issues and Problems"
          }
        ]
      }
    ]
  },
  "c12_history": {
    "icon": "📜",
    "label": "History",
    "cacheKey": "c12_history",
    "groups": [
      {
        "label": "Part I — Early India",
        "chapters": [
          {
            "code": "lehs101",
            "name": "Bricks, Beads and Bones: The Harappan Civilisation"
          },
          {
            "code": "lehs102",
            "name": "Kings, Farmers and Towns: Early States and Economies"
          },
          {
            "code": "lehs103",
            "name": "Kinship, Caste and Class: Early Societies"
          },
          {
            "code": "lehs104",
            "name": "Thinkers, Beliefs and Buildings: Cultural Developments"
          }
        ]
      },
      {
        "label": "Part II — Medieval India",
        "chapters": [
          {
            "code": "lehs201",
            "name": "Bhakti-Sufi Traditions: Changes in Religious Beliefs and Devotional Texts"
          },
          {
            "code": "lehs202",
            "name": "An Imperial Capital: Vijayanagara"
          },
          {
            "code": "lehs203",
            "name": "Peasants, Zamindars and the State: Agrarian Society and the Mughal Empire"
          },
          {
            "code": "lehs204",
            "name": "Colonialism and the Countryside: Exploring Official Archives"
          }
        ]
      },
      {
        "label": "Part III — Modern India",
        "chapters": [
          {
            "code": "lehs301",
            "name": "Rebels and the Raj: 1857 Revolt and Its Representations"
          },
          {
            "code": "lehs302",
            "name": "Mahatma Gandhi and the Nationalist Movement"
          },
          {
            "code": "lehs304",
            "name": "Framing the Constitution: The Beginning of a New Era"
          }
        ]
      }
    ]
  },
  "c12_political_science": {
    "icon": "🏛️",
    "label": "Political Science",
    "cacheKey": "c12_political_science",
    "groups": [
      {
        "label": "Contemporary World Politics (Book 1)",
        "chapters": [
          {
            "code": "leps101",
            "name": "The End of Bipolarity"
          },
          {
            "code": "leps102",
            "name": "Contemporary Centres of Power"
          },
          {
            "code": "leps103",
            "name": "Contemporary South Asia"
          },
          {
            "code": "leps104",
            "name": "International Organisations"
          },
          {
            "code": "leps105",
            "name": "Security in the Contemporary World"
          },
          {
            "code": "leps106",
            "name": "Environment and Natural Resources"
          },
          {
            "code": "leps107",
            "name": "Globalisation"
          }
        ]
      },
      {
        "label": "Politics in India since Independence (Book 2)",
        "chapters": [
          {
            "code": "leps201",
            "name": "Challenges of Nation Building"
          },
          {
            "code": "leps202",
            "name": "Era of One-Party Dominance"
          },
          {
            "code": "leps203",
            "name": "Politics of Planned Development"
          },
          {
            "code": "leps204",
            "name": "India's External Relations"
          },
          {
            "code": "leps205",
            "name": "Challenges to and Restoration of the Congress System"
          },
          {
            "code": "leps206",
            "name": "The Crisis of Democratic Order"
          },
          {
            "code": "leps207",
            "name": "Regional Aspirations"
          },
          {
            "code": "leps208",
            "name": "Recent Developments in Indian Politics"
          }
        ]
      }
    ]
  },
  "c12_sociology": {
    "icon": "👥",
    "label": "Sociology",
    "cacheKey": "c12_sociology",
    "groups": [
      {
        "label": "Indian Society (Book 1)",
        "chapters": [
          {
            "code": "lesy101",
            "name": "Introducing Indian Society"
          },
          {
            "code": "lesy102",
            "name": "The Demographic Structure of the Indian Society"
          },
          {
            "code": "lesy103",
            "name": "Social Institutions: Continuity and Change"
          },
          {
            "code": "lesy104",
            "name": "The Market as a Social Institution"
          },
          {
            "code": "lesy105",
            "name": "Patterns of Social Inequality and Exclusion"
          },
          {
            "code": "lesy106",
            "name": "The Challenges of Cultural Diversity"
          },
          {
            "code": "lesy107",
            "name": "Suggestions for Project Work"
          }
        ]
      },
      {
        "label": "Social Change and Development in India (Book 2)",
        "chapters": [
          {
            "code": "lesy201",
            "name": "Structural Change"
          },
          {
            "code": "lesy202",
            "name": "Cultural Change"
          },
          {
            "code": "lesy203",
            "name": "The Story of Indian Democracy"
          },
          {
            "code": "lesy204",
            "name": "Change and Development in Rural Society"
          },
          {
            "code": "lesy205",
            "name": "Change and Development in Industrial Society"
          },
          {
            "code": "lesy206",
            "name": "Globalisation and Social Change"
          },
          {
            "code": "lesy207",
            "name": "Mass Media and Communications"
          },
          {
            "code": "lesy208",
            "name": "Social Movements"
          }
        ]
      }
    ]
  },
  "c12_psychology": {
    "icon": "🧠",
    "label": "Psychology",
    "cacheKey": "c12_psychology",
    "groups": [
      {
        "label": "Psychology",
        "chapters": [
          {
            "code": "lepy101",
            "name": "Variations in Psychological Attributes"
          },
          {
            "code": "lepy102",
            "name": "Self and Personality"
          },
          {
            "code": "lepy103",
            "name": "Meeting Life Challenges"
          },
          {
            "code": "lepy104",
            "name": "Psychological Disorders"
          },
          {
            "code": "lepy105",
            "name": "Therapeutic Approaches"
          },
          {
            "code": "lepy106",
            "name": "Attitude and Social Cognition"
          },
          {
            "code": "lepy107",
            "name": "Social Influence and Group Processes"
          }
        ]
      }
    ]
  }
};
