import React from 'react';
import ButtonBase from '@mui/material/ButtonBase';

const CountCard = props => {
	return(
		<div className="rounded" onClick={props?.onClick}>
			<div 
				style={{
					width: '250px',
					height: 'fit-content',
					minHeight: '150px',
					color: '#5b5d5a',
				}}
				className="d-flex flex-column justify-content-start align-items-start rounded shadow bg-white overflow-hidden"
			>
				<div 
					style={{
						height: '35px',
						background: '#6a6c68',
						color: 'white',
						width: '100%'
					}}
					className="border-bottom text-white shadow"
				>
					<p 
						style={{
							letterSpacing: '1px'
						}}
						className="text-left text-truncate text-capitalize px-3 py-1"
					>
						{ props?.title }
					</p>
				</div>
				{
					props?.icon
						?	<div className="p-3">
								<props.icon fontSize="large"/>
							</div>
						: null
				}
				{
					props?.data
						?	<div className="px-3 pb-3">
								{
									props?.offOver
										? 	<p>{ props?.data }</p>
										:	<p><b>{ props?.data?.count }</b> /{ props?.data?.countLabel }</p>
								}
							</div>
						: null
				}
			</div>
		</div>
	);
}


export default CountCard;