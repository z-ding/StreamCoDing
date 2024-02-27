import React, { Component } from 'react';

const Home = () => {
  const[problem, problem_setter] = React.useState([])
  React.useEffect(() => {
      fetch("https://localhost:7011/items/")
        .then(res => res.json())
        .then(data => {
            problem_setter(data)
        })
  }, [])
console.log(problem)
 
    return (
      <div>
        <h1>Welcome to StreamCoDing!</h1>
        <p> Happy Grinding ~_~</p>
        <ul>
          <li><a href='https://get.asp.net/'>ASP.NET Core</a> and <a href='https://msdn.microsoft.com/en-us/library/67ef8sbd.aspx'>C#</a> for cross-platform server-side code</li>
          <li><a href='https://facebook.github.io/react/'>React</a> for client-side code</li>
          <li><a href='http://getbootstrap.com/'>Bootstrap</a> for layout and styling</li>
        </ul>
        <p>Below are some sample problems in our database:</p>
        <ul>
            {problem.map(item => (
                <li key={item.id}>{item.name}</li>
            ))}
        </ul>       
        <p>The <code>ClientApp</code> subdirectory is a standard React application based on the <code>create-react-app</code> template. If you open a command prompt in that directory, you can run <code>npm</code> commands such as <code>npm test</code> or <code>npm install</code>.</p>
      </div>
    );
  
}

export default Home;
