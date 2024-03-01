import React, { Component } from 'react';
import { Link } from 'react-router-dom'

const Home = () => {
  const[problem, problem_setter] = React.useState([])
  React.useEffect(() => {
      fetch("https://localhost:7011/items/")
        .then(res => res.json())
        .then(data => {
            problem_setter(data)
        })
  }, [])

  //users that want to join lc dashboard
    const [people, people_setter] = React.useState([])
    React.useEffect(() => {
        fetch("https://localhost:7011/people/")
            .then(res => res.json())
            .then(data => {
                people_setter(data)
            })
    }, [])

    const handleDelete = (id) => {
        fetch(`https://localhost:7011/items/${id}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    // If deletion is successful, remove the problem from the state
                    problem_setter(problem.filter(problem => problem.id !== id));
                } else {
                    console.error('Failed to delete problem');
                }
            })
            .catch(error => console.error("Error deleting problem:", error));
    };
    return (
      <div>
        <h1>Welcome to StreamCoDing!</h1>
        <p> Happy Grinding ~_~</p>
        <ul>
          <li><a href='https://get.asp.net/'>ASP.NET Core</a> and <a href='https://msdn.microsoft.com/en-us/library/67ef8sbd.aspx'>C#</a> for cross-platform server-side code</li>
          <li><a href='https://facebook.github.io/react/'>React</a> for client-side code</li>
          <li><a href='http://getbootstrap.com/'>Bootstrap</a> for layout and styling</li>
        </ul>      
            <div class="container">
                <div class="left">
                    <p>Below are some sample problems in our database:</p>
                    <ul>
                        {problem.map(item => (
                            <li key={item.id}>
                                <Link to={`/problem/${item.id}`}>
                                    {item.name}
                                </Link>
                                <button className="deleteButton" onClick={() => handleDelete(item.id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div class="right">
                    <p>Leaderboard</p>
                    <ul>
                        {people.map(item => (
                            <li key={item.name}>
                                <Link to={`/people/${item.name}`}>
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        <p>The <code>ClientApp</code> subdirectory is a standard React application based on the <code>create-react-app</code> template. If you open a command prompt in that directory, you can run <code>npm</code> commands such as <code>npm test</code> or <code>npm install</code>.</p>
      </div>
    );
  
}

export default Home;
