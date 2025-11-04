import { ResponsiveLine } from "@nivo/line";
import { useEffect, useRef, useState } from "react";
import { timeFormat } from "d3-time-format";
import * as d3 from "d3";
import ToggleButton from "./components/ToggleButton";

function App() {
  // ==============================================
  // 📆 날짜 생성
  // ==============================================
  const start = new Date(2024, 10, 1);
  const end = new Date(2025, 9, 31);
  const dates: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 3)) {
    dates.push(new Date(d));
  }

  // ==============================================
  // 🔧 상태 관리
  // ==============================================
  const [chartData, setChartData] = useState<
    { id: string; color: string; data: DataPoint[] }[]
  >([]);

  const [hoverX, setHoverX] = useState<number | null>(null);
  const [activeSeries, setActiveSeries] = useState([
    "ATOM Price",
    "Active Account",
    "Value",
  ]);
  const [normalized, setNormalized] = useState(true);

  const chartRef = useRef<HTMLDivElement>(null);

  // ==============================================
  // 타입 정의
  // ==============================================
  type CosmosRow = {
    date: string;
    atom_norm: number;
    atom_price: number;
    account_norm: number;
    account_value: number;
    value_norm: number;
    value: number;
  };

  type DataPoint = {
    x: Date;
    y: number;
    actual: number;
  };

  // ==============================================
  // 📊 CSV 데이터 로드 및 파싱
  // ==============================================
  useEffect(() => {
    d3.csv<CosmosRow>("/data/merged-cosmos-data.csv", d3.autoType).then(
      (rows) => {
        const parsed = {
          "ATOM Price": {
            id: "ATOM Price",
            color: "var(--color-main1)",
            data: rows.map((r) => ({
              x: new Date(r.date),
              y: r.atom_norm,
              actual: r.atom_price,
            })),
          },
          "Active Account": {
            id: "Active Account",
            color: "var(--color-main2)",
            data: rows.map((r) => ({
              x: new Date(r.date),
              y: r.account_norm,
              actual: r.account_value,
            })),
          },
          Value: {
            id: "Value",
            color: "var(--color-main3)",
            data: rows.map((r) => ({
              x: new Date(r.date),
              y: r.value_norm,
              actual: r.value,
            })),
          },
        };

        setChartData([
          parsed["ATOM Price"],
          parsed["Active Account"],
          parsed["Value"],
        ]);
      }
    );
  }, []);

  // ==============================================
  // 📐 보조 스케일 설정 (정규화 OFF 시 실제값 매핑)
  // ==============================================
  const LEFT_MIN = 2.4;
  const LEFT_MAX = 5.4;

  const atomSeries = chartData.find((s) => s.id === "ATOM Price");
  const accSeries = chartData.find((s) => s.id === "Active Account");
  const valSeries = chartData.find((s) => s.id === "Value");

  const [atomMin, atomMax] = atomSeries
    ? (d3.extent(atomSeries.data, (d: DataPoint) => Number(d.actual)) as [
        number,
        number
      ])
    : [0, 1];

  const [accMin, accMax] = accSeries
    ? (d3.extent(accSeries.data, (d: DataPoint) => Number(d.actual)) as [
        number,
        number
      ])
    : [0, 1];

  const [valMin, valMax] = valSeries
    ? (d3.extent(valSeries.data, (d: DataPoint) => Number(d.actual)) as [
        number,
        number
      ])
    : [0, 1];

  const atomScale = d3
    .scaleLinear()
    .domain([atomMin, atomMax])
    .range([LEFT_MIN, LEFT_MAX]);
  const accScale = d3
    .scaleLinear()
    .domain([accMin, accMax])
    .range([LEFT_MIN, LEFT_MAX]);
  const valScale = d3
    .scaleLinear()
    .domain([valMin, valMax])
    .range([LEFT_MIN, LEFT_MAX]);

  // ==============================================
  // 🎨 시리즈별 색상 (투명도 포함)
  // ==============================================
  const colorMap: Record<string, string> = {
    "ATOM Price": "color-mix(in srgb, var(--color-main1) 60%, transparent)",
    "Active Account": "color-mix(in srgb, var(--color-main2) 90%, transparent)",
    Value: "color-mix(in srgb, var(--color-main3) 100%, transparent)",
  };

  // ==============================================
  // 🔘 시리즈 토글 함수
  // ==============================================
  const toggleSeries = (id: string) => {
    setActiveSeries((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const visibleData = chartData.filter((d) => activeSeries.includes(d.id));

  // ==============================================
  // 📈 메인 차트 렌더링
  // ==============================================
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col px-60 pt-13">
      {/* 제목 */}
      <section className="title flex flex-col gap-3">
        <h1>
          Analyzing the Relationship Between
          <br />
          User Activity, Trading Volume, and ATOM Price
        </h1>
        <h2>
          An intuitive view to compare on-chain activity and market reactions in
          real time
        </h2>
      </section>

      {/* 범례 & 토글 버튼 */}
      <div className="flex justify-between pb-7 pt-10">
        <section className="label flex gap-7">
          {Object.keys(colorMap).map((key) => (
            <div
              key={key}
              className="flex gap-2.5 items-center cursor-pointer select-none transition-all duration-200"
              onClick={() => toggleSeries(key)}
              style={{
                opacity: activeSeries.includes(key) ? 1 : 0.35,
                transform: activeSeries.includes(key)
                  ? "scale(1)"
                  : "scale(0.97)",
              }}
            >
              <div
                className="w-[15px] h-[15px] rounded-full"
                style={{
                  background: colorMap[key],
                  border: activeSeries.includes(key)
                    ? "none"
                    : "2px solid var(--color-axis)",
                }}
              />
              <div>{key}</div>
            </div>
          ))}
        </section>

        {/* Normalize 토글 */}
        <div className="flex gap-4 items-center">
          <div className="label">Normalize</div>
          <ToggleButton
            enabled={normalized}
            onToggle={() => setNormalized(!normalized)}
          />
        </div>
      </div>

      {/* 그래프 본체 */}
      <section className="flex-1 bg-transparent rounded-2xl flex justify-center items-center relative -translate-x-[110px] w-[calc(100%+110px)]">
        <div ref={chartRef} className="w-full h-full relative">
          <ResponsiveLine
            data={visibleData.map((series) => ({
              ...series,
              data: series.data.map((d) => {
                const actual = d.actual;
                const y = normalized
                  ? Number(d.y)
                  : series.id === "ATOM Price"
                  ? atomScale(actual)
                  : series.id === "Active Account"
                  ? accScale(actual)
                  : valScale(actual);

                return { x: new Date(d.x), y, actual };
              }),
            }))}
            colors={(d) => colorMap[d.id as keyof typeof colorMap]}
            margin={{
              top: 10,
              right: normalized ? 10 : 112,
              bottom: 100,
              left: 100,
            }}
            xScale={{ type: "time", format: "%Y-%m-%d", precision: "day" }}
            xFormat="time:%Y-%m-%d"
            yScale={
              normalized
                ? { type: "linear", min: 0, max: 1 }
                : { type: "linear", min: 2.4, max: 5.4, clamp: true }
            }
            curve="monotoneX"
            enableArea
            areaOpacity={1}
            defs={[
              {
                id: "gradientATOM",
                type: "linearGradient",
                colors: [
                  { offset: 0, color: "rgba(105, 221, 209, 0.70)" },
                  { offset: 100, color: "rgba(0, 0, 0, 0.00)" },
                ],
              },
              {
                id: "gradientVALUE",
                type: "linearGradient",
                colors: [
                  { offset: 0, color: "rgba(229, 43, 85, 0.70)" },
                  { offset: 100, color: "rgba(0, 0, 0, 0.00)" },
                ],
              },
              {
                id: "gradientACCOUNT",
                type: "linearGradient",
                colors: [
                  { offset: 0, color: "rgba(251, 187, 59, 0.70)" },
                  { offset: 100, color: "rgba(0, 0, 0, 0.00)" },
                ],
              },
            ]}
            fill={[
              { match: { id: "ATOM Price" }, id: "gradientATOM" },
              { match: { id: "Active Account" }, id: "gradientACCOUNT" },
              { match: { id: "Value" }, id: "gradientVALUE" },
            ]}
            axisBottom={{
              format: timeFormat("%Y.%m"),
              tickValues: "every 1 month",
              legend: "Month",
              legendOffset: 50,
              legendPosition: "middle",
            }}
            axisLeft={
              normalized
                ? {
                    legend: "Normalized Value",
                    legendOffset: -50,
                    legendPosition: "middle",
                  }
                : {
                    legend: "ATOM Price",
                    legendOffset: -50,
                    legendPosition: "middle",
                    tickSize: 5,
                    tickPadding: 5,
                    tickValues: d3.range(2.4, 5.5, (5.4 - 2.4) / 10),
                    format: (v) => v.toFixed(1),
                  }
            }
            lineWidth={3}
            enablePoints={false}
            enableSlices="x"
            onMouseMove={(_, event) => {
              // SVG 기준 좌표 계산
              const bounds = chartRef.current?.getBoundingClientRect();
              if (!bounds) return;
              const x = event.clientX - bounds.left;
              setHoverX(x);
            }}
            onMouseLeave={() => setHoverX(null)}
            sliceTooltip={({ slice }) => {
              const date = timeFormat("%Y.%m.%d")(
                slice.points[0].data.x as Date
              );
              const seriesOrder = [
                { id: "ATOM Price", color: "var(--color-main1)" },
                { id: "Active Account", color: "var(--color-main2)" },
                { id: "Value", color: "var(--color-main3)" },
              ];

              return (
                <div
                  style={{
                    background: "rgba(18, 20, 28, 0.9)",
                    color: "var(--color-text1)",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid var(--color-axis)",
                    fontFamily: "Pretendard",
                    fontSize: "13px",
                    lineHeight: "1.4",
                  }}
                >
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{date}</div>
                  {seriesOrder.map(({ id, color }) => {
                    const p = slice.points.find((pt) => pt.id?.includes(id));
                    if (!p) return null;

                    const actual = Number((p.data as DataPoint).actual);

                    return (
                      <div
                        key={id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: color,
                          }}
                        />
                        <span style={{ minWidth: 120 }}>
                          {id}:{" "}
                          <strong style={{ color }}>
                            {id === "Value"
                              ? `${(actual / 1_000_000_000).toFixed(2)}B`
                              : id === "Active Account"
                              ? `${Math.round(actual / 1000)}K`
                              : `$${actual.toFixed(2)}`}
                          </strong>
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            }}
            theme={{
              background: "transparent",
              axis: {
                domain: {
                  line: { stroke: "var(--color-axis)", strokeWidth: 2 },
                },
                ticks: {
                  line: { stroke: "#333", strokeWidth: 1 },
                  text: {
                    fill: "var(--color-text1)",
                    fontSize: 10,
                    fontFamily: "Pretendard, sans-serif",
                  },
                },
                legend: {
                  text: {
                    fill: "var(--color-text1)",
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "Pretendard",
                  },
                },
              },
              grid: { line: { stroke: "#3e4c856a", strokeWidth: 0.5 } },
              crosshair: {
                line: {
                  stroke: "url(#whiteGradientStroke)",
                  strokeWidth: 2,
                  strokeDasharray: "0",
                },
              },
            }}
          />
          {/* 커스텀 그라데이션 crosshair overlay */}
          {hoverX !== null && (
            <div
              className="absolute top-0 h-full pointer-events-none"
              style={{
                left: hoverX,
                width: "2.5px",
                transform: "translateX(-1px)",
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.2) 75%, rgba(0,0,0,0) 100%)",
              }}
            />
          )}
          {/* ==========================================
              오른쪽 커스텀 축 (정규화 OFF 일 때만 표시)
          ========================================== */}
          {!normalized && (
            <>
              {/* Value 축 */}
              <RightAxis
                title="Value"
                color="border-main3"
                values={[
                  "2.60B",
                  "2.46B",
                  "2.32B",
                  "2.18B",
                  "2.04B",
                  "1.90B",
                  "1.76B",
                  "1.62B",
                  "1.48B",
                  "1.34B",
                  "1.20B",
                ]}
              />

              {/* Active Account 축 */}
              <RightAxis
                title="Active Account"
                color="border-main2"
                values={[
                  "20.0",
                  "18.6",
                  "17.2",
                  "15.8",
                  "14.4",
                  "13.0",
                  "11.6",
                  "10.2",
                  "8.8",
                  "7.4",
                  "6.0",
                ]}
              />
            </>
          )}

          {/* 시각적 블러 처리 */}
          {normalized && (
            <div className="absolute top-0 right-0 w-32 h-full bg-linear-to-l from-black/90 to-transparent pointer-events-none" />
          )}
          <div className="absolute top-0 left-0 w-full h-20 bg-linear-to-b from-black/80 to-transparent pointer-events-none" />
        </div>
      </section>
    </div>
  );
}

/** 오른쪽 보조축 컴포넌트 (Value, Active Account 공용) */
function RightAxis({
  title,
  color,
  values,
}: {
  title: string;
  color: string;
  values: string[];
}) {
  return (
    <div
      className={`absolute ${
        title === "Value" ? "right-[73px]" : "right-0"
      } top-2.5 bottom-[100px] flex flex-col justify-between text-[11px] border-l-2 ${color} pl-2`}
    >
      {values.map((v, i) => (
        <div key={i}>{v}</div>
      ))}
      <div
        className={`absolute -rotate-270 top-1/2 label ${
          title === "Active Account" ? "-right-20" : "-right-10"
        }`}
      >
        {title}
      </div>
    </div>
  );
}

export default App;
