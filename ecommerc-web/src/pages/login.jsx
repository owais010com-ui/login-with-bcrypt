import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router';
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

const MailIcon = () => (
    <svg {...svgProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
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

const Login = () => {

    let { state, dispatch } = useContext(GlobalContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const next = {};
        if (!email.trim()) next.email = 'Email is required.';
        if (!password) next.password = 'Password is required.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const login = async (e) => {
        e.preventDefault();
        setApiError("");

        if (!validate()) return;

        setSubmitting(true);
        try {
            const apiResponse = await axios.post('/api1/login', {
                "email": email,
                "password_hash": password
            }, { withCredentials: true });

            dispatch({ type: 'USER_LOGIN', user: apiResponse.data.user });

        } catch (error) {
            setApiError(error.response?.data?.message ?? error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <p className="auth-eyebrow">Account login</p>
                <h1>Welcome back.</h1>
                <p className="auth-sub">Enter your details below to access your account.</p>

                <form className="form" onSubmit={login} noValidate>

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

                    <div>
                        <div className={`field ${errors.password ? 'field--error' : ''}`}>
                            <span className="field__icon"><LockIcon /></span>
                            <div className="field__body">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
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

                    {apiError && <p className="auth-alert" role="alert">{apiError}</p>}

                    <button className="btn" type="submit" disabled={submitting}>
                        {submitting ? 'Signing in…' : 'Sign in to account'}
                    </button>
                </form>

                <p className="auth-alt">
                    Don't have an account? <Link to="/signup">SIGN UP</Link>
                </p>

                <div className="auth-foot">
                    <LockIcon />
                    <span>Your connection is encrypted and secure.</span>
                </div>
            </div>
        </main>
    );
};

export default Login;