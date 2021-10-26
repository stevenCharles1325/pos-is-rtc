import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';

// import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import AppBar from '@mui/material/AppBar';
import MenuItem from '@mui/material/MenuItem';
import { styled, alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';


const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  }
}));

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


const Appbar = props => {
	const { 
		name, 
		search,
		setSearch, 
		setToThisView
	} = props.tools;
	
	const [anchorEl, setAnchorEl] = React.useState( null );
	const open = Boolean( anchorEl );

	const [windowWidth, setWindowWidth] = React.useState( window.innerWidth );

	const handleClickBadge = event =>{ 
		setAnchorEl( event.currentTarget );
	}

	const handleClose = () => {
		setAnchorEl( null );
	}

	const handleSignOut = () => {
		setAnchorEl( null );

		const token = Cookies.get('token');
		axios.delete('http://localhost:3500/sign-out', {
			headers: {
				'authentication': `Bearer ${ token }`
			}
		})
		.then( res => {
			Cookies.remove('token');
			Cookies.remove('rtoken');

			// Also clear history
			setToThisView('/sign-in');
		});
	}

	const handleLinkClick = e => {
		const linkName = e.target.innerText.toLowerCase();
		const pathname = window.location.pathname.replace('/', '');

		if( linkName === pathname ) e.preventDefault();
	}

	const resize = () => {
		setWindowWidth( window.innerWidth );
	}

	const handleSearch = e => {
		setSearch( e.target.value );
	}


	React.useEffect(() => {
		window.addEventListener('resize', resize);

		return () => window.removeEventListener('resize', resize);
	}, []);

	return(
		<AppBar
			sx={{
				padding: '0 20px 0px 20px',
				bgcolor: 'rgba(0, 0, 0, 0.7)',
			}}
		>
			<Stack 
				direction="row" 
				spacing={2}
				sx={{ 
					color: 'white',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between'
				}}
			>
				<Breadcrumbs
					color="rgba(255, 255, 255, 0.8)"
				>
					<Link 
						style={{
							color: window.location.pathname.includes('dashboard') ? 'rgba(255, 255, 255, 0.6)' : 'white',
							textDecoration: 'none'
						}}
						to="/dashboard"
						onClick={handleLinkClick}
					>	
						<Typography variant="h7" sx={{ letterSpacing: '1px'}}>
							dashboard
						</Typography>
					</Link>
					<Link 
						style={{
							color: window.location.pathname.includes('inventory') ? 'rgba(255, 255, 255, 0.6)' : 'white',
							textDecoration: 'none'
						}}
						to="/inventory"
						onClick={handleLinkClick}
					>
						<Typography variant="h7" sx={{ letterSpacing: '1px'}}>
							inventory
						</Typography>
					</Link>
				</Breadcrumbs>

				{
					windowWidth > 620 && window.location.pathname.includes('inventory')
						? (
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
							)
						: null
				}
					<IconButton
						size="large"
						color="inherit"
					>
						<StyledBadge
							overlap="circular"
					        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					        variant="dot"
						>	
							<Tooltip title={ name } placement="left">
								<Avatar
									sx={{ bgcolor: 'rgba(200, 200, 200, 1)', color: 'black'}}
									onClick={ handleClickBadge }
								> 
									<Typography variant="h7">
										{ name?.[0]?.toUpperCase?.() ?? "Hi" } 
									</Typography>
								</Avatar>
							</Tooltip>
							<Menu
								open={ open }
								anchorEl={ anchorEl }
								onClose={ handleClose }
							>
								<MenuItem onClick={handleSignOut}>Sign-out</MenuItem>
							</Menu>
						</StyledBadge>
					</IconButton>
			</Stack>
		</AppBar>
	);
}


export default Appbar;