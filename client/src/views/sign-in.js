import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

import Input from '@mui/material/Input';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

const Signin = props => {
	const { 
		validator, 
		errorHandler,
		setToThisView
	} = props.tools;

	const [user, setUser] = React.useState({ username: '', password: '', showPassword: false });
	const [signingIn, setSigningIn] = React.useState( false );
	const [btnMsg, setBtnMsg] = React.useState('sign me in');
	const [errMsg, setErrMsg] = React.useState( null );

	const setUsername = e => {
		setUser(user => ({
			username: e.target.value,
			password: user.password,
			showPassword: user.showPassword
		}));
	}

	const setPassword = e => {
		setUser(user => ({
			username: user.username,
			password: e.target.value,
			showPassword: user.showPassword
		}));
	}

	const handleClickShowPassword = () => {
		setUser({
		  ...user,
		  showPassword: !user.showPassword,
		});
	};

	const handleMouseDownPassword = event => {
		event.preventDefault();
	};

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
					width: '100%',
					height: '30%'
				}} 
				className="d-flex flex-column justify-content-around align-items-center"
			>
				<TextField sx={{width: '25ch'}} onChange={setUsername} id="sign-in-uname" label="username" variant="standard" />
				<FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
					<InputLabel htmlFor="sign-in-pass">Password</InputLabel>
					<Input 
						id="sign-in-pass" 
						variant="standard" 
						type={ user.showPassword ? "text" : "password" }
						value={ user.password } 
						onChange={setPassword} 
						endAdornment={
			              <InputAdornment position="end">
			                <IconButton
			                  aria-label="toggle password visibility"
			                  onClick={handleClickShowPassword}
			                  onMouseDown={handleMouseDownPassword}
			                  edge="end"
			                >
			                  { user.showPassword ? <VisibilityOff /> : <Visibility /> }
			                </IconButton>
			              </InputAdornment>
			            }
					/>
				</FormControl>
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