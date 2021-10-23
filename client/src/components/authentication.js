import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Redirect } from 'react-router-dom';


/* =======================================
+
+	This authenticates the user,
+	hence every view request will 
+	go here first for authentication
+	then act accordingly.
+
==========================================*/

const Authentication = props => {
	const { errorHandler } = props;

	const [allow, setAllow] = React.useState( false );
	const [responseView, setResponseView] = React.useState( null );

	React.useEffect(() => {
		const token = Cookies.get('token');

		const runAuth = async () => {
			axios.get('/validate-user', {
				headers: {
					'authentication': `Bearer ${ token }`
				}
			})
			.then( res => setAllow(() => true ))
			.catch( err => {
				errorHandler( err );
				setAllow(() => false);
			});	
		}

		runAuth();
	}, []);

	React.useEffect(() => {
		if( allow ){
			setResponseView(() => <> { props.children } </>);
		}
		else{
			setResponseView(() => <Redirect to="/auth"/>);
		}
	}, [allow]);

	return (
		<> 
			{ responseView ?? <Loading/> }
		</>
	);
}


const Loading = () => <h1> LOADING 2 </h1>

export default Authentication;