import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';


const Signup = props => {
	const { 
		validator, 
		errorHandler,
		setToThisView
	} = props.tools;

	const [user, setUser] = React.useState({ 
		username: '', 
		password: '',
		confPass: '',
		masterPass: ''
	});
	const [signingUp, setSigningUp] = React.useState( false );
	const [btnMsg, setBtnMsg] = React.useState('sign me up');
	const [errMsg, setErrMsg] = React.useState( null );

	const setUsername = e => {
		setUser(user => ({
			username: e.target.value,
			password: user.password,
			confPass: user.confPass,
			masterPass: user.masterPass
		}));
	}

	const setPassword = e => {
		setUser(user => ({
			username: user.username,
			password: e.target.value,
			confPass: user.confPass,
			masterPass: user.masterPass
		}));
	}
	
	const setConfPassword = e => {
		setUser(user => ({
			username: user.username,
			password: user.password,
			confPass: e.target.value,
			masterPass: user.masterPass
		}));
	}

	const setMasterPassword = e => {
		setUser(user => ({
			username: user.username,
			password: user.password,
			confPass: user.confPass,
			masterPass: e.target.value
		}));
	}

	const signUp = async () => {

		validator.validate( user.username, 'username' );
		if( validator.message ){ 
			setBtnMsg('sign me up');
			setSigningUp( false );

			return setErrMsg( "Username: " + validator.message );
		}
		
		validator.validate( user.password, 'password' );
		if( validator.message ){ 
			setBtnMsg('sign me up');
			setSigningUp( false );

			return setErrMsg( "Password: " + validator.message );
		}

		if( user.password.length && user.confPass.length && user.password !== user.confPass ){
			setBtnMsg('sign me up');
			setSigningUp( false );

			return setErrMsg('Passwords did not match');
		}

		axios.post('http://localhost:3500/sign-up', user)
		.then( res => {
			const { accessToken, refreshToken } = res.data;

			Cookies.set('token', accessToken);
			Cookies.set('rtoken', refreshToken);

			setToThisView('/dashboard');
		})
		.catch( err => {
			if( err?.response?.status === 403 ){
				setErrMsg( err?.response?.data?.message ?? null );
			}
			else{
				errorHandler?.handle?.( err, signUp, 1 );
			}

			setSigningUp( false );
			setBtnMsg('sign me up');
		});
	}

	React.useEffect(() => {
		if( signingUp ){
			setBtnMsg('loading');
			signUp();
		}
	}, [user, signingUp]);

	React.useEffect(() => {
		if( errMsg ){ 
			setTimeout(() => setErrMsg( null ), 2000);
		}
	}, [errMsg]);

	return(
		<div className="sign-up d-flex flex-column justify-content-center align-items-center">
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
					SIGN-UP
				</Typography>
			</div>
			<br/>
			<div 
				style={{
					width: '90%',
					height: '50%'
				}} 
				className="d-flex flex-column justify-content-between align-items-center"
			>
				<TextField onChange={setUsername} id="sign-in-uname" label="username" variant="standard" />
				<TextField onChange={setPassword} id="sign-in-pass" label="password" type="password" variant="standard" />
				<TextField onChange={setConfPassword} id="sign-in-confpass" label="confirm-password" type="password" variant="standard" />
				<TextField onChange={setMasterPassword} id="sign-in-mpass" label="master-password" type="password" variant="standard" />
				<br/>
				<br/>
				<div className="d-flex flex-row justify-content-between align-items-center"> 
					<Button 
						onClick={() => setSigningUp(() => true)} 
						disabled={ btnMsg === 'loading' ? true : false } 
						sx={{borderColor: 'black', color: 'black'}} 
						variant="outlined"
					> 
						{ btnMsg } 
					</Button>
					<Button sx={{ color: 'white' }} href="/sign-in">Sign-in?</Button>
				</div>
			</div>			
		</div>
	);
}

export default Signup;