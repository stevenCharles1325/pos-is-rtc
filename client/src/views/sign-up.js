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
		masterPass: '',
		showPassword: false,
		showMasterPassword: false
	});
	const [signingUp, setSigningUp] = React.useState( false );
	const [btnMsg, setBtnMsg] = React.useState('sign me up');
	const [errMsg, setErrMsg] = React.useState( null );

	const setUsername = e => {
		setUser(user => ({
			username: e.target.value,
			password: user.password,
			confPass: user.confPass,
			masterPass: user.masterPass,
			showPassword: user.showPassword,
			showMasterPassword: user.showMasterPassword
		}));
	}

	const setPassword = e => {
		setUser(user => ({
			username: user.username,
			password: e.target.value,
			confPass: user.confPass,
			masterPass: user.masterPass,
			showPassword: user.showPassword,
			showMasterPassword: user.showMasterPassword
		}));
	}
	
	const setConfPassword = e => {
		setUser(user => ({
			username: user.username,
			password: user.password,
			confPass: e.target.value,
			masterPass: user.masterPass,
			showPassword: user.showPassword,
			showMasterPassword: user.showMasterPassword
		}));
	}

	const setMasterPassword = e => {
		setUser(user => ({
			username: user.username,
			password: user.password,
			confPass: user.confPass,
			masterPass: e.target.value,
			showPassword: user.showPassword,
			showMasterPassword: user.showMasterPassword
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

	const handleClickShowMasterPassword = () => {
		setUser({
		  ...user,
		  showMasterPassword: !user.showMasterPassword,
		});
	};

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
				<TextField sx={{width: '25ch'}} onChange={setUsername} id="sign-in-uname" label="username" variant="standard" />
				<PasswordInput
					id="sign-in-pass"
					label="Password"
					show={ user.showPassword }
					value={ user.password }
					onChange={ setPassword }
					onClick={ handleClickShowPassword }
					onMouseDown={ handleMouseDownPassword }
				/>
				<TextField sx={{width: '25ch'}} onChange={setConfPassword} id="sign-in-confpass" label="confirm-password" type="password" variant="standard" />
				<PasswordInput
					id="sign-in-mpass"
					label="Master password"
					show={ user.showMasterPassword }
					value={ user.masterPassword }
					onChange={ setMasterPassword }
					onClick={ handleClickShowMasterPassword }
					onMouseDown={ handleMouseDownPassword }
				/>
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


const PasswordInput = props => (
	<FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
		<InputLabel htmlFor={ props.id }> { props.label } </InputLabel>
		<Input 
			id={ props.id } 
			variant="standard" 
			type={ props.show ? "text" : "password" }
			value={ props.value } 
			onChange={ props.onChange } 
			endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={ props.onClick }
                  onMouseDown={ props.onMouseDown }
                  edge="end"
                >
                  { props.show ? <VisibilityOff /> : <Visibility /> }
                </IconButton>
              </InputAdornment>
            }
		/>
	</FormControl>
)

export default Signup;