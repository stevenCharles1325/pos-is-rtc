import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

import { Bar, Pie } from 'react-chartjs-2';

import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import dashBoardPhoto from '../images/pic1.jpg';

const Dashboard = props => {
	const { errorHandler, name, setToThisView, role } = props.tools;

	const [monthlyIncome, setMonthlyIncome] = React.useState( null );
	const [adminCount, setAdminCount] = React.useState( 0 );
	const [employeeCount, setEmployeeCount] = React.useState( 0 );

	const scales = {
	    yAxes: [
	        {
	            ticks: {
	                beginAtZero: true,
	            }
	        }
	    ]
	}

    const legend = {
        labels: {
            font:{
                family: 'Poppins'
            }
        }
    } 

	const options = {
        color: 'rgb(255, 255, 255)',
        scales: scales,
        legend: legend
    }

    const config = gData => ({
		data : {
	        labels: Object.keys( gData ).slice( 2, 14 ) ,
	        datasets: [
	            {
	                label: `Year ${Object.values( gData )[1]}`,
	                data: Object.values( gData ).slice( 2, 14 ),
	                fill: false,
	                backgroundColor: ['rgb(100, 100, 100)', 'rgb(196, 196, 196)'],
	                borderColor: 'rgba(255, 255, 255, 0.5)'
	            }
	        ] 
		}
	});


	React.useEffect(() => {

	}, []);

	React.useEffect(() => {
		const getGrapData = async () => {
			const token = Cookies.get('token');

			axios.get(`http://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/graph-data`, {
				headers: {
					'authentication': `Bearer ${ token }`
				}
			})
			.then( res => {
				setMonthlyIncome( res.data.report );
				setAdminCount( res.data.adminCount );
				setEmployeeCount( res.data.employeeCount );
			})
			.catch( err => {
				errorHandler.handle( err, getGrapData, 9 );
			});
		}

		getGrapData();
	}, []);


	return(
		<div 
			style={{
				width: '100%',
				height: '100%',
				margin: '0',
				paddingTop: '15vh',
				overflowY: 'auto',
				overflowX: 'hidden',
				backgroundColor:'transparent'
			}}
			className="row d-flex justify-content-around align-items-center"
		>	
			<div className="ml-0 p-1 col-md-7" style={{height: 'fit-content'}}>
					{ 
						monthlyIncome
							? (
								<Paper elevation={10} sx={{ width: '100%', height: '100%', padding: '10px' }}>
									<Bar 
										width="100px"
										height="60px"
										stlye={{backgroundColor: 'transparent'}}
										{...config( monthlyIncome )}
										{...options}
									/>	
								</Paper>
								)
							: <Skeleton animation="wave" variant="rectangular" width="100%" height="450px"/>
					}
			</div>
			{
				props?.tools?.role === 'sysadmin' && monthlyIncome
					? 	<div className="col-md-4 ml-0 p-1 my-3">
							<Paper elevation={10} sx={{ width: '100%', height: '100%', padding: '10px' }}>
								<Bar
									data={{
										labels: ['Administrator', 'Employee'],
								        datasets: [
								            {
								                label: `User count`,
								                data: [adminCount, employeeCount],
								                fill: false,
								                backgroundColor: ['rgb(100, 100, 100)', 'rgb(196, 196, 196)'],
								                borderColor: 'rgba(255, 255, 255, 0.5)'
								            }
								        ]
									}}
									{...options}
								/>
							</Paper>
						</div>
					: null
			}
			{/*<div className="m-0 p-2 col-md-4">
				<Card sx={{ maxWidth: 500, height: 400 }}>
			      {
			      	monthlyIncome && dashBoardPhoto
			      		? (
			      			<>	
				      			<CardMedia
							        component="img"
							        height="250"
							        image={dashBoardPhoto}
							        alt="green iguana"
							      />
			      			</>
			      		)
			      		: <Skeleton animation="wave" variant="rectangular" width="100%" height="250px"/>
			      }
			      <CardContent>
			        <Typography gutterBottom variant="h5" component="div">
			          {
			          	monthlyIncome
			          		? `Hi ${ name }!`
			          		: <Skeleton animation="wave"/>
			          }
			        </Typography>
			        <Typography variant="body2" color="text.secondary">
			          {
			          	monthlyIncome
			          		? `The highest income this ${ monthlyIncome?.year ?? '' } is ${ getHighestValue( monthlyIncome )?.[0] ?? '' } in month ${ getHighestValue( monthlyIncome )?.[1] ?? '' }.`
			          		: <Skeleton animation="wave"/>
			          }		
			        </Typography>
			      </CardContent>
			      <CardActions>
			      	{
			      		monthlyIncome
			      			? (
			      				<>
							        <Button size="small" onClick={() => window.location.reload( true )}>Refresh</Button>
			      				</>
			      			)
			      			: (
			      				<>
			      					<Skeleton animation="wave" variant="rectangular" width={70} height={25}/>
			      				</>
			      			)
			      	}
			      </CardActions>
			    </Card>
			</div>*/}
		</div>
	);
}

const getHighestValue = monIncome => {
	if( !monIncome ) return;

	let highest = -Infinity;
	let key = null;

	Object.keys( monIncome ).slice(2, 14).forEach( month => {
		if( monIncome[ month ] >= highest ){
			highest = monIncome[ month ];
			key = month;
		} 
	});

	return [highest, key]
}

export default Dashboard;