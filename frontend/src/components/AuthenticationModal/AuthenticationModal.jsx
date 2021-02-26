import { Modal, Tabs, Tab, Button } from 'react-bootstrap';
import classes from "../AuthenticationModal/AuthenticationModal.module.scss";
import {useState} from "react";

const AuthenticationModal = (props) => {

    const [loginValues, setLoginValues] = useState({
        email: '',
        password: ''
    });

    const [registerValues, setRegisterValues] = useState({

    });

    return (
        <Modal.Dialog>
            <Modal.Header className={classes.Modal}>
                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" className={classes.Tabs}>
                    <Tab eventKey="login" title="Login" tabClassName={[classes.Tab, classes.LoginTab].join(' ')}>
                        <div className={classes.LoginForm}>
                            <form>
                                <div className={classes.FieldWrapper}>
                                    <label>Email: </label>
                                    <input type="text"/>
                                </div>
                                <div className={classes.FieldWrapper}>
                                    <label>Password: </label>
                                    <input type="password"/>
                                </div>
                                <div className={classes.BtnWrapper}>
                                    <Button variant="success">Login</Button>
                                </div>
                            </form>
                        </div>
                    </Tab>
                    <Tab eventKey="register" title="Register" tabClassName={[classes.Tab, classes.RegisterTab].join(' ')}>
                        <div className={classes.RegisterForm}>
                            <form>
                                <div className={classes.FieldWrapper}>
                                    <label>Email: </label>
                                    <input type="text"/>
                                </div>
                                <div className={classes.FieldWrapper}>
                                    <label>Password: </label>
                                    <input type="password"/>
                                </div>
                                <div className={classes.FieldWrapper}>
                                    <label>Confirm Password: </label>
                                    <input type="password"/>
                                </div>
                                <div className={classes.BtnWrapper}>
                                    <Button variant="success">Register</Button>
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
