import React, { useState, useEffect } from "react";
import { useWindowSize } from "react-use";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getAllWarehouses } from "../../../service/warehousesService";

const ChooseWarehouse = () => {
  const { width } = useWindowSize();
  const isMobile = width <= 1024;
  const navigate = useNavigate();
  const { awb } = useParams();
  const location = useLocation();
  const { totalWeight } = location.state || { totalWeight: "Unknown" };

  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await getAllWarehouses();
        setWarehouses(response.data);
      } catch (error) {
        console.error("Error fetching warehouses: ", error);
      }
    };

    fetchWarehouses();
  }, []);

  const handleChooseWarehouse = (warehouseId) => {
    navigate(`/xyz/m/schedulepickup/${awb}`, {
      state: { warehouseId, awb },
    });
  };

  return (
    <div>
      {isMobile ? (
        <div className="bg-white h-screen flex flex-col overflow-auto">
          <header className="flex flex-col mt-6">
            <div className="flex flex-row justify-between mx-6">
              <button onClick={() => navigate(-1)}>
                <svg
                  className=""
                  width="20"
                  height="24"
                  viewBox="0 0 20 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.818359 8.42969C0.818359 8.09766 0.964844 7.76562 1.19922 7.53125L7.5957 1.14453C7.86914 0.871094 8.17188 0.744141 8.47461 0.744141C9.17773 0.744141 9.66602 1.24219 9.66602 1.90625C9.66602 2.25781 9.51953 2.55078 9.29492 2.77539L7.11719 4.98242L4.53906 7.33594L6.75586 7.20898H18.2695C19.0117 7.20898 19.5098 7.70703 19.5098 8.42969C19.5098 9.15234 19.0117 9.65039 18.2695 9.65039H6.75586L4.53906 9.52344L7.11719 11.877L9.29492 14.084C9.51953 14.2988 9.66602 14.5918 9.66602 14.9531C9.66602 15.6074 9.17773 16.1055 8.47461 16.1055C8.17188 16.1055 7.86914 15.9883 7.61523 15.7344L1.19922 9.32812C0.964844 9.09375 0.818359 8.76172 0.818359 8.42969Z"
                    fill="#828282"
                  />
                </svg>
              </button>
              <div className="flex flex-row gap-1">
                <svg
                  className=""
                  width="27"
                  height="24"
                  viewBox="0 0 27 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.57031 8.13281C2.35156 8.13281 0.515625 6.29688 0.515625 4.07031C0.515625 1.84375 2.35156 0.0078125 4.57031 0.0078125C6.79688 0.0078125 8.63281 1.84375 8.63281 4.07031C8.63281 6.28125 6.78125 8.13281 4.57031 8.13281ZM2.71094 4.77344H4.625C4.96094 4.77344 5.21875 4.51562 5.21875 4.17969V1.84375C5.21875 1.52344 4.95312 1.26562 4.625 1.26562C4.29688 1.26562 4.03125 1.52344 4.03125 1.84375V3.59375H2.71094C2.38281 3.59375 2.11719 3.85938 2.11719 4.17969C2.11719 4.50781 2.375 4.77344 2.71094 4.77344ZM2.52344 14.625V8.84375C3.15625 9.11719 3.84375 9.26562 4.57031 9.26562C7.40625 9.26562 9.76562 6.90625 9.76562 4.07031C9.76562 3.25 9.57031 2.48438 9.23438 1.79688H15.5391C17.1172 1.79688 17.9844 2.67188 17.9844 4.25V14.0547C17.2578 14.6562 16.8203 15.5703 16.8203 16.5938C16.8203 16.7578 16.8359 16.9141 16.8594 17.0703H12.1406C12.1719 16.9141 12.1797 16.7578 12.1797 16.6016C12.1797 14.6719 10.6094 13.0938 8.67969 13.0938C6.74219 13.0938 5.17188 14.6719 5.17188 16.6016C5.17188 16.7578 5.17969 16.9141 5.21094 17.0625H4.77344C3.3125 17.0625 2.52344 16.1406 2.52344 14.625ZM19.1094 6.11719H21.2109C22.0625 6.11719 22.6406 6.32812 23.1562 6.90625L25.8828 9.97656C26.3594 10.5234 26.4922 10.9219 26.4922 11.7734V14.625C26.4922 16.1562 25.6875 17.0781 24.1953 17.0781H23.7891C23.8203 16.9141 23.8359 16.7578 23.8359 16.5938C23.8359 14.6641 22.2422 13.0938 20.3047 13.0938C19.875 13.0938 19.4688 13.1875 19.1094 13.3516V6.11719ZM21.4453 11.3984H24.6484C24.625 11.2188 24.5391 11.0859 24.4219 10.9453L22.1406 8.375C21.8516 8.05469 21.6328 7.98438 21.2578 7.98438H20.6562V10.6094C20.6562 11.0938 20.9609 11.3984 21.4453 11.3984ZM20.3281 19.1094C18.9453 19.1094 17.8203 17.9844 17.8203 16.5938C17.8203 15.2109 18.9453 14.0859 20.3281 14.0859C21.7109 14.0859 22.8359 15.2109 22.8359 16.5938C22.8359 18 21.7188 19.1094 20.3281 19.1094ZM8.67969 19.1094C7.28906 19.1094 6.16406 17.9844 6.16406 16.6016C6.16406 15.2188 7.28906 14.0938 8.67969 14.0938C10.0625 14.0938 11.1875 15.2188 11.1875 16.6016C11.1875 17.9844 10.0625 19.1094 8.67969 19.1094Z"
                    fill="#828282"
                  />
                </svg>
                <div className="text-[#828282] items-center font-vietnam text-base font-semibold leading-normal">
                  Choose Warehouse
                </div>
              </div>
              <div className="invisible" />
            </div>
            <hr className="w-full h-[2px] bg-[#d9d9d9] border-0 mt-6 visible"></hr>
          </header>
          <main className="mt-7 mx-6 pb-5 flex flex-col gap-4">
            <div className="font-vietnam text-2xl font-medium text-black/50">
              To Ship: <b className="text-black">{totalWeight} kg</b>
            </div>
            <div className="flex flex-col w-full gap-4">
              {warehouses.map((warehouse) => (
                <div
                  key={warehouse.id}
                  className="flex flex-col w-full gap-4 bg-[#f0f0f0] rounded-lg p-4"
                >
                  <div className="self-start flex flex-row gap-2 px-2.5 py-1.5 bg-black rounded-md">
                    <div className="font-vietnam text-sm font-medium text-white ">
                      Kecamatan <b>{warehouse.location}</b>
                    </div>
                  </div>
                  <div className="self-center font-vietnam font-bold text-2xl py-2 tracking-wider">
                    {warehouse.TotalStock} / {warehouse.Capacity}kg
                  </div>
                  <button
                    className="cursor-pointer self-center font-vietnam bg-[#A7AD6F] text-base font-medium text-white rounded-lg py-1 px-3 w-full text-center"
                    onClick={() => handleChooseWarehouse(warehouse.id)}
                  >
                    Choose
                  </button>
                </div>
              ))}
            </div>
          </main>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen mt-4 text-gray-600">
          Not available for this device.
        </div>
      )}
    </div>
  );
};

export default ChooseWarehouse;
