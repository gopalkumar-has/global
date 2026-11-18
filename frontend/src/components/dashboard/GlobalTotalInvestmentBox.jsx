
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const GlobalTotalInvestmentBox = () => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchTotal = async () => {
      try {
        const response = await api.get("/dashboard/global-investment");

        if (mounted && response.data?.success) {
          setTotal(Number(response.data?.summary?.globalInvestment || 0));
        }
      } catch (error) {
        console.error("Global investment fetch error:", error);
      }
    };

    fetchTotal();
    const interval = setInterval(fetchTotal, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex min-h-[82px] w-full min-w-0 flex-col justify-center overflow-hidden rounded-2xl border border-[#c9a45c]/20 bg-gradient-to-br from-[#201a10] to-[#100e0a] px-4 py-2.5 shadow-lg sm:min-h-[90px] sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#bca878] sm:text-xs">
        Global Total Investment
      </p>

    <h2 className="mt-1.5 break-words text-2xl font-black leading-tight text-[#f5d68e] sm:text-3xl">
  {new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(total)}
</h2>
    </div>
  );
};

export default GlobalTotalInvestmentBox;
