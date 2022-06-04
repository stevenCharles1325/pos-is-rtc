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

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Pagination from '@mui/material/Pagination';


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
		buy,
		update
	} = props;

	const { enqueueSnackbar } = useSnackbar();
	const [count, setCount] = React.useState( props.quantity );
	const [elevated, setElevated] = React.useState( false );

	const handleBuy = () => {
		if( count > 0 ){
			setCount( count => count-=1 );
			buy([props._id, props.name]);
		}
	}

	// React.useEffect(() => {
	// 	if( count === 0 ){
	// 		enqueueSnackbar(`${props.name} has been sold out`, { variant: 'success' });
	// 	}	
	// 	else{

	// 	}
	// }, [count]);

	return(
		<TableRow sx={{ paddingTop: '5px', paddingBottom: '5px' }}>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.name } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} align="right"> { count } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} align="right"> { props.srp } </TableCell>
			{/*<TableCell align="right"> { renderDate(props.dateDelivered) } </TableCell>*/}
			{/*<TableCell align="right"> { renderDate(props.dateReleased) } </TableCell>*/}
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} align="center">
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
					}}
					disabled={props?.role !== 'normal'}
				>
					<EditIcon/>
				</IconButton>
				
				{/*<IconButton onClick={() => handleBuy()}>
					<ShoppingCartIcon/>
				</IconButton>*/}

				{/*<IconButton onClick={() => handleDelete( props._id )}>
					<DeleteIcon/>
				</IconButton>*/}
			</TableCell>
			<TableCell 
				sx={{ 
					paddingTop: '5px', 
					paddingBottom: '5px', 
					color: count === 0 ? '#ff4757' : '#2ed573'
				}} 
				align="center"
			> 
				{ 
					count === 0
						? <b className="text-center p-0 m-0">Out of Stock</b>
						: <b className="text-center p-0 m-0">Available</b>
				}
			</TableCell>
		</TableRow>
	);
}


const Inventory = props => {
	const chunksLimit = 7;
	const [page, setPage] = React.useState( 1 );

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

		axios.get(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/shop-items`, {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => {
			setItems([ ...res.data.items ]);
			
			// if (res.data.items.length)
			// 	enqueueSnackbar( res.data.message, { variant: 'success' });
		})
		.catch( err => {
			errorHandler.handle( err, getItems, 3 );
		});
	}

	const addItem = async item => {
		enqueueSnackbar('Please wait...');

		const token = Cookies.get('token');

		axios.post(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/add-shop-item`, { item }, {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => {
			enqueueSnackbar( res.data.message, { variant: 'success' });			
			// setItems( items => [ ...items, res.data.item ]);
			getItems();
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

		axios.put(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/update-shop-item`, item, {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => { 
			enqueueSnackbar( res.data.message, { variant: 'success' });					
			// setItems(() => [ ...res.data.items ]);
			getItems();
		})
		.catch( err => {
			enqueueSnackbar( err?.response?.data?.message ?? 'Error occured, please try again!', { variant: 'error' });					
			errorHandler.handle( err, updateItem, 5, null, item );
		});
	}

	const deleteItem = id => {
		if( !id ) return;

		const ItemRemoval = async id => {
			const token = Cookies.get('token');

			axios.delete(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/delete-shop-item/${ id }`, {
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

		axios.put(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/buy-shop-item/${id}`, null, {
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

		axios.get(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/export-record`, {
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

	const handleSearching = async () => {
		// if( !items.length ) return;

		let filtered = [];
		let chunkSet = [];

		const addToFilteredItems = item => {
			filtered.push((
				<Item 
					{...item}
					buy={buyItem}
					key={uniqid()}
					update={getItems}
					role={props?.tools?.role}
					handleUpdate={ updateItem }
					handleDelete={ deleteItem }
					handleEditBox={ handleEditBox }
					setSelectedItem={ setSelectedItem }
				/>
			));
		}

		const sortedItems = [ ...items ];
		sortedItems.sort((item1, item2) => new Date( item1.dateDelivered ) - new Date( item2.dateDelivered ));	

		sortedItems.reverse().forEach( item => {
			if(item.name.toLowerCase().includes( search.toLowerCase() )){
				addToFilteredItems( item );
			}
		});

		let index = 0;
		do{
			const chunk = filtered.slice(index, index + chunksLimit);

			chunkSet.push( chunk );	

			index += chunksLimit;
		}
		while( chunkSet.length < Math.floor( filtered.length / chunksLimit ) + (filtered % chunksLimit === 0 ? 0 : 1 ));

		setRenderedItems([ ...chunkSet ]);
	}

	// const memoizedFiltering = React.useCallback(() => handleSearching(), [search, items]);

	React.useEffect(() => handleSearching(), [search, items, props]);
	React.useEffect(() => getItems(), []);

	React.useEffect(() => {
		if( renderedItems.length ){
			if( page === renderedItems.length && !renderedItems[ renderedItems.length - 1 ].length ){
				if( page - 1 > 0 ){
					setPage( page => page - 1 );
				}
			}
		}
	}, [renderedItems, page]);


	return(
		<div 
			style={{
				width: '100%',
				height: '100%',
				paddingTop: '10vh',
				backgroundColor:'transparent'
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
				className="row d-flex justify-content-around align-items-start"
			>
				{/*ITEM AREA*/}
				{/*{ 
					renderedItems.length 
						? renderedItems 
						: search.length 
							? (
									<div style={{ width: '100%' }} className="text-center">
										<Typography 
											sx={{
												color: 'rgba(0, 0, 0, 0.4)'
											}} 
											gutterBottom
											variant="h1" 
										>
						        	No result  
						        </Typography>
									</div>
								)
							: (
									<div style={{ width: '100%' }} className="text-center">
										<Typography 
											sx={{
												color: 'rgba(0, 0, 0, 0.4)'
											}} 
											gutterBottom 
											variant="h1"
										>
						          No items
						        </Typography>
									</div>
								)
				}*/}
				<Paper sx={{ height: '450px' }}>
					<Stack sx={{ height: '450px' }} direction="column" justifyContent="space-between" alignItems="center">
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell><b>Item name</b></TableCell>
				            <TableCell align="right"><b>Quantity</b></TableCell>
				            <TableCell align="right"><b>Price</b></TableCell>
				            {/*<TableCell align="right"><b>Date delivered</b></TableCell>*/}
				            {/*<TableCell align="right"><b>Date released</b></TableCell>*/}
				            <TableCell align="center"><b>Action</b></TableCell>
				            <TableCell align="center"><b>Status</b></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{ renderedItems[ page - 1 ] }
								</TableBody>
							</Table>
						</TableContainer>
						<div className="row col-12 my-2 d-flex flex-row justify-content-center align-items-center">
							<div className="col-2 d-flex flex-row" style={{ color: 'rgba(0, 0, 0, 0.5)'}}>
								<b className="p-0 m-0">Total item: </b><p className="p-0 m-0"> { items.length }</p>
							</div>
							<div className="col-10 d-flex justify-content-center align-items-center">
								<Pagination count={ !renderedItems?.[ renderedItems?.length - 1 ]?.length ? renderedItems?.length - 1 : renderedItems?.length } page={page} onChange={(_, value) => setPage( value )}/>
							</div>
						</div>
					</Stack>
				</Paper>
			</div>
			<SpeedDial
        ariaLabel="speed dial"
        sx={{ position: 'absolute', bottom: 16, right: 30 }}
        icon={<SpeedDialIcon />}
        hidden={props?.tools?.role !== 'admin'}
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
    		update={getItems}
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
		handleAddBox,
	} = props;

	let currDate = new Date();
	const date = String(currDate.getDate()).padStart(2, '0');
	const month = String(currDate.getMonth() + 1).padStart(2, '0');
	const year = currDate.getFullYear();
	const today = `${year}-${month}-${date}`;

	const { enqueueSnackbar } = useSnackbar();

	const [item, setItem] = React.useState({
		name: '',
		quantity: 0,
		srp: 0,
		dateDelivered: today,
		dateReleased: today
	});

	const handleName = e => {
		setItem( item => ({
			name: e.target.value,
			quantity: item.quantity,
			srp: item.srp,
			dateDelivered: item.dateDelivered,
			dateReleased: item.dateReleased	
		}));
	}

	const handleCount = e => {
		setItem( item => ({
			name: item.name,
			quantity: e.target.value,
			srp: item.srp,
			dateDelivered: item.dateDelivered,
			dateReleased: item.dateReleased	
		}));
	}

	const handleSrp = e => {
		setItem( item => ({
			name: item.name,
			quantity: item.quantity,
			srp: e.target.value,
			dateDelivered: item.dateDelivered,
			dateReleased: item.dateReleased	
		}));
	}


	const handleImei = e => {
		setItem( item => ({
			name: item.name,
			quantity: item.quantity,
			srp: item.srp,
			dateDelivered: item.dateDelivered,
			dateReleased: item.dateReleased	
		}));
	}

	const handleDateDelivered = e => {
		setItem( item => ({
			name: item.name,
			quantity: item.quantity,
			srp: item.srp,
			dateDelivered: e.target.value,
			dateReleased: item.dateReleased	
		}));
	}

	// const handleDateReleased = e => {
	// 	setItem( item => ({
	// 		name: item.name,
	// 		quantity: item.quantity,
	// 		srp: item.srp,
	// 		dateDelivered: item.dateDelivered,
	// 		dateReleased: e.target.value
	// 	}));
	// }

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
          <TextField 
          	onChange={handleDateDelivered} 
          	onClick={ e => e.target.setAttribute('min', today)}
          	defaultValue={today} 
          	variant="standard" 
          	type='date' 
          	helperText="Date delivered"
          />
          {/*<TextField 
          	onChange={handleDateReleased} 
          	onClick={ e => e.target.setAttribute('min', today)}
          	defaultValue={today} 
          	variant="standard" 
          	type='date' 
          	helperText="Date released"
          />*/}
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
		handleEditBox,
	} = props;

	const { enqueueSnackbar } = useSnackbar();

	const data = React.useMemo(() => selectedItem, [selectedItem]);

	const [item, setItem] = React.useState( {} );

	// React.useEffect(() => {
	// 	if( selectedItem ){
	// 		console.log( selectedItem );
	// 		setItem({
	// 			_id: selectedItem?._id,
	// 			name: selectedItem?.name,
	// 			quantity: selectedItem?.quantity,
	// 			srp: selectedItem?.srp,
	// 			dateDelivered: selectedItem?.dateDelivered,
	// 			dateReleased: selectedItem?.dateReleased
	// 		});
	// 	}
	// }, [selectedItem]);

	React.useEffect(() => setItem(() => ({ ...data })), [data]);

	const handleName = e => {
		setItem( item => ({
			_id: selectedItem?._id,
			name: e.target.value,
			quantity: item.quantity,
			srp: item.srp,
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
			dateDelivered: e.target.value,
			dateReleased: item.dateReleased	
		}));
	}

	// const handleDateReleased = e => {
	// 	setItem( item => ({
	// 		_id: selectedItem?._id,
	// 		name: item.name,
	// 		quantity: item.quantity,
	// 		srp: item.srp,
	// 		dateDelivered: item.dateDelivered,
	// 		dateReleased: e.target.value
	// 	}));
	// }

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
		          	value={item?.name} 
		          	autoFocus 
		          	variant="filled" 
		          	label="Item name"
		          />
		          
		          <TextField 
			          disabled
		          	onChange={handleCount} 
		          	value={item?.quantity} 
		          	autoFocus 
		          	variant="filled" 
		          	label="Item quantity"
		          />
		          
		          <TextField 
		          	onChange={handleSrp} 
		          	value={item?.srp} 
		          	variant="filled" 
		          	type="number" 
		          	label="Item price"
		          />
		          
		          <TextField 
		          	onChange={handleDateDelivered} 
		          	value={renderDate(item?.dateDelivered)} 
		          	variant="standard" 
		          	type='date' 
		          	helperText="Date delivered"
		          />

		          {/*<TextField 
		          	onChange={handleDateReleased} 
		          	defaultValue={renderDate(selectedItem?.dateReleased)} 
		          	variant="standard" 
		          	type='date' 
		          	helperText="Date released"
		          />*/}
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
	const _date = (_parsedDate.getDate()).toString().padStart(2, '0');
	const _month = (_parsedDate.getMonth() + 1).toString().padStart( 2, '0' );
	const _year = _parsedDate.getFullYear();

	return `${_year}-${_month}-${_date}`;
}
export default Inventory;