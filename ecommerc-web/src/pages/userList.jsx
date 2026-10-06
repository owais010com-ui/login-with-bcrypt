import React, { useState, useEffect } from "react";
import api from '../components/api';
import "./UserList.css";

const UserList = () => {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);

    const getUsers = async () => {
        try {
            const apiRes = await api.get('/users');
            setUsers(apiRes.data.users);
        } catch (error) {
            console.log("error", error);
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    const filteredUsers = users.filter((user) =>
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="user-list-page">

            <div className="user-list-container">

                <div className="user-list-header">
                    <div>
                        <h1>Users</h1>
                        <p>Manage all registered users</p>
                    </div>

                    <div className="user-count">
                        {users.length} Users
                    </div>
                </div>

                {/* Search */}
                <div className="user-toolbar">

                    <div className="search-box">
                        <span>🔍</span>

                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                </div>

                {/* Table */}
                <div className="table-wrapper">

                    <table className="users-table">

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredUsers.map((user) => (
                                <tr key={user.id}>

                                    <td className="user-id">
                                        #{user.id}
                                    </td>

                                    <td>
                                        <div className="user-info">

                                            <div className="user-avatar">
                                                {user.full_name.charAt(0)}
                                            </div>

                                            <span>
                                                {user.full_name}
                                            </span>

                                        </div>
                                    </td>

                                    <td className="user-email">
                                        {user.email}
                                    </td>

                                    <td>
                                        <span
                                            className={`role-badge ${user.role.toLowerCase()}`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`status-badge ${user.is_active ? "active" : "disabled"}`}
                                        >
                                            <span className="status-dot"></span>
                                            {user.is_active ? "Active" : "Disabled"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="action-buttons">

                                            <button
                                                className="disable-btn"
                                                title="Disable User"
                                            >
                                                {user.is_active ? "Disable" : "Enable"}
                                            </button>

                                            <button
                                                className="delete-btn"
                                                title="Delete User"
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    </td>

                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="no-users"
                                    >
                                        No users found
                                    </td>
                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
};

export default UserList;