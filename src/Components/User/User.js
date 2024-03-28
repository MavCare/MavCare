import React, {useState, useEffect} from 'react';
import {BrowserRouter,Routes,Route,Link,Navigate, useNavigate} from 'react-router-dom';
import { FaUser,FaLock } from "react-icons/fa";
import './User.css';
import { login, register, resetPass } from '../../DB/DB.js';
import {NavBar, Home} from '../Home/Home.js';

export const Register = () => {
    return (
        <div>
            <h2>Registration Page</h2>
        </div>
    )
}

export const LogIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    var errMessage = "";
    
    const submitLogin = (event) => {
        event.preventDefault();
        login(username.trim(), password).then(user => {
            if(user === "no user found") {
                errMessage = user;
            } else {
                localStorage.setItem("User",user);
                <Navigate to="/"/>;
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
                <input type="text" value={username} onChange={setUser} placeholder="Username/Email" required/>
                <FaUser className="icon"/>
            </div>
            <div className="user-input">
                <input type="text" value={password} onChange={setPass} placeholder="Password" required/>
                <FaLock className="icon"/>
            </div>
            <div className="resetPass">
                <a href="/reset-pass">Password Reset?</a>
            </div>
            <button type="submit">Login</button>
            <div className="register-link">
                <p>Don't have an account? Register <Link to="/register">here</Link></p>
            </div>
            </form>
            <div>
            </div>
        </div>
    )
}

export const LogOut = () => {
    localStorage.removeItem("User");
    return (
        <div>
            <LogIn></LogIn>
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

