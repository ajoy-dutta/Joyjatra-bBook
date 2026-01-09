import { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";

const CashAccount = () => {
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  const [cash, setCash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchCash();
  }, []);


  const fetchCash = async () => {
    try {
      const res = await AxiosInstance.get("cash-accounts/", {
            params: {
            business_category: selectedCategory.id,
            },
        }
      );

      // assuming backend returns [] or single object
      setCash(res.data[0] || null);
    } catch (err) {
      setCash(null);
    } finally {
      setLoading(false);
    }
  };

  const createCash = async () => {
    if (!amount) return alert("Enter opening balance");

    await AxiosInstance.post("cash-accounts/", {
      business_category: selectedCategory.id,
      opening_balance: amount,
    });

    setAmount("");
    fetchCash();
  };

  const updateCash = async () => {
    if (!amount) return alert("Enter amount");

    await AxiosInstance.put(`cash-accounts/${cash.id}/`, {
      business_category: selectedCategory.id,
      opening_balance: amount,
    });

    setEditing(false);
    setAmount("");
    fetchCash();
  };

  if (loading) return <p>Loading cash...</p>;

  return (
    <div className="max-w-md p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-3">Cash Account</h2>

      {cash ? (
        <>
          <div className="mb-3">
            <p>
              <strong>Opening Balance:</strong> {cash.opening_balance}
            </p>
            <p className="text-green-600 font-bold">
              Current Balance: {cash.current_balance}
            </p>
          </div>

          {editing ? (
            <div className="flex gap-2">
              <input
                type="number"
                className="border p-2 w-full"
                placeholder="New opening balance"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                onClick={updateCash}
                className="bg-blue-600 text-white px-4 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-400 text-white px-4 rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit Opening Balance
            </button>
          )}
        </>
      ) : (
        <>
          <p className="mb-2 text-red-500">
            No cash account created yet
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              className="border p-2 w-full"
              placeholder="Initial cash amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              onClick={createCash}
              className="bg-green-600 text-white px-4 rounded"
            >
              Add Cash
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CashAccount;
