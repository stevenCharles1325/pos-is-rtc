import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Route, Switch, Redirect } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

import Validator from './modules/validator';
import ErrorHandler from './modules/error-handler';
import PageNotFound from './views/pagenotfound';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

const PurchaseHistory = React.lazy(() => import('./views/purchaseHistory'));
const Accounts = React.lazy(() => import('./views/accounts'));
const Dashboard = React.lazy(() => import('./views/dashboard'));
const Inventory = React.lazy(() => import('./views/inventory'));
const Appbar = React.lazy(() => import('./components/app-bar'));
const Signin = React.lazy(() => import('./views/sign-in'));
// const Signup = React.lazy(() => import('./views/sign-up'));


const ROOT = '/';
const VIEWS = [
  ROOT,              // 0
  `${ROOT}sign-up`,  // 1
  `${ROOT}sign-in`,  // 2
  `${ROOT}inventory`,// 3
  `${ROOT}dashboard`, // 4
  `${ROOT}account`, // 5
  `${ROOT}purchase-history`, // 5
];

const validator = new Validator();
const errorHandler = new ErrorHandler( 5, 5000 );

function App() {
  const path = new Path( window.location.pathname );

  const [name, setName] = React.useState( null );
  const [view, setView] = React.useState( null );
  const [allow, setAllow] = React.useState( null );
  const [role, setRole] = React.useState( null );
  const [search, setSearch] = React.useState( '' );


  const setToThisView = ( viewPath ) => {
    setView(() => <Redirect to={viewPath} />);
    runAuth();
  }

  const tools = { 
    role,
    name,
    search,
    setName,
    setSearch,
    validator, 
    errorHandler, 
    setToThisView, 
  };

  const runAuth = () => {
    const token = Cookies.get('token');
    const rtoken = Cookies.get('rtoken');

    axios.get(`http://${window.address}:${window.port}/verify-me`, {
      headers: {
        'authentication': `Bearer ${ token }`
      }
    })
    .then( res => {
      setName( res.data.user.name );
      setRole( res.data.user.role );
      setAllow(() => true);
    })
    .catch( err => {
      axios.post(`http://${window.address}:${window.port}/auth/refresh-token`, { rtoken })
      .then( res => {
        Cookies.set('token', res.data.accessToken);
        runAuth();
      })
      .catch( err => setAllow(() => false));
    }); 
  }


  React.useEffect(() => {
    setAllow(() => null);
    runAuth();
  }, []);

  React.useEffect(() => {

    if( allow ){
      switch( path.pathname ){
        case '/dashboard':
          setToThisView( path.pathname );
          break;

        case '/inventory':
          setToThisView( path.pathname );
          break;

        case '/item-list':
          setToThisView( path.pathname );
          break;

        default:
          setToThisView( '/dashboard' );
          break;
      }     
      // return setAllow(() => null);
    }
    else if( allow === false ){
      switch( path.pathname ){
        case '/sign-in':
          setToThisView( path.pathname );
          break;

        default:
          setToThisView( '/sign-in' );
          break;
      }
      // return setAllow(() => null);
    }
  }, [allow]);

  React.useEffect(() => {
    if( !path.exist() ){
      setView(() => path.notFound());
    }
  }, []);

  return (
    <SnackbarProvider maxSnack={3}>
      <div className="App">
        <React.Suspense fallback={<Loading/>}>      
          <Switch>
            {
              allow 
                ? (
                    <>
                      <Route exact path="/inventory">
                        <Appbar tools={tools}/>
                        <Inventory tools={tools}/>
                      </Route>

                      <Route exact path="/dashboard">
                        <Appbar tools={tools}/>
                        <Dashboard tools={tools}/>
                      </Route>

                      <Route exact path="/accounts">
                        <Appbar tools={tools}/>
                        <Accounts tools={tools}/>
                      </Route>

                      <Route exact path="/purchase-history">
                        <Appbar tools={tools}/>
                        <PurchaseHistory tools={tools}/>
                      </Route>
                    </>
                  )
                : null
            }

            {
              allow === false 
                ? (
                      <Route path="/sign-in">
                        <Signin tools={tools}/>
                      </Route>
                  )
                : null
            }
          </Switch>
          { view }
        </React.Suspense>
      </div>
    </SnackbarProvider>
  );
}

const Loading = () => (
  <div 
    style={{ width: '100vw', height: '100vh' }} 
    className="d-flex flex-row justify-content-center align-items-center"
  >
    <CircularProgress/>
  </div>
);

function Path( pathname ){
  if( !pathname ) 
    console.warn('[Line 45 - Admin]: No given pathname');

  this.pathname = pathname;

  this.home = () => {
    this.pathname = VIEWS[ 4 ];

    return this.pathname;
  }

  this.exit = () => {
    this.pathname = VIEWS[ 2 ];

    return this.pathname;
  }

  this.kick = () => {
    this.pathname = VIEWS[ 2 ];

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
    return ( VIEWS.indexOf( this.pathname ) === 1
      ? true
      : false
    );
  };

  this.isSignInPath = () => {
    return ( VIEWS.indexOf( this.pathname ) === 2
      ? true
      : false
    );
  };
} 

export default App;
