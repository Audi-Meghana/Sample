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
    try {
      const res = await API.get("/history", {
        params: {
          page,
          limit,
          action: actionFilter,
          timeFilter
        }
      });

      setHistory(res.data.data);
      setTotalPages(res.data.pages);

    } catch (error) {
      console.error(error);
    }
  };

  const clearHistory = async () => {
    await API.delete("/history");
    fetchHistory();
  };

  const deleteSingleHistory = async (id) => {
    await API.delete(`/history/${id}`);
    fetchHistory();
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
        deleteSingleHistory
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};