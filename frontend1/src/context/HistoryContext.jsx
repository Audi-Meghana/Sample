/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const HistoryContext = createContext();

export const useHistoryContext = () => useContext(HistoryContext);

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [timeFilter, setTimeFilter] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async () => {
    // 🔥 FIX: Check for token before making the request
    const token = localStorage.getItem("token");
    if (!token) return; 

    try {
      const res = await API.get("/history", {
        params: {
          page,
          limit,
          action: actionFilter,
          timeFilter
        }
      });

      // Added optional chaining just in case the backend response structure varies
      setHistory(res.data?.data || []);
      setTotalPages(res.data?.pages || 1);

    } catch (error) {
      // If the error is 401, you might want to handle logout logic here
      console.error("History Fetch Error:", error.response?.status === 401 ? "Unauthorized" : error.message);
    }
  };

  const clearHistory = async () => {
    try {
      await API.delete("/history");
      fetchHistory();
    } catch (err) { console.error(err); }
  };

  const deleteSingleHistory = async (id) => {
    try {
      await API.delete(`/history/${id}`);
      fetchHistory();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, limit, actionFilter, timeFilter]);

  return (
    <HistoryContext.Provider
      value={{
        history,
        page,
        setPage,
        limit,
        setLimit,
        totalPages,
        actionFilter,
        setActionFilter,
        timeFilter,
        setTimeFilter,
        clearHistory,
        deleteSingleHistory,
        refreshHistory: fetchHistory // Added this so you can manually trigger a refresh
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};