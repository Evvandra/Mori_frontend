import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import bell from '../../../assets/bell.png';
import hamburg from '../../../assets/hamburg.png';
import back from '../../../assets/back.png';
import { Doughnut } from 'react-chartjs-2';
import DatePicker from "react-tailwindcss-datepicker";
import { useWindowSize } from 'react-use';
import { addDryingActivity, getDryingActivity_Bymachine } from "../../../service/dryingActivity.js";
import { updateDryingMachineStatus } from "../../../service/dryingMachine.js";
import { createDriedLeaf } from "../../../service/driedLeaves.js";

const gaugeOptions = {
  responsive: true,
  cutout: '80%',
  circumference: 180,
  rotation: -90,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  maintainAspectRatio: false,
  events: [],
};

function parseISODuration(duration) {
  const matches = duration.match(/P(?:(\d+)D)?/);
  const days = matches[1] ? parseInt(matches[1], 10) : 0;
  const totalSeconds = days * 24 * 60 * 60;
  return totalSeconds;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
};

export default function DryingMachine() {
  const location = useLocation();
  const { centraID, capacity, currentLoad, status, duration, load, id } = location.state || {};

  const [machineData, setMachineData] = useState({ centraID, id, capacity, currentLoad, status, duration, load });
  const [timer, setTimer] = useState(parseISODuration(duration));
  const [timerInterval, setTimerInterval] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const [buttonText, setButtonText] = useState("Start Process");
  const [batchDetails, setBatchDetails] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const { width } = useWindowSize();
  const isMobile = width <= 640;

  const [remainingTime, setRemainingTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    receiveData();
  }, [centraID, id, capacity, currentLoad, status, duration, load]);

  const receiveData = async () => {
    console.log("Received data:", { centraID, id, capacity, currentLoad, status, duration, load });
    setMachineData({ centraID, id, capacity, currentLoad, status, duration, load });

    if (status === "running") {
      try {
        const response = await getDryingActivity_Bymachine(id);
        const runningActivity = response.data.find(activity => activity.InUse);
        if (runningActivity) {
          const endTime = new Date(runningActivity.EndTime).getTime();
          const currentTime = new Date().getTime();
          const remainingSeconds = Math.max((endTime - currentTime) / 1000, 0);
          setTimer(remainingSeconds);
          setIsRunning(true);
          startTimer(remainingSeconds);
        }
      } catch (error) {
        console.error("Failed to fetch running activity:", error.message);
      }
    } else if (status === "finished") {
      // Set the timer to 0 and set batch details if the status is finished
      setTimer(0);
      setBatchDetails({
        number: Math.floor(Math.random() * 10000),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        weight: load
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning && timer > 0) {
        setTimer(prevTimer => prevTimer - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const startProcess = async () => {
    const startTime = new Date().toISOString();
    localStorage.setItem(`dryingStartTime_${id}`, startTime);
    try {
      await addDryingActivity(load, id, parseISODuration(duration));
      await updateDryingMachineStatus(id, "running");
      setMachineData(prevData => ({ ...prevData, status: "running", inuse: true })); // Update inuse field
      startTimer();
    } catch (error) {
      console.error("Failed to start drying process:", error.message);
    }
  };

  const startTimer = (totalSeconds = parseISODuration(duration)) => {
    setTimer(totalSeconds);

    if (!timerInterval) {
      const interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer > 0) {
            return prevTimer - 1;
          } else {
            clearInterval(interval);
            setInProgress(false);
            setButtonText("Done Processing");
            setBatchDetails({
              number: Math.floor(Math.random() * 10000),
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              weight: load
            });
            return 0;
          }
        });
      }, 1000);
      setTimerInterval(interval);
      setInProgress(true);
      setButtonText("In Progress");
    }
  };

  const handleFastForward = async () => {
    setTimer(0);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setInProgress(false);
    setButtonText("Done Processing");

    // Update the machine status to 'finished'
    try {
      await updateDryingMachineStatus(machineData.id, 'finished');
      setBatchDetails({
        number: Math.floor(Math.random() * 10000),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        weight: load
      });
    } catch (error) {
      console.log("Error updating drying machine status: ", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    // Cleanup timer on component unmount
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const formatTimeWithoutSeconds = (timeString) => {
    if (!timeString) return '';
    const [time, modifier] = timeString.split(' ');
    if (!time || !modifier) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes} ${modifier}`;
  };

  const handleRescale = () => {
    // Logic for rescaling goes here
  };

  const handleDateChange = (date) => {
    if (date) {
      setEditDate(date.startDate);
    }
  };

  const handleEditClick = () => {
    setEditMode(!editMode);

    if (!editMode) {
      setEditDate(batchDetails?.date || "");
      setEditTime(batchDetails?.time || "");
      setEditWeight(batchDetails?.weight.toString() || "");

      const currentTime = batchDetails?.time || new Date().toLocaleTimeString();
      const [time, modifier] = currentTime.split(' ');
      if (!modifier) {
        const systemAmPm = new Date().toLocaleTimeString().split(' ')[1] || 'AM';
        setEditTime(`${time} ${systemAmPm}`);
      } else {
        setEditTime(currentTime);
      }
    } else {
      // Exiting edit mode, do not change the state as they should already be updated in handleSaveEdit
    }
  };

  const handleConfirm = async () => {
    try {
        // Extract necessary details
        const centralId = centraID;
        const weight = parseFloat(batchDetails.weight);
        const driedDate = new Date(batchDetails.date).toISOString().split('T')[0]; // Ensure this is in YYYY-MM-DD format
        const floured = false; // Set the value as needed
        const inMachine = false; // Explicitly set inMachine to false

        // Log the data to verify
        console.log("Data being sent to the API:", {
            CentraID: centralId,
            Weight: weight,
            DriedDate: driedDate,
            Floured: floured,
            InMachine: inMachine,
        });

        // Call the API function to save data to the database
        await createDriedLeaf(centralId, weight, driedDate, floured, inMachine);
        console.log("Dried leaf saved successfully!");

        // Update the machine status to 'idle'
        await updateDryingMachineStatus(machineData.id, 'idle');
        console.log("Machine status updated to idle!");

        // Optionally, update the local state to reflect the new status
        setMachineData(prevData => ({ ...prevData, status: 'idle' }));
    } catch (error) {
        console.error("Error saving dried leaf or updating machine status:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
  };


  const handleCancelEdit = () => {
    setEditDate(batchDetails?.date || "");
    setEditTime(batchDetails?.time || "");
    setEditWeight(batchDetails?.weight || "");
    setEditMode(false);
  };

  const handleSaveEdit = async () => {
    setBatchDetails({
        ...batchDetails,
        centraID: centraID,
        date: editDate,
        time: editTime,
        weight: editWeight
    });
    setEditMode(false);

    try {
        // Extract necessary details
        const centralId = centraID;
        const weight = editWeight;
        const driedDate = editDate; // Ensure this is in YYYY-MM-DD format
        const floured = false; // Set the value as needed
        const inMachine = false; // Explicitly set inMachine to false

        // Log the data to verify
        console.log("Data being sent to the API:", {
            CentraID: centralId,
            Weight: weight,
            DriedDate: driedDate,
            Floured: floured,
            InMachine: inMachine,
        });

        // Call the API function to save data to the database
        await createDriedLeaf(centralId, weight, driedDate, floured, inMachine);
        console.log("Dried leaf saved successfully!");
    } catch (error) {
        console.error("Error saving dried leaf:", error);
    }
  };


  let chartColor = '#99D0D580';
  if (load === capacity) {
    chartColor = '#0F3F43';
  } else if (load > capacity / 2) {
    chartColor = '#5D9EA4';
  }

  return (
    isMobile ? (
      <div className="bg-000000" style={{ paddingBottom: '40px' }}>
        <div className="w-full">
          <div className="p-4 shadow-md flex justify-between items-center bg-white">
            <Link to="/centra/processor" className="flex items-center">
              <img src={back} alt="back" className="w-5 mr-2" />
            </Link>
            <span className="font-bold text-2xl lg:text-3xl xl:text-4xl mr-18 font-vietnam">
              Drying Machine {id}
            </span>
            <div className="flex">
              <img src={bell} alt="notifications" className="w-5 mr-2" />
              <img src={hamburg} alt="menu" className="w-5" />
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="chart-container" style={{ width: '150px', height: '120px', position: 'relative' }}>
            <Doughnut
              data={{
                labels: ['Current Load', 'Capacity'],
                datasets: [{
                  data: [load || 0, capacity - (load || 0)],
                  backgroundColor: [chartColor, '#EFEFEF'],
                  borderWidth: 0
                }]
              }}
              options={gaugeOptions}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ fontSize: '0' }}>
              <span className="font-vietnam font-bold" style={{ fontSize: '24px', lineHeight: '1.2' }}>{load} kg</span>
              <span className="font-vietnam font-bold" style={{ fontSize: '12px', lineHeight: '1.2', marginBottom: '-30px' }}>{`/ ${capacity} kg`}</span>
            </div>
          </div>
        </div>

        <div className="last-updated" style={{ textAlign: 'center', fontSize: '10px', color: '#666666', marginTop: '-18px' }}>
          Last updated: <span style={{ fontWeight: 'bold' }}>{machineData?.lastUpdated}</span>
        </div>

        <div style={{ borderTop: '1px solid #ccc', margin: '20px auto', width: '80%' }}></div>


        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          {status === 'idle' ? (
            <button
              className="start-btn text-white py-1 px-4"
              style={{
                backgroundColor: buttonText === "Start Process" ? "#000000" : inProgress ? "#FFFFFF" : "#FFFFFF",
                color: buttonText === "Start Process" ? "#FFFFFF" : inProgress ? "#000000" : "#217045",
                border: buttonText === "Start Process" ? "none" : inProgress ? "1px solid #000000" : "1px solid #217045",
                borderRadius: "10px",
                fontSize: "14px",
              }}
              onClick={startProcess}
              disabled={inProgress}
            >
              {buttonText}
            </button>
          ) : status === 'running' ? (
            <>
              <button
                className="fast-forward-btn text-white py-1 px-4 ml-4"
                style={{
                  backgroundColor: "#FF4500",
                  borderRadius: "10px",
                  fontSize: "14px",
                }}
                onClick={handleFastForward}
              >
                Jump to finish
              </button>
            </>
          ) : (
            <></>
          )}
        </div>

        <div className="flex justify-center items-center">
          <div className="chart-container" style={{ width: '200px', height: '200px', position: 'relative' }}>
            <Doughnut
              data={{
                labels: ['Time Left', ''],
                datasets: [{
                  data: [timer, parseISODuration(duration) - timer],
                  backgroundColor: ['#4D946D', '#EFEFEF'],
                  borderWidth: 0
                }]
              }}
              options={{
                ...gaugeOptions,
                cutout: '88%',
                circumference: 360,
                rotation: 0,
                animation: { animateRotate: false },
                tooltips: { enabled: false }
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ fontSize: '0' }}>
              <span className="font-vietnam font-bold" style={{ fontSize: '24px', lineHeight: '1.2' }}>{formatTime(timer)}</span>
              {/* <span className="text-sm mt-2" style={{ fontSize: '10px', lineHeight: '1.2' }}>Finished at {new Date(Date.now() + timer * 1000).toLocaleTimeString()}</span> */}
            </div>
          </div>
        </div>

        {timer === 0 && batchDetails && (
          <div className="bg-white p-4 mt-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'left', width: '100%' }}>
              {/* <p className="text-xs mb-1">Date</p> */}
              {/* {editMode ? (
                <DatePicker
                  useRange={false}
                  asSingle={true}
                  value={{ startDate: editDate, endDate: editDate }}
                  onChange={handleDateChange}
                  inputClassName="w-full h-10 rounded-md focus:ring-0 bg-[#EFEFEF] dark:bg-gray-900 dark:placeholder:text-gray-100 border-gray-300 text-sm text-gray-500"
                  placeholderText="Select date"
                  dateFormat="yyyy-MM-dd"
                />
              ) : (
                <p className="font-bold text-sm mb-2">{formatDate(batchDetails?.date)}</p>
              )} */}

              {/* <p className="text-xs mb-1">Time</p> */}
              {/* {editMode ? (
                <div className="relative max-w-sm flex items-center">
                  <div className="h-10 bg-[#EFEFEF] leading-none border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500 relative flex items-center justify-left">
                    <select
                      name="hours"
                      className="bg-transparent text-xs appearance-none outline-none border-none text-center"
                      value={editTime.split(':')[0]}
                      onChange={(e) => setEditTime(`${e.target.value}:${editTime.split(':')[1].split(' ')[0]} ${editTime.split(' ')[1]}`)}
                    >
                      {[...Array(12).keys()].map((hour) => (
                        <option key={hour + 1} value={hour + 1}>{String(hour + 1).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <span className="text-s mr-3">:</span>
                    <select
                      name="minutes"
                      className="bg-transparent text-xs appearance-none outline-none mr-4 border-none"
                      value={editTime.split(':')[1].split(' ')[0]}
                      onChange={(e) => setEditTime(`${editTime.split(':')[0]}:${e.target.value} ${editTime.split(' ')[1]}`)}
                    >
                      {[...Array(60).keys()].map((minute) => (
                        <option key={minute} value={String(minute).padStart(2, '0')}>{String(minute).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <select
                      name="ampm"
                      className="bg-transparent text-xs appearance-none outline-none border-none"
                      value={editTime.split(' ')[1]}
                      onChange={(e) => setEditTime(`${editTime.split(':')[0]}:${editTime.split(':')[1].split(' ')[0]} ${e.target.value}`)}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              ) : (
                <p className="font-bold text-sm mb-2">{formatTimeWithoutSeconds(batchDetails?.time)}</p>
              )} */}

              <p className="text-xs mb-1">Weight</p>
              {editMode ? (
                <div className="relative max-w-sm flex items-center">
                  <input
                    type="number"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="w-full py-1 px-2 rounded-full bg-[#EFEFEF] text-gray-500 focus:outline-none border border-gray-300"
                    placeholder="Enter weight (kg)"
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                    <span>kg</span>
                  </div>
                </div>
              ) : (
                <p className="font-bold text-sm mb-4">{batchDetails?.weight} kg</p>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingTop: '10px' }}>
              <button
                  onClick={editMode ? handleCancelEdit : handleEditClick}
                  className="bg-black text-white py-1 px-3 rounded-md mr-2"
                  style={{ width: '150px', borderBottom: 'none' }}
              >
                  {editMode ? 'Cancel' : 'Edit'}
              </button>

              <button
                  onClick={editMode ? handleSaveEdit : handleConfirm}
                  className={`bg-green-600 text-white py-1 px-3 rounded-md ml-2 ${
                    editMode ? 'mr-2' : ''
                  }`}
                  style={{ width: '150px', borderBottom: 'none' }}
              >
                  {editMode ? 'Save' : 'Confirm'}
              </button>
          </div>
          </div>
        )}

        <footer className="bg-gray-200 text-black flex justify-between items-center h-10 px-3 fixed bottom-0 left-0 right-0">
          <p className="font-semibold">@2024 AMIN</p>
          <p className="font-semibold">CENTRA</p>
        </footer>
      </div>
    ) : (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Not available for this device.</p>
      </div>
    )
  );
}
