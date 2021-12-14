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



const Item = props => {
	return(
		<TableRow sx={{ paddingTop: '5px', paddingBottom: '5px' }}>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.name } </TableCell>
			<TableCell align="right"> { renderDate(props.datePurchased) } </TableCell>
		</TableRow>
	);
}


const ItemList = props => {
	const { errorHandler, search, setSearch } = props.tools;
	const { enqueueSnackbar } = useSnackbar();

	const [items, setItems] = React.useState( [] );
	const [renderedItems, setRenderedItems] = React.useState( [] );
	const [filteredItems, setFilteredItems] = React.useState( null );

	const [windowWidth, setWindowWidth] = React.useState( window.innerWidth );

	const getItems = async () => {
		const token = Cookies.get('token');

		axios.get(`http://${window.address}:${window.port}/purchase-history`, {
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

	const handleSearch = e => {
		setSearch( e.target.value );
	}

	const handleSearching = async () => {
		let filtered = [];

		const addToFilteredItems = item => {
			filtered.push((
				<Item 
					{...item}
					key={uniqid()}
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

	const debouncedFiltering = debounce( handleSearching, 500 );
	const memoizedFiltering = React.useCallback(debouncedFiltering, [search, items]);

	React.useEffect(() => memoizedFiltering(), [search, items]);
	React.useEffect(() => getItems(), []);

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
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell><b>Item name</b></TableCell>
		            <TableCell align="right"><b>Date purchased</b></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{ renderedItems }
						</TableBody>
					</Table>
				</TableContainer>
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

	return `${_month}-${_date}-${_year}`;
}


export default ItemList;