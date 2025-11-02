import { ResponsiveLine } from "@nivo/line";
import { useState } from "react";
import { timeFormat } from "d3-time-format";
import ToggleButton from "./components/ToggleButton";

function App() {
  // 📆 날짜 데이터 생성 (11개월간, 일 단위)
  const start = new Date(2024, 10, 1);
  const end = new Date(2025, 9, 31);
  const dates: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 3)) {
    dates.push(new Date(d));
  }

  // 📊 원본 데이터
  const allData = [
    {
      id: "ATOM Price",
      color: "var(--color-main1)",
      data: dates.map((d, i) => {
        // 실제값 (예: 10~30달러)
        const actual = 20 + 10 * Math.sin(i * 0.3);
        // 정규화된 값 (0~1)
        const normalized = (actual - 10) / (30 - 10);

        return { x: d, y: normalized, actual };
      }),
    },
    {
      id: "Active Account",
      color: "var(--color-main2)",
      data: dates.map((d, i) => {
        // 실제값 (예: 5,000~15,000명)
        const actual = 10000 + 5000 * Math.cos(i * 0.25);
        const normalized = (actual - 5000) / (15000 - 5000);

        return { x: d, y: normalized, actual };
      }),
    },
    {
      id: "Value",
      color: "var(--color-main3)",
      data: dates.map((d, i) => {
        // 실제값 (예: 10억~30억)
        const actual = 20_000_000_000 + 10_000_000_000 * Math.sin(i * 0.4 + 1);
        const normalized =
          (actual - 10_000_000_000) / (30_000_000_000 - 10_000_000_000);

        return { x: d, y: normalized, actual };
      }),
    },
  ];

  // 선택된 시리즈 상태
  const [activeSeries, setActiveSeries] = useState([
    "ATOM Price",
    "Active Account",
    "Value",
  ]);

  const [normalized, setNormalized] = useState(true);

  // 클릭 시 토글 함수
  const toggleSeries = (id: string) => {
    setActiveSeries((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // 선택된 데이터만 필터링
  const visibleData = allData.filter((d) => activeSeries.includes(d.id));

  const colorMap: Record<string, string> = {
    "ATOM Price": "var(--color-main1)",
    "Active Account": "var(--color-main2)",
    Value: "var(--color-main3)",
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col px-60 pt-13">
      <section className="title flex flex-col gap-3">
        {/* 제목 */}
        <h1>
          Analyzing the Relationship Between
          <br />
          User Activity, Trading Volume, and ATOM Price
        </h1>
        {/* 부제목 */}
        <h2>
          An intuitive view to compare on-chain activity and market reactions in
          real time
        </h2>
      </section>

      <div className="flex justify-between pb-7 pt-10">
        {/* 범례 */}
        <section className="label flex gap-7 ">
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
                  border:
                    activeSeries.includes(key) === false
                      ? "2px solid var(--color-axis)"
                      : "none",
                }}
              />
              <div>{key}</div>
            </div>
          ))}
        </section>
        {/* 정규화 버튼 */}
        <div className="flex gap-4 items-center">
          <div className="label">Normalize</div>
          <ToggleButton
            enabled={normalized}
            onToggle={() => setNormalized(!normalized)}
          />
        </div>
      </div>

      {/* 그래프 */}
      <section className="flex-1 bg-transparent rounded-2xl flex justify-center items-center relative -translate-x-[110px] w-[calc(100%+110px)]">
        <div className="w-full h-full relative">
          <ResponsiveLine
            data={visibleData}
            colors={(d) => colorMap[d.id as keyof typeof colorMap]}
            margin={{ top: 10, right: 10, bottom: 100, left: 100 }}
            xScale={{
              type: "time",
              format: "%Y-%m-%d",
              precision: "day",
            }}
            xFormat="time:%Y-%m-%d"
            yScale={{ type: "linear", min: 0, max: 1 }}
            curve="basis"
            axisBottom={{
              format: timeFormat("%Y.%m"),
              tickValues: "every 1 month",
              legend: "Month",
              legendOffset: 50,
              legendPosition: "middle",
            }}
            axisLeft={{
              legend: "Normalized Value",
              legendOffset: -50,
              legendPosition: "middle",
            }}
            enablePoints={false}
            enableArea={true}
            areaOpacity={0.15}
            enableSlices="x"
            sliceTooltip={({ slice }) => {
              const date = timeFormat("%Y.%m.%d")(
                slice.points[0].data.x as Date
              );

              // 현재 표시 중인 그래프만 표시
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
                    // slice.points 배열 중 label(id)이 일치하는 항목 찾기
                    const p = slice.points.find((pt) => pt.id?.includes(id));

                    if (!p) return null; // 없는 시리즈는 툴팁에 표시 안 함

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
                            {p.data.actual.toLocaleString()}{" "}
                            {/* 예: 10,253,000 */}
                          </strong>
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            }}
            enableTouchCrosshair={true}
            useMesh={true}
            motionConfig={{
              mass: 1,
              tension: 180,
              friction: 30,
            }}
            theme={{
              background: "transparent",
              axis: {
                domain: {
                  line: {
                    stroke: "var(--color-axis)",
                    strokeWidth: 2,
                  },
                },
                ticks: {
                  line: {
                    stroke: "#333",
                    strokeWidth: 1,
                  },
                  text: {
                    fill: "var(--color-text1)",
                    fontSize: 10,
                    fontFamily: "Pretendard, sans-serif",
                    fontWeight: "lighter",
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
              grid: {
                line: {
                  stroke: "#3e4c856a",
                  strokeWidth: 0.5,
                },
              },
              crosshair: {
                line: {
                  stroke: "#888",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                },
              },
            }}
          />

          {/* X축 우측 흐림 */}
          <div className="absolute top-0 right-0 w-32 h-full bg-linear-to-l from-black/90 to-transparent pointer-events-none" />

          {/* Y축 위 흐림 */}
          <div className="absolute top-0 left-0 w-full h-20 bg-linear-to-b from-black/80 to-transparent pointer-events-none" />
        </div>
      </section>
    </div>
  );
}

export default App;
