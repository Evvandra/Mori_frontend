import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import moriLogo from "../../../assets/XYZ/BlackMori.png";
import semicircle from "../../../assets/XYZ/semicircle.png";
import ArrowDown from "../../../assets/XYZ/arrowdown.png";
import notifIcon from "../../../assets/XYZ/notif.png";
import nonotifIcon from "../../../assets/XYZ/nonotif.png";
import DashboardMachineCard from "./DashboardMachineCard";
import LeavesStatusDashboard from "./MonitoringCentra/LeavesStatusCard";
import XYZShippingInformation from "././XYZShippingInformation/XYZShippingInformation";
import AcceptedPackages from "././AcceptedPackages/AcceptedPackages";
import StockBooking from "./StockBooking/StockBooking";
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import { getAllWarehouses, getWarehouseDetails } from "../../../service/warehousesService";
import { readExpeditions } from "../../../service/expeditionService";
import { getAllCentras } from "../../../service/centras";
import { getConvertionRate } from "../../../service/dashboard";


const MainXYZ = () => {
  const initialConvertionRate = {
    id: 0,
    conversionRate: 0,
    wetToDry: 0,
    dryToFloured: 0
  };
  const initialCentra = {
    CentralID: 0, 
    Address: ""
  };
  const [selectedConversionRate, setSelectedConversionRate] = useState(initialConvertionRate);
  const [centras, setCentras] = useState([]);
  const [selectedCentra, setSelectedCentra] = useState(initialCentra);
  const [activePage, setActivePage] = useState(localStorage.getItem('activePage') || 'Dashboard');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState("Kupang");
  const [warehouseDropdownVisible, setWarehouseDropdownVisible] = useState(false);
  const [warehouseId, setWarehouseId] = useState([]); // Default warehouseId to null
  const [machines, setMachines] = useState([]);
  const [warehouses, setWarehouses] = useState([]); // State to store all warehouse details
  const shippedCount = 2;
  const toDeliverCount = 2;
  const completedCount = 2;
  const missingCount = 2;

  const [expeditionsData, setExpeditionsData] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    XYZ_PickingUp: 0,
    XYZ_Completed: 0,
    PKG_Delivered: 0,
    PKG_Delivering: 0,
    Missing: 0,
  });

  const [conversionRateDropdownVisible, setConversionRateDropdownVisible] = useState(false);
  

  const fetchExpeditionsData = async () => {
    try {
      const res = await readExpeditions();
      const expeditions = res.data;
  
      const groupedExpeditions = expeditions.reduce((acc, expedition) => {
        const expeditionDetails = expedition?.expedition;
        if (!expeditionDetails || !expedition.batches) {
          return acc;
        }
  
        const airwayBill = expeditionDetails.AirwayBill;
        if (!acc[airwayBill]) {
          acc[airwayBill] = {
            id: airwayBill,
            expeditionID: expeditionDetails.ExpeditionID,
            batchIds: [],
            flouredDates: [],
            driedDates: [],
            weights: [],
            status: expeditionDetails.Status || "Unknown",
            checkpoint: `${expedition.checkpoint_status || "Unknown"} | ${
              expedition.checkpoint_statusdate ? new Date(expedition.checkpoint_statusdate).toLocaleString() : "Unknown"
            }`,
          };
        }
  
        expedition.batches.forEach((batch) => {
          acc[airwayBill].batchIds.push(batch.BatchID);
          acc[airwayBill].flouredDates.push(new Date(batch.FlouredDate).toLocaleDateString());
          acc[airwayBill].driedDates.push(new Date(batch.DriedDate).toLocaleDateString());
          acc[airwayBill].weights.push(batch.Weight);
        });
  
        return acc;
      }, {});
  
      const resArr = Object.values(groupedExpeditions).map((expedition, index) => ({
        id: index + 1,
        shipmentId: expedition.id,
        expeditionID: expedition.expeditionID,
        batchId: expedition.batchIds,
        driedDate: expedition.driedDates,
        flouredDate: expedition.flouredDates,
        weight: expedition.weights,
        status: expedition.status,
        checkpoint: expedition.checkpoint,
        receptionNotes: "Null",
      }));
  
      console.log("Resulting Array: ", resArr);
      setExpeditionsData(resArr);
  
      // Calculate status counts
      const counts = resArr.reduce((acc, expedition) => {
        if (expedition.status === "XYZ_PickingUp") {
          acc.XYZ_PickingUp += 1;
        } else if (expedition.status === "XYZ_Completed") {
          acc.XYZ_Completed += 1;
        } else if (expedition.status === "PKG_Delivered") {
          acc.PKG_Delivered += 1;
        } else if (expedition.status === "PKG_Delivering") {
          acc.PKG_Delivering += 1;
        } else if (expedition.status === "Missing") {
          acc.Missing += 1;
        }
        return acc;
      }, {
        XYZ_PickingUp: 0,
        XYZ_Completed: 0,
        PKG_Delivered: 0,
        PKG_Delivering: 0,
        Missing: 0,
      });
  
      setStatusCounts(counts);
    } catch (err) {
      console.error("Error: ", err);
    }
  };

  useEffect(() => {
    fetchExpeditionsData();
    fetchCentras();
    fetchAllWarehouses();
  }, []);

  const fetchCentras = async () => {
    try {
      const centras = await getAllCentras();

      setCentras(centras.data); // Assuming getAllCentras returns the conversion rates
      setSelectedCentra(centras.data[0]);
    } catch (error) {
      console.error("Error fetching centras data: ", error);
    }
  }

  useEffect(() => {
    if (selectedCentra) {
      const fetchConversionRate = async () => {
        try {
          const response = await getConvertionRate(selectedCentra.CentralID);
          setSelectedConversionRate(response.data);
        } catch (error) {
          console.error("Error fetching conversion rate data: ", error);
        }
      };

      fetchConversionRate();
    }
  }, [selectedCentra]);
  
  const toggleConversionRateDropdown = () => {
    setConversionRateDropdownVisible(!conversionRateDropdownVisible);
  };

  const selectConversionRate = (centra) => {
    setSelectedCentra(centra);
    setConversionRateDropdownVisible(false);
  };

  useEffect(() => {
    if (warehouseId !== null) {
      fetchWarehouseDetails(warehouseId);
    }
  }, [warehouseId]); // Fetch data when warehouseId changes

  const fetchAllWarehouses = async () => {
    try {
      const response = await getAllWarehouses();
      const data = response.data;
      setWarehouses(data);
      console.log("All warehouse details:", data); // Log all warehouse details
    } catch (error) {
      console.error("Error fetching all warehouses: ", error);
    }
  };

  const fetchWarehouseDetails = async (warehouse_id) => {
    try {
      const response = await getWarehouseDetails(warehouse_id);
      const data = response.data;
      console.log('Raw data from backend:', data);

      // Transform the data if needed
      const transformedData = data.map(item => ({
        location: item.location,
        currentLoad: item.TotalStock,
        capacity: item.Capacity, // Assuming capacity is provided by the backend
        // lastUpdated: item.lastUpdated || null, // Customize as needed
      }));
      console.log('Transformed data:', transformedData);

      setMachines(transformedData); // Update machines with transformed data
      console.log('Machines state:', machines); // Log machines state to debug
    } catch (error) {
      console.error('Error fetching warehouse details:', error);
      // Handle error state if needed
    }
  };
  
  const chartData = {
    datasets: [
      {
        data: [selectedConversionRate.conversionRate, 100 - selectedConversionRate.conversionRate],
        backgroundColor: ['#176E76', '#E0E0E0'],
      },
    ],
  };

  const gaugeOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
    },
    rotation: 270,
    circumference: 180,
  };

  // Editable user state
  const initialUserState = {
    name: "Randy",
    email: "rany@gmail.com",
    phone: "0812828828282",
    gender: "Male",
    birthdate: { day: "08", month: "December", year: "2004" },
    role: "XYZ Admin",
    location: "Bekasi",
  };

  const [userState, setUserState] = useState(initialUserState);
  const [tempUserState, setTempUserState] = useState(initialUserState);

  const user = {
    ...userState,
    loginDate: new Date(),
    hasNotification: true,
  };

  const formattedDate = user.loginDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const toggleWarehouseDropdown = () => {
    setWarehouseDropdownVisible(!warehouseDropdownVisible);
  };

  const selectWarehouse = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setWarehouseDropdownVisible(false);
  };

  // Generate date, month, and year options
  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from({ length: 124 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempUserState((prev) => ({ ...prev, [name]: value }));
  };

  const handleBirthdateChange = (e) => {
    const { name, value } = e.target;
    setTempUserState((prev) => ({
      ...prev,
      birthdate: { ...prev.birthdate, [name]: value },
    }));
  };

  const handleGenderChange = (e) => {
    const { value } = e.target;
    if (value === "Male" && tempUserState.gender === "Others") {
      setTempUserState((prev) => ({ ...prev, gender: "Female" }));
      setTimeout(
        () => setTempUserState((prev) => ({ ...prev, gender: "Male" })),
        0
      );
    } else if (value === "Others" && tempUserState.gender === "Male") {
      setTempUserState((prev) => ({ ...prev, gender: "Female" }));
      setTimeout(
        () => setTempUserState((prev) => ({ ...prev, gender: "Others" })),
        0
      );
    } else {
      setTempUserState((prev) => ({ ...prev, gender: value }));
    }
  };

  const handleSaveChanges = () => {
    setUserState(tempUserState);
  };

  const handleCancel = () => {
    setTempUserState(userState);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    localStorage.setItem('activePage', page);
  };
  
  return (
    <div className="flex">
      <div className="fixed flex flex-col w-64 h-screen bg-white border-r">
        <div className="flex items-center justify-center mt-10 mr-24">
          <img src={moriLogo} alt="Mori Logo" className="h-10" />
        </div>
        <nav className="mt-10 ">
          <div className="px-6 mb-1">
            <h2 className="text-sm font-semibold text-gray-700 ml-[-0.1rem]">
              MAIN
            </h2>
          </div>
          <ul>
            {[
              // {
              //   name: "Stock Booking",
              //   icon: "M2.4098 13.6519C1.61633 13.6519 1.01633 13.4627 0.609796 13.0845C0.203265 12.7108 0 12.1593 0 11.4302V3.11084C0 2.37712 0.203265 1.8234 0.609796 1.44971C1.01633 1.07601 1.61633 0.88916 2.4098 0.88916H12.5192C13.3176 0.88916 13.9176 1.07601 14.3192 1.44971C14.7257 1.8234 14.929 2.37712 14.929 3.11084V6.9458C14.8163 6.92301 14.6988 6.90934 14.5763 6.90479C14.4588 6.89567 14.3388 6.89111 14.2163 6.89111C14.0939 6.89111 13.9714 6.89567 13.849 6.90479C13.7314 6.9139 13.609 6.92757 13.4816 6.9458V5.1001C13.4816 4.80387 13.3984 4.58057 13.2318 4.43018C13.0702 4.27979 12.8351 4.20459 12.5265 4.20459H2.3951C2.08653 4.20459 1.85143 4.27979 1.6898 4.43018C1.52816 4.58057 1.44735 4.80387 1.44735 5.1001V11.4165C1.44735 11.7127 1.52816 11.936 1.6898 12.0864C1.85143 12.2323 2.08653 12.3052 2.3951 12.3052H9.52163C9.56571 12.5467 9.63429 12.7814 9.72735 13.0093C9.82041 13.2371 9.93551 13.4513 10.0727 13.6519H2.4098ZM6.04653 6.57666C5.91918 6.57666 5.82857 6.55387 5.77469 6.5083C5.72082 6.46273 5.69388 6.3807 5.69388 6.26221V5.85889C5.69388 5.73584 5.72082 5.65153 5.77469 5.60596C5.82857 5.56038 5.91918 5.5376 6.04653 5.5376H6.48C6.61225 5.5376 6.70286 5.56038 6.75184 5.60596C6.80571 5.65153 6.83265 5.73584 6.83265 5.85889V6.26221C6.83265 6.3807 6.80571 6.46273 6.75184 6.5083C6.70286 6.55387 6.61225 6.57666 6.48 6.57666H6.04653ZM8.45633 6.57666C8.31918 6.57666 8.22612 6.55387 8.17714 6.5083C8.12816 6.46273 8.10367 6.3807 8.10367 6.26221V5.85889C8.10367 5.73584 8.12816 5.65153 8.17714 5.60596C8.22612 5.56038 8.31918 5.5376 8.45633 5.5376H8.88245C9.01469 5.5376 9.10531 5.56038 9.15429 5.60596C9.20816 5.65153 9.2351 5.73584 9.2351 5.85889V6.26221C9.2351 6.3807 9.20816 6.46273 9.15429 6.5083C9.10531 6.55387 9.01469 6.57666 8.88245 6.57666H8.45633ZM10.8514 6.57666C10.7192 6.57666 10.6261 6.55387 10.5722 6.5083C10.5233 6.46273 10.4988 6.3807 10.4988 6.26221V5.85889C10.4988 5.73584 10.5233 5.65153 10.5722 5.60596C10.6261 5.56038 10.7192 5.5376 10.8514 5.5376H11.2849C11.4171 5.5376 11.5078 5.56038 11.5567 5.60596C11.6057 5.65153 11.6302 5.73584 11.6302 5.85889V6.26221C11.6302 6.3807 11.6057 6.46273 11.5567 6.5083C11.5078 6.55387 11.4171 6.57666 11.2849 6.57666H10.8514ZM3.64408 8.771C3.51184 8.771 3.41878 8.75049 3.3649 8.70947C3.31592 8.6639 3.29143 8.57959 3.29143 8.45654V8.05322C3.29143 7.93473 3.31592 7.8527 3.3649 7.80713C3.41878 7.76156 3.51184 7.73877 3.64408 7.73877H4.07755C4.2098 7.73877 4.30041 7.76156 4.34939 7.80713C4.39837 7.8527 4.42286 7.93473 4.42286 8.05322V8.45654C4.42286 8.57959 4.39837 8.6639 4.34939 8.70947C4.30041 8.75049 4.2098 8.771 4.07755 8.771H3.64408ZM6.04653 8.771C5.91918 8.771 5.82857 8.75049 5.77469 8.70947C5.72082 8.6639 5.69388 8.57959 5.69388 8.45654V8.05322C5.69388 7.93473 5.72082 7.8527 5.77469 7.80713C5.82857 7.76156 5.91918 7.73877 6.04653 7.73877H6.48C6.61225 7.73877 6.70286 7.76156 6.75184 7.80713C6.80571 7.8527 6.83265 7.93473 6.83265 8.05322V8.45654C6.83265 8.57959 6.80571 8.6639 6.75184 8.70947C6.70286 8.75049 6.61225 8.771 6.48 8.771H6.04653ZM8.45633 8.771C8.31918 8.771 8.22612 8.75049 8.17714 8.70947C8.12816 8.6639 8.10367 8.57959 8.10367 8.45654V8.05322C8.10367 7.93473 8.12816 7.8527 8.17714 7.80713C8.22612 7.76156 8.31918 7.73877 8.45633 7.73877H8.88245C9.01469 7.73877 9.10531 7.76156 9.15429 7.80713C9.20816 7.8527 9.2351 7.93473 9.2351 8.05322V8.45654C9.2351 8.57959 9.20816 8.6639 9.15429 8.70947C9.10531 8.75049 9.01469 8.771 8.88245 8.771H8.45633ZM3.64408 10.979C3.51184 10.979 3.41878 10.9562 3.3649 10.9106C3.31592 10.8651 3.29143 10.7808 3.29143 10.6577V10.2544C3.29143 10.1359 3.31592 10.0539 3.3649 10.0083C3.41878 9.96273 3.51184 9.93994 3.64408 9.93994H4.07755C4.2098 9.93994 4.30041 9.96273 4.34939 10.0083C4.39837 10.0539 4.42286 10.1359 4.42286 10.2544V10.6577C4.42286 10.7808 4.39837 10.8651 4.34939 10.9106C4.30041 10.9562 4.2098 10.979 4.07755 10.979H3.64408ZM6.04653 10.979C5.91918 10.979 5.82857 10.9562 5.77469 10.9106C5.72082 10.8651 5.69388 10.7808 5.69388 10.6577V10.2544C5.69388 10.1359 5.72082 10.0539 5.77469 10.0083C5.82857 9.96273 5.91918 9.93994 6.04653 9.93994H6.48C6.61225 9.93994 6.70286 9.96273 6.75184 10.0083C6.80571 10.0539 6.83265 10.1359 6.83265 10.2544V10.6577C6.83265 10.7808 6.80571 10.8651 6.75184 10.9106C6.70286 10.9562 6.61225 10.979 6.48 10.979H6.04653ZM8.45633 10.979C8.31918 10.979 8.22612 10.9562 8.17714 10.9106C8.12816 10.8651 8.10367 10.7808 8.10367 10.6577V10.2544C8.10367 10.1359 8.12816 10.0539 8.17714 10.0083C8.22612 9.96273 8.31918 9.93994 8.45633 9.93994H8.88245C9.01469 9.93994 9.10531 9.96273 9.15429 10.0083C9.20816 10.0539 9.2351 10.1359 9.2351 10.2544V10.6577C9.2351 10.7808 9.20816 10.8651 9.15429 10.9106C9.10531 10.9562 9.01469 10.979 8.88245 10.979H8.45633ZM14.2163 14.896C13.6971 14.896 13.2098 14.8049 12.7543 14.6226C12.2988 14.4403 11.8971 14.1851 11.5494 13.8569C11.2016 13.5334 10.9273 13.1597 10.7265 12.7358C10.5306 12.312 10.4327 11.8586 10.4327 11.3755C10.4327 10.8924 10.5306 10.439 10.7265 10.0151C10.9273 9.59131 11.2016 9.21761 11.5494 8.89404C11.8971 8.56592 12.2988 8.31071 12.7543 8.12842C13.2098 7.94613 13.6971 7.85498 14.2163 7.85498C14.7355 7.85498 15.2229 7.94613 15.6784 8.12842C16.1339 8.31071 16.5355 8.56364 16.8833 8.88721C17.231 9.21077 17.5029 9.58675 17.6988 10.0151C17.8996 10.439 18 10.8924 18 11.3755C18 11.854 17.8996 12.3052 17.6988 12.729C17.5029 13.1574 17.2286 13.5334 16.8759 13.8569C16.5282 14.1805 16.1241 14.4334 15.6637 14.6157C15.2082 14.8026 14.7257 14.896 14.2163 14.896ZM14.2163 13.604C14.3682 13.604 14.4882 13.5607 14.5763 13.4741C14.6694 13.3875 14.7159 13.2759 14.7159 13.1392V11.8403H16.1118C16.2588 11.8403 16.3788 11.7993 16.4718 11.7173C16.5649 11.6307 16.6114 11.5168 16.6114 11.3755C16.6114 11.2342 16.5649 11.1226 16.4718 11.0405C16.3788 10.9539 16.2588 10.9106 16.1118 10.9106H14.7159V9.61182C14.7159 9.4751 14.6694 9.36344 14.5763 9.27686C14.4882 9.19027 14.3682 9.14697 14.2163 9.14697C14.0645 9.14697 13.942 9.19027 13.849 9.27686C13.7608 9.36344 13.7167 9.4751 13.7167 9.61182V10.9106H12.3208C12.1739 10.9106 12.0539 10.9539 11.9608 11.0405C11.8678 11.1226 11.8212 11.2342 11.8212 11.3755C11.8212 11.5168 11.8678 11.6307 11.9608 11.7173C12.0539 11.7993 12.1739 11.8403 12.3208 11.8403H13.7167V13.1392C13.7167 13.2759 13.7608 13.3875 13.849 13.4741C13.942 13.5607 14.0645 13.604 14.2163 13.604Z",
              // },
              {
                name: "Shipping Information",
                icon: "M1.56379 12.0678V7.44007C1.81703 7.55133 2.08083 7.63905 2.35518 7.70323C2.63374 7.76314 2.91865 7.79309 3.20988 7.79309C3.76701 7.79309 4.29039 7.68398 4.77999 7.46575C5.27382 7.24752 5.70856 6.94799 6.0842 6.56716C6.46407 6.18633 6.75952 5.74773 6.97056 5.25137C7.18582 4.75073 7.29345 4.218 7.29345 3.65317C7.29345 3.3408 7.25968 3.03699 7.19215 2.74174C7.12462 2.44649 7.02754 2.16622 6.90092 1.90092H11.7126C12.2781 1.90092 12.7066 2.05069 12.9978 2.35022C13.289 2.64547 13.4346 3.07764 13.4346 3.64675V11.8496C13.232 12.0678 13.078 12.3224 12.9725 12.6134C12.8669 12.9001 12.8142 13.2082 12.8142 13.5376C12.8142 13.6275 12.8205 13.7174 12.8332 13.8072H8.80025C8.81292 13.7216 8.81925 13.6339 8.81925 13.5441C8.81925 13.1846 8.75171 12.8487 8.61665 12.5364C8.48581 12.2197 8.30221 11.9437 8.06584 11.7084C7.8337 11.4687 7.56146 11.2826 7.24913 11.15C6.94102 11.013 6.6118 10.9446 6.26148 10.9446C5.90693 10.9446 5.57349 11.013 5.26116 11.15C4.95304 11.2826 4.68081 11.4687 4.44444 11.7084C4.2123 11.9437 4.0287 12.2197 3.89364 12.5364C3.76279 12.8487 3.69737 13.1846 3.69737 13.5441C3.69737 13.6339 3.7037 13.7216 3.71637 13.8072H3.28585C2.9102 13.8072 2.59365 13.7409 2.33618 13.6082C2.08294 13.4799 1.89089 13.2873 1.76005 13.0306C1.62921 12.7696 1.56379 12.4486 1.56379 12.0678ZM14.302 5.44393H15.9861C16.2984 5.44393 16.5643 5.48672 16.7838 5.5723C17.0033 5.65788 17.208 5.8055 17.3979 6.01517L19.5505 8.47987C19.7278 8.68098 19.8459 8.87354 19.905 9.05753C19.9683 9.23725 20 9.48543 20 9.80208V12.0678C20 12.6326 19.8565 13.0627 19.5695 13.3579C19.2825 13.6574 18.8604 13.8072 18.3033 13.8072H17.9171C17.9297 13.7174 17.9361 13.6275 17.9361 13.5376C17.9361 13.1782 17.8664 12.8423 17.7271 12.5299C17.5921 12.2133 17.4042 11.9373 17.1637 11.7019C16.9273 11.4623 16.653 11.2762 16.3406 11.1435C16.0325 11.0066 15.7012 10.9381 15.3466 10.9381C15.1567 10.9381 14.9731 10.9638 14.7958 11.0152C14.6186 11.0622 14.4539 11.1286 14.302 11.2141V5.44393ZM15.9418 9.53892H18.7781C18.7654 9.46618 18.7422 9.39771 18.7085 9.33353C18.6747 9.26934 18.6325 9.20944 18.5818 9.15381L16.6508 6.95869C16.5284 6.81748 16.4124 6.72762 16.3026 6.68911C16.1929 6.6506 16.0663 6.63135 15.9228 6.63135H15.3656V8.95484C15.3656 9.13455 15.4163 9.2779 15.5176 9.38488C15.6231 9.48757 15.7645 9.53892 15.9418 9.53892ZM6.26148 15.3926C5.92382 15.3926 5.6157 15.3091 5.33713 15.1423C5.06278 14.9754 4.8433 14.7507 4.6787 14.4683C4.51831 14.1902 4.43811 13.8821 4.43811 13.5441C4.43811 13.2017 4.51831 12.8915 4.6787 12.6134C4.8433 12.331 5.06278 12.1085 5.33713 11.9459C5.6157 11.779 5.92382 11.6955 6.26148 11.6955C6.59491 11.6955 6.89881 11.779 7.17316 11.9459C7.45173 12.1085 7.67331 12.331 7.83792 12.6134C8.00253 12.8915 8.08484 13.2017 8.08484 13.5441C8.08484 13.8821 8.00253 14.1902 7.83792 14.4683C7.67331 14.7507 7.45384 14.9754 7.17949 15.1423C6.90514 15.3091 6.59913 15.3926 6.26148 15.3926ZM15.372 15.3926C15.0385 15.3926 14.7325 15.3091 14.4539 15.1423C14.1796 14.9754 13.9601 14.7507 13.7955 14.4683C13.6309 14.1859 13.5486 13.8757 13.5486 13.5376C13.5486 13.1953 13.6309 12.8851 13.7955 12.607C13.9601 12.3245 14.1796 12.102 14.4539 11.9394C14.7325 11.7726 15.0385 11.6891 15.372 11.6891C15.7096 11.6891 16.0156 11.7726 16.29 11.9394C16.5643 12.102 16.7838 12.3245 16.9484 12.607C17.113 12.8851 17.1953 13.1953 17.1953 13.5376C17.1953 13.88 17.113 14.1902 16.9484 14.4683C16.788 14.7507 16.5685 14.9754 16.29 15.1423C16.0156 15.3091 15.7096 15.3926 15.372 15.3926ZM3.21621 6.91376C2.77725 6.91376 2.36362 6.83032 1.97531 6.66344C1.587 6.49228 1.24512 6.25693 0.949668 5.95741C0.654215 5.65788 0.422074 5.31128 0.253245 4.91761C0.0844149 4.52394 0 4.10246 0 3.65317C0 3.20387 0.0844149 2.78453 0.253245 2.39515C0.422074 2.00148 0.654215 1.65488 0.949668 1.35535C1.24512 1.05154 1.587 0.816198 1.97531 0.649318C2.36362 0.478158 2.77725 0.392578 3.21621 0.392578C3.65939 0.392578 4.07513 0.478158 4.46344 0.649318C4.85175 0.816198 5.19363 1.0494 5.48908 1.34893C5.78453 1.64846 6.01456 1.99506 6.17917 2.38873C6.348 2.78239 6.43242 3.20387 6.43242 3.65317C6.43242 4.09818 6.348 4.51752 6.17917 4.91119C6.01034 5.30486 5.77609 5.65146 5.47642 5.95099C5.18096 6.25052 4.83908 6.48586 4.45078 6.65702C4.06247 6.82818 3.65094 6.91376 3.21621 6.91376ZM1.71573 4.15381H3.25419C3.36393 4.15381 3.45468 4.1153 3.52643 4.03828C3.60241 3.96126 3.64039 3.86712 3.64039 3.75586V1.7533C3.64039 1.64632 3.60241 1.55646 3.52643 1.48372C3.45046 1.4067 3.35971 1.36819 3.25419 1.36819C3.14445 1.36819 3.0516 1.4067 2.97563 1.48372C2.89965 1.55646 2.86167 1.64632 2.86167 1.7533V3.36434H1.71573C1.61021 3.36434 1.51736 3.40285 1.43716 3.47987C1.36119 3.55689 1.3232 3.64889 1.3232 3.75586C1.3232 3.86284 1.36119 3.95698 1.43716 4.03828C1.51314 4.1153 1.60599 4.15381 1.71573 4.15381Z",
              },
              {
                name: "Accepted Packages",
                icon: "M8.00641 16.9359V9.35085L14.9409 5.3883C14.9803 5.53616 15 5.72344 15 5.95016V11.7092C15 12.2464 14.9088 12.6431 14.7265 12.8994C14.549 13.1507 14.2878 13.375 13.9428 13.5721L8.15426 16.8693C8.12962 16.8841 8.10498 16.8964 8.08033 16.9063C8.05569 16.9211 8.03105 16.9309 8.00641 16.9359ZM6.99359 16.9359C6.96895 16.9309 6.94431 16.9211 6.91966 16.9063C6.89995 16.8964 6.87777 16.8841 6.85313 16.8693L1.05717 13.5721C0.717102 13.375 0.45589 13.1507 0.273534 12.8994C0.0911779 12.6431 0 12.2464 0 11.7092V5.95016C0 5.72344 0.0197141 5.53616 0.0591424 5.3883L6.99359 9.35085V16.9359ZM7.5037 8.46371L0.532282 4.50856C0.64071 4.40999 0.778709 4.31388 0.946279 4.22024L3.65944 2.67514L10.6604 6.67465L7.5037 8.46371ZM11.688 6.09062L4.65747 2.09851L6.15821 1.24833C6.61656 0.982192 7.06506 0.849121 7.5037 0.849121C7.93741 0.849121 8.38344 0.982192 8.84179 1.24833L14.0611 4.22024C14.2238 4.31388 14.3593 4.40999 14.4677 4.50856L11.688 6.09062Z",
              },
              {
                name: "Monitoring Centra",
                icon: "M9 9.57939C8.44151 9.57939 7.93245 9.44348 7.47282 9.17165C7.01812 8.89488 6.65239 8.52914 6.37562 8.07445C6.10379 7.61481 5.96787 7.10575 5.96787 6.54727C5.96787 5.98878 6.10379 5.47972 6.37562 5.02008C6.65239 4.56045 7.01812 4.19471 7.47282 3.92288C7.93245 3.64611 8.44151 3.50773 9 3.50773C9.55848 3.50773 10.0651 3.64611 10.5198 3.92288C10.9794 4.19471 11.3451 4.56045 11.617 5.02008C11.8937 5.47972 12.0321 5.98878 12.0321 6.54727C12.0321 7.10575 11.8937 7.61481 11.617 8.07445C11.3451 8.52914 10.9794 8.89488 10.5198 9.17165C10.0651 9.44348 9.55848 9.57939 9 9.57939ZM9 8.82321C9.42998 8.82321 9.81301 8.72437 10.1491 8.52667C10.4901 8.32404 10.7595 8.05221 10.9572 7.71119C11.1598 7.36522 11.2611 6.97725 11.2611 6.54727C11.2611 6.11728 11.1598 5.73178 10.9572 5.39076C10.7545 5.0448 10.4827 4.7705 10.1417 4.56786C9.8056 4.36522 9.42504 4.26391 9 4.26391C8.57496 4.26391 8.19193 4.36522 7.85091 4.56786C7.51483 4.7705 7.24794 5.0448 7.05025 5.39076C6.85255 5.73178 6.75371 6.11728 6.75371 6.54727C6.75371 6.97725 6.85255 7.36522 7.05025 7.71119C7.24794 8.05221 7.51483 8.32404 7.85091 8.52667C8.19193 8.72437 8.57496 8.82321 9 8.82321ZM9 2.74414C9.10379 2.74414 9.18781 2.77873 9.25206 2.84793C9.31631 2.91712 9.34843 3.00114 9.34843 3.09998V4.87181C9.34843 4.97066 9.31384 5.05468 9.24465 5.12387C9.1804 5.19307 9.09885 5.22766 9 5.22766C8.90115 5.22766 8.81713 5.19554 8.74794 5.13129C8.68369 5.06209 8.65156 4.9756 8.65156 4.87181V3.09998C8.65156 3.00114 8.68369 2.91712 8.74794 2.84793C8.81713 2.77873 8.90115 2.74414 9 2.74414ZM10.668 6.8957C10.5692 6.8957 10.4852 6.8611 10.416 6.79191C10.3517 6.72272 10.3196 6.64117 10.3196 6.54727C10.3196 6.44348 10.3517 6.35946 10.416 6.29521C10.4852 6.23096 10.5692 6.19883 10.668 6.19883H12.4473C12.5412 6.19883 12.6227 6.23343 12.6919 6.30262C12.7611 6.36687 12.7957 6.44842 12.7957 6.54727C12.7957 6.64117 12.7611 6.72272 12.6919 6.79191C12.6227 6.8611 12.5412 6.8957 12.4473 6.8957H10.668ZM9 10.3356C8.9061 10.3356 8.82455 10.3034 8.75535 10.2392C8.68616 10.17 8.65156 10.0835 8.65156 9.97972V8.20789C8.65156 8.10905 8.68616 8.0275 8.75535 7.96325C8.82455 7.89405 8.9061 7.85946 9 7.85946C9.10379 7.85946 9.18781 7.89405 9.25206 7.96325C9.31631 8.03244 9.34843 8.11399 9.34843 8.20789V9.97972C9.34843 10.0835 9.31384 10.17 9.24465 10.2392C9.1804 10.3034 9.09885 10.3356 9 10.3356ZM5.56013 6.8957C5.45634 6.8957 5.37232 6.8611 5.30807 6.79191C5.24382 6.72272 5.2117 6.64117 5.2117 6.54727C5.2117 6.44842 5.24629 6.36687 5.31549 6.30262C5.38468 6.23343 5.46623 6.19883 5.56013 6.19883H7.33937C7.43328 6.19883 7.51483 6.23096 7.58402 6.29521C7.65321 6.35946 7.68781 6.44348 7.68781 6.54727C7.68781 6.64117 7.65321 6.72272 7.58402 6.79191C7.51483 6.8611 7.43328 6.8957 7.33937 6.8957H5.56013ZM9.00741 7.07363C8.85914 7.07363 8.73311 7.02173 8.62932 6.91794C8.52554 6.81415 8.47364 6.68812 8.47364 6.53985C8.47364 6.39653 8.52554 6.27297 8.62932 6.16918C8.73311 6.06539 8.85914 6.01349 9.00741 6.01349C9.15074 6.01349 9.27183 6.06539 9.37068 6.16918C9.47446 6.27297 9.52636 6.39653 9.52636 6.53985C9.52636 6.68812 9.47446 6.81415 9.37068 6.91794C9.27183 7.02173 9.15074 7.07363 9.00741 7.07363ZM1.85338 12.871C1.27512 12.871 0.820428 12.7079 0.489292 12.3817C0.163097 12.0506 0 11.5934 0 11.0102V2.08433C0 1.50114 0.163097 1.04644 0.489292 0.720249C0.820428 0.394054 1.27512 0.230957 1.85338 0.230957H16.1466C16.7249 0.230957 17.1771 0.394054 17.5033 0.720249C17.8344 1.04644 18 1.50114 18 2.08433V11.0102C18 11.5934 17.8344 12.0506 17.5033 12.3817C17.1771 12.7079 16.7249 12.871 16.1466 12.871H1.85338ZM1.93493 11.4476H16.0651C16.2183 11.4476 16.3418 11.4006 16.4357 11.3067C16.5297 11.2128 16.5766 11.0893 16.5766 10.9361V2.1733C16.5766 2.0102 16.5297 1.88417 16.4357 1.79521C16.3418 1.7013 16.2183 1.65435 16.0651 1.65435H1.93493C1.78171 1.65435 1.65815 1.7013 1.56425 1.79521C1.47035 1.88417 1.42339 2.0102 1.42339 2.1733V10.9361C1.42339 11.0893 1.47035 11.2128 1.56425 11.3067C1.65815 11.4006 1.78171 11.4476 1.93493 11.4476ZM6.5832 14.5613V12.7153H11.4168V14.5613H6.5832ZM6.54613 15.5547C6.35832 15.5547 6.19769 15.488 6.06425 15.3545C5.93575 15.2211 5.8715 15.0629 5.8715 14.8801C5.8715 14.6922 5.93575 14.5316 6.06425 14.3982C6.19769 14.2697 6.35832 14.2054 6.54613 14.2054H11.4539C11.6417 14.2054 11.7998 14.2697 11.9283 14.3982C12.0568 14.5316 12.1211 14.6922 12.1211 14.8801C12.1211 15.0629 12.0568 15.2211 11.9283 15.3545C11.7998 15.488 11.6417 15.5547 11.4539 15.5547H6.54613Z",
              },
              {
                name: "Stock Management",
                icon: "M0.120549 14.2763L1.71602 7.79972C1.86658 7.17319 2.15799 6.69236 2.59025 6.35724C3.02251 6.02212 3.56405 5.85456 4.21486 5.85456H10.7862C11.4418 5.85456 11.9858 6.02212 12.4181 6.35724C12.8503 6.69236 13.1417 7.17319 13.2923 7.79972L14.8805 14.2763C15.0942 15.1408 15.0213 15.8159 14.6619 16.3016C14.3074 16.7873 13.71 17.0301 12.8697 17.0301H2.13128C1.29105 17.0301 0.691227 16.7873 0.331822 16.3016C-0.0227275 15.8159 -0.0931516 15.1408 0.120549 14.2763ZM6.61899 7.2169V4.55779H8.38203V7.2169H6.61899ZM7.50051 5.44659C7.07311 5.44659 6.68213 5.34216 6.32758 5.13332C5.97304 4.91962 5.68891 4.63549 5.47521 4.28095C5.26151 3.9264 5.15466 3.53542 5.15466 3.10802C5.15466 2.68062 5.26151 2.28964 5.47521 1.93509C5.68891 1.57569 5.97304 1.28913 6.32758 1.07543C6.68213 0.861733 7.07311 0.754883 7.50051 0.754883C7.92306 0.754883 8.3116 0.861733 8.66615 1.07543C9.02556 1.28913 9.31211 1.57569 9.52581 1.93509C9.73951 2.28964 9.84636 2.68062 9.84636 3.10802C9.84636 3.53542 9.73951 3.9264 9.52581 4.28095C9.31697 4.63549 9.03284 4.91962 8.67344 5.13332C8.31889 5.34216 7.92791 5.44659 7.50051 5.44659ZM7.50051 4.01139C7.74821 4.01139 7.96191 3.92154 8.14161 3.74184C8.32132 3.56213 8.41117 3.35086 8.41117 3.10802C8.41117 2.86518 8.31889 2.65391 8.13433 2.4742C7.95462 2.28964 7.74335 2.19736 7.50051 2.19736C7.25767 2.19736 7.0464 2.28964 6.86669 2.4742C6.68699 2.65391 6.59714 2.86518 6.59714 3.10802C6.59714 3.35086 6.68699 3.56213 6.86669 3.74184C7.0464 3.92154 7.25767 4.01139 7.50051 4.01139Z",
              },
              {
                name: "Dashboard",
                icon: "M12.4691 2.57196C11.0181 1.42988 9.30673 0.650229 7.52121 0.686713C5.66861 0.724569 3.94565 1.6384 2.58463 3.46025C0.292818 6.52807 -0.883336 11.3551 1.80837 15.988L2.01635 16.346C2.06218 16.4249 2.13533 16.4824 2.22145 16.5074L2.6122 16.6207C7.68784 18.0924 12.0799 15.4358 14.1977 12.601C15.5269 10.8218 15.9253 8.8808 15.4995 7.04102C15.0866 5.25667 13.9386 3.72869 12.4691 2.57196ZM4.80744 5.20985C5.68867 4.03025 6.61835 3.62746 7.50609 3.60932C8.4609 3.58981 9.57758 4.01479 10.7197 4.91372C11.8431 5.79802 12.5222 6.81459 12.7475 7.78812C12.96 8.70621 12.8078 9.73641 11.9749 10.8514C10.7672 12.468 8.55653 13.9888 5.90309 14.1056C5.61363 14.1183 5.46442 13.7805 5.64346 13.5409L9.60896 8.23265C9.73222 8.06766 9.70518 7.83397 9.54857 7.7107L8.33747 6.75743C8.18086 6.63415 7.95397 6.66798 7.83071 6.83297L3.88037 12.1209C3.7018 12.3599 3.3461 12.3008 3.28135 12.0118C2.70108 9.4219 3.50012 6.95983 4.80744 5.20985Z",
              },
            ].map((item) => (
              <li
                key={item.name}
                className="relative flex items-center rounded-md hover:bg-gray-200 p-2"
              >
                <div

                  className={`flex items-center cursor-pointer ${activePage === item.name ? 'bg-white-100 font-bold' : 'hover:bg-gray-200'}`}
                  onClick={() => handlePageChange(item.name)}  // Use handlePageChange here
                  >
                  {activePage === item.name && (
                    <img
                      src={semicircle}
                      alt="Semicircle"
                      className="mr-2 h-5"
                    />
                  )}
                  <svg
                    width="16"
                    height="18"
                    viewBox="0 0 16 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={
                      activePage === item.name
                        ? "fill-current text-[#A7AD6F] ml-3"
                        : "fill-current text-[#A9A9A9] ml-5"
                    }
                  >
                    <path d={item.icon} />
                  </svg>
                  <span className="ml-2">{item.name}</span>
                  {activePage === item.name && (
                    <div className="absolute left-0 top-0 bottom-0 w-2" />
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="px-6 mt-10 mb-1">
            {/* <h2 className="text-sm font-semibold text-gray-700 ml-[-0.1rem]">
              SUPPORT
            </h2> */}
          </div>
          <ul>
            {[
              // {
              //   name: "Settings",
              //   icon: "M6.83971 15.3926C6.65311 15.3926 6.49522 15.3399 6.36603 15.2347C6.23684 15.1342 6.15072 14.9907 6.10766 14.8041L5.73445 13.2251C5.59569 13.1773 5.45933 13.127 5.32536 13.0744C5.19139 13.0218 5.06459 12.9667 4.94498 12.9093L3.56699 13.7562C3.40909 13.8519 3.24641 13.8926 3.07895 13.8782C2.91627 13.8639 2.77033 13.7921 2.64115 13.6629L1.72249 12.7443C1.5933 12.6151 1.51914 12.4643 1.5 12.2921C1.48565 12.1199 1.5311 11.9572 1.63636 11.8041L2.47608 10.4332C2.41866 10.3088 2.36364 10.1821 2.311 10.0529C2.25837 9.92368 2.21292 9.79449 2.17464 9.66531L0.58134 9.28492C0.394737 9.24664 0.251196 9.16291 0.150718 9.03373C0.0502392 8.90454 0 8.74664 0 8.56004V7.261C0 7.07918 0.0502392 6.92368 0.150718 6.79449C0.251196 6.66531 0.394737 6.58157 0.58134 6.5433L2.16029 6.16291C2.20335 6.01459 2.2512 5.87583 2.30383 5.74665C2.36124 5.61746 2.41388 5.49545 2.46172 5.38062L1.62201 3.98827C1.51675 3.83516 1.47129 3.67727 1.48565 3.51459C1.5 3.34712 1.57416 3.1988 1.70813 3.06961L2.64115 2.14377C2.77512 2.01937 2.91866 1.9476 3.07177 1.92846C3.22967 1.90932 3.38756 1.94521 3.54545 2.03612L4.9378 2.89736C5.05742 2.83516 5.18421 2.77775 5.31818 2.72511C5.45694 2.6677 5.59569 2.61507 5.73445 2.56722L6.10766 0.981095C6.15072 0.799277 6.23684 0.655736 6.36603 0.550473C6.49522 0.44521 6.65311 0.392578 6.83971 0.392578H8.16029C8.34689 0.392578 8.50478 0.44521 8.63397 0.550473C8.76316 0.655736 8.84689 0.799277 8.88517 0.981095L9.25837 2.58157C9.4067 2.62942 9.54545 2.67966 9.67464 2.73229C9.80861 2.78492 9.93301 2.84234 10.0478 2.90454L11.4545 2.03612C11.6124 1.94521 11.7679 1.91172 11.9211 1.93564C12.0742 1.95478 12.2177 2.02416 12.3517 2.14377L13.2919 3.06961C13.4258 3.1988 13.4976 3.34712 13.5072 3.51459C13.5215 3.67727 13.4785 3.83516 13.378 3.98827L12.5311 5.38062C12.5789 5.49545 12.6292 5.61746 12.6818 5.74665C12.7392 5.87583 12.7919 6.01459 12.8397 6.16291L14.4187 6.5433C14.6005 6.58157 14.7416 6.66531 14.8421 6.79449C14.9474 6.92368 15 7.07918 15 7.261V8.56004C15 8.74664 14.9474 8.90454 14.8421 9.03373C14.7416 9.16291 14.6005 9.24664 14.4187 9.28492L12.8254 9.66531C12.7823 9.79449 12.7345 9.92368 12.6818 10.0529C12.634 10.1821 12.5789 10.3088 12.5167 10.4332L13.3636 11.8041C13.4689 11.9572 13.512 12.1199 13.4928 12.2921C13.4785 12.4643 13.4067 12.6151 13.2775 12.7443L12.3517 13.6629C12.2225 13.7921 12.0742 13.8639 11.9067 13.8782C11.744 13.8926 11.5861 13.8519 11.433 13.7562L10.0478 12.9093C9.92823 12.9667 9.80144 13.0218 9.66746 13.0744C9.53349 13.127 9.39713 13.1773 9.25837 13.2251L8.88517 14.8041C8.84689 14.9907 8.76316 15.1342 8.63397 15.2347C8.50478 15.3399 8.34689 15.3926 8.16029 15.3926H6.83971ZM7.5 10.4261C7.96412 10.4261 8.38756 10.3112 8.77034 10.0816C9.1579 9.85191 9.46412 9.54569 9.689 9.16291C9.91866 8.77535 10.0335 8.34952 10.0335 7.8854C10.0335 7.42129 9.91866 7.00023 9.689 6.62224C9.46412 6.23947 9.1579 5.93325 8.77034 5.70358C8.38756 5.47392 7.96412 5.35909 7.5 5.35909C7.03589 5.35909 6.61244 5.47392 6.22967 5.70358C5.84689 5.93325 5.54067 6.23947 5.31101 6.62224C5.08134 7.00023 4.96651 7.42129 4.96651 7.8854C4.96651 8.34952 5.07895 8.77535 5.30383 9.16291C5.53349 9.54569 5.83971 9.85191 6.22249 10.0816C6.61005 10.3112 7.03589 10.4261 7.5 10.4261Z",
              // },
            ].map((item) => (
              <li
                key={item.name}
                className="relative flex items-center rounded-md hover:bg-gray-200 p-2"
              >
                <div
                  className={`flex items-center cursor-pointer ${activePage === item.name ? 'bg-white-100 font-bold' : 'hover:bg-gray-200'}`}
                  onClick={() => handlePageChange(item.name)}  // Use handlePageChange here
                  >
                  {activePage === item.name && (
                    <img
                      src={semicircle}
                      alt="Semicircle"
                      className="mr-2 h-5"
                    />
                  )}
                  <svg
                    width="16"
                    height="18"
                    viewBox="0 0 16 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={
                      activePage === item.name
                        ? "fill-current text-[#A7AD6F] ml-3"
                        : "fill-current text-[#A9A9A9] ml-5"
                    }
                  >
                    <path d={item.icon} />
                  </svg>
                  <span className="ml-2">{item.name}</span>
                  {activePage === item.name && (
                    <div className="absolute left-0 top-0 bottom-0 w-2" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="flex-1 ml-64">
        <header className="flex items-center justify-between p-7 border-b bg-white fixed top-0 left-64 right-0 z-10">
          <div>
            <h1 className="text-2xl font-bold ml-3">
              Welcome back, {user.name}
            </h1>
            <p className="text-sm text-gray-500 ml-3">{formattedDate}</p>
          </div>
          <div className="relative flex items-center">
            <button className="relative">
              <img
                src={user.hasNotification ? notifIcon : nonotifIcon}
                alt="Notification Icon"
                className="w-6 h-6 text-gray-600 mr-4"
              />
              {user.hasNotification && <span className=""></span>}
            </button>
            <div className="mx-2 h-5 border-l border-gray-400"></div>
            <div className="ml-4 flex items-center">
              <span className="font-bold text-gray-600 mr-2">{user.name}</span>
              <button className="ml-2 mr-12" onClick={toggleDropdown}>
                <img src={ArrowDown} alt="Arrow Down" className="w-4" />
              </button>
            </div>
            {isDropdownVisible && (
              <div className="absolute right-0 top-12 mt-4 w-96 h-48 bg-white border border-gray-300 shadow-md z-20">
                <div className="p-4 mt-3">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-red-500"></div>
                    <div className="ml-4">
                      <h2 className="text-xl font-bold text-[#852222]">
                        {user.name}
                      </h2>
                      <p className="text-lg text-gray-600">{user.email}</p>
                      <p className="text-lg text-gray-600">{user.phone}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between w-full">
                    <button className="w-1/2 px-4 py-2 mr-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg">
                      EDIT PROFILE
                    </button>
                    <button className="w-1/2 px-4 py-2 ml-2 text-sm font-semibold text-white bg-[#852222] rounded-lg">
                      LOGOUT
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="p-10 mt-24">
          {activePage === "Dashboard" && (
            <div className="">
              <h1 className="text-3xl font-bold mb-6">Overview</h1>
              <div className="flex flex-wrap lg:flex-nowrap">
                <div className="w-full lg:w-2/3 lg:mr-6 mb-4 lg:mb-z">
                <div className="bg-white border border-gray-300 rounded-lg shadow-lg w-full p-6 lg:p-10">
                    <h3 className="text-2xl font-bold mb-4 flex items-center">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-current text-gray-500 mr-1"
                        style={{ marginBottom: "-0.65em" }}
                      >
                        <path d="M1.56379 12.0678V7.44007C1.81703 7.55133 2.08083 7.63905 2.35518 7.70323C2.63374 7.76314 2.91865 7.79309 3.20988 7.79309C3.76701 7.79309 4.29039 7.68398 4.77999 7.46575C5.27382 7.24752 5.70856 6.94799 6.0842 6.56716C6.46407 6.18633 6.75952 5.74773 6.97056 5.25137C7.18582 4.75073 7.29345 4.218 7.29345 3.65317C7.29345 3.3408 7.25968 3.03699 7.19215 2.74174C7.12462 2.44649 7.02754 2.16622 6.90092 1.90092H11.7126C12.2781 1.90092 12.7066 2.05069 12.9978 2.35022C13.289 2.64547 13.4346 3.07764 13.4346 3.64675V11.8496C13.232 12.0678 13.078 12.3224 12.9725 12.6134C12.8669 12.9001 12.8142 13.2082 12.8142 13.5376C12.8142 13.6275 12.8205 13.7174 12.8332 13.8072H8.80025C8.81292 13.7216 8.81925 13.6339 8.81925 13.5441C8.81925 13.1846 8.75171 12.8487 8.61665 12.5364C8.48581 12.2197 8.30221 11.9437 8.06584 11.7084C7.8337 11.4687 7.56146 11.2826 7.24913 11.15C6.94102 11.013 6.6118 10.9446 6.26148 10.9446C5.90693 10.9446 5.57349 11.013 5.26116 11.15C4.95304 11.2826 4.68081 11.4687 4.44444 11.7084C4.2123 11.9437 4.0287 12.2197 3.89364 12.5364C3.76279 12.8487 3.69737 13.1846 3.69737 13.5441C3.69737 13.6339 3.7037 13.7216 3.71637 13.8072H3.28585C2.9102 13.8072 2.59365 13.7409 2.33618 13.6082C2.08294 13.4799 1.89089 13.2873 1.76005 13.0306C1.62921 12.7696 1.56379 12.4486 1.56379 12.0678ZM14.302 5.44393H15.9861C16.2984 5.44393 16.5643 5.48672 16.7838 5.5723C17.0033 5.65788 17.208 5.8055 17.3979 6.01517L19.5505 8.47987C19.7278 8.68098 19.8459 8.87354 19.905 9.05753C19.9683 9.23725 20 9.48543 20 9.80208V12.0678C20 12.6326 19.8565 13.0627 19.5695 13.3579C19.2825 13.6574 18.8604 13.8072 18.3033 13.8072H17.9171C17.9297 13.7174 17.9361 13.6275 17.9361 13.5376C17.9361 13.1782 17.8664 12.8423 17.7271 12.5299C17.5921 12.2133 17.4042 11.9373 17.1637 11.7019C16.9273 11.4623 16.653 11.2762 16.3406 11.1435C16.0325 11.0066 15.7012 10.9381 15.3466 10.9381C15.1567 10.9381 14.9731 10.9638 14.7958 11.0152C14.6186 11.0622 14.4539 11.1286 14.302 11.2141V5.44393ZM15.9418 9.53892H18.7781C18.7654 9.46618 18.7422 9.39771 18.7085 9.33353C18.6747 9.26934 18.6325 9.20944 18.5818 9.15381L16.6508 6.95869C16.5284 6.81748 16.4124 6.72762 16.3026 6.68911C16.1929 6.6506 16.0663 6.63135 15.9228 6.63135H15.3656V8.95484C15.3656 9.13455 15.4163 9.2779 15.5176 9.38488C15.6231 9.48757 15.7645 9.53892 15.9418 9.53892ZM6.26148 15.3926C5.92382 15.3926 5.6157 15.3091 5.33713 15.1423C5.06278 14.9754 4.8433 14.7507 4.6787 14.4683C4.51831 14.1902 4.43811 13.8821 4.43811 13.5441C4.43811 13.2017 4.51831 12.8915 4.6787 12.6134C4.8433 12.331 5.06278 12.1085 5.33713 11.9459C5.6157 11.779 5.92382 11.6955 6.26148 11.6955C6.59491 11.6955 6.89881 11.779 7.17316 11.9459C7.45173 12.1085 7.67331 12.331 7.83792 12.6134C8.00253 12.8915 8.08484 13.2017 8.08484 13.5441C8.08484 13.8821 8.00253 14.1902 7.83792 14.4683C7.67331 14.7507 7.45384 14.9754 7.17949 15.1423C6.90514 15.3091 6.59913 15.3926 6.26148 15.3926ZM15.372 15.3926C15.0385 15.3926 14.7325 15.3091 14.4539 15.1423C14.1796 14.9754 13.9601 14.7507 13.7955 14.4683C13.6309 14.1859 13.5486 13.8757 13.5486 13.5376C13.5486 13.1953 13.6309 12.8851 13.7955 12.607C13.9601 12.3245 14.1796 12.102 14.4539 11.9394C14.7325 11.7726 15.0385 11.6891 15.372 11.6891C15.7096 11.6891 16.0156 11.7726 16.29 11.9394C16.5643 12.102 16.7838 12.3245 16.9484 12.607C17.113 12.8851 17.1953 13.1953 17.1953 13.5376C17.1953 13.88 17.113 14.1902 16.9484 14.4683C16.788 14.7507 16.5685 14.9754 16.29 15.1423C16.0156 15.3091 15.7096 15.3926 15.372 15.3926ZM3.21621 6.91376C2.77725 6.91376 2.36362 6.83032 1.97531 6.66344C1.587 6.49228 1.24512 6.25693 0.949668 5.95741C0.654215 5.65788 0.422074 5.31128 0.253245 4.91761C0.0844149 4.52394 0 4.10246 0 3.65317C0 3.20387 0.0844149 2.78453 0.253245 2.39515C0.422074 2.00148 0.654215 1.65488 0.949668 1.35535C1.24512 1.05154 1.587 0.816198 1.97531 0.649318C2.36362 0.478158 2.77725 0.392578 3.21621 0.392578C3.65939 0.392578 4.07513 0.478158 4.46344 0.649318C4.85175 0.816198 5.19363 1.0494 5.48908 1.34893C5.78453 1.64846 6.01456 1.99506 6.17917 2.38873C6.348 2.78239 6.43242 3.20387 6.43242 3.65317C6.43242 4.09818 6.348 4.51752 6.17917 4.91119C6.01034 5.30486 5.77609 5.65146 5.47642 5.95099C5.18096 6.25052 4.83908 6.48586 4.45078 6.65702C4.06247 6.82818 3.65094 6.91376 3.21621 6.91376ZM1.71573 4.15381H3.25419C3.36393 4.15381 3.45468 4.1153 3.52643 4.03828C3.60241 3.96126 3.64039 3.86712 3.64039 3.75586V1.7533C3.64039 1.64632 3.60241 1.55646 3.52643 1.48372C3.45046 1.4067 3.35971 1.36819 3.25419 1.36819C3.14445 1.36819 3.0516 1.4067 2.97563 1.48372C2.89965 1.55646 2.86167 1.64632 2.86167 1.7533V3.36434H1.71573C1.61021 3.36434 1.51736 3.40285 1.43716 3.47987C1.36119 3.55689 1.3232 3.64889 1.3232 3.75586C1.3232 3.86284 1.36119 3.95698 1.43716 4.03828C1.51314 4.1153 1.60599 4.15381 1.71573 4.15381Z" />
                      </svg>
                      Shipping Information
                    </h3>
                    
                    <div className="mb-4 border border-gray-300 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-3">
                        <span className="font-semibold text-xl">XYZ_PickingUp</span>
                        <div className="bg-[#9AD1B3] text-black rounded-lg px-8 py-2">
                          <span className="font-bold text-xl">
                          {statusCounts.XYZ_PickingUp}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-3">
                        <span className="font-semibold text-xl">XYZ_Completed</span>
                        <div className="bg-[#4D946D] text-white rounded-lg px-8 py-2">
                          <span className="font-bold text-xl">
                          {statusCounts.XYZ_Completed}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-3">
                        <span className="font-semibold text-xl">PKG_Delivered</span>
                        <div className="bg-[#A7AD6F] text-white rounded-lg px-8 py-2">
                          <span className="font-bold text-xl">
                            {statusCounts.PKG_Delivered}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-4 pb-3">
                        <span className="font-semibold text-xl">PKG_Delivering</span>
                        <div className="bg-[#5C612C] text-white rounded-lg px-8 py-2">
                          <span className="font-bold text-xl">
                            {statusCounts.PKG_Delivering}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-4 pb-3">
                        <span className="font-semibold text-xl">Missing</span>
                        <div className="bg-[#FDECEC] text-[#D9534F] rounded-lg px-8 py-2">
                          <span className="font-bold text-xl">
                            {statusCounts.Missing}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePage("Shipping Information")}
                      className="w-full py-4 mt-4 text-center bg-gray-100 rounded-lg text-gray-700 font-medium hover:bg-gray-200"
                    >
                      VIEW ALL
                    </button>
                  </div>
                </div>


                <div className="w-full lg:w-2/3 mt-6">
                <div className="relative">
                  {/* <button
                    className="flex items-center text-[#A7AD6F] font-semibold"
                    onClick={toggleConversionRateDropdown}
                  >
                    {selectedConversionRate.id}
                    <img src={ArrowDown} alt="Arrow Down" className="ml-2 w-4" />
                  </button>
                  {conversionRateDropdownVisible && (
                    <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 shadow-md z-40">
                      {conversionRates.map((conversionRate) => (
                        <button
                          key={conversionRate.id}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                          onClick={() => selectConversionRate(conversionRate)}
                        >
                          {conversionRate.id} - Conversion Rate
                        </button>
                      ))}
                    </div>
                  )} */}
                  <div className="bg-white border border-gray-300 rounded-lg shadow-lg w-full p-6 lg:p-10">
                    <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                      <button
                        className="flex items-center text-[#A7AD6F] font-semibold"
                        onClick={toggleConversionRateDropdown}
                      >
                        {selectedCentra.Address}
                        <img src={ArrowDown} alt="Arrow Down" className="ml-2 w-4" />
                      </button>
                      {conversionRateDropdownVisible && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-md z-40">
                          {centras.map((centra) => (
                            <button
                              key={centra.CentralID}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                              onClick={() => selectConversionRate(centra)}
                            >
                              {centra.Address}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Conversion Rate</h3>
                    <div className="flex items-center justify-center h-full">
                      <div className="relative w-48 h-48">
                        <Doughnut data={chartData} options={gaugeOptions} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center mt-20">
                          <span className="text-4xl font-bold">{selectedConversionRate.conversionRate}%</span>
                          {/* <span className="text-[#A7AD6F] text-lg">^ {selectedConversionRate.rateChange}%</span> */}
                        </div>
                      </div>
                    </div>
                    <div className="flex mt-3 flex-wrap">
                      <div className="flex items-center mr-4">
                        <span className="inline-block w-3 h-3 bg-[#176E76] rounded-full mr-2"></span>
                        <span className="text-gray-700">{selectedConversionRate.wetToDry}% Wet to Dry Leaves</span>
                      </div>
                      <div className="flex items-center mr-4">
                        <span className="inline-block w-3 h-3 bg-[#4D946D] rounded-full mr-2"></span>
                        <span className="text-gray-700">{selectedConversionRate.dryToFloured}% Dry to Floured Leaves</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                </div>
              </div>
            </div>
          )}

          {/* {activePage === "Stock Booking" && <StockBooking />} */}

          {/* Shipping Information Page */}
          {activePage === "Shipping Information" && <XYZShippingInformation />}

          {activePage === "Accepted Packages" && <AcceptedPackages />}

          {/* Monitoring Centra Page */}
          {activePage === "Monitoring Centra" && (
            <div>
              <div>
                <LeavesStatusDashboard />
              </div>
            </div>
          )}

          {/* Stock Management Page */}
          {activePage === "Stock Management" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Stock Management</h1>
            <div className="relative">
              <button
                className="flex items-center text-[#A7AD6F] font-semibold"
                onClick={toggleWarehouseDropdown}
              >
                Warehouse {selectedWarehouse}
                <img
                  src={ArrowDown}
                  alt="Arrow Down"
                  className="ml-2 w-4"
                />
              </button>
              {warehouseDropdownVisible && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-md z-20">
                  {warehouses.map((warehouse) => (
                    <button
                      key={warehouse.id}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                      onClick={() => selectWarehouse(warehouse)}
                    >
                      {warehouse.location}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="machine-cards">
                {machines.length > 0 ? (
                  <DashboardMachineCard machines={machines} />
                ) : (
                  <p>No machines available.</p>
                )}
          </div>
        </>
      )}

          {activePage === "Help Center" && <div>Help Center Content</div>}
          {activePage === "Settings" && (
            <div className="">
              <h1 className="text-3xl font-bold ">Edit Profile</h1>
              <div className="bg-white  rounded-lg p-5">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2 ">
                      Name
                    </label>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-lg"
                      name="name"
                      value={tempUserState.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Email
                    </label>
                    <p className="text-gray-900">{tempUserState.email}</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Phone Number
                    </label>
                    <p className="text-gray-900">{tempUserState.phone}</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Gender
                    </label>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="male"
                        name="gender"
                        value="Male"
                        checked={tempUserState.gender === "Male"}
                        onChange={handleGenderChange}
                        className="mr-2"
                      />
                      <label htmlFor="male" className="mr-4">
                        Male
                      </label>
                      <input
                        type="radio"
                        id="female"
                        name="gender"
                        value="Female"
                        checked={tempUserState.gender === "Female"}
                        onChange={handleGenderChange}
                        className="mr-2"
                      />
                      <label htmlFor="female" className="mr-4">
                        Female
                      </label>
                      <input
                        type="radio"
                        id="others"
                        name="gender"
                        value="Others"
                        checked={tempUserState.gender === "Others"}
                        onChange={handleGenderChange}
                        className="mr-2"
                      />
                      <label htmlFor="others">Others</label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Birthdate
                    </label>
                    <div className="flex items-center">
                      <select
                        name="day"
                        className="border border-gray-300 rounded-lg px-3 py-2 mr-4"
                        value={tempUserState.birthdate.day}
                        onChange={handleBirthdateChange}
                      >
                        {days.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <select
                        name="month"
                        className="border border-gray-300 rounded-lg px-3 py-2 mr-4"
                        value={tempUserState.birthdate.month}
                        onChange={handleBirthdateChange}
                      >
                        {months.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        name="year"
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        value={tempUserState.birthdate.year}
                        onChange={handleBirthdateChange}
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Role
                    </label>
                    <p className="text-gray-900">{tempUserState.role}</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Location
                    </label>
                    <p className="text-gray-900">{tempUserState.location}</p>
                  </div>
                </div>
                <div className="flex justify-center mt-6 ">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="ml-3 px-4 py-2 text-white bg-[#852222] rounded-lg"
                  >
                    SAVE CHANGES
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MainXYZ;
