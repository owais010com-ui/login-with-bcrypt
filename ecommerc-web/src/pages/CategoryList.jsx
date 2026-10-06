import React, { useContext, useEffect, useState } from "react";
import "./CategoryList.css";
import { GlobalContext } from "../context/Context";
import api from "../components/api";

const CategoryList = () => {
    let { state } = useContext(GlobalContext);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [toasts, setToasts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const showToast = (message, type = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    const getCategories = async () => {
        try {
            const apiRes = await api.get(`/categories`);
            setCategories(apiRes.data.categories);
        } catch (error) {
            console.log("Err", error);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    const resetForm = () => {
        setName("");
        setDescription("");
        setEditingId(null);
        setShowForm(false);
    };

    const addCategory = async (e) => {
        e.preventDefault();
        try {
            const apiRes = await api.post(`/category`, {
                name: name,
                description: description
            });
            getCategories();
            showToast(apiRes.data.message, "success");
            resetForm();
        } catch (error) {
            console.log("Err", error);
            showToast(error.response?.data?.message || "Something went wrong", "error");
        }
    };

    const updateCategory = async (e) => {
        e.preventDefault();
        try {
            const apiRes = await api.put(`/category/${editingId}`, {
                name: name,
                description: description
            });
            getCategories();
            showToast(apiRes.data.message, "success");
            resetForm();
        } catch (error) {
            console.log("Err", error);
            showToast(error.response?.data?.message || "Something went wrong", "error");
        }
    };

    const startEdit = (category) => {
        setEditingId(category.id);
        setName(category.name);
        setDescription(category.description || "");
        setShowForm(true);
    };

    const deleteCategory = async (id) => {
        try {
            const apiRes = await api.delete(`/category/${id}`);
            getCategories();
            showToast(apiRes.data.message, "success");
        } catch (error) {
            console.log("Err", error);
            showToast(error.response?.data?.message || "Something went wrong", "error");
        } finally {
            setConfirmDeleteId(null);
        }
    };

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            {confirmDeleteId && (
                <div className="confirm-overlay">
                    <div className="confirm-box">
                        <p>Delete this category?</p>
                        <div className="confirm-actions">
                            <button className="cancel-btn" onClick={() => setConfirmDeleteId(null)}>
                                Cancel
                            </button>
                            <button className="confirm-delete-btn" onClick={() => deleteCategory(confirmDeleteId)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="category-page">

                <div className="toast-container">
                    {toasts.map((toast) => (
                        <div key={toast.id} className={`toast toast--${toast.type}`}>
                            {toast.message}
                        </div>
                    ))}
                </div>

                <div className="category-container">

                    <div className="category-header">
                        <div>
                            <h1>Categories</h1>
                            <p>Manage your product categories</p>
                        </div>

                        {state.user?.role === "admin" && (
                            <button
                                className="add-category-btn"
                                onClick={() => {
                                    resetForm();
                                    setShowForm(true);
                                }}
                            >
                                <span>+</span>
                                Add Category
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="category-form-card">

                            <div className="form-header">
                                <div>
                                    <h2>{editingId ? "Edit Category" : "Add New Category"}</h2>
                                    <p>{editingId ? "Update category details" : "Create a new product category"}</p>
                                </div>

                                <button
                                    type="button"
                                    className="close-btn"
                                    onClick={resetForm}
                                >
                                    ×
                                </button>
                            </div>

                            <form
                                className="category-form"
                                onSubmit={editingId ? updateCategory : addCategory}
                            >

                                <div className="input-group">
                                    <label htmlFor="categoryName">Category Name</label>
                                    <input
                                        id="categoryName"
                                        type="text"
                                        placeholder="Enter category name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="categoryDescription">Description</label>
                                    <textarea
                                        id="categoryDescription"
                                        placeholder="Enter category description"
                                        rows="4"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={resetForm}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="save-category-btn">
                                        {editingId ? "Update Category" : "Save Category"}
                                    </button>
                                </div>

                            </form>

                        </div>
                    )}

                    <div className="category-toolbar">
                        <div className="search-box">
                            <span>🔍</span>
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="category-count">
                            {filteredCategories.length} Categories
                        </div>
                    </div>

                    <div className="category-table-wrapper">

                        <table className="category-table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredCategories.map((category) => (
                                    <tr key={category.id}>

                                        <td className="category-id">#{category.id}</td>

                                        <td>
                                            <div className="category-name">
                                                <div className="category-icon">
                                                    {category.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{category.name}</span>
                                            </div>
                                        </td>

                                        <td className="category-description">
                                            {category.description}
                                        </td>

                                        <td>
                                            <div className="action-buttons">
                                                <button className="edit-btn" onClick={() => startEdit(category)}>
                                                    Edit
                                                </button>
                                                <button className="delete-btn" onClick={() => setConfirmDeleteId(category.id)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}

                                {filteredCategories.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="no-categories">
                                            No categories found
                                        </td>
                                    </tr>
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>
        </>
    );
};

export default CategoryList;