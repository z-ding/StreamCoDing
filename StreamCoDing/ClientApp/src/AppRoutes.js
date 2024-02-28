import Counter from "./components/Counter";
import { FetchData } from "./components/FetchData";
import Home from "./components/Home";
import ProblemDetail from "./components/ProblemDetail"; // Import ProblemDetail component

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
    key: 'fetch-data',
    path: '/fetch-data',
    element: <FetchData />
   },
    {
    key: 'problem-detail',
    path: '/problem/:id', // Define route for problem details
    element: <ProblemDetail />
    }
];

export default AppRoutes;
