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

const STANDARD_TYPES = [
  { id: "pbs", label: "PBS", color: "#0d9488", border: "#115e59", text: "#fff" },
  { id: "triton", label: "Triton", color: "#7c3aed", border: "#4c1d95", text: "#fff" },
  { id: "sample1", label: "Sample 1", color: "#f59e0b", border: "#b45309", text: "#fff" },
  { id: "sample2", label: "Sample 2", color: "#10b981", border: "#047857", text: "#fff" },
  { id: "sample3", label: "Sample 3", color: "#ef4444", border: "#b91c1c", text: "#fff" },
];

export default function RiboGreenConfigurator() {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT());
  const [activeTool, setActiveTool] = useState("pbs");
  const [standardConcentrations, setStandardConcentrations] = useState([1000, 500, 100, 20, 0]);
  const [sampleGroups, setSampleGroups] = useState([
    { id: "s1", label: "Sample 1", pbs: "0", triton: "0" },
    { id: "s2", label: "Sample 2", pbs: "0", triton: "0" },
    { id: "s3", label: "Sample 3", pbs: "0", triton: "0" },
  ]);
  const [csvFilename, setCsvFilename] = useState("your_plate_data.csv");
  const [outputFilename, setOutputFilename] = useState("ribogreen_results.xlsx");

  const clearLayout = () => setLayout(DEFAULT_LAYOUT());

  const applyPaint = (key) => {
    setLayout((prev) => ({ ...prev, [key]: activeTool }));
  };

  const updateStandard = (index, value) => {
    setStandardConcentrations((prev) => prev.map((entry, i) => (i === index ? Number(value) : entry)));
  };

  const updateSampleGroup = (id, field, value) => {
    setSampleGroups((prev) => prev.map((group) => (group.id === id ? { ...group, [field]: value } : group)));
  };

  const generateRScript = () => {
    const script = `# AUTO-GENERATED RIBOGREEN ANALYSIS SCRIPT
library(tidyverse)
library(readr)
library(ggplot2)
library(writexl)
library(broom)

csv_file <- "${csvFilename}"
output_file <- "${outputFilename}"

standard_conc <- c(${standardConcentrations.join(", ")})

plate <- read_delim(csv_file, delim = ";", locale = locale(decimal_mark = ","))

# Example placeholder calibration model
pbs_fit <- lm(Fluorescence ~ Concentration, data = tibble(
  Concentration = standard_conc,
  Fluorescence = standard_conc * 0.5 + 10
))

triton_fit <- lm(Fluorescence ~ Concentration, data = tibble(
  Concentration = standard_conc,
  Fluorescence = standard_conc * 0.7 + 18
))

# Calculate free, total, and encapsulated RNA
free_rna <- predict(pbs_fit, newdata = tibble(Concentration = standard_conc))
total_rna <- predict(triton_fit, newdata = tibble(Concentration = standard_conc))
encapsulated_rna <- total_rna - free_rna

summary_df <- tibble(
  Condition = c("PBS", "Triton", "Encapsulated"),
  RNA = c(mean(free_rna), mean(total_rna), mean(encapsulated_rna))
)

write_xlsx(summary_df, output_file)

cat("RiboGreen analysis complete.\n")
`;

    window.alert(script);
  };

  const assignmentSummary = useMemo(() => {
    const count = Object.values(layout).filter((value) => value !== "empty").length;
    return `${count} wells assigned`;
  }, [layout]);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <h2>RiboGreen Assay Plate Configurator</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
        <div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {STANDARD_TYPES.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                style={{
                  background: activeTool === tool.id ? tool.color : "#f3f4f6",
                  color: activeTool === tool.id ? tool.text : "#111827",
                  border: `1px solid ${tool.border}`,
                  borderRadius: 6,
                  padding: "8px 12px",
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
                  const tool = STANDARD_TYPES.find((item) => item.id === value) || { color: "#f5f5f5", border: "#d1d5db", text: "#111827" };
                  return (
                    <button
                      key={key}
                      type="button"
                      onMouseDown={() => applyPaint(key)}
                      onMouseEnter={() => applyPaint(key)}
                      style={{
                        background: value === "empty" ? "#f5f5f5" : tool.color,
                        border: `1px solid ${value === "empty" ? "#d1d5db" : tool.border}`,
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        cursor: "crosshair",
                        color: tool.text,
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
            <button onClick={clearLayout} style={{ width: "100%", padding: 8 }}>Clear plate</button>
          </div>

          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Calibration standards</h3>
            {standardConcentrations.map((value, idx) => (
              <label key={idx} style={{ display: "block", marginBottom: 8 }}>
                Std {idx + 1}
                <input
                  type="number"
                  value={value}
                  onChange={(e) => updateStandard(idx, e.target.value)}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </label>
            ))}
          </div>

          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Samples</h3>
            {sampleGroups.map((group) => (
              <div key={group.id} style={{ marginBottom: 10 }}>
                <input
                  value={group.label}
                  onChange={(e) => updateSampleGroup(group.id, "label", e.target.value)}
                  style={{ width: "100%", marginBottom: 4 }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <input value={group.pbs} onChange={(e) => updateSampleGroup(group.id, "pbs", e.target.value)} placeholder="PBS" />
                  <input value={group.triton} onChange={(e) => updateSampleGroup(group.id, "triton", e.target.value)} placeholder="Triton" />
                </div>
              </div>
            ))}
          </div>

          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Generate</h3>
            <p>{assignmentSummary}</p>
            <button onClick={generateRScript} style={{ width: "100%", padding: 10 }}>Generate R Config</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
