import { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";

const CashAccount = () => {
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  const [cashBalance, setCashBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCashBalance();
  }, [selectedCategory]);

  const fetchCashBalance = async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      const res = await AxiosInstance.get("cash-balance/", {
        params: {
          business_category: selectedCategory.id,
        },
      });

      setCashBalance(res.data.balance);
    } catch (err) {
      console.error(err);
      setCashBalance(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading cash...</p>;

  return (
    <div className="max-w-md p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-3">Cash Account</h2>

      {cashBalance !== null ? (
        <div className="mb-3">
          <p className="text-green-600 font-bold">
            Current Balance: {cashBalance.toLocaleString()}
          </p>
        </div>
      ) : (
        <p className="text-red-500">No cash transactions yet</p>
      )}
    </div>
  );
};

export default CashAccount;
