import { useState, useEffect, useRef } from 'react';
import AxiosInstance from '../../components/AxiosInstance';

export default function PurchaseEntry() {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [selectedCategory, setSelectedCategory] = useState(
        JSON.parse(localStorage.getItem("business_category")) || null
    );

    const [formData, setFormData] = useState({
        business_category: selectedCategory.id,
        invoice_no: 'AUTO GENERATE',
        purchase_date: '',
        display_purchase_date: '',
        total_price: '',
    });

    


    useEffect(() => {
        const today = new Date();

        const formattedForInput = today.toISOString().slice(0, 10); // YYYY-MM-DD for input[type=date]
        const formattedForUI = today.toLocaleDateString('en-GB'); // DD/MM/YYYY

        setFormData(prev => ({
            ...prev,
            purchase_date: formattedForInput,
            display_purchase_date: formattedForUI,
        }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    useEffect(() => {
    console.log("Selected File:", selectedFile);
    }, [selectedFile]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert('Please upload a file before submitting.');
            return;
        }

        try {
            const data = new FormData();
            data.append('business_category', formData.business_category);
            data.append('invoice_no', formData.invoice_no);
            data.append('purchase_date', formData.purchase_date);
            data.append('total_price', formData.total_price);
            data.append('xl_file', selectedFile);

            const response = await AxiosInstance.post('upload-order-excel/', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            console.log('Success:', response.data);
            alert('Purchase entry saved successfully!');

            setFormData({
                invoice_no: 'AUTO GENERATE',
                purchase_date: new Date().toISOString().slice(0, 10),
                display_purchase_date: new Date().toLocaleDateString('en-GB'),
                total_price: '',
            });
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error saving purchase entry. Check console for details.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-4 bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-md">
            <h2 className="text-2xl font-extrabold mb-4 text-center text-blue-700 tracking-wide">
                🛒 Product Purchase Entry
            </h2>

            <form
                onSubmit={handleSubmit}
                className="space-y-8 bg-white rounded-2xl p-8"
            >
                {/* Purchase Entry Section */}
                <section>
                    <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
                        <span className="w-1 h-4 bg-blue-600 rounded"></span> Purchase Information
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Invoice No
                            </label>
                            <input
                                type="text"
                                name="invoice_no"
                                value={formData.invoice_no}
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-3 py-1 bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Purchase Date *
                            </label>
                            <input
                                type="date"
                                name="purchase_date"
                                value={formData.purchase_date}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Display: {formData.display_purchase_date}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Order Sheet Section */}
                <section className="grid md:grid-cols-3 gap-6">

                    {/* Middle: Order Sheet Upload */}
                    <div>
                        <h3 className="text-sm mb-1 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            Ordered file
                        </h3>

                        <div className="bg-card dark:bg-gray-900 border rounded-xl p-5 shadow-sm 
                                        dark:border-gray-700 dark:shadow-md space-y-1">

                            <h4 className="text-md font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                Upload Excel File
                            </h4>

                            <input
                                type="file"
                                name="xl_file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 
                                bg-white dark:bg-gray-800 dark:text-gray-300 cursor-pointer focus:ring-2 
                                focus:ring-blue-500 w-full"/>
                        </div>
                    </div>
                </section>

                {/* Submit */}
                <div className="text-center mt-8">
                    <button
                        type="submit"
                        className="bg-blue-700 text-white px-10 py-3 rounded-full hover:bg-blue-800 transition-all shadow-lg"
                    >
                        ✅ Submit Entry
                    </button>
                </div>
            </form>
        </div>
    );
}