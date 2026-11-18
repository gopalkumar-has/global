
import React, { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

const GwTokenBalance = () => {
  const [totalTokens, setTotalTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGwTokenTotal = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/user/gw-token-total");

      if (response?.data?.success) {
        setTotalTokens(
          Math.max(0, Number(response.data.totalTokens) || 0)
        );
      } else {
        throw new Error(
          response?.data?.message || "Unable to fetch GW Tokens"
        );
      }
    } catch (err) {
      console.error("[GW TOKEN FETCH ERROR]", err);
      setError("Unable to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGwTokenTotal();

    const interval = setInterval(fetchGwTokenTotal, 30000);

    return () => clearInterval(interval);
  }, [fetchGwTokenTotal]);

  return (
<div className="flex min-h-[82px] w-full min-w-0 flex-col justify-center overflow-hidden rounded-2xl border border-purple-400/30 bg-gradient-to-br from-[#3b0764] to-[#160b2e] px-4 py-2.5 shadow-lg sm:min-h-[90px] sm:px-5">      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#bca878] sm:text-xs">
        My Total GW Tokens
      </p>

      <h2 className="mt-1.5 break-words text-2xl font-black leading-tight text-[#f5d68e] sm:text-3xl">
        {loading
          ? "Loading..."
          : error
          ? "Unavailable"
          : `${totalTokens.toLocaleString("en-US", {
              maximumFractionDigits: 2
            })} GW`}
      </h2>

      {error && (
        <button
          onClick={fetchGwTokenTotal}
          className="mt-1 w-fit text-[10px] text-amber-400 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default GwTokenBalance;
