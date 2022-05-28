import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import debounce from 'lodash.debounce';
import Cookies from 'js-cookie';
import uniqid from 'uniqid';
import axios from 'axios';

import ReactToPrint from 'react-to-print';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';

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
import DownloadIcon from '@mui/icons-material/Download';

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


const monthIndices = {
		'Jan': 0,
		'Feb': 1,
		'Mar': 2,
		'Apr': 3,
		'May': 4,
		'Jun': 5,
		'Jul': 6,
		'Aug': 7,
		'Sep': 8,
		'Oct': 9,
		'Nov': 10,
		'Dec': 11,
}

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
			<TableCell align="right"> { props.date.split(' ').filter((_, i) => i < 5).join(' ') } </TableCell>
		</TableRow>
	);
}

const Item2 = props => {
	const { enqueueSnackbar } = useSnackbar();
	const [elevated, setElevated] = React.useState( false );

	return(
		<TableRow sx={{ paddingTop: '5px', paddingBottom: '5px' }}>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.year } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.month[ 0 ] } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.month[ 1 ] } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.month[ 2 ] } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.month[ 3 ] } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.month[ 4 ] } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.month[ 5 ] } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.month[ 6 ] } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.month[ 7 ] } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.month[ 8 ] } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.month[ 9 ] } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.month[ 10 ] } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.month[ 11 ] } </TableCell>
			<TableCell sx={{ paddingTop: '5px', paddingBottom: '5px' }} component="th" scope="row"> { props.total } </TableCell>
		</TableRow>
	);
}

const Inventory = props => {
	const chunksLimit = 7;
	const [page, setPage] = React.useState( 1 );
	const [page2, setPage2] = React.useState( 1 );

	const { errorHandler, search, setSearch } = props.tools;
	const { enqueueSnackbar } = useSnackbar();

	const [windowWidth, setWindowWidth] = React.useState( window.innerWidth );
	const [openAddBox, setOpenAddBox] = React.useState( false );
	const [openEditBox, setOpenEditBox] = React.useState( false );

	const [items, setItems] = React.useState( [] );
	const [message, setMessage] = React.useState( null );
	const [renderedItems, setRenderedItems] = React.useState( [] );
	const [records, setRecords] = React.useState( [] );
	const [years, setYears] = React.useState( {} );
	const [totalCash, setTotalCash] = React.useState( 0 );

	const dailyReportRef = React.useRef( null );
	const annualReportRef = React.useRef( null );

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

		items.forEach( item => {
			if( new Date( item.date ).toString().split(' ').slice(0, 4).join(' ') === new Date().toString().split(' ').slice(0, 4).join(' ')  ){
				setTotalCash( totalCash => totalCash + item.srp );
			}
		});

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

	React.useEffect(() => {
		if( items.length ){
			items?.forEach?.( item => {
					if( years?.[ item.year ] ){
						let index = monthIndices[ item.month ];
							
						years[ item.year ][ index ] += 1;
					}
					else{
						const year = item.year;

						const newYearsRecord = { ...years };
						newYearsRecord[ year ] = Array( 12 ).fill( 0 )

						setYears(() => ({ ...newYearsRecord }));
					}						
			});
		}
	}, [items, years]);

	React.useEffect(() => {
			let yearKeys = Object.keys( years );

			if( yearKeys.length	){
				const chunkLimit = 7;
				const yrList = [];
				let chunkSet = [];

				yearKeys.reverse();

				yearKeys.forEach( yr => {
					yrList.push(
								<Item2
									key={uniqid()}
									year={ yr }
									month={ [...years[ yr ].map( datum => Math.floor(datum))] }
									total={ Math.floor(years[ yr ].reduce((val, accum) => val + accum)) }
								/>
						);
				});

				let index = 0;
				do{
					const chunk = yrList.slice(index, index + chunksLimit);

					chunkSet.push( chunk );	

					index += chunksLimit;
				}
				while( chunkSet.length < Math.floor( yrList.length / chunksLimit ) + (yrList % chunksLimit === 0 ? 0 : 1 ));

				setRecords(() => [ ...chunkSet ]);
			}		
	}, [years]);

	React.useEffect(() => {
		if( records.length ){
			if( page2 === records.length && !records[ records.length - 1 ].length ){
				if( page2 - 1 > 0 ){
					setPage2( page2 => page2 - 1 );
				}
			}
		}
	}, [records, page2]);

	const handleDownload = recordType => {
		axios.get(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/download/record-type/${recordType}`)
		.then( res => {
			const link = document.createElement('a');
			
			link.href = res.data.path;
			link.setAttribute('download', res.data.name );

			enqueueSnackbar( res.data.message, { variant: 'success' });
			
			document.body.appendChild(link);
			link.click();
		})
		.catch( err => {
			enqueueSnackbar( err?.response?.data?.message ?? 'Please try again!', { variant: 'error' });
			throw err;
		});
	}

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
				className="row"
			>
				<Paper sx={{ height: '500px' }}>
					<Stack sx={{ height: '500px' }} direction="column" justifyContent="space-between" alignItems="center">
						<TableContainer ref={dailyReportRef}>
							<Table>
								<TableHead>
									<TableRow>
				            <TableCell align="left"><b>Sold By</b></TableCell>
				            <TableCell align="right"><b>Item Name</b></TableCell>
				            <TableCell align="right"><b>Price</b></TableCell>
				            <TableCell align="right"><b>Date Released</b></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{ renderedItems[ page - 1 ] }
								</TableBody>
							</Table>
						</TableContainer>
						<div className="row col-12 my-2 d-flex flex-row justify-content-center align-items-center">
							<div className="col-4 d-flex justify-content-center align-items-center">
									<p className="m-0">Total Cash Today: { totalCash }</p>
							</div>
							<div className="col-4 d-flex justify-content-center align-items-center">
								<Pagination count={ !renderedItems?.[ renderedItems?.length - 1 ]?.length ? renderedItems?.length - 1 : renderedItems?.length } page={page} onChange={(_, value) => setPage( value )}/>
							</div>
							<div className="col-4 d-flex justify-content-end align-items-center">
									<DownloadButton onClick={() => handleDownload('daily')}/>
									<ReactToPrint
										trigger={() => (
											<IconButton>
												<LocalPrintshopIcon/>
											</IconButton>
										)}
										content={() => dailyReportRef.current}
									/>
							</div>
						</div>
					</Stack>
				</Paper>
				<br/>
				<Divider/>
				<br/>
				<Paper sx={{ height: '500px', marginBottom: '100px' }}>
					<Stack sx={{ height: '500px' }} direction="column" justifyContent="space-between" alignItems="center">
						<TableContainer ref={annualReportRef}>
							<Table>
								<TableHead>
									<TableRow>
				            <TableCell align="left"><b>Year</b></TableCell>
				            <TableCell align="left"><b>Jan</b></TableCell>
				            <TableCell align="left"><b>Feb</b></TableCell>
				            <TableCell align="left"><b>Mar</b></TableCell>
				            <TableCell align="left"><b>Apr</b></TableCell>
				            <TableCell align="left"><b>May</b></TableCell>
				            <TableCell align="left"><b>Jun</b></TableCell>
				            <TableCell align="left"><b>Jul</b></TableCell>
				            <TableCell align="left"><b>Aug</b></TableCell>
				            <TableCell align="left"><b>Sep</b></TableCell>
				            <TableCell align="left"><b>Oct</b></TableCell>
				            <TableCell align="left"><b>Nov</b></TableCell>
				            <TableCell align="left"><b>Dec</b></TableCell>
				            <TableCell align="left"><b>Total</b></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{ records[ page2 - 1 ] }
								</TableBody>
							</Table>
						</TableContainer>
						<div className="row col-12 my-2 d-flex flex-row justify-content-center align-items-center">
							<div className="col-6 d-flex justify-content-center align-items-center">
								<Pagination count={ !records?.[ records?.length - 1 ]?.length ? records?.length - 1 : records?.length } page={page2} onChange={(_, value) => setPage2( value )}/>
							</div>
							<div className="col-6 d-flex justify-content-end align-items-center">
									<DownloadButton onClick={() => handleDownload('annual')}/>
									<ReactToPrint
										trigger={() => (
											<IconButton>
												<LocalPrintshopIcon/>
											</IconButton>
										)}
										content={() => annualReportRef.current}
									/>
							</div>
						</div>
					</Stack>
				</Paper>
			</div>
		</div>
	);
}


const DownloadButton = props => {
	return(
		<IconButton onClick={props?.onClick}>
			<DownloadIcon/>
		</IconButton>
	);
}

// const DownloadButton = props => {
// 	return(
// 		<IconButton onClick={props?.onClick}>
// 			<DownloadIcon/>
// 		</IconButton>
// 	);
// }

const renderDate = date => {
	if( !date ) return '';

	const _parsedDate = new Date( date );
	const _date = _parsedDate.getDate();
	const _month = _parsedDate.getMonth() + 1;
	const _year = _parsedDate.getFullYear();

	return `${_year}-${_month}-${_date}`;
}
export default Inventory;