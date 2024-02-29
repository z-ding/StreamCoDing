import Counter from "./components/Counter";
import  FetchData  from "./components/FetchData";
import Home from "./components/Home";
import ProblemDetail from "./components/ProblemDetail"; // Import ProblemDetail component
import PeopleDetail from "./components/PeopleDetail"; // Import ProblemDetail component

const AppRoutes = [
    {
    key: 'home',
    index: true,
    element: <Home />
  },
    {
    key: 'contribute-prob',
    path: '/ContributeProb',
    element: <Counter />
  },
    {
    key: 'AddMe',
    path: '/AddMe',
    element: <FetchData />
   },
    {
    key: 'problem-detail',
    path: '/problem/:id', // Define route for problem details
    element: <ProblemDetail />
    },
    {
        key: 'people-detail',
        path: '/people/:id', // Define route for problem details
        element: <PeopleDetail />
    }
];

export default AppRoutes;
