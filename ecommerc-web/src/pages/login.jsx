import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router';


const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async (e) => {
        e.preventDefault();

        try {
            const apiResonse = await axios.post('http://localhost:5000/login', {
                "email": email,
                "password_hash": password
            });

            alert(apiResonse.data);
            console.log(apiResonse.data.user);

        } catch (error) {
            console.log(error.response.data.message);

        }
    }

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={login}>


                <label>
                    Email:
                    <input
                        type="email"
                        placeholder='Enter Your Email'
                        value={email}
                        onChange={(e) => { setEmail(e.target.value) }}
                    />
                </label>
                <br />
                <label>
                    Password:
                    <input
                        type="text"
                        placeholder='Enter Your Password'
                        value={password}
                        onChange={(e) => { setPassword(e.target.value) }} />
                </label>
                <br />
                <button>
                    Login
                </button>
            </form>
            <br />
            Don't have an account?&nbsp;<Link to="/signup">Sign Up</Link>
        </div>

    )
}

export default Login;