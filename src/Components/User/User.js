import React, {useState, useEffect, useHistory} from 'react';
import {BrowserRouter,Routes,Route,Link,Navigate, useNavigate} from 'react-router-dom';
import { FaUser,FaLock, FaLessThanEqual } from "react-icons/fa";
import './User.css';
import { login, register, resetPass, getScannedUser, getScannedItems } from '../../DB/DB.js';
import {NavBar, Home} from '../Home/Home.js';

export const Register = () => {
    const [fname, setFirstname] = useState('');
    const [lname, setLastname] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState(false);

    var admin = "0";
    var epc = "*";

    var errMessage = "unable to create account";

    const navigate = useNavigate();

    const submitReg = (event) => {
        event.preventDefault();
        register(username.trim(), password, fname.trim(), lname.trim(), epc, admin).then(user => {
            if(user === "email already in use.") {
                setErr(true);
            } else {
                localStorage.setItem("User",user);
                navigate("/");
                window.location.reload();
            }
        });
    }

    const setFname = (event) => {
        setFirstname(event.target.value);
    }

    const setLname = (event) => {
        setLastname(event.target.value);
    }

    const setUser = (event) => {
        setUsername(event.target.value);
    }

    const setPass = (event) => {
        setPassword(event.target.value);
    }
    return (
        <div className="login-box">
            <form action="" onSubmit={submitReg}>
            <h1>Register</h1>
            <div className="user-input">
                <input type="text" value={fname} onChange={setFname} placeholder="First Name" required/>
            </div>
            <div className="user-input">
                <input type="text" value={lname} onChange={setLname} placeholder="Last Name" required/>
            </div>
            <div className="user-input">
                <input type="email" value={username} onChange={setUser} placeholder="Username/Email" required/>
            </div>
            <div className="user-input">
                <input type="password" value={password} onChange={setPass} placeholder="Password" required/>
            </div>
            <button type="submit">Register</button>
            <div className="register-link">
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
            <div className="error-message">{err && errMessage}</div>
            </form>
        </div>
    )
}

export const LogIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState(false);
    var errMessage = "invalid login credentials";
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            getScannedUser().then(user => {
                if(user !== "no user scanned") {
                    localStorage.setItem("User",user);
                    navigate("/");
                    window.location.reload();
                }
            })
        },2000)

        return () => clearInterval(interval);
    });
    
    const submitLogin = (event) => {
        event.preventDefault();
        login(username.trim(), password).then(user => {
            if(user === "no user found") {
                setErr(true);
            } else {
                localStorage.setItem("User",user);
                navigate("/");
            }
        }).then(() => {
            window.location.reload();
        });
    }

    const setUser = (event) => {
        setUsername(event.target.value);
    }

    const setPass = (event) => {
        setPassword(event.target.value);
    }

    return (
        <div className="login-box">
            <form action="" onSubmit={submitLogin}>
            <h1>Login</h1>
            <div className="user-input">
                <input type="email" value={username} onChange={setUser} placeholder="Username/Email" required/>
                <FaUser className="icon"/>
            </div>
            <div className="user-input">
                <input type="password" value={password} onChange={setPass} placeholder="Password" required/>
                <FaLock className="icon"/>
            </div>
            <div className="resetPass">
                <a href="/reset-pass">Password Reset?</a>
            </div>
            <button type="submit">Login</button>
            <div className="register-link">
                <p>Don't have an account? Register <Link to="/register">here</Link></p>
            </div>
            <div className="error-message">{err && errMessage}</div>
            </form>
        </div>
    )
}

export const LogOut = () => {
    const navigate = useNavigate();
    useEffect(() => {
        if(localStorage.getItem("User") === null) {
          navigate("/login");
          window.location.reload();
        } 
    },[]);
    useEffect(() => {
        localStorage.removeItem("User");
        window.location.reload();
        navigate("/login");
    },[])
    return (
        <div>
        </div>
    )
}

export const ResetPassword = () => {
    const [username, setUsername] = useState('');
    const [oldPassword, setOldPass] = useState('');
    const [newPassword, setNewPass] = useState('');
    const [err, setErr] = useState(false);
    var errMessage = "invalid username and current password";

    const navigate = useNavigate();

    const submitReset = (event) => {
        event.preventDefault();
        login(username.trim(), oldPassword).then(user => {
            if(user === "no user found") {
                setErr(true);
            } 
            else {
                resetPass(username.trim(), newPassword).then(user => {
                    localStorage.setItem("User", user);
                    navigate("/");
                }).then(() => {
                    window.location.reload();
                });;
            }
        })          
    }
    
    const setUser = (event) => {
        setUsername(event.target.value);
    }
    const setOld = (event) => {
        setOldPass(event.target.value);
    }
    const setNew = (event) => {
        setNewPass(event.target.value);
    }

    return (
        <div className="login-box">
            <form action="" onSubmit={submitReset}>
            <h1>Reset Password</h1>
            <div className="user-input">
                <input type="email" value={username} onChange={setUser} placeholder="Username/Email" required/>
                <FaUser className="icon"/>
            </div>
            <div className="user-input">
                <input type="password" value={oldPassword} onChange={setOld} placeholder="Current Password" required/>
                <FaLock className="icon"/>
            </div>
            <div className="user-input">
                <input type="password" value={newPassword} onChange={setNew} placeholder="New Password" required/>
                <FaLock className="icon"/>
            </div>
            <button type="submit">Reset Password</button>
            <div className="register-link">
                <p>Back to <Link to="/login">login</Link> or <Link to="/register">register</Link></p>
            </div>
            <div className="error-message">{err && errMessage}</div>
            </form>
        </div>
    )
}

