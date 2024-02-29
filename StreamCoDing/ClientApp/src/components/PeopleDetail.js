import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function PeopleDetail() {
    const { id } = useParams();
    const [person, setPerson] = useState(null);

    useEffect(() => {
        fetch(`https://leetcode-stats-api.herokuapp.com/${id}`)
            .then(res => res.json())
            .then(data => {
                setPerson(data);
            })
            .catch(error => console.error("Error fetching problem details:", error));
    }, [id]);

    if (!setPerson) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>{setPerson.name}</h2>
            {/* Render other details of the problem */}
        </div>
    );
}

export default PeopleDetail;
