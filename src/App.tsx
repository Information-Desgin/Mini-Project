function App() {
  return (
    <>
      <div>
        <div className="title pt-20 pl-65 flex flex-col gap-4">
          <h1>
            Analyzing the Relationship Between
            <br />
            User Activity, Trading Volume, and ATOM Price
          </h1>
          <h2>
            An intuitive view to compare on-chain activity and market reactions
            in real time
          </h2>
          <div className="label pt-13 flex gap-7">
            <div className="flex gap-2.5 items-center">
              <div className="w-4 h-4 rounded-full bg-main1" />
              <div>ATOM Price</div>
            </div>
            <div className="flex gap-2.5 items-center">
              <div className="w-4 h-4 rounded-full bg-main2" />
              <div>Active Account</div>
            </div>
            <div className="flex gap-2.5 items-center">
              <div className="w-4 h-4 rounded-full bg-main3" />
              <div>Value</div>
            </div>
          </div>
          <div className="w-[1018px] h-[533px] bg-gray-800 mt-11 mb-25 rounded-2xl flex justify-center items-center">
            그래프
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
