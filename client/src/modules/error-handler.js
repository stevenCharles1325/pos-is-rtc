import axios from 'axios';
import Cookies from 'js-cookie';

export default class ErrorHandler{
	constructor( limit, delay ){
		this.limit = limit ?? 5;
		this.delay = delay ?? 1000;

		this.rToken = Cookies.get('rtoken');

		this.timeTable = {};
	}

	handle( err, self, id, callback, data ){
		if( !err ) return;
		if( !id ) return console.warn('ErrorHandler handle function has no ID');

		if( this.timeTable?.[ id ] <= 0 ){
			console.warn(`ErrorHandler with id ${ id } has reached its maximum tries of ${ this.limit }`);
			return callback?.();
		}

		if( this.timeTable[ id ] === null ||  this.timeTable[ id ] === undefined ){
			console.error( err );
			console.warn('ErrorHandler received an error.');

			this.timeTable[ id ] = this.limit;
			this.handle( err, self, id, callback, data );
		}
		else{
			console.log('Recovering...');
			this.timeTable[ id ] --;

			if( err?.response?.status ){
				const status = err?.response?.status;
				const message = err?.response?.data?.message;

				console.log( status );
				switch( status ){
					case 400:
						console.log(`[400 - BAD REQUEST]: ${ message ?? '' }`);			
						break;

					case 401:
						console.log(`[401 - UNAUTHORIZED]: ${ message ?? '' }`);

						axios.post('http://localhost:3500/auth/refresh-token', { rtoken: this.rToken })
						.then( res => {
							Cookies.set('token', res.data.accessToken);

							setTimeout(() => self(data), this.delay);					
						})
						.catch( err => console.error( err ));
						break;

					case 403:
						console.log(`[403 - FORBIDDEN]: ${ message ?? '' }`);
						break;

					case 404:
						console.log(`[404 - NOT FOUND]: ${ message ?? '' }`);
						break;

					case 405:
						console.log(`[404 - METHOD NOT ALLOWED]: ${ message ?? '' }`);
						break;

					case 500:
						setTimeout(() => self(data), this.delay);					

						console.log(`[500 - SERVER ERROR]: ${ message ?? '' }`);
						console.warn('ErrorHandler will now try to recover.');
						break;

					case 503:
						setTimeout(() => self(data), this.delay);					

						console.log(`[503 - SERVICE UNAVAILABLE]: ${ message ?? '' }`);
						console.warn('ErrorHandler will now try to recover.');
						break;

					default:
						console.log(`[ERROR]: ${ message ? message + ', ' : '' } please try again.`);
						break;
				}
			}
		}
	}
}