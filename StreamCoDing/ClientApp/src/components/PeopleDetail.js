import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Chart } from 'react-chartjs-2'
import { Chart as ChartJS } from 'chart.js/auto'
function PeopleDetail() {
    const { id } = useParams();
    const [leetcode, leetcode_setter] = React.useState({ ranking:0,easy: 0, medidum: 0, hard: 0, acceptance: 0, submission_date: [], submission_amt: [] })
    React.useEffect(() => {
        fetch(`https://leetcode-stats-api.herokuapp.com/${id}`)
            .then(res => res.json())
            .then(data => {
                let s_d = []
                let s_a = []
                for (let key in data.submissionCalendar) {
                    const date = new Date(key * 1000)
                    const d = date.toLocaleDateString("en-GB")
                    s_d.push(d)
                    s_a.push(data.submissionCalendar[key])
                }
                leetcode_setter({
                    ranking:data.ranking,
                    easy: data.easySolved,
                    medium: data.mediumSolved,
                    hard: data.hardSolved,
                    acceptance: data.acceptanceRate,
                    submission_date: s_d,
                    submission_amt: s_a
                })
            })
    }, [leetcode.easy + leetcode.medidum + leetcode.difficult])

    //console.log(leetcode)
    const leetcode_submission = {
        labels: leetcode.submission_date,
        datasets: [
            {
                type: 'line',
                label: "leetcode submission",
                data: leetcode.submission_amt,
                fill: false,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)"

            }
        ],
        options: {
            scales: {
                tick: {
                    color: "rgba(255,255,255,1)"
        }

            }
        }
    };
    return (
        <div>
            <h2>{id}</h2>
            <h5> Ranking: {leetcode.ranking} </h5>
            <h5> Acceptance Rate: {leetcode.acceptance} </h5>
            <h5> Easy: {leetcode.easy} </h5>
            <h5> Medium: {leetcode.medium} </h5>
            <h5> Hard: {leetcode.hard} </h5>
            <Chart data={leetcode_submission} />
            {/* Render other details of the problem */}
        </div>
    );
}

export default PeopleDetail;
