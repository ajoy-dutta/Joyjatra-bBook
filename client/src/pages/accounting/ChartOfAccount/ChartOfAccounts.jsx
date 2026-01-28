import { useEffect, useState, Fragment } from "react";
import AccountForm from "./AccountForm";
import AxiosInstance from "../../../components/AxiosInstance";

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await AxiosInstance.get("accounts/");
      setAccounts(res.data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 🔹 GROUP BY ACCOUNT TYPE
  const groupedAccounts = accounts.reduce((groups, acc) => {
    const type = acc.account_type || "Others";
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(acc);
    return groups;
  }, {});

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

      {/* Table */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600 uppercase text-xs tracking-wider">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Account Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {Object.keys(groupedAccounts).length > 0 ? (
                Object.entries(groupedAccounts).map(([type, accList]) => (
                  <Fragment key={type}>

                    {/* Group Header */}
                    <tr className="bg-gray-100">
                      <td
                        colSpan={4}
                        className="px-4 py-2 font-semibold text-gray-700 uppercase"
                      >
                        {type}
                      </td>
                    </tr>

                    {/* Group Rows */}
                    {accList.map((acc) => (
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
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium
                                       bg-gray-100 text-gray-700"
                          >
                            {acc.account_type}
                          </span>
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
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
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
