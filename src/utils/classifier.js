const categoryKeywords = {
  Sanitation: [
    "garbage",
    "waste",
    "dustbin",
    "dirty",
    "sewage",
    "drain",
  ],
  Electricity: [
    "electricity",
    "power",
    "street light",
    "streetlight",
    "transformer",
    "electric pole",
  ],
  "Water Supply": [
    "water",
    "leakage",
    "pipeline",
    "tap",
    "water supply",
  ],
  "Roads & Transport": [
    "road",
    "pothole",
    "sidewalk",
    "footpath",
    "traffic",
    "bridge",
  ],
};

const departmentMap = {
  Sanitation: "Municipal Services",
  Electricity: "Electricity Department",
  "Water Supply": "Water Department",
  "Roads & Transport": "Transport Department",
};

const highPriorityWords = [
  "urgent",
  "danger",
  "dangerous",
  "emergency",
  "accident",
  "life threatening",
];

function classifyGrievance(description) {
  const text = description.toLowerCase();

  let category = "Other";
  let topScore = 0;

  // Score every category by how many of its keywords appear,
  // instead of stopping at the first match. This means a
  // description mentioning both "garbage" and "water leak"
  // gets classified by whichever category has more signal,
  // not just whichever check happened to run first.
  for (const [candidateCategory, keywords] of Object.entries(
    categoryKeywords
  )) {
    const score = keywords.filter((keyword) =>
      text.includes(keyword)
    ).length;

    if (score > topScore) {
      topScore = score;
      category = candidateCategory;
    }
  }

  const department = departmentMap[category] || "General";

  const priority = highPriorityWords.some((word) =>
    text.includes(word)
  )
    ? "High"
    : "Medium";

  return {
    category,
    department,
    priority,
  };
}

export default classifyGrievance;
