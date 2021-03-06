import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import debounce from 'lodash.debounce';
import Cookies from 'js-cookie';
import uniqid from 'uniqid';
import axios from 'axios';

import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import IconButton from '@mui/material/IconButton';
import AddBoxIcon from '@mui/icons-material/AddBox';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSnackbar } from 'notistack';

import FilledInput from '@mui/material/FilledInput';
import Input from '@mui/material/Input';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const Item = props => {
	const {
		setSelectedItem,
		handleItemBox,
		handleUpdate,
		handleDelete,
		update,
		handleStatus
	} = props;

	const { enqueueSnackbar } = useSnackbar();

	return(
		<TableRow>
			<TableCell component="th" scope="row"> { props.firstName } </TableCell>
			<TableCell component="th" scope="row"> { props.lastName } </TableCell>
			<TableCell component="th" scope="row"> { props.username } </TableCell>
			<TableCell align="center">
				<Stack
					direction="row"
					justifyContent="center"
					spacing={1}
				>
					<IconButton 
						onClick={() => {
							setSelectedItem({
								editMode: true,
								_id: props._id,
								username: props.username,
								password: props.password,
								firstName: props.firstName,
								middleName: props.middleName,
								lastName: props.lastName,
								email: props.email,
								number: props.number,
							});

							handleItemBox();
						}}
					>
						<EditIcon/>
					</IconButton>
					{/*<IconButton onClick={() => handleDelete( props._id )}>
						<DeleteIcon/>
					</IconButton>*/}
					<FormGroup>
				      <FormControlLabel 
				      		control={<Switch checked={props.status === 'activated' ? true : false} onDoubleClick={e => e.stopPropagation()} onChange={() => handleStatus( props._id )} />} 
				      		label={ props.status === 'activated' ? 'Activated' : 'Deactivated'} 
				      	/>
				    </FormGroup>
				</Stack>
			</TableCell>
		</TableRow>
	);
}



const Accounts = props => {
	const [accounts, setAccounts] = React.useState([]);
	const [renderedAccounts, setRenderedAccounts] = React.useState([]);
	const [selectedItem, setSelectedItem] = React.useState( null );
	const [openItemBox, setOpenItemBox] = React.useState( false );
	const { enqueueSnackbar } = useSnackbar();

	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

	const role = React.useMemo(() => props?.tools?.role, [props]);

	const handleItemBox = () => {
		setOpenItemBox( openItemBox => !openItemBox );
	}

	const handleFetchNonAdminAccounts = async () => {
		axios.get(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/get-users`)
		.then( res => {
			setAccounts([ ...res.data ]);
		})
		.catch( err => {
			throw err;			
			// props.errorHandler.handle( err, handleFetchNonAdminAccounts, 20, null );
		});
	}

	const updateItem = async item => {
		const token = Cookies.get('token');

		axios.put(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/update-user/${item._id}`, item, {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => { 
			enqueueSnackbar( res.data.message, { variant: 'success' });					
			handleFetchNonAdminAccounts();
		})
		.catch( err => {
			throw err;
			// props.errorHandler.handle( err, updateItem, 21, null, item );
		});
	}

	const handleAdd = async item => {
		const token = Cookies.get('token');

		axios.post(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/add-user`, item, {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => { 
			enqueueSnackbar( res.data.message, { variant: 'success' });					
			handleFetchNonAdminAccounts();
		})
		.catch( err => {
			throw err;
			// props.errorHandler.handle( err, updateItem, 21, null, id );
		});
	}

	const handleStatus = async id => {
		const token = Cookies.get('token');

		axios.put(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/user-status/id/${id}`, null, {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then(() => {
			handleFetchNonAdminAccounts();
		})
		.catch( err => {
			throw err;
			// props.errorHandler.handle( err, updateItem, 21, null, id );
		});
	}

	const handleDelete = async id => {
		const token = Cookies.get('token');

		axios.delete(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/delete-user/${id}`, {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => { 
			enqueueSnackbar( res.data.message, { variant: 'success' });					
			handleFetchNonAdminAccounts();
		})
		.catch( err => {
			throw err;
			// props.errorHandler.handle( err, updateItem, 21, null, id );
		});
	}

	const handleAccountsRendering = () => {
		const accountList = [];

		const addAccount = acc => {
			accountList.push(
				<Item
					{ ...acc }
					key={uniqid()}
					handleStatus={handleStatus}
					handleUpdate={updateItem}
					handleDelete={handleDelete}
					handleItemBox={handleItemBox}
					setSelectedItem={setSelectedItem}
					update={handleFetchNonAdminAccounts}
				/>
			);
		}

		accounts.forEach( acc => {
			if( props?.tools?.role === 'sysadmin' && acc.role === 'admin' ){
				addAccount( acc );
			}
			else if( props?.tools?.role === 'admin' && acc.role === 'normal'){
				addAccount( acc );
			}
		});

		setRenderedAccounts([ ...accountList ]);
	}

	React.useEffect(() => {
		if( !openItemBox ){
			setSelectedItem( null );
		}
	}, [openItemBox]);
	
	React.useEffect(() => handleFetchNonAdminAccounts(), []);
	React.useEffect(() => handleAccountsRendering(), [accounts, props]);

	React.useEffect(() => {
		if( props.tools.role !== 'admin' || props.tools.role !== 'sysadmin' ){
			props?.setToThisView?.('/dashboard');
		}
	}, [props.tools.role]);

	return(
		<div style={{ width: '100%', height: '100%', padding: '100px 10px 10px 10px', backgroundColor:'transparent' }} className="d-flex justify-content-center align-items-start">
			<TableContainer component={Paper} sx={{ width: 900 }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell><b>First Name</b></TableCell>
							<TableCell><b>Last Name</b></TableCell>
							<TableCell><b>Username</b></TableCell>
				            <TableCell align="center"><b> Actions </b></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{ renderedAccounts }
					</TableBody>
				</Table>
			</TableContainer>
			{ 
				selectedItem || openItemBox
					? <ItemBox 
						addItem={handleAdd}
			    		editItem={updateItem}
			    		fullScreen={fullScreen} 
			    		openItemBox={openItemBox} 
			    		selectedItem={selectedItem}
			    		handleItemBox={handleItemBox}
			    		setSelectedItem={setSelectedItem}
			    		update={handleFetchNonAdminAccounts}
			    		role={role === 'sysadmin' ? 'admin' : 'normal'}
			    	/>  
			    	: null
			}
			<div style={{ position: 'absolute', bottom: '2vh', right: '2vw'}}>
				<IconButton onClick={handleItemBox}>
					<AddBoxIcon fontSize="large"/>
				</IconButton>
			</div>
		</div>
	);
}

const ItemBox = props => {
	const {
		update,
		addItem,
		editItem,
		fullScreen,
		openItemBox,
		selectedItem,
		handleItemBox,
		setSelectedItem,
	} = props;

	const { enqueueSnackbar } = useSnackbar();

	const userObject = {
		_id: selectedItem?._id ?? '',
		username: selectedItem?.username ?? '',
		password: selectedItem?.password ?? '',
		firstName: selectedItem?.firstName ?? '',
		lastName: selectedItem?.lastName ?? '',
		middleName: selectedItem?.middleName ?? '',
		email: selectedItem?.email ?? '',
		number: selectedItem?.number ?? '',
		role: props?.role ?? '',
	}

	const handleClickShowPassword = () => {
		setShowPassword( showPassword => !showPassword );
	};

	const handleMouseDownPassword = event => {
		event.preventDefault();
	};

	// const handleContactNumber = e => {
	// 	const reg = new RegExp('^[0-9]*$');
	// 	const value = e.target.value;

	// 	console.log( value );
	// 	if(!reg.test( value )){
	// 		dispatch({ type: 'number', data: value.replace(/[^0-9]/g, '') });
	// 	}
	// 	else{
	// 		;
	// 	}
	// }

	const reducer = (state, action) => {
		switch( action.type ){
			case 'username':
				state.username = action.data;
				return state;

			case 'password':
				state.password = action.data;
				return state;

			case 'firstName':
				state.firstName = action.data;
				return state;

			case 'middleName':
				state.middleName = action.data;
				return state;

			case 'lastName':
				state.lastName = action.data;
				return state;

			case 'email':
				state.email = action.data;
				return state;

			case 'number':
				state.number = action.data;
				return state;

			case 'role':
				state.role = action.data;
				return state;

			default:
				return state;			
		}
	}

	const [item, dispatch] = React.useReducer(reducer, userObject);
	const [showPassword, setShowPassword] = React.useState( false );

	const isEmailValid = () => {
		const validMailServers = ['gmail', 'yahoo', 'email'].map( mailServer => `${mailServer}.com` );
		const splittedEmail = item.email.split('@');

		const isEmailInputedEmpty = !!!splittedEmail; 

		if( isEmailInputedEmpty ) return false;

		const emailUname = splittedEmail?.[ 0 ];
		const emailMailServer = splittedEmail?.[ 1 ];

		const isEmailUnameEmpty = !!!emailUname;
		const isEmailUnameHaveSpaces = emailUname.includes(' ');

		if( isEmailUnameEmpty || isEmailUnameHaveSpaces ) return false;

		if(!validMailServers.includes( emailMailServer )) return false;

		return true;
	}

	const areAllFieldsFilled = ( doShift = false ) => {
		console.log( item );
		const itemVal = Object.values( item );

		if( doShift ) itemVal.shift();
		for( let val of itemVal ){
			if( !val?.length ) return false;
		}

		return true;
	}

	const isPasswordLengthGood = () => {
		if( item.password.length >= 8 ){
			return true;
		}

		return false;
	}

	React.useEffect(() => {
		if( props?.selectedItem ){
			const data = props?.selectedItem;

			dispatch({ type: 'username', data: data.username });
			dispatch({ type: 'password', data: data.password });
			dispatch({ type: 'firstName', data: data.firstName });
			dispatch({ type: 'middleName', data: data.middleName });
			dispatch({ type: 'lastName', data: data.lastName });
			dispatch({ type: 'email', data: data.email });
			dispatch({ type: 'number', data: data.number });
			dispatch({ type: 'role', data: props.role });
		}
		else{
			dispatch({ type: 'username', data: '' });
			dispatch({ type: 'password', data: '' });
			dispatch({ type: 'firstName', data: '' });
			dispatch({ type: 'middleName', data: '' });
			dispatch({ type: 'lastName', data: '' });
			dispatch({ type: 'email', data: '' });
			dispatch({ type: 'number', data: '' });
			dispatch({ type: 'role', data: props?.role });
		}

	}, [props]);

	return(
		<Dialog
			fullWidth={true}
	        fullScreen={fullScreen}
	        open={openItemBox}
	        onClose={handleItemBox}
	        aria-labelledby="responsive-dialog-title"
	        maxWidth="sm"
	    >
	        <DialogTitle id="responsive-dialog-title">
	          { selectedItem?.editMode ? 'Edit user' : 'Add user' }
	        </DialogTitle>
	        <DialogContent>
	          <DialogContentText>
	            Please do not leave username and password field blank.
	          </DialogContentText>

	          <Stack spacing={5}>
		          <TextField 
		          	onChange={e => dispatch({ type: 'firstName', data: e.target.value })} 
		          	defaultValue={item.firstName} 
		          	autoFocus 
		          	variant="filled" 
		          	label="First Name"
		          />
		          
		          <TextField 
		          	onChange={e => dispatch({ type: 'middleName', data: e.target.value })} 
		          	defaultValue={item.middleName} 
		          	autoFocus 
		          	variant="filled" 
		          	label="Middle Name"
		          />
		          
		          <TextField 
		          	onChange={e => dispatch({ type: 'lastName', data: e.target.value })} 
		          	defaultValue={item.lastName} 
		          	autoFocus 
		          	variant="filled" 
		          	label="Last Name"
		          />

  		          <TextField 
		          	onChange={e => dispatch({ type: 'email', data: e.target.value })} 
		          	defaultValue={item.email} 
		          	autoFocus 
		          	type="email"
		          	variant="filled" 
		          	label="Email"
		          />

  		          <TextField 
		          	onChange={e => dispatch({ type: 'number', data: e.target.value })} 
		          	defaultValue={item.number}
		          	type="number"
		          	variant="filled" 
		          	label="Contact Number"
		          />

		          <TextField 
		          	onChange={e => dispatch({ type: 'username', data: e.target.value })} 
		          	defaultValue={item.username} 
		          	autoFocus 
		          	variant="filled" 
		          	label="Username"
		          />
		         
		          <FormControl sx={{ m: 1, width: '100%' }} variant="filled">
					<InputLabel htmlFor="sign-in-pass">Password</InputLabel>
					<FilledInput 
						id="sign-in-pass" 
						variant="filled" 
						type={ showPassword ? "text" : "password" }
						defaultValue={ item.password } 
						onChange={e => dispatch({ type: 'password', data: e.target.value })} 
						endAdornment={
			              <InputAdornment position="end">
			                <IconButton
			                  aria-label="toggle password visibility"
			                  onClick={handleClickShowPassword}
			                  onMouseDown={handleMouseDownPassword}
			                  edge="end"
			                >
			                  { !showPassword ? <VisibilityOff /> : <Visibility /> }
			                </IconButton>
			              </InputAdornment>
			            }
					/>
				</FormControl>
		      </Stack>
	        </DialogContent>
	        
	        <DialogActions>
	          <Button 
	          	onClick={() => {
	          		setSelectedItem( null );
	          		handleItemBox();
		        }}
	          >
	            Discard
	          </Button>
	          {
	          	selectedItem?.editMode
	          		? (
						<Button 
				          	onClick={() => {
				          		if( !areAllFieldsFilled() ) {
				          			return enqueueSnackbar('All fields are required', { variant: 'error' });
				          		}
				          		else if( !isPasswordLengthGood() ){
				          			return enqueueSnackbar('Password must at least 8 character', { variant: 'error' });
				          		}
				          		else if( !isEmailValid() ){
				          			return enqueueSnackbar('Email is invalid', { variant: 'error' });
				          		}

				          		handleItemBox();
				          		editItem( item );
				          	}} 
				          	autoFocus
				          >
				            Save
				        </Button>
          			)
          			: (
          				<Button 
				          	onClick={() => {
				          		if( !areAllFieldsFilled( true ) ) {
				          			return enqueueSnackbar('All fields are required', { variant: 'error' });
				          		}
				          		else if( !isPasswordLengthGood() ){
				          			return enqueueSnackbar('Password must at least 8 character', { variant: 'error' });
				          		}
				          		else if( !isEmailValid() ){
				          			return enqueueSnackbar('Email is invalid', { variant: 'error' });
				          		}

				          		const { 
				          			username,
				          			password,
				          			firstName,
				          			middleName,
				          			lastName,
				          			email,
				          			number,
				          			role 
				          		} = item;

				          		handleItemBox();
				          		addItem({
				          			username,
				          			password,
				          			firstName,
				          			middleName,
				          			lastName,
				          			email,
				          			number,
				          			role
				          		});
				          	}} 
				          	autoFocus
				        >
				            Add
				        </Button>
          			)
	          }
	        </DialogActions>
		</Dialog>
	);
}


export default Accounts;