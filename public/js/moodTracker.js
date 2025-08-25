const MOOD_SCORE = {
  Angry: 1,
  Sad: 2,
  Confused: 2,
  Tired: 2,
  Lonely: 2,
  Neutral: 3,
  Anxious: 3,
  Relieved: 4,
  Calm: 4,
  Loved: 4,
  Excited: 5,
  Energetic: 5,
  Happy: 5
};

const MOOD_COLORS = {
  Angry: "#ef4444",
  Sad: "#3b82f6",
  Confused: "#a78bfa",
  Tired: "#94a3b8",
  Lonely: "#06b6d4",
  Neutral: "#9ca3af",
  Anxious: "#f59e0b",
  Relieved: "#34d399",
  Calm: "#22c55e",
  Loved: "#f472b6",
  Excited: "#eab308",
  Energetic: "#84cc16",
  Happy: "#f97316",
};

const username = window.SERENITY?.username || "demoUser";

document.addEventListener("DOMContentLoaded", async () => {
  const username = window.SERENITY?.username || "demoUser";

  const { moods } = await fetch(`/api/mood-data?username=${username}`).then(r => r.json());

  const items = (moods || [])
    .map(m => ({ ...m, date: new Date(m.date) }))
    .sort((a, b) => a.date - b.date);

  buildMoodFrequency(items);
  buildMoodOverTime(items);
  buildReasonsBreakdown(items);
  buildMonthlyHeatmap(items);
});

function buildMoodFrequency(items) {
  const counts = {};
  items.forEach(({ mood }) => {
    counts[mood] = (counts[mood] || 0) + 1;
  });

  const labels = Object.keys(counts);
  const data = Object.values(counts);
  const colors = labels.map(m => MOOD_COLORS[m] || "#94a3b8");

  const ctx = document.getElementById("moodFrequency").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Count",
        data,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        x: { ticks: { autoSkip: false } },
        y: { beginAtZero: true, precision: 0 }
      }
    }
  });
}

function buildMoodOverTime(items) {
  if (items.length === 0) {
    const ctx = document.getElementById("moodOverTime").getContext("2d");
    ctx.font = "14px sans-serif";
    ctx.fillText("No data yet", 10, 20);
    return;
  }

  const byDay = {};
  items.forEach(({ date, mood }) => {
    const key = date.toISOString().slice(0, 10);
    byDay[key] = mood;
  });

  const labels = Object.keys(byDay).sort();
  const data = labels.map(d => MOOD_SCORE[byDay[d]] ?? 3);

  const ctx = document.getElementById("moodOverTime").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Mood score",
        data,
        fill: false,
        tension: 0.25
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: (context) => {
              const day = labels[context.dataIndex];
              const score = context.raw;
              const moodName = scoreToNearestMood(score);
              return `${moodName} (${score}) on ${day}`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
            callback: (v) => {
              // show labels for clarity
              const map = {1:"Angry",2:"Low",3:"Neutral",4:"Calm",5:"High/Happy"};
              return map[v] || v;
            }
          },
          title: { display: true, text: "Mood score" }
        },
        x: { ticks: { maxRotation: 0, autoSkip: true } }
      }
    }
  });
}

function scoreToNearestMood(score) {
  if (score <= 1) return "Angry";
  if (score <= 2) return "Low mood";
  if (score <= 3) return "Neutral/Anxious";
  if (score <= 4) return "Calm/Relieved/Loved";
  return "Happy/Excited/Energetic";
}

function buildReasonsBreakdown(items) {
  const reasonCounts = {};
  items.forEach(({ reasons }) => {
    (reasons || []).forEach(r => {
      const key = (r || "").trim();
      if (!key) return;
      reasonCounts[key] = (reasonCounts[key] || 0) + 1;
    });
  });

  const labels = Object.keys(reasonCounts);
  const data = Object.values(reasonCounts);

  const ctx = document.getElementById("reasonsBreakdown").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

function buildMonthlyHeatmap(items) {
  const wrap = document.getElementById("heatmap");
  if (!wrap) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); 

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  
  const dayScore = {};
  items.forEach(({ date, mood }) => {
    const d = new Date(date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate(); 
      const score = MOOD_SCORE[mood] ?? 3;
      dayScore[key] = score;
    }
  });

  const startWeekday = firstOfMonth.getDay(); 
  for (let i = 0; i < startWeekday; i++) {
    const cell = document.createElement("div");
    cell.className = "heat-cell";
    cell.textContent = "";
    wrap.appendChild(cell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    const level = dayScore[day] || 0; // 0=no data
    cell.className = "heat-cell";
    if (level) cell.dataset.level = String(level);
    cell.textContent = day;
    wrap.appendChild(cell);
  }
}
