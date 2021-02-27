import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useStoreActions } from 'easy-peasy';

import { Modal, Tabs, Tab, Button } from 'react-bootstrap';
import classes from "../AuthenticationModal/AuthenticationModal.module.scss";
import { auth } from '../../firebase';


const AuthenticationModal = (props) => {

    const history = useHistory();

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

    const login = useStoreActions(actions => actions.user.login);

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

    return (
        <Modal.Dialog>
            <Modal.Header className={classes.Modal}>
                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" className={classes.Tabs}>
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
                            <form onSubmit={() => console.log('Registering...')}>
                                <div className={classes.FieldWrapper}>
                                    <label>Email: </label>
                                    <input type="text"/>
                                </div>
                                <div className={classes.FieldWrapper}>
                                    <label>Password: </label>
                                    <input type="password"/>
                                </div>
                                <div className={[classes.FieldWrapper, classes.ConfirmPassword].join(' ')}>
                                    <label>Confirm Password: </label>
                                    <input type="password"/>
                                </div>
                                <div className={classes.BtnWrapper}>
                                    <Button type="submit" variant="success">Register</Button>
                                </div>
                            </form>
                        </div>
                    </Tab>
                </Tabs>
            </Modal.Header>
        </Modal.Dialog>
    );
};

export default AuthenticationModal;
