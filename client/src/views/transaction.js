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
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
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
import Checkbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import DialogTitle from '@mui/material/DialogTitle';
import ButtonGroup from '@mui/material/ButtonGroup';
import Autocomplete from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DialogContentText from '@mui/material/DialogContentText';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

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


const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const actions = [
	{ icon: <AddIcon/>, name: 'Add an item' },
	{ icon: <ArrowCircleDownIcon/>, name: 'Download as spreadsheet'}
];


const Item = props => {
	const { enqueueSnackbar } = useSnackbar();
	const [elevated, setElevated] = React.useState( false );

	return(
		<TableRow sx={{ paddingTop: '5px', paddingBottom: '5px' }}>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.soldBy } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} align="right"> { props.itemName } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} align="right"> { props.srp } </TableCell>
			<TableCell align="right"> { props.date } </TableCell>
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
	// const [filteredItems, setFilteredItems] = React.useState( null );
	// const [selectedItem, setSelectedItem] = React.useState( null );

	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

	const resize = () => {
		setWindowWidth( window.innerWidth );
	}

	const getItems = async () => {
		const token = Cookies.get('token');

		axios.get(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/transaction-history`, {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => {
			setItems([ ...res.data ]);

			// setDropDownItems([ ...newDropDownItems ]);
			// debounce(getItems, 3000)();
			// enqueueSnackbar(`Successfully sold 1 ${ name }`, { variant: 'success' });
		})
		.catch( err => {
			errorHandler.handle( err, getItems, 700 );
		});	
	}

	const handleSearch = e => {
		setSearch( e.target.value );
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
					key={uniqid()}
				/>
			));
		}

		const sortedItems = [ ...items ];
		sortedItems.sort((item1, item2) => new Date( item1.date ) - new Date( item2.date ));	

		sortedItems.reverse().forEach( item => {
			if(item?.itemName?.toLowerCase?.()?.includes?.( search?.toLowerCase?.() ) || item.date?.includes?.( search )){
				addToFilteredItems( item );
			}
		});

		let index = 0;
		do{
			const chunk = filtered.slice(index, index + chunksLimit);

			chunkSet.push( chunk );	

			index += chunksLimit;

			console.log( filtered.length );
			console.log( Math.floor( filtered.length / chunksLimit ) + (filtered % chunksLimit === 0) ? 0 : 1 );
		}
		while( chunkSet.length < Math.floor( filtered.length / chunksLimit ) + (filtered % chunksLimit === 0 ? 0 : 1 ));

		setRenderedItems([ ...chunkSet ]);
	}

	const memoizedFiltering = React.useCallback(() => handleSearching(), [search, items]);

	React.useEffect(() => memoizedFiltering(), [search, items]);
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
				backgroundColor:'#C0C0C0'
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
				<Paper sx={{ height: '500px' }}>
					<Stack sx={{ height: '500px' }} direction="column" justifyContent="space-between" alignItems="center">
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
				            <TableCell align="left"><b>Sold By</b></TableCell>
				            <TableCell align="right"><b>Item Name</b></TableCell>
				            <TableCell align="right"><b>Price</b></TableCell>
				            <TableCell align="right"><b>Date of Transaction</b></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{ renderedItems[ page - 1 ] }
								</TableBody>
							</Table>
						</TableContainer>
						<div className="row col-12 my-2 d-flex flex-row justify-content-center align-items-center">
							<div className="col-8 d-flex justify-content-center align-items-center">
								<Pagination count={ !renderedItems?.[ renderedItems?.length - 1 ]?.length ? renderedItems?.length - 1 : renderedItems?.length } page={page} onChange={(_, value) => setPage( value )}/>
							</div>
						</div>
					</Stack>
				</Paper>
			</div>
		</div>
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