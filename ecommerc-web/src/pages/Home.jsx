import axios from 'axios';
import React, { useContext } from 'react';
import { GlobalContext } from '../context/Context';

const Home = () => {
    const { state, dispatch } = useContext(GlobalContext);
    const user = state.user;

    const logout = async () => {
        try {
            await axios.post('/api1/logout', {}, { withCredentials: true });
            dispatch({ type: 'USER_LOGOUT' });
        } catch (error) {
            console.log(error.response?.data?.message ?? error.message);
        }
    };

    return (
        <main className="home-page">
            <section className="home-card">
                <div className="avatar">{user?.full_name?.charAt(0).toUpperCase()}</div>

                <div>
                    <h1>{user?.full_name}</h1>
                    <span className="badge">{user?.role}</span>
                </div>

                <dl className="details">
                    <div className="details__row">
                        <dt>Email</dt>
                        <dd>{user?.email}</dd>
                    </div>
                    <div className="details__row">
                        <dt>Phone</dt>
                        <dd>{user?.phone_num || 'Not provided'}</dd>
                    </div>
                </dl>

                <button className="btn" onClick={logout}>Log out</button>
            </section>
        </main>
    );
};

export default Home;