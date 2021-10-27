import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import debounce from 'lodash.debounce';
import Cookies from 'js-cookie';
import uniqid from 'uniqid';
import axios from 'axios';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';

import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import DialogTitle from '@mui/material/DialogTitle';
import ButtonGroup from '@mui/material/ButtonGroup';
import useMediaQuery from '@mui/material/useMediaQuery';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';

import { useSnackbar } from 'notistack';

import Stack from '@mui/material/Stack';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '50ch',
    },
  },
}));

const actions = [
	{ icon: <AddIcon/>, name: 'Add an item' },
	{ icon: <ArrowCircleDownIcon/>, name: 'Download as spreadsheet'}
];

const Item = props => {
	const {
		setSelectedItem,
		handleEditBox,
		handleUpdate,
		handleDelete,
		buy
	} = props;

	const { enqueueSnackbar } = useSnackbar();
	const [count, setCount] = React.useState( props.quantity );
	const [elevated, setElevated] = React.useState( false );

	const handleBuy = () => {
		setCount( count => count-=1 );
		buy([props._id, props.name])
	}

	React.useEffect(() => {
		if( count === 0 ){
			enqueueSnackbar(`${props.name} has been sold out`, { variant: 'success' });
		}	
	}, [count]);

	return(
		<div 
			style={{
				height: '300px'
			}}
			className="item col-md-3"
			onPointerEnter={() => setElevated( true )}
			onPointerLeave={() => setElevated( false )}
		>	
			<Paper sx={{width: '100%', height: '80%'}} elevation={!elevated ? 5 : 15}>
				<Paper 
					square 
					sx={{
						width: '100%', 
						height: '20%', 
						backgroundColor: 'rgba(0, 0, 0, 0.8)', 
						color: 'white',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '0 10px 0 10px'
					}} 
					elevation={ 3 }
				>
					<Tooltip title={props?.name ?? 'No name item'}>
						<Typography 
							sx={{ 
								whiteSpace: 'nowrap',
								overflow: 'hidden'
							}} 
							variant="h5"
						>
							{ props?.name?.split?.(' ')?.[ 0 ] ?? 'Item' }
						</Typography>
					</Tooltip>

					<Stack direction="row" spacing={2}>
						{/*Edit button*/}
						<Tooltip title="Edit item">
							<IconButton 
								onClick={() => {
									setSelectedItem({
										_id: props._id,
										name: props.name,
										quantity: count,
										srp: props.srp,
										imei: props.imei,
										dateDelivered: props.dateDelivered,
										dateReleased: props.dateReleased
									});

									handleEditBox();
									setElevated( false );
								}} 
								color="inherit"
							>
								<EditIcon fontSize="small" sx={{ color: 'white' }}/>
							</IconButton>
						</Tooltip>

						{/*Cart button*/}
						{
							count 
								? ( 
									<Tooltip title="Sell 1">
										<IconButton onClick={() => handleBuy()} color="inherit">
											<ShoppingCartIcon fontSize="small" sx={{ color: 'white' }}/>
										</IconButton>
									</Tooltip>
								)
								: (
									<IconButton disabled color="inherit">
										<RemoveShoppingCartIcon fontSize="small" sx={{ color: '#ff7675' }}/>
									</IconButton>
								)
						}

						{/*Delete button*/}
						<Tooltip title="Delete item">
							<IconButton onClick={() => handleDelete( props._id )} color="inherit">
								<DeleteIcon fontSize="small" sx={{ color: 'white' }}/>
							</IconButton>
						</Tooltip>
					</Stack>
				</Paper>
				<Box
					sx={{ 
						width: '100%', 
						height: '80%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '0 5% 0 5%'
					}}
				>
					<Stack
						orientation="vertical"
						spacing={2}
					>	
						<TextField 
							id="item-quant" 
							disabled 
							variant="filled" 
							type="number" 
							label="Item quantity" 
							value={`${count ?? 0}`}
						/>
						<TextField 
							disabled 
							variant="filled" 
							label="Item price" 
							defaultValue={`₱ ${props.srp ?? 0}`}
						/>
					</Stack>
				</Box>
			</Paper>
		</div>
	);
}

const Inventory = props => {
	const { errorHandler, search, setSearch } = props.tools;
	const { enqueueSnackbar } = useSnackbar();

	const [windowWidth, setWindowWidth] = React.useState( window.innerWidth );
	const [openAddBox, setOpenAddBox] = React.useState( false );
	const [openEditBox, setOpenEditBox] = React.useState( false );

	const [items, setItems] = React.useState( [] );
	const [message, setMessage] = React.useState( null );
	const [renderedItems, setRenderedItems] = React.useState( [] );
	const [filteredItems, setFilteredItems] = React.useState( null );
	const [selectedItem, setSelectedItem] = React.useState( null );

	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

	const handleAddBox = () => {
		setOpenAddBox( openAddBox => !openAddBox );
	}

	const handleEditBox = () => {
		setOpenEditBox( openEditBox => !openEditBox );
	}

	const resize = () => {
		setWindowWidth( window.innerWidth );
	}

	const getItems = async () => {
		const token = Cookies.get('token');

		axios.get('http://localhost:3500/shop-items', {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => {
			setItems([ ...res.data.items ]);
			
			if (res.data.items.length)
				enqueueSnackbar( res.data.message, { variant: 'success' });
		})
		.catch( err => {
			errorHandler.handle( err, getItems, 3 );
		});
	}

	const addItem = async item => {
		enqueueSnackbar('Please wait...');

		const token = Cookies.get('token');

		axios.post('http://localhost:3500/add-shop-item', { item }, {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => {
			enqueueSnackbar( res.data.message, { variant: 'success' });			
			setItems( items => [ ...items, res.data.item ]);
		})
		.catch( err => {
			if( err?.response?.status === 403 ){
				return enqueueSnackbar( err.response.data.message, { variant: 'error' });
			}
			errorHandler.handle( err, addItem, 4, null, item );
		});
	}

	const updateItem = async item => {
		enqueueSnackbar(`Updating ${item.name}!`);

		const token = Cookies.get('token');

		axios.put('http://localhost:3500/update-shop-item', item, {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => { 
			enqueueSnackbar( res.data.message, { variant: 'success' });					
			setItems(() => [ ...res.data.items ]);
		})
		.catch( err => {
			errorHandler.handle( err, updateItem, 5, null, item );
		});
	}

	const deleteItem = id => {
		if( !id ) return;

		const ItemRemoval = async id => {
			const token = Cookies.get('token');

			axios.delete(`http://localhost:3500/delete-shop-item/${ id }`, {
				headers: {
					'authentication': `Bearer ${ token }`
				}
			})
			.then( res => {
				enqueueSnackbar( res.data.message, { variant: 'success' });
			})
			.catch( err => {
				errorHandler.handle( err, ItemRemoval, 6, null, id );
			});
		}

		ItemRemoval( id );

		let newItems = items.filter( item => item._id !== id );
		setItems([...newItems]);
	}

	const buyItem = async ([id, name]) => {
		const token = Cookies.get('token');

		axios.put(`http://localhost:3500/buy-shop-item/${id}`, null, {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => {
			enqueueSnackbar(`Successfully sold 1 ${ name }`, { variant: 'success' });
		})
		.catch( err => {
			errorHandler.handle( err, buyItem, 7, null, [id, name] );
		});	
	}

	const handleSearch = e => {
		setSearch( e.target.value );
	}

	const handleExport = async () => {
		const token = Cookies.get('token');

		axios.get('http://localhost:3500/export-record', {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => {
	  	const link = document.createElement('a');
			
			link.href = res.data.path;
			link.setAttribute('download', res.data.name );

			enqueueSnackbar( res.data.message, { variant: 'success' });
			
			document.body.appendChild(link);
			link.click();
		})
		.catch( err => {
			errorHandler.handle( err, handleExport, 8 );
		});
	}

	React.useEffect(() => {
		window.addEventListener('resize', resize);

		return () => window.removeEventListener('resize', resize);
	}, []);

	React.useEffect(() => getItems(), []);

	const handleSearching = async () => {
		let filtered = [];

		const addToFilteredItems = item => {
			filtered.push((
				<Item 
					{...item}
					buy={buyItem}
					key={uniqid()}
					update={getItems}
					handleUpdate={ updateItem }
					handleDelete={ deleteItem }
					handleEditBox={ handleEditBox }
					setSelectedItem={ setSelectedItem }
				/>
			));
		}

		items.forEach( item => {
			if(item.name.includes( search )){
				addToFilteredItems( item );
			}
		});	

		setRenderedItems([ ...filtered ]);
	}

	const memoizedFiltering = React.useCallback(debounce( handleSearching, 500 ), [search, items]);

	React.useEffect(() => memoizedFiltering(), [search, items]);

	return(
		<div 
			style={{
				width: '100%',
				height: '100%',
				paddingTop: '10vh'
			}}
			className="d-flex flex-column justify-content-center align-items-center"
		>
			{
				windowWidth <= 620
					? (
						<div 
							style={{ 
								backgroundColor: 'transparent',
								width: '300px', 
								height: '60px'
							}}
							className="py-4"
						>
							<Search>
		            <SearchIconWrapper>
		              <SearchIcon />
		            </SearchIconWrapper>
		            <StyledInputBase
			            value={search} 
			            onChange={handleSearch}
		              placeholder="Search item"
		              inputProps={{ 'aria-label': 'search' }}
		            />
			        </Search>
						</div>
					)
					: null
			}
			<div 
				style={{ 
					width: '100%', 
					height: '100%', 
					overflowY: 'auto',
					overflowX: 'hidden',
					padding: '3% 10% 0 10%'
				}}
				className="row d-flex justify-content-around align-items-center"
			>
				{/*ITEM AREA*/}
				{ renderedItems }
			</div>
			<SpeedDial
		        ariaLabel="speed dial"
		        sx={{ position: 'absolute', bottom: 16, right: 30 }}
		        icon={<SpeedDialIcon />}
		     >
		        {
		        	actions.map((action, index) => (
			          <SpeedDialAction
			            key={action.name}
			            icon={action.icon}
			            tooltipTitle={action.name}
			            onClick={[handleAddBox, handleExport][ index ]}
			          />
			        ))
			    }
	      	</SpeedDial>
	      	<AddItemBox 
		      	addItem={addItem}
	      		fullScreen={fullScreen} 
	      		openAddBox={openAddBox} 
	      		handleAddBox={handleAddBox}
	      	/>
	      	<EditItemBox 
	      		editItem={updateItem}
	      		fullScreen={fullScreen} 
	      		openEditBox={openEditBox} 
	      		selectedItem={selectedItem}
	      		handleEditBox={handleEditBox}
	      	/> 
		</div>
	);
}

const AddItemBox = props => {
	const { 
		addItem,
		fullScreen,
		openAddBox,
		handleAddBox
	} = props;

	const { enqueueSnackbar } = useSnackbar();

	const [item, setItem] = React.useState({
		name: '',
		quantity: 0,
		srp: 0,
		imei: '',
		dateDelivered: '',
		dateReleased: ''
	});

	const handleName = e => {
		setItem( item => ({
			name: e.target.value,
			quantity: item.quantity,
			srp: item.srp,
			imei: item.imei,
			dateDelivered: item.dateDelivered,
			dateReleased: item.dateReleased	
		}));
	}

	const handleCount = e => {
		setItem( item => ({
			name: item.name,
			quantity: e.target.value,
			srp: item.srp,
			imei: item.imei,
			dateDelivered: item.dateDelivered,
			dateReleased: item.dateReleased	
		}));
	}

	const handleSrp = e => {
		setItem( item => ({
			name: item.name,
			quantity: item.quantity,
			srp: e.target.value,
			imei: item.imei,
			dateDelivered: item.dateDelivered,
			dateReleased: item.dateReleased	
		}));
	}


	const handleImei = e => {
		setItem( item => ({
			name: item.name,
			quantity: item.quantity,
			srp: item.srp,
			imei: e.target.value,
			dateDelivered: item.dateDelivered,
			dateReleased: item.dateReleased	
		}));
	}

	const handleDateDelivered = e => {
		setItem( item => ({
			name: item.name,
			quantity: item.quantity,
			srp: item.srp,
			imei: item.imei,
			dateDelivered: e.target.value,
			dateReleased: item.dateReleased	
		}));
	}

	const handleDateReleased = e => {
		setItem( item => ({
			name: item.name,
			quantity: item.quantity,
			srp: item.srp,
			imei: item.imei,
			dateDelivered: item.dateDelivered,
			dateReleased: e.target.value
		}));
	}

	return(
		<Dialog
			fullWidth={true}
	        fullScreen={fullScreen}
	        open={openAddBox}
	        onClose={handleAddBox}
	        aria-labelledby="responsive-dialog-title"
	        maxWidth="md"
	    >
	        <DialogTitle id="responsive-dialog-title">
	          {'Add item'}
	        </DialogTitle>
	        <DialogContent>
	          <DialogContentText>
	            Please fill up all text fields.
	          </DialogContentText>

	          <Stack spacing={5}>
		          <TextField onChange={handleName} autoFocus variant="filled" label="Item name"/>
		          <TextField onChange={handleCount} variant="filled" type="number" label="Item quantity"/>
		          <TextField onChange={handleSrp} variant="filled" type="number" label="Item price"/>
		          <TextField onChange={handleImei} variant="filled" label="Item IMEI"/>
		          <TextField onChange={handleDateDelivered} variant="standard" type='date' helperText="Date delivered"/>
		          <TextField onChange={handleDateReleased} variant="standard" type='date' helperText="Date released"/>
		      </Stack>
	        </DialogContent>
	        
	        <DialogActions>
	          <Button onClick={handleAddBox}>
	            Discard
	          </Button>
	          <Button 
	          	onClick={() => {
	          		if( !item || !item.name.length ||
									!item.quantity ||
									!item.srp ||
									!item.imei ||
									!item.dateDelivered ||
									!item.dateReleased
									) return enqueueSnackbar('All fields are required', { variant: 'error' });

	          		handleAddBox();
	          		addItem( item );
	          	}} 
	          	autoFocus
	          >
	            Add
	          </Button>
	        </DialogActions>
		</Dialog>
	);
}


const EditItemBox = props => {
	const {
		editItem,
		fullScreen,
		openEditBox,
		selectedItem,
		handleEditBox
	} = props;

	const { enqueueSnackbar } = useSnackbar();

	const [item, setItem] = React.useState({
		_id: '',
		name: '',
		quantity: '',
		srp: '',
		imei: '',
		dateDelivered: '',
		dateReleased: '' 
	});

	React.useEffect(() => {
		if( selectedItem ){
			setItem({
				_id: selectedItem?._id,
				name: selectedItem?.name,
				quantity: selectedItem?.quantity,
				srp: selectedItem?.srp,
				imei: selectedItem?.imei,
				dateDelivered: selectedItem?.dateDelivered,
				dateReleased: selectedItem?.dateReleased
			});
		}
	}, [selectedItem]);

	const handleName = e => {
		setItem( item => ({
			_id: selectedItem?._id,
			name: e.target.value,
			quantity: item.quantity,
			srp: item.srp,
			imei: item.imei,
			dateDelivered: item.dateDelivered,
			dateReleased: item.dateReleased	
		}));
	}

	const handleCount = e => {
		setItem( item => ({
			_id: selectedItem?._id,
			name: item.name,
			quantity: e.target.value,
			srp: item.srp,
			imei: item.imei,
			dateDelivered: item.dateDelivered,
			dateReleased: item.dateReleased	
		}));
	}

	const handleSrp = e => {
		setItem( item => ({
			_id: selectedItem?._id,
			name: item.name,
			quantity: item.quantity,
			srp: e.target.value,
			imei: item.imei,
			dateDelivered: item.dateDelivered,
			dateReleased: item.dateReleased	
		}));
	}


	const handleImei = e => {
		setItem( item => ({
			_id: selectedItem?._id,
			name: item.name,
			quantity: item.quantity,
			srp: item.srp,
			imei: e.target.value,
			dateDelivered: item.dateDelivered,
			dateReleased: item.dateReleased	
		}));
	}

	const handleDateDelivered = e => {
		setItem( item => ({
			_id: selectedItem?._id,
			name: item.name,
			quantity: item.quantity,
			srp: item.srp,
			imei: item.imei,
			dateDelivered: e.target.value,
			dateReleased: item.dateReleased	
		}));
	}

	const handleDateReleased = e => {
		setItem( item => ({
			_id: selectedItem?._id,
			name: item.name,
			quantity: item.quantity,
			srp: item.srp,
			imei: item.imei,
			dateDelivered: item.dateDelivered,
			dateReleased: e.target.value
		}));
	}

	return(
		<Dialog
			fullWidth={true}
	        fullScreen={fullScreen}
	        open={openEditBox}
	        onClose={handleEditBox}
	        aria-labelledby="responsive-dialog-title"
	        maxWidth="md"
	    >
	        <DialogTitle id="responsive-dialog-title">
	          {'Edit item'}
	        </DialogTitle>
	        <DialogContent>
	          <DialogContentText>
	            Remember to save before you exit.
	          </DialogContentText>

	          <Stack spacing={5}>
		          <TextField 
		          	onChange={handleName} 
		          	defaultValue={selectedItem?.name} 
		          	autoFocus 
		          	variant="filled" 
		          	label="Item name"
		          />
		          
		          <TextField 
		          	onChange={handleCount} 
		          	defaultValue={selectedItem?.quantity} 
		          	autoFocus 
		          	variant="filled" 
		          	label="Item quantity"
		          />
		          
		          <TextField 
		          	onChange={handleSrp} 
		          	defaultValue={selectedItem?.srp} 
		          	variant="filled" 
		          	type="number" 
		          	label="Item price"
		          />
		          
		          <TextField 
		          	onChange={handleImei} 
		          	defaultValue={selectedItem?.imei} 
		          	variant="filled" 
		          	label="Item IMEI"
		          />
		          
		          <TextField 
		          	onChange={handleDateDelivered} 
		          	defaultValue={renderDate(selectedItem?.dateDelivered)} 
		          	variant="standard" 
		          	type='date' 
		          	helperText="Date delivered"
		          />

		          <TextField 
		          	onChange={handleDateReleased} 
		          	defaultValue={renderDate(selectedItem?.dateReleased)} 
		          	variant="standard" 
		          	type='date' 
		          	helperText="Date released"
		          />
		      </Stack>
	        </DialogContent>
	        
	        <DialogActions>
	          <Button onClick={handleEditBox}>
	            Discard
	          </Button>
	          <Button 
	          	onClick={() => {
	          		if( !item || !item.name.length ||
									!item.quantity ||
									!item.srp ||
									!item.imei ||
									!item.dateDelivered ||
									!item.dateReleased
									) return enqueueSnackbar('All fields are required', { variant: 'error' });
	          		
	          		handleEditBox();
	          		editItem( item );
	          	}} 
	          	autoFocus
	          >
	            Save
	          </Button>
	        </DialogActions>
		</Dialog>
	);
}

const renderDate = date => {
	if( !date ) return '';

	const _parsedDate = new Date( date );
	const _date = _parsedDate.getDate();
	const _month = _parsedDate.getMonth() + 1;
	const _year = _parsedDate.getFullYear();

	return `${_year}-${_month}-${_date}`;
}
export default Inventory;