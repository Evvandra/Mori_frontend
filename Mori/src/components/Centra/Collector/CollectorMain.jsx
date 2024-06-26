import { useWindowSize } from "react-use";
import BatchBox from "./BatchBox";
import DropDown from "./DropDown";
import EditBatch from "./EditBatch"; // Import the EditBatch component
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { readBatches } from '../../../service/batches';
import { readWetLeavesCollections } from "../../../service/wetLeaves";

const CollectorMain = () => {
  const { width } = useWindowSize(); // Get the window width using the useWindowSize hook

  const isMobile = width <= 640;
  const footerHeight = 40;

  const [batchData, setBatchData] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);

  // useEffect(() => {
  //   fetch("/data.json")
  //     .then((response) => response.json())
  //     .then((data) => setBatchData(data))
  //     .catch((error) => console.error("Error fetching data:", error));
  // }, []);

  // // Calculate the total weight
  // const totalWeight = batchData.reduce(
  //   (total, batch) => total + (parseFloat(batch.weight) || 0),
  //   0
  // );

  useEffect(() => {
    const wetLeaves = async () => {
      try {
        const response = await readWetLeavesCollections();
        const batches = response.data.map((batch) => ({
          batchId: batch.WetLeavesBatchID,
          weight: batch.Weight, 
        }));
        setBatchData(batches);
  
        // Calculate total weight
        const totalWeight = batches.reduce(
          (total, batch) => total + parseFloat(batch.weight),
          0
        );
        setTotalWeight(totalWeight);
      } catch (error) {
        console.error("Error fetching batches: ", error);
      }
    };
  
    wetLeaves();
  }, []);  

  return (
    <div>
      {isMobile ? (
        <div className="collector-main-container h-screen bg-[#F0F0F0] overflow-hidden flex flex-col items-start justify-start pt-[18px] px-0 pb-0 box-border gap-[24px] leading-[normal] tracking-[normal] ml-auto mr-auto overflow-y-auto">
          {/* Header */}
          <header className="self-stretch flex flex-col items-start justify-start gap-[24px] max-w-full text-left text-base text-black font-vietnam">
            <nav className="m-0 self-stretch flex flex-row items-start justify-start py-0 pr-6 pl-5 box-border max-w-full">
              <nav className="m-0 flex-1 flex flex-row items-start justify-between max-w-full gap-[20px] text-right text-xl text-[#828282] font-vietnam">
                <div className="flex flex-row items-start justify-start gap-[20px]">
                  <div className="flex flex-row items-start justify-start">
                    <h3 className="m-0 w-6 relative text-inherit tracking-[-0.02em] font-semibold font-inherit inline-block min-w-[24px]">
                      <Link to="/centra/home">
                        <svg
                          className="w-[26px] h-[26px] text-gray-800"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="26"
                          height="26"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M5 12h14M5 12l4-4m-4 4 4 4"
                          />
                        </svg>
                      </Link>
                    </h3>
                  </div>
                  <h3 className="m-0 relative text-inherit font-bold font-vietnam text-black text-left inline-block min-w-[89px]">
                    Collector
                  </h3>
                </div>
                <div className="flex flex-row items-start justify-start gap-[15px] text-left text-black">
                  <div className="flex flex-col items-start justify-start pt-px px-0 pb-0">
                    <h3 className="m-0 relative text-inherit tracking-[-0.02em] font-bold font-inherit inline-block min-w-[24px]">
                      <Link to="/centra/notification">
                        <svg
                          className="w-[26px] h-[26px] text-gray-800"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.133 12.632v-1.8a5.406 5.406 0 0 0-4.154-5.262.955.955 0 0 0 .021-.106V3.1a1 1 0 0 0-2 0v2.364a.955.955 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C6.867 15.018 5 15.614 5 16.807 5 17.4 5 18 5.538 18h12.924C19 18 19 17.4 19 16.807c0-1.193-1.867-1.789-1.867-4.175ZM8.823 19a3.453 3.453 0 0 0 6.354 0H8.823Z" />
                        </svg>
                      </Link>
                    </h3>
                  </div>
                  <h3 className="m-0 relative text-[22px] tracking-[-0.02em] font-bold font-inherit inline-block min-w-[28px]">
                    <Link to="/centra/navigation">
                      <svg
                        className="w-[30px] h-[30px] text-gray-800"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="2.5"
                          d="M5 7h14M5 12h14M5 17h14"
                        />
                      </svg>
                    </Link>
                  </h3>
                </div>
              </nav>
            </nav>
          </header>

          {/* Collector Main Section */}
          <main className="self-stretch flex flex-row items-start justify-start pb-12 pt-0 px-6 box-border max-w-full text-left text-lg text-black font-vietnam overflow-y-auto">
            <div className="flex-1 flex flex-col items-start justify-start gap-[8px] max-w-full">
              {/* Total Weight */}
              <div className="w-full mb-2 flex justify-between items-center w-[342px] h-20 bg-white rounded-lg px-4">
                <div className="flex flex-col">
                  <span className="text-black text-sm font-bold font-['Be Vietnam Pro'] leading-[15px]">
                    Total weight
                  </span>
                  <span className="text-black text-sm font-medium font-['Be Vietnam']">
                    of leaves collected
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-black text-4xl font-bold font-['Be Vietnam Pro']">
                    {totalWeight.toFixed(1)}{" "}
                    <span className="text-black text-xl font-medium font-['Be Vietnam Pro']">
                      kg
                    </span>{" "}
                  </span>
                </div>
              </div>

              {/* Separator Line */}
              <hr className="w-full h-0 border-2 border-gray-300" />

              {/* Filter By Button */}
              <div className="w-full mt-3 mb-3">
                <DropDown className="w-full" />
              </div>

              {/* Render BatchBox components using fetched data
              {batchData.map(batch => (
                <BatchBox
                  key={batch.batchId}
                  batchId={batch.batchId}
                  weight={batch.weight}
                  status={batch.status}
                  date={batch.date}
                  time={batch.time}
                  duration={batch.duration}
                  selectedDate={selectedDate}
                />
              ))} */}

              {/* <EditBatch onClose={handleClose} batchData={{}} date={date} weight={weight} time={time} /> */}
            </div>
          </main>

          {/* Footer */}
          <footer className="font-vietnam bg-gray-200 text-black flex justify-between items-center h-10 px-3 fixed bottom-0 left-0 right-0">
            <p className="font-bold">@2024 MORI</p>
            <p className="font-semibold">CENTRA</p>
          </footer>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen mt-4 text-gray-600">
          Not available for this device.
        </div>
      )}
    </div>
  );
};

export default CollectorMain;
