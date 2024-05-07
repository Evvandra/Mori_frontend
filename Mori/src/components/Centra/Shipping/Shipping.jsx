import React, { useState, useEffect } from "react";
import { useWindowSize } from "react-use";
import ShippingBox from "./ShippingBox";
import StatusComponent from "./StatusComponent";
import "./Shipping.css";

const Shipping = () => {
  const { width } = useWindowSize(); // Get the window width using the useWindowSize hook
  const { height } = useWindowSize(); // Get the window height using the useWindowSize hook
  // Check if the window width is greater than a mobile device width (e.g., 640px)

  const headerHeight = 90;
  const footerHeight = 40;

  const [maxScrollHeight, setMaxScrollHeight] = useState(0);
  const [activeTab, setActiveTab] = useState("toShip");

  useEffect(() => {
    const availableHeight = height - (headerHeight + footerHeight);
    setMaxScrollHeight(availableHeight);
  }, [height, headerHeight, footerHeight]);

  // Dummy data for To Ship tab
  const batchToShip = [
    { id: "1", weight: "10kg", date: "11/11/25" },
    { id: "2", weight: "29kg", date: "11/11/25" },
    { id: "3", weight: "30kg", date: "11/11/25" },
    { id: "4", weight: "30kg", date: "11/11/25" },
    { id: "5", weight: "30kg", date: "11/11/25" },
  ];

  // State to track checked boxes
  const [checkedState, setCheckedState] = useState(
    new Array(batchToShip.length).fill(false)
  );

  const handleCheckboxChange = (index) => {
    const updatedCheckedState = checkedState.map((item, position) =>
      index === position ? !item : item
    );
    setCheckedState(updatedCheckedState);
  };

  const selectAll = () => {
    setCheckedState(new Array(batchToShip.length).fill(true));
  };

  const deselectAll = () => {
    setCheckedState(new Array(batchToShip.length).fill(false));
  };

  const allChecked = checkedState.every(Boolean);
  const anyChecked = checkedState.some(Boolean);
  const checkedCount = checkedState.filter(Boolean).length;
  const batchText = checkedCount === 1 ? "Batch" : "Batches";

  // Dummy data for Shipped tab
  const shipmentData = [
    {
      id: "12",
      status: "Shipped",
      batches: [10201, 10273, 10279],
      totalWeight: 72.3,
    },
    {
      id: "13",
      status: "To Receive",
      batches: [10212, 12931, 12315, 12750, 83412, 12746, 32161],
      totalWeight: 0.5,
    },
    {
      id: "20",
      status: "Completed",
      batches: [10201, 10273, 10279],
      totalWeight: 72.3,
    },
    // Add more shipments if needed
  ];

  return (
    <div className="max-w-[640px] h-screen relative bg-slate-50 overflow-hidden flex flex-col items-start justify-start pt-[18px] px-0 pb-0 box-border leading-[normal] tracking-[normal] ml-auto mr-auto">
      <header
        className="self-stretch flex flex-col items-start justify-start gap-[24px] max-w-full text-left text-base text-black font-vietnam"
        style={{ height: `${headerHeight}px` }}
      >
        {/* Dynamically showing components based on checkbox state */}
        {!anyChecked && (
          // No checkbox selected
          <nav className="m-0 self-stretch flex flex-row items-start justify-start py-0 pr-6 pl-5 box-border max-w-full">
            <nav className="m-0 flex-1 flex flex-row items-start justify-between max-w-full gap-[20px] text-right text-xl text-[#828282] font-vietnam">
              <div className="flex flex-row items-start justify-start gap-[20px]">
                <div className="flex flex-row items-start justify-start">
                  <h3 className="m-0 w-6 relative text-inherit tracking-[-0.02em] font-semibold font-inherit inline-block min-w-[24px]">
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
                  </h3>
                </div>
                <h3 className="m-0 relative text-inherit font-bold font-vietnam text-black text-left inline-block min-w-[89px]">
                  Shipping
                </h3>
              </div>
              <div className="flex flex-row items-start justify-start gap-[15px] text-left text-black">
                <div className="flex flex-col items-start justify-start pt-px px-0 pb-0">
                  <h3 className="m-0 relative text-inherit tracking-[-0.02em] font-bold font-inherit inline-block min-w-[24px]">
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
                  </h3>
                </div>
                <h3 className="m-0 relative text-[22px] tracking-[-0.02em] font-bold font-inherit inline-block min-w-[28px]">
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
                </h3>
              </div>
            </nav>
          </nav>
        )}
        {anyChecked && !allChecked && (
          // Some checkboxes selected
          <div className="relative grid grid-cols-3 w-full items-center justify-center text-[#828282] mb-[0.465rem]">
            <button
              className="cursor-pointer [border:none] px-7 py-0.5 bg-[transparent] w-max font-medium font-vietnam text-[#4e5995] justify-self-start"
              style={{ fontSize: "1rem" }}
              onClick={selectAll}
            >
              Select All
            </button>
            <p className="m-0 font-semibold text-center text-base">
              {checkedCount} {batchText}
            </p>
            <button
              className="cursor-pointer [border:none] px-7 py-0.5 bg-[transparent] w-max font-semibold font-vietnam text-[#4e5995] justify-self-end"
              style={{ fontSize: "1.25rem" }}
            >
              Ship
            </button>
          </div>
        )}
        {allChecked && (
          // All checkboxes selected
          <div className="relative grid grid-cols-3 w-full items-center justify-center text-[#828282] mb-[0.465rem]">
            <button
              className="cursor-pointer [border:none] px-7 py-0.5 bg-[transparent] w-max font-medium font-vietnam text-[#4e5995] justify-self-start"
              style={{ fontSize: "1rem" }}
              onClick={deselectAll}
            >
              Deselect All
            </button>
            <p className="m-0 font-semibold text-center">
              {checkedCount} {batchText}
            </p>
            <button
              className="cursor-pointer [border:none] px-7 py-0.5 bg-[transparent] w-max font-semibold font-vietnam text-[#4e5995] justify-self-end"
              style={{ fontSize: "1.25rem" }}
            >
              Ship
            </button>
          </div>
        )}

        {/* Tabs chooser */}
        <div className="relative left-[0px] w-full h-9 text-left text-base">
          <div
            onClick={() => setActiveTab("toShip")}
            className={`absolute w-1/2 box-border flex flex-row items-center justify-center py-2 px-2.5 font-vietnam font-bold select-none ${
              activeTab === "toShip"
                ? "border-b-[2px] border-solid border-[#6d7dd2] text-[#6d7dd2]"
                : "border-b-[1px] border-solid border-black/25 text-black/25 cursor-pointer hover:border-gray-400 hover:text-gray-400"
            }`}
          >
            To Ship
          </div>
          <div
            onClick={() => setActiveTab("shipped")}
            className={`absolute left-1/2 box-border w-1/2 flex flex-row items-center justify-center py-2 px-2.5 font-vietnam font-bold select-none ${
              activeTab === "shipped"
                ? "border-b-[2px] border-solid border-[#6d7dd2] text-[#6d7dd2]"
                : "border-b-[1px] border-solid border-black/25 text-black/25 cursor-pointer hover:border-gray-400 hover:text-gray-400"
            }`}
          >
            Shipped
          </div>
        </div>
      </header>

      {/* Main content for TO SHIP tab */}
      {activeTab === "toShip" && (
        <main className="self-stretch flex flex-row items-start justify-start mt-5 px-6 mb-12 box-border max-w-full text-left text-lg text-black font-vietnam overflow-y-auto">
          <div className="flex-1 flex flex-col items-start justify-start gap-[8px] max-w-full">
            {batchToShip.map((batch, index) => (
              <ShippingBox
                key={batch.id}
                batchId={batch.id}
                weight={batch.weight}
                date={batch.date}
                checked={checkedState[index]}
                onChange={() => handleCheckboxChange(index)}
              />
            ))}
          </div>
        </main>
      )}

      {/* Main content for SHIPPED tab */}
      {activeTab === "shipped" && (
        <main className="w-full flex flex-col overflow-x-hidden">
          {/* FILTERS */}
          <div className="grid grid-cols-2 gap-2 mt-7">
            {/* Sort */}
            <div
              className="flex items-center justify-between box-border border-[2px] border-solid border-[#6d7dd2] text-[#6d7dd2] text-xs py-1 px-3 ml-7 font-vietnam"
              style={{ height: "clamp(50px, 9vw, 65px)" }}
            >
              <div
                className="flex-1 text-center"
                style={{ fontSize: "clamp(12px, 2vw, 15px)" }}
              >
                <p className="font-semibold">Sort By</p>
                <p className="mt-1">Newest to Oldest</p>
              </div>
              <svg
                width="14"
                height="9"
                viewBox="0 0 14 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 8.02344C6.80208 8.02344 6.625 7.94792 6.46875 7.79688L0.421875 1.60938C0.354167 1.54167 0.302083 1.46615 0.265625 1.38281C0.229167 1.29427 0.210938 1.20052 0.210938 1.10156C0.210938 0.966146 0.242188 0.84375 0.304688 0.734375C0.367188 0.625 0.450521 0.539062 0.554688 0.476562C0.664062 0.414062 0.786458 0.382812 0.921875 0.382812C1.11979 0.382812 1.28906 0.450521 1.42969 0.585938L7.41406 6.70312H6.57812L12.5625 0.585938C12.7083 0.450521 12.8776 0.382812 13.0703 0.382812C13.2057 0.382812 13.3255 0.414062 13.4297 0.476562C13.5391 0.539062 13.625 0.625 13.6875 0.734375C13.75 0.84375 13.7812 0.966146 13.7812 1.10156C13.7812 1.29427 13.7109 1.46094 13.5703 1.60156L7.52344 7.79688C7.45573 7.86979 7.375 7.92708 7.28125 7.96875C7.19271 8.00521 7.09896 8.02344 7 8.02344Z"
                  fill="#6D7DD2"
                />
              </svg>
            </div>

            {/* Channel Filter */}
            <div
              className="flex items-center justify-between box-border border-[2px] border-solid border-[#6d7dd2] text-[#6d7dd2] text-xs py-1 px-3 mr-7 font-vietnam"
              style={{ height: "clamp(50px, 9vw, 65px)" }}
            >
              <div
                className="flex-1 text-center"
                style={{ fontSize: "clamp(12px, 2vw, 15px)" }}
              >
                <p className="font-semibold">Channel Filter</p>
                <p className="mt-1">All</p>
              </div>
              <svg
                width="14"
                height="9"
                viewBox="0 0 14 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 8.02344C6.80208 8.02344 6.625 7.94792 6.46875 7.79688L0.421875 1.60938C0.354167 1.54167 0.302083 1.46615 0.265625 1.38281C0.229167 1.29427 0.210938 1.20052 0.210938 1.10156C0.210938 0.966146 0.242188 0.84375 0.304688 0.734375C0.367188 0.625 0.450521 0.539062 0.554688 0.476562C0.664062 0.414062 0.786458 0.382812 0.921875 0.382812C1.11979 0.382812 1.28906 0.450521 1.42969 0.585938L7.41406 6.70312H6.57812L12.5625 0.585938C12.7083 0.450521 12.8776 0.382812 13.0703 0.382812C13.2057 0.382812 13.3255 0.414062 13.4297 0.476562C13.5391 0.539062 13.625 0.625 13.6875 0.734375C13.75 0.84375 13.7812 0.966146 13.7812 1.10156C13.7812 1.29427 13.7109 1.46094 13.5703 1.60156L7.52344 7.79688C7.45573 7.86979 7.375 7.92708 7.28125 7.96875C7.19271 8.00521 7.09896 8.02344 7 8.02344Z"
                  fill="#6D7DD2"
                />
              </svg>
            </div>
          </div>

          <hr className="mt-4 mb-[-0.5px] w-full bg-zinc-300 h-1 border-none" />

          {/* Batches */}
          <div
            className="mb-[40px] overflow-y-auto"
            style={{ maxHeight: `${maxScrollHeight}px` }}
          >
            {shipmentData.map((shipment) => (
              <StatusComponent
                key={shipment.id}
                id={shipment.id}
                status={shipment.status}
                batches={shipment.batches}
                totalWeight={shipment.totalWeight}
              />
            ))}
          </div>
        </main>
      )}

      {/* Footer */}

      <footer
        className="absolute bottom-0 w-full self-stretch bg-[#efefef] box-border flex flex-row items-start justify-start py-2.5 px-6 max-w-full text-left text-[15px] text-black font-vietnam border-t-[1px] border-solid border-[#828282]"
        style={{ height: `${footerHeight}px` }}
      >
        <div className="flex-1 flex flex-row items-start justify-between max-w-full gap-[20px]">
          <b className="relative leading-[19.33px] inline-block min-w-[84px]">
            <span>©</span>
            <span className="text-xs"> 2024 MORI</span>
          </b>
          <div className="flex items-start justify-start text-xs">
            <span className="relative inline-block min-w-[51px] pt-0.5">
              CENTRA
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Shipping;