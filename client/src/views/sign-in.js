import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';


const Signin = props => {
	const { 
		validator, 
		errorHandler,
		setToThisView
	} = props.tools;

	const [user, setUser] = React.useState({ username: '', password: '' });
	const [signingIn, setSigningIn] = React.useState( false );
	const [btnMsg, setBtnMsg] = React.useState('sign me in');
	const [errMsg, setErrMsg] = React.useState( null );

	const setUsername = e => {
		setUser(user => ({
			username: e.target.value,
			password: user.password
		}));
	}

	const setPassword = e => {
		setUser(user => ({
			username: user.username,
			password: e.target.value
		}));
	}

	const signIn = async () => {
		axios.post('http://localhost:3500/sign-in', user)
		.then( res => {
			const { accessToken, refreshToken } = res.data;

			Cookies.set('token', accessToken);
			Cookies.set('rtoken', refreshToken);
		
			setToThisView('/dashboard');
		})
		.catch( err => {
			if( err?.response?.status === 403 ){
				setErrMsg( err?.response?.data?.message );
			}
			else{
				errorHandler.handle( err, signIn, 2 );
			}
			
			setSigningIn( false );
			setBtnMsg('sign me in');
		});
	}

	React.useEffect(() => {
		if( signingIn && user.username.length && user.password.length ){
			setBtnMsg('loading');
			signIn();
		}
		else if( signingIn && (!user.username.length || !user.password) ){
			setErrMsg('Either username or password is empty!');
			setSigningIn( false );
		}

	}, [user, signingIn]);

	React.useEffect(() => {
		if( errMsg ){ 
			setTimeout(() => setErrMsg( null ), 2000);
		}
	}, [errMsg]);

	return(
		<div className="sign-in d-flex flex-column justify-content-center align-items-center">
			{
				errMsg 
					? <Alert variant="outlined" severity="error">
						{ errMsg }
					</Alert> 
					: null
			}
			<div className="d-flex justify-content-center">
				<Typography 
					variant="h3" 
					sx={{ 
						color: 'rgba(0, 0, 0, 0.4)', 
						fontFamily: 'Poppins',
						letterSpacing: '5px'
					}}
				>
					SIGN-IN
				</Typography>
			</div>
			<br/>
			<div 
				style={{
					width: '90%',
					height: '30%'
				}} 
				className="d-flex flex-column justify-content-around align-items-center"
			>
				<TextField onChange={setUsername} id="sign-in-uname" label="username" variant="standard" />
				<TextField onChange={setPassword} id="sign-in-pass" label="password" type="password" variant="standard" />
				<div className="d-flex flex-row justify-content-between align-items-center"> 
					<Button 
						onClick={() => setSigningIn( true )} 
						disabled={ btnMsg === 'loading' ? true : false } 
						sx={{borderColor: 'black', color: 'black'}} 
						variant="outlined"
					> 
						{ btnMsg } 
					</Button>
					<Button sx={{ color: 'white' }} href="/sign-up">Sign-up?</Button>
				</div>
			</div>			
		</div>
	);
}

export default Signin;