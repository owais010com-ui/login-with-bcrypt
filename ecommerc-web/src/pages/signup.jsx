import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router';



const Signup = () => {

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");




    const signup = async (e) => {
        e.preventDefault();

        try {
            const apiResonse = await axios.post('http://localhost:5000/signup', {
                "full_name": fullName,
                "email": email,
                "password_hash": password,
                "phone_num": phone
            });

            console.log(apiResonse.data.message);
        } catch (error) {
            console.log(error.response.data.message);
        };
    }


    return (
        <div>
            <h1>Sign UP</h1>
            <form onSubmit={signup} >
                <label>
                    Full Name:
                    <input
                        type="text"
                        placeholder='Enter Your Name'
                        value={fullName}
                        onChange={(e) => { setFullName(e.target.value) }}
                    />
                </label>
                <br />
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
                <label>
                    Phone NO:
                    <input
                        type="text"
                        placeholder='Enter Your Phone NO'
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value) }}
                    />
                </label>
                <br />
                <button>
                    Sign Up
                </button>
            </form>
            <br />
            Already have an account?&nbsp;<Link to="/login">Login</Link>

        </div>

    )
}

export default Signup;