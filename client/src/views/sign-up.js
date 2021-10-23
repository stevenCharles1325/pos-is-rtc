import React from 'react';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';


const Signup = props => {
	const { validator, errorHandler } = props.tools;

	const [user, setUser] = React.useState({ 
		username: null, 
		password: null,
		confPass: null 
	});
	const [signingIn, setSigningIn] = React.useState( false );
	const [btnMsg, setBtnMsg] = React.useState('sign me up');

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
	
	const setConfPassword = e => {
		setUser(user => ({
			username: user.username,
			password: user.password,
			confPass: e.target.value
		}));
	}

	const signIn = async () => {
		console.log('Singing up');

		// Do signing request here

		setSigningIn( false );
		setBtnMsg('sign me up')
	}

	React.useEffect(() => {
		if( signingIn ){
			setBtnMsg('loading');
			signIn();
		}
	}, [user, signingIn]);

	return(
		<div className="sign-up d-flex flex-column justify-content-center align-items-center">
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
				<TextField id="sign-in-uname" label="username" variant="standard" />
				<TextField id="sign-in-pass" label="password" type="password" variant="standard" />
				<TextField id="sign-in-confpass" label="confirm-password" type="password" variant="standard" />
				<TextField id="sign-in-mpass" label="master-password" type="password" variant="standard" />
				<br/>
				<br/>
				<div className="d-flex flex-row justify-content-between align-items-center"> 
					<Button 
						onClick={() => setSigningIn( true )} 
						disabled={ btnMsg === 'loading' ? true : false } 
						sx={{borderColor: 'black', color: 'black'}} 
						variant="outlined"
					> 
						{ btnMsg } 
					</Button>
					<Button sx={{ color: 'white' }} href="/auth/sign-in">Sign-in?</Button>
				</div>
			</div>			
		</div>
	);
}

export default Signup;