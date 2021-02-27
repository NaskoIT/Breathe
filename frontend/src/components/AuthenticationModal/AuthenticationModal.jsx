import {useEffect, useState} from "react";
import { useHistory } from "react-router-dom";
import { useStoreActions } from 'easy-peasy';

import { Modal, Tabs, Tab, Button } from 'react-bootstrap';
import classes from "../AuthenticationModal/AuthenticationModal.module.scss";
import { auth } from '../../firebase';


const AuthenticationModal = (props) => {

    const history = useHistory();

    const [activeTab, setActiveTab] = useState('login');

    useEffect(() => {
        setActiveTab(history.location.search?.substring(1));
    }, [history.location.search]);

    const selectTab = (tabName) => {
        setActiveTab(tabName);
    }
    
    const [loginValues, setLoginValues] = useState({
        email: '',
        password: ''
    });

    const [registerValues, setRegisterValues] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errorMessage, setErrorMessage] = useState('');

    const login = useStoreActions(actions => actions.userStore.login);
    const register = useStoreActions(actions => actions.userStore.register);

    const onInput = (e, fieldType) => {
        const inputName = e.target.name;
        const value = e.target.value;

        if (fieldType === 'login') {
            setLoginValues({
                ...loginValues,
                [inputName]: value,
            });
        } else {
            setRegisterValues({
                ...registerValues,
                [inputName]: value,
            });
        };
    }

    const onLogin = (e) => {
        e.preventDefault();
        const { email, password } = loginValues;

        auth.signInWithEmailAndPassword(email, password)
            .then(async (userCredential) => {
                const { email, displayName, uid, refreshToken } = userCredential.user;
                await login({email, displayName, uid, refreshToken, isLoggedIn: true});
                history.push('/');
            })
            .catch((error) => {
                const errorMessage = error.message;
                setErrorMessage(errorMessage);
            });
    };

    const onRegister = (e) => {
        e.preventDefault();
        const { email, password, confirmPassword } = registerValues;

        if (password !== confirmPassword) {
            setErrorMessage("Passwords don't match!");
            e.target.reset();
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then(async (userCredential) => {
                const { email, displayName, uid, refreshToken } = userCredential.user;
                await register({email, displayName, uid, refreshToken, isLoggedIn: true});
                history.push('/');
            })
            .catch((error) => {
                const errorMessage = error.message;
                setErrorMessage(errorMessage);
            });
    };

    return (
        <Modal.Dialog>
            <Modal.Header className={classes.Modal}>
                <Tabs activeKey={activeTab ? activeTab : 'login'} className={classes.Tabs} onSelect={selectTab}>
                    <Tab eventKey="login" title="Login" tabClassName={[classes.Tab, classes.LoginTab].join(' ')}>
                        <div className={classes.LoginForm}>
                            <form onSubmit={onLogin}>
                                <div className={classes.FieldWrapper}>
                                    <label>Email: </label>
                                    <input type="text" name="email" value={loginValues.email} onChange={(e) => onInput(e, 'login')}/>
                                </div>
                                <div className={classes.FieldWrapper}>
                                    <label>Password: </label>
                                    <input type="password" name="password" value={loginValues.password} onChange={(e) => onInput(e, 'login')}/>
                                </div>
                                <div className={classes.BtnWrapper}>
                                    <Button type="submit" variant="success">Login</Button>
                                </div>

                                <p>{errorMessage}</p>
                            </form>
                        </div>
                    </Tab>
                    <Tab eventKey="register" title="Register" tabClassName={[classes.Tab, classes.RegisterTab].join(' ')}>
                        <div className={classes.RegisterForm}>
                            <form onSubmit={onRegister}>
                                <div className={classes.FieldWrapper}>
                                    <label>Email: </label>
                                    <input type="text" name="email" value={registerValues.email} onChange={(e) => onInput(e, 'register')}/>
                                </div>
                                <div className={classes.FieldWrapper}>
                                    <label>Password: </label>
                                    <input type="password" name="password" value={registerValues.password} onChange={(e) => onInput(e, 'register')}/>
                                </div>
                                <div className={[classes.FieldWrapper, classes.ConfirmPassword].join(' ')}>
                                    <label>Confirm Password: </label>
                                    <input type="password" name="confirmPassword" value={registerValues.confirmPassword} onChange={(e) => onInput(e, 'register')}/>
                                </div>
                                <div className={classes.BtnWrapper}>
                                    <Button type="submit" variant="success">Register</Button>
                                </div>

                                <p>{errorMessage}</p>
                            </form>
                        </div>
                    </Tab>
                </Tabs>
            </Modal.Header>
        </Modal.Dialog>
    );
};

export default AuthenticationModal;
