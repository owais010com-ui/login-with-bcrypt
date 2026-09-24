import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router';
import { GlobalContext } from '../context/Context';

const svgProps = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
};

const UserIcon = () => (
    <svg {...svgProps}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const MailIcon = () => (
    <svg {...svgProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
const PhoneIcon = () => (
    <svg {...svgProps}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg>
);
const LockIcon = () => (
    <svg {...svgProps}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
const EyeIcon = () => (
    <svg {...svgProps}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon = () => (
    <svg {...svgProps}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /><path d="M3 3l18 18" /></svg>
);

const Signup = () => {
    let { state } = useContext(GlobalContext);

    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isSeller, setIsSeller] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const next = {};
        if (!fullName.trim()) next.fullName = 'Full name is required.';
        if (!email.trim()) next.email = 'Email is required.';
        if (!password) next.password = 'Password is required.';
        else if (password.length < 6) next.password = 'Use at least 6 characters.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const signup = async (e) => {
        e.preventDefault();
        setApiError("");

        if (!validate()) return;

        setSubmitting(true);
        try {
            await axios.post('/api1/signup', {
                "full_name": fullName,
                "email": email,
                "password_hash": password,
                "phone_num": phone,
                "isSeller": isSeller
            });

            navigate('/login');

        } catch (error) {
            setApiError(error.response?.data?.message ?? error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <p className="auth-eyebrow">Create account</p>
                <h1>Get started.</h1>
                <p className="auth-sub">Fill in your details to create a new account.</p>

                <form className="form" onSubmit={signup} noValidate>

                    <div>
                        <div className={`field ${errors.fullName ? 'field--error' : ''}`}>
                            <span className="field__icon"><UserIcon /></span>
                            <div className="field__body">
                                <input
                                    id="full_name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder=" "
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                                <label htmlFor="full_name">Full name</label>
                            </div>
                        </div>
                        {errors.fullName && <p className="field__error">{errors.fullName}</p>}
                    </div>

                    <div>
                        <div className={`field ${errors.email ? 'field--error' : ''}`}>
                            <span className="field__icon"><MailIcon /></span>
                            <div className="field__body">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder=" "
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label htmlFor="email">Email address</label>
                            </div>
                        </div>
                        {errors.email && <p className="field__error">{errors.email}</p>}
                    </div>

                    <div className="field">
                        <span className="field__icon"><PhoneIcon /></span>
                        <div className="field__body">
                            <input
                                id="phone"
                                type="tel"
                                autoComplete="tel"
                                placeholder=" "
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <label htmlFor="phone">Phone (optional)</label>
                        </div>
                    </div>

                    <div>
                        <div className={`field ${errors.password ? 'field--error' : ''}`}>
                            <span className="field__icon"><LockIcon /></span>
                            <div className="field__body">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder=" "
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label htmlFor="password">Password</label>
                            </div>
                            <button
                                type="button"
                                className="field__toggle"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.password && <p className="field__error">{errors.password}</p>}
                    </div>

                    <label className="check">
                        <input
                            type="checkbox"
                            checked={isSeller}
                            onChange={(e) => setIsSeller(e.target.checked)}
                        />
                        <span>Register as a seller</span>
                    </label>

                    {apiError && <p className="auth-alert" role="alert">{apiError}</p>}

                    <button className="btn" type="submit" disabled={submitting}>
                        {submitting ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="auth-alt">
                    Already have an account? <Link className='auth-link' to="/login">LOGIN</Link>
                </p>

                <div className="auth-foot">
                    <LockIcon />
                    <span>Your password is never stored in plain text.</span>
                </div>
            </div>
        </main>
    );
};

export default Signup;