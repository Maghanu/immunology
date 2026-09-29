import React, { useMemo, useState } from "react";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = Array.from({ length: 12 }, (_, i) => i + 1);

const DEFAULT_LAYOUT = () => {
  const grid = {};
  ROWS.forEach((row) => {
    COLS.forEach((col) => {
      grid[`${row}${col}`] = "empty";
    });
  });
  return grid;
};

const CONTROL_TYPES = [
  { id: "medium", label: "Medium", color: "#e5e7eb", border: "#94a3b8", text: "#111827" },
  { id: "positive", label: "Positive", color: "#dc2626", border: "#7f1d1d", text: "#fff" },
  { id: "negative", label: "Negative", color: "#2563eb", border: "#1d4ed8", text: "#fff" },
];

const SAMPLE_PALETTE = [
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#0ea5e9",
];

const makeGroup = (name, concentration) => ({
  id: `${name}-${Date.now()}-${Math.random()}`,
  name,
  concentration,
  unit: "ug/mL",
  color: SAMPLE_PALETTE[Math.floor(Math.random() * SAMPLE_PALETTE.length)],
  wells: [],
});

export default function B3ZConfigurator() {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT());
  const [activeTool, setActiveTool] = useState("positive");
  const [groups, setGroups] = useState([
    { id: "g1", name: "Group 1", concentration: "1.0", unit: "ug/mL", color: "#f59e0b", wells: [] },
    { id: "g2", name: "Group 2", concentration: "0.5", unit: "ug/mL", color: "#10b981", wells: [] },
  ]);
  const [controls, setControls] = useState([
    { id: "medium", label: "Medium", type: "medium", concentration: "", unit: "" },
    { id: "positive", label: "Positive control", type: "positive", concentration: "10", unit: "ug/mL" },
    { id: "negative", label: "Negative control", type: "negative", concentration: "0", unit: "ug/mL" },
  ]);
  const [analysisMode, setAnalysisMode] = useState("anova");
  const [csvFilename, setCsvFilename] = useState("your_b3z_data.csv");
  const [outputFilename, setOutputFilename] = useState("b3z_results.xlsx");

  const cellStyle = (type) => {
    const cfg = CONTROL_TYPES.find((item) => item.id === type) || CONTROL_TYPES[0];
    return {
      background: cfg.color,
      border: `1px solid ${cfg.border}`,
      color: cfg.text,
    };
  };

  const assignWell = (wellKey, tool) => {
    setLayout((prev) => ({ ...prev, [wellKey]: tool }));
  };

  const applyPaint = (wellKey) => {
    assignWell(wellKey, activeTool);
  };

  const clearLayout = () => setLayout(DEFAULT_LAYOUT());

  const addGroup = () => {
    const next = makeGroup(`Group ${groups.length + 1}`, "1.0");
    setGroups((prev) => [...prev, next]);
  };

  const updateGroup = (id, field, value) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const generateScript = () => {
    const selectedConditions = groups
      .map((g) => `condition_${g.name.replace(/\s+/g, "_").toLowerCase()} <- c(${g.concentration || "1.0"})`)
      .join("\n");

    const script = `# AUTO-GENERATED B3Z ANALYSIS SCRIPT
library(tidyverse)
library(readr)
library(ggplot2)
library(writexl)
library(rstatix)
library(ggpubr)

csv_file <- "${csvFilename}"
output_file <- "${outputFilename}"

# Example structure generated from the plate layout
# You can replace this with a fully mapped analysis table.
${selectedConditions}

# Placeholder summary analysis
summary_df <- tibble(
  Condition = c(${groups.map((g) => `"${g.name}"`).join(", ")}),
  Mean_OD596 = c(1, 1),
  SD_OD596 = c(0.1, 0.1)
)

summary_df %>%
  ggplot(aes(x = Condition, y = Mean_OD596)) +
  geom_col() +
  theme_minimal() +
  labs(title = "B3Z activation summary", y = "Mean OD596")

ggsave("b3z_all_conditions.png", width = 7, height = 5, dpi = 300)

write_xlsx(summary_df, output_file)
`;

    window.alert(script);
  };

  const statsSummary = useMemo(() => {
    const assigned = Object.values(layout).filter((value) => value !== "empty").length;
    return `${assigned} wells assigned`;
  }, [layout]);

  const wells = useMemo(
    () =>
      ROWS.flatMap((row) =>
        COLS.map((col) => {
          const key = `${row}${col}`;
          return { key, row, col, value: layout[key] || "empty" };
        })
      ),
    [layout]
  );

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <h2>B3Z T-cell Activation Plate Configurator</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            {CONTROL_TYPES.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                style={{
                  background: activeTool === tool.id ? tool.color : "#f3f4f6",
                  color: activeTool === tool.id ? tool.text : "#111827",
                  border: `1px solid ${tool.border}`,
                  padding: "8px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                {tool.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "30px repeat(12, minmax(26px, 1fr))",
              gap: 4,
              width: "fit-content",
              background: "#fff",
              border: "1px solid #ddd",
              padding: 8,
            }}
          >
            <div />
            {COLS.map((col) => (
              <div key={col} style={{ textAlign: "center", fontWeight: 600 }}>{col}</div>
            ))}

            {ROWS.map((row) => (
              <React.Fragment key={row}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>{row}</div>
                {COLS.map((col) => {
                  const key = `${row}${col}`;
                  const value = layout[key] || "empty";
                  const style = value === "empty" ? { background: "#f5f5f5", border: "1px solid #d1d5db" } : cellStyle(value);
                  return (
                    <button
                      key={key}
                      type="button"
                      onMouseDown={() => applyPaint(key)}
                      onMouseEnter={() => applyPaint(key)}
                      style={{
                        ...style,
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        cursor: "crosshair",
                        color: style.color || "#111827",
                      }}
                    >
                      {value === "empty" ? "" : value[0].toUpperCase()}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        <aside style={{ display: "grid", gap: 12 }}>
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Setup</h3>
            <label style={{ display: "block", marginBottom: 8 }}>
              CSV filename
              <input value={csvFilename} onChange={(e) => setCsvFilename(e.target.value)} style={{ width: "100%", marginTop: 4 }} />
            </label>
            <label style={{ display: "block", marginBottom: 8 }}>
              Excel output
              <input value={outputFilename} onChange={(e) => setOutputFilename(e.target.value)} style={{ width: "100%", marginTop: 4 }} />
            </label>
            <label style={{ display: "block", marginBottom: 8 }}>
              Analysis mode
              <select value={analysisMode} onChange={(e) => setAnalysisMode(e.target.value)} style={{ width: "100%", marginTop: 4 }}>
                <option value="anova">ANOVA + Tukey</option>
                <option value="ttest">Pairwise t-tests</option>
              </select>
            </label>
            <button onClick={clearLayout} style={{ width: "100%", padding: 8, marginTop: 4 }}>Clear plate</button>
          </div>

          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Groups</h3>
            {groups.map((group) => (
              <div key={group.id} style={{ marginBottom: 8 }}>
                <input
                  value={group.name}
                  onChange={(e) => updateGroup(group.id, "name", e.target.value)}
                  style={{ width: "100%", marginBottom: 4 }}
                />
                <input
                  value={group.concentration}
                  onChange={(e) => updateGroup(group.id, "concentration", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            ))}
            <button onClick={addGroup} style={{ width: "100%", padding: 8 }}>Add group</button>
          </div>

          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Generate</h3>
            <p>{statsSummary}</p>
            <button onClick={generateScript} style={{ width: "100%", padding: 10 }}>Generate R Script</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
