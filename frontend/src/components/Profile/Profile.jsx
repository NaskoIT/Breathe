import React from 'react';
import { useStoreState } from 'easy-peasy';
import { Bar, Pie } from 'react-chartjs-2';

import classes from "./Profile.module.scss";
import { ProgressBar } from "react-bootstrap";

const Profile = (props) => {

    const { email } = useStoreState(store => store.userStore);

    const barChartData = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [
            {
                label: 'Weekly Contribution',
                backgroundColor: 'rgba(89, 125, 53, 0.2)',
                borderColor: 'rgba(89, 125, 53, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(89, 125, 53, 0.4)',
                hoverBorderColor: 'rgba(89, 125, 53, 1)',
                data: [65, 59, 80, 81, 56, 55, 40]
            }
        ]
    };

    const pieChartData = {
        labels: [
            '0.2',
            '0.4',
            '0.6',
            '0.8',
            '1'
        ],
        datasets: [{
            data: [18, 12, 23, 34, 13],
            backgroundColor: [
                'rgba(0, 204, 0, 0.8)',
                'rgba(51, 153, 0, 0.8)',
                'rgba(102, 102, 0, 0.8)',
                'rgba(153, 51, 0, 0.8)',
                'rgba(204, 0, 0, 0.8)'
            ],
            hoverBackgroundColor: [
                'rgba(0, 204, 0, 1)',
                'rgba(51, 153, 0, 1)',
                'rgba(102, 102, 0, 1)',
                'rgba(153, 51, 0, 1)',
                'rgba(204, 0, 0, 1)'
            ]
        }]
    };

    return (
        <div className={classes.ProfileContainer}>
            <div className={classes.Header}>
                <h3>{`Hi, ${email.split('@')[0]}`}</h3>

                <p>Daily Points: <span>0</span></p>
            </div>

            <div className={classes.Progress}>
                <p>Your level: <span>5</span></p>
                <ProgressBar className={classes.Bar} striped animated variant="success" now={63} label={`63%`} />
            </div>

            <div className={classes.Stats}>
                <h2>Contribution Stats</h2>

                <div className={classes.ChartsContainer}>
                    <div>
                        <Bar
                            data={barChartData}
                            width={100}
                            height={50}
                            options={{
                                maintainAspectRatio: false
                            }}
                        />
                    </div>
                    <div>
                        <Pie data={pieChartData} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
