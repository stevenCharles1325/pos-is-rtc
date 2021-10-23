import React from 'react';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';


const Signin = props => {
	const { validator, errorHandler } = props.tools;

	const [user, setUser] = React.useState({ username: null, password: null });
	const [signingIn, setSigningIn] = React.useState( false );
	const [btnMsg, setBtnMsg] = React.useState('sign me in');

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
		console.log('Singing in');

		// Do sign-in request here

		setSigningIn( false );
		setBtnMsg('sign me in')
	}

	React.useEffect(() => {
		if( signingIn && user.username && user.password ){
			setBtnMsg('loading');
			signIn();
		}
	}, [user, signingIn]);

	return(
		<div className="sign-in d-flex flex-column justify-content-center align-items-center">
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
					<Button sx={{ color: 'white' }} href="/auth/sign-up">Sign-up?</Button>
				</div>
			</div>			
		</div>
	);
}

export default Signin;