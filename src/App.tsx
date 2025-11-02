function App() {
  return (
    <>
      <div className="w-screen h-screen overflow-hidden flex flex-col px-60 py-13">
        {/* 제목 */}
        <section className="title flex flex-col gap-3">
          <h1>
            Analyzing the Relationship Between
            <br />
            User Activity, Trading Volume, and ATOM Price
          </h1>
          <h2>
            An intuitive view to compare on-chain activity and market reactions
            in real time
          </h2>
        </section>
        {/* 범례 */}
        <section className="label pt-10 flex gap-7 pb-5">
          <div className="flex gap-2.5 items-center">
            <div className="w-[15px] h-[15px] rounded-full bg-main1" />
            <div>ATOM Price</div>
          </div>
          <div className="flex gap-2.5 items-center">
            <div className="w-[15px] h-[15px] rounded-full bg-main2" />
            <div>Active Account</div>
          </div>
          <div className="flex gap-2.5 items-center">
            <div className="w-[15px] h-[15px] rounded-full bg-main3" />
            <div>Value</div>
          </div>
        </section>
        {/* 그래프 */}
        <section className="flex-1 bg-gray-800 rounded-2xl flex justify-center items-center ">
          그래프
        </section>
      </div>
    </>
  );
}

export default App;
