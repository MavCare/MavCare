import React, {useState, useEffect} from 'react';
import {BrowserRouter,Routes,Route,Link,Navigate, useNavigate} from 'react-router-dom';
import { FaUser,FaLock } from "react-icons/fa";
import './User.css';
import { login, register, resetPass } from '../../DB/DB.js';
import {NavBar, Home} from '../Home/Home.js';

export const Register = () => {
    const [fname, setFirstname] = useState('');
    const [lname, setLastname] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState(false);

    var errMessage = "unable to create account";

    const submitReg = (event) => {
        event.preventDefault();
        register(username.trim(), password, fname.trim(), lname.trim()).then(user => {
            if(user === "email already in use.") {
                setErr(true);
            } else {
                localStorage.setItem("User",user);
                {<Navigate to="/"/>};
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
            <div>
            </div>
        </div>
    )
}

export const LogIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState(false);
    var errMessage = "invalid login credentials";
    
    const submitLogin = (event) => {
        event.preventDefault();
        login(username.trim(), password).then(user => {
            if(user === "no user found") {
                setErr(true);
            } else {
                localStorage.setItem("User",user);
                {<Navigate to="/"/>};
            }
        });
    }

    const setUser = (event) => {
        setUsername(event.target.value);
    }

    const setPass = (event) => {
        setPassword(event.target.value);
    }

    const toRegister = (event) => {
        return <Navigate to="/register"/>;
    }

    const toPassReset = (event) => {
        return <Navigate to="/reset-pass"/>;
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
            <div>
            </div>
        </div>
    )
}

export const LogOut = () => {
    useEffect(() => {
        localStorage.removeItem("User");
    },[])
    return (
        <div>
            <Navigate to="/login"/>
        </div>
    )
}

export const ResetPassword = () => {
    const [username, setUsername] = useState('');
    const [oldPassword, setOldPass] = useState('');
    const [newPassword, setNewPass] = useState('');
    var errMessage = "";

    const submitPassChange = (event) => {
        event.preventDefault();
        login(username.trim(), oldPassword).then(user => {
            if(user === "no user found") {
                errMessage = user;
            } 
            else {
                resetPass(username.trim(), newPassword).then(user => {
                    localStorage.setItem("User", user);
                });
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
        <div>
            <h2>Reset Password Page</h2>
        </div>
    )
}

