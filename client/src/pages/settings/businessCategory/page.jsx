import React, { useState, useEffect } from 'react';
import AxiosInstance from '../../../components/AxiosInstance';

const BusinessCategory = () => {
    const [formData, setFormData] = useState({ name: '' });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await AxiosInstance.get('/business-categories/');
            setCategories(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (editingId) {
                await AxiosInstance.put(`/business-categories/${editingId}/`, formData);
                setEditingId(null);
            } else {
                await AxiosInstance.post('/business-categories/', formData);
            }
            setFormData({ name: '' });
            fetchCategories();
        } catch (err) {
            setError(err.response?.data || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        setFormData({ name: category.name });
        setEditingId(category.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await AxiosInstance.delete(`/business-categories/${id}/`);
            fetchCategories();
        } catch (err) {
            console.error(err);
            alert('Failed to delete category');
        }
    };

    return (<div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Form Card */} <div className="bg-gradient-to-r from-blue-50 to-white shadow-lg rounded-lg p-4"> <h2 className="text-2xl font-bold mb-4 text-blue-700">
            {editingId ? 'Edit' : 'Add'} Business Category </h2>
            {error && <div className="text-red-500 mb-2">{JSON.stringify(error)}</div>} <form onSubmit={handleSubmit} className="flex flex-col space-y-2"> <input
                type="text"
                name="name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            />
                <button
                    type="submit"
                    disabled={loading}
                    className={`py-1 px-4 rounded text-white font-medium transition-colors ${editingId
                            ? 'bg-yellow-500 hover:bg-yellow-600'
                            : 'bg-blue-500 hover:bg-blue-600'
                        } disabled:bg-gray-400`}
                >
                    {loading ? (editingId ? 'Updating...' : 'Adding...') : editingId ? 'Update Category' : 'Add Category'} </button> </form> </div>

        {/* Table Card */}
        <div className="bg-white shadow-lg rounded-lg p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Business Categories</h2>
            {categories.length === 0 ? (
                <p className="text-gray-500">No categories found.</p>
            ) : (
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="border px-3 py-1 text-left text-gray-700">ID</th>
                            <th className="border px-3 py-1 text-left text-gray-700">Name</th>
                            <th className="border px-3 py-1 text-left text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat, index) => (
                            <tr
                                key={cat.id}
                                className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                    } hover:bg-blue-50 transition-colors`}
                            >
                                <td className="border px-3 py-1">{cat.id}</td>
                                <td className="border px-3 py-1">{cat.name}</td>
                                <td className="border px-3 py-1 space-x-2">
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </div>

    );
};

export default BusinessCategory;
