import { useEffect, useState } from "react";
import AccountForm from "./AccountForm";
import AxiosInstance from "../../../components/AxiosInstance";

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  const fetchAccounts = async () => {
    const res = await AxiosInstance.get("accounts/");
    setAccounts(res.data);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const toggleStatus = async (account) => {
    await AxiosInstance.patch(`accounts/${account.id}/`, {
      is_active: !account.is_active,
    });
    fetchAccounts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Chart of Accounts
          </h2>
          <p className="text-sm text-gray-500">
            Manage and organize your accounting structure
          </p>
        </div>

        <button
          onClick={() => {
            setSelected(null);
            setOpenForm(true);
          }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white
                     px-4 py-2 rounded-md text-sm font-medium
                     hover:bg-blue-700 transition"
        >
          + New Account
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600 uppercase text-xs tracking-wider">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Account Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {accounts.map((acc) => (
                <tr
                  key={acc.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {acc.code}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {acc.name}
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium
                                     bg-gray-100 text-gray-700">
                      {acc.account_type}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {acc.is_active ? (
                      <span className="px-2 py-1 text-xs font-semibold
                                       bg-green-100 text-green-700 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold
                                       bg-red-100 text-red-700 rounded-full">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => {
                        setSelected(acc);
                        setOpenForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800
                                 font-medium text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleStatus(acc)}
                      className={`font-medium text-sm ${
                        acc.is_active
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      }`}
                    >
                      {acc.is_active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}

              {accounts.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {openForm && (
        <AccountForm
          selected={selected}
          onClose={() => setOpenForm(false)}
          onSaved={fetchAccounts}
        />
      )}
    </div>
  );
}
