import React from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

const ChangePassword = props => {
	const [currentPassword, setCurrentPassword] = React.useState( '' );
	const [newPassword, setNewPassword] = React.useState( '' );
	const [repeatPassword, setRepeatPassword] = React.useState( '' );
	const [isCurrentPasswordError, setIsCurrentPasswordError] = React.useState( false );
	const [isChangingSuccess, setIsChangingSuccess] = React.useState( false );

	const checkPasswordValidity = (newPass, repeatPass) => {
		return newPass.length > 7 && newPass === repeatPass;
	}

	const isPasswordValid = React.useMemo(() => checkPasswordValidity( newPassword, repeatPassword ), [newPassword, repeatPassword]);

	const handleSetPassword = type => e => {
		switch( type ){
			case 'current':
				setCurrentPassword( e.target.value );
				break;

			case 'new':
				setNewPassword( e.target.value );
				break;

			case 'repeat':
				setRepeatPassword( e.target.value );
				break;

			default:
				return console.warn('Password type is undefined');
		}
	}

	const handleChangePassword = React.useCallback(() => {
		const token = Cookies.get('token');

		Axios.put(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/change-password/user/${Cookies.get('uname')}`, 
		{ currentPassword, newPassword }, 
		{
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => {
			setIsChangingSuccess( true );
			setCurrentPassword( '' );
			setNewPassword( '' );
			setRepeatPassword( '' );
		})
		.catch( err => {
			setIsCurrentPasswordError( true );
		});

	}, [currentPassword, newPassword]);

	React.useEffect(() => {
		if( isCurrentPasswordError ){
			setTimeout(() => setIsCurrentPasswordError( false ), 2000);
		}
		else if( isChangingSuccess ){
			setTimeout(() => setIsChangingSuccess( false ), 2000);
		}
	}, [isCurrentPasswordError, isChangingSuccess]);

	return(
		<div style={{ width: '100%', height: '100%', padding: '100px 10px 10px 10px', backgroundColor:'transparent' }} className="d-flex flex-column justify-content-around align-items-center">
			{
				isChangingSuccess
					?	<div className="col-5">
							<Alert severity="success">Successfully changed password!</Alert>
						</div>
					: null
			}
			<div className="p-3 d-flex flex-column justify-content-around align-items-center border shadow rounded bg-white" style={{ width: '100%', height: '70%', minHeight: '300px', maxHeight: '500px', minWidth: '300px', maxWidth: '500px' }}>
				<TextField 
					value={currentPassword} 
					type="password" 
					label="Current password" 
					variant="standard" 
					error={isCurrentPasswordError}
					helperText={isCurrentPasswordError ? 'Incorrect Password' : null}
					onChange={handleSetPassword('current')}
				/>
				<div className="w-100">
					<Divider variant="middle"/>
				</div>
				<TextField 
					value={newPassword} 
					type="password" 
					label="New password" 
					variant="standard" 
					onChange={handleSetPassword('new')}
				/>
				<TextField 
					value={repeatPassword} 
					type="password" 
					label="Repeat password" 
					variant="standard" 
					onChange={handleSetPassword('repeat')}
					error={!isPasswordValid && !!repeatPassword.length}
					helperText={!isPasswordValid && !!repeatPassword.length ? 'Password did not match' : null}
				/>
				<Button variant="outlined" disabled={!isPasswordValid} onClick={handleChangePassword}>
					Change password
				</Button>
			</div>
		</div>
	);
}


export default ChangePassword;