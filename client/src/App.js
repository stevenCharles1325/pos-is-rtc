import React from 'react';
import { Route, Switch } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

import Validator from './modules/validator';
import ErrorHandler from './modules/error-handler';
import PageNotFound from './views/pagenotfound';

const Authentication = React.lazy(() => import('./components/authentication'));
const Checkpoint = React.lazy(() => import('./components/checkpoint'));
const Dashboard = React.lazy(() => import('./views/dashboard'));
const Inventory = React.lazy(() => import('./views/inventory'));
const Signin = React.lazy(() => import('./views/sign-in'));
const Signup = React.lazy(() => import('./views/sign-up'));


const ROOT = '/';
const VIEWS = [
  ROOT,                   // 0
  `${ROOT}auth`,          // 1
  `${ROOT}auth/sign-up`,  // 2
  `${ROOT}auth/sign-in`,  // 3
  `${ROOT}inventory`,     // 4
  `${ROOT}dashboard`      // 5
];

const validator = new Validator();
const errorHandler = new ErrorHandler();

function App() {
  const path = new Path( window.location.pathname );
  const [view, setView] = React.useState( null );

  const tools = { validator, errorHandler };

  React.useEffect(() => {
    if( !path.exist() ){
      setView(() => path.notFound());
    }
  }, []);

  return (
    <div className="App">
      <React.Suspense fallback={<Loading/>}>
        <Switch>

          <Route path="/auth">
            <Switch>
              <Checkpoint>
                <Route path="/auth/sign-in">
                  <Signin tools={tools}/>
                </Route>

                <Route path="/auth/sign-up">
                  <Signup tools={tools}/>
                </Route>
              </Checkpoint>
            </Switch>
          </Route>

          <Authentication>
            <Route exact path="/inventory">
              <Inventory tools={tools}/>
            </Route>

            <Route exact path="/dashboard">
              <Dashboard tools={tools}/>
            </Route>
          </Authentication>

        </Switch>
      </React.Suspense>

      { view }
    </div>
  );
}

const Loading = () => <h1> LOADING </h1>

function Path( pathname ){
  if( !pathname ) 
    console.warn('[Line 45 - Admin]: No given pathname');

  this.pathname = pathname;

  this.home = () => {
    this.pathname = VIEWS[ 5 ];

    return this.pathname;
  }

  this.exit = () => {
    this.pathname = VIEWS[ 3 ];

    return this.pathname;
  }

  this.kick = () => {
    this.pathname = VIEWS[ 3 ];

    return this.pathname;
  }
  
  this.exist = () => {
    return VIEWS.includes( this.pathname );
  };

  this.isRoot = () => {
    return this.pathname === ROOT;  
  }

  this.notFound = () => <PageNotFound />;

  this.isSignUpPath = () => {
    return ( VIEWS.indexOf( this.pathname ) === 2
      ? true
      : false
    );
  };

  this.isSignInPath = () => {
    return ( VIEWS.indexOf( this.pathname ) === 3
      ? true
      : false
    );
  };
} 

export default App;
