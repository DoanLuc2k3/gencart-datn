import React from "react";
import { Column } from "@ant-design/plots";

const SentimentChart = ({ data, mode, chartMode }) => {
  const displayMode = mode === "product" ? "percent" : chartMode;
  
  return (
    <Column
      data={data}
      xField="date"
      yField="value"
      seriesField="sentiment"
      isStack
      // Fix series order and colors to avoid misinterpretation
      meta={{
        sentiment: { values: ["positive", "neutral", "negative"] },
      }}
      color={(datum) =>
        ({
          positive: "#52c41a",
          neutral: "#faad14",
          negative: "#ff4d4f",
        }[datum.sentiment] || "#d9d9d9")
      }
      height={320}
      yAxis={
        displayMode === "percent"
          ? { max: 100, label: { formatter: (v) => `${v}%` } }
          : { label: { formatter: (v) => `${v}` } }
      }
      legend={{ position: "top" }}
      columnStyle={{ radius: [2, 2, 0, 0] }}
      tooltip={{
        title: "date",
        customContent: (title, items) => {
          if (!items || items.length === 0) return null;
          const order = { positive: 0, neutral: 1, negative: 2 };
          const sorted = [...items].sort(
            (a, b) =>
              (order[a?.data?.sentiment] ?? 99) -
              (order[b?.data?.sentiment] ?? 99)
          );
          let content = `<div style="padding: 8px;"><strong>${title}</strong><br/>`;
          sorted.forEach((item) => {
            const rawData = item.data;
            const sentiment = rawData?.sentiment || "unknown";
            const count = rawData?.count || 0;
            const percentage = rawData?.percentage || "0.0";
            const line =
              displayMode === "percent"
                ? `${percentage}% (${count} reviews)`
                : `${count} reviews (${percentage}%)`;
            content += `<div style="margin: 4px 0;"><span style="color: ${item.color};">●</span> ${sentiment}: ${line}</div>`;
          });
          content += "</div>";
          return content;
        },
      }}
    />
  );
};

export default SentimentChart;
