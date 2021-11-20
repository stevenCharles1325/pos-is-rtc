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


const Item = props => {
	const {
		setSelectedItem,
		handleItemBox,
		handleUpdate,
		handleDelete,
		update
	} = props;

	const { enqueueSnackbar } = useSnackbar();

	return(
		<TableRow>
			<TableCell component="th" scope="row"> { props.username } </TableCell>
			<TableCell align="center"> { props.password } </TableCell>
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
								password: props.password
							});

							handleItemBox();
						}}
					>
						<EditIcon/>
					</IconButton>
					<IconButton onClick={() => handleDelete( props._id )}>
						<DeleteIcon/>
					</IconButton>
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

	const handleItemBox = () => {
		setOpenItemBox( openItemBox => !openItemBox );
	}

	const handleFetchNonAdminAccounts = async () => {
		axios.get(`http://${window.address}:${window.port}/get-nonadmin-users`)
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

		axios.put(`http://${window.address}:${window.port}/update-user/${item._id}`, item, {
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

		axios.post(`http://${window.address}:${window.port}/add-user`, item, {
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

	const handleDelete = async id => {
		const token = Cookies.get('token');

		axios.delete(`http://${window.address}:${window.port}/delete-user/${id}`, {
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

		accounts.forEach( acc => {
			accountList.push(
				<Item
					{ ...acc }
					key={uniqid()}
					handleUpdate={updateItem}
					handleDelete={handleDelete}
					handleItemBox={handleItemBox}
					setSelectedItem={setSelectedItem}
					update={handleFetchNonAdminAccounts}
				/>
			);
		});

		setRenderedAccounts([ ...accountList ]);
	}

	React.useEffect(() => {
		if( !openItemBox ){
			setSelectedItem( null );
		}
	}, [openItemBox]);
	
	React.useEffect(() => handleFetchNonAdminAccounts(), []);
	React.useEffect(() => handleAccountsRendering(), [accounts]);

	React.useEffect(() => {
		if( props.tools.role !== 'admin' ){
			props?.setToThisView?.('/dashboard');
		}

	}, [props.tools.role]);

	return(
		<div style={{ width: '100%', height: '100%', padding: '100px 10px 10px 10px' }} className="d-flex justify-content-center align-items-start">
			<TableContainer component={Paper} sx={{ width: 700 }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell><b>Username</b></TableCell>
				            <TableCell align="center"><b>Password</b></TableCell>
				            <TableCell align="center"><b> Actions </b></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{ renderedAccounts }
					</TableBody>
				</Table>
			</TableContainer>
			<ItemBox 
				addItem={handleAdd}
	    		editItem={updateItem}
	    		fullScreen={fullScreen} 
	    		openItemBox={openItemBox} 
	    		selectedItem={selectedItem}
	    		handleItemBox={handleItemBox}
	    		setSelectedItem={setSelectedItem}
	    		update={handleFetchNonAdminAccounts}
	    	/> 
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

	const [item, setItem] = React.useState({
		_id: selectedItem?._id ?? '',
		username: selectedItem?.username ?? '',
		password: selectedItem?.password ?? ''
	});

	const handleUsername = e => {
		setItem( item => ({
			_id: item._id,
			username: e.target.value,
			password: item.password
		}));
	}

	const handlePassword = e => {
		setItem( item => ({
			_id: item._id,
			username: item.username,
			password: e.target.value
		}));
	}

	React.useEffect(() => {
		if( props?.selectedItem ){
			setItem(() => ({ ...props.selectedItem }));
		}
		else{
			setItem(() => ({ _id: '', username: '', password: '' }));
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
	            Please do not leave a blank field
	          </DialogContentText>

	          <Stack spacing={5}>
		          <TextField 
		          	onChange={handleUsername} 
		          	value={item.username} 
		          	autoFocus 
		          	variant="filled" 
		          	label="Username"
		          />
		         
		          <TextField 
		          	onChange={handlePassword} 
		          	value={item.password} 
		          	autoFocus 
		          	variant="filled" 
		          	label="Password"
		          />
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
				          		if( !item.username || !item.password ) return enqueueSnackbar('All fields are required', { variant: 'error' });
				          		
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
				          		if( !item.username || !item.password ) return enqueueSnackbar('All fields are required', { variant: 'error' });
				          		
				          		const { username, password } = item;

				          		handleItemBox();
				          		addItem({ username, password });
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