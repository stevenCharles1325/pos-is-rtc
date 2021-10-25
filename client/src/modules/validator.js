export default class Validator{
	constructor( options ){
		this.defaultMinLength = 8;
		this.validatorMessage = null;

		this.allMinLength = options?.allMinLength ?? this.defaultMinLength;

		this.unameMinLength = options?.unameMinLength ?? this.allMinLength;		
		this.passMinLength = options?.passMinLength ?? this.allMinLength;

		this.passStrenght = options?.passStrenght?.toLowerCase?.() ?? 'low';

		this.acceptedEmailAddress = ['@gmail.com', '@yahoo.com'];

		this.evaluatePasswordStrength( this.passStrenght );
	}

	get message(){
		return this.validatorMessage;
	}

	setMessage( msg ){
		this.validatorMessage = msg;
	}

	useLowLevelPassValidator(){
		this.passValidator = ( pass ) => {
			// level 1 - check length
			// level 2 - check if it has uppercase letter, at least 1
			// level 3 - check if it has special character, at least 1

			if( pass.length < this.passMinLength ){
				this.setMessage(`Length must be > ${ this.passMinLength }`);
			}
			else if( pass.countUpperCase() < 1 ){
				this.setMessage(`uppercase letters must be greater than 1`);
			}
			else if( pass.countSpecialChar() < 1 ){
				this.setMessage(`special characters must be greater than 1`);
			}
		}
	}

	useMidLevelPassValidator(){
		this.passValidator = ( pass ) => {
			// level 1 - check length
			// level 2 - check if it has uppercase letter, at least 3
			// level 3 - check if it has special character, at least 3

			if( pass.length < this.passMinLength ){
				this.setMessage(`length must be > ${ this.passMinLength }`);
			}
			else if( pass.countUpperCase() < 3 ){
				this.setMessage(`uppercase letters must be greater than 3`);
			}
			else if( pass.countSpecialChar() < 3 ){
				this.setMessage(`special characters must be greater than 3`);
			}
		}
	}

	useHighLevelPassValidator(){
		this.passValidator = ( pass ) => {
			// level 1 - check length
			// level 2 - check if it has uppercase letter, at least 5
			// level 3 - check if it has special character, at least 5

			if( pass.length < this.passMinLength ){
				this.setMessage(`length must be > ${ this.passMinLength }`);
			}
			else if( pass.countUpperCase() < 5 ){
				this.setMessage(`uppercase letters must be greater than 5`);
			}
			else if( pass.countSpecialChar() < 5 ){
				this.setMessage(`special characters must be greater than 5`);
			}
		}
	}

	evaluatePasswordStrength( strength ){
		switch( strength ){
			case 'low':
				return this.useLowLevelPassValidator();

			case 'mid':
				return this.useMidLevelPassValidator();

			case 'high':
				return this.useHighLevelPassValidator();

			default:
				return this.useLowLevelPassValidator();
		}	
	}

	validate( input, type ){
		this.setMessage('');
		console.log(input, type);
		switch( type ){
			case 'username':
				if( input.length < this.unameMinLength ){
					this.setMessage(`length must be greater than ${ this.unameMinLength }`);
				}
				break;

			case 'password':
				this.passValidator( input );
				break;

			case 'email':
				if( !input.length ){
					this.setMessage('invalid E-mail address');
				}
				else{
					let finderCount = 0;

					this.acceptedEmailAddress.forEach( email => {
						if( input.split(email).length > 1 && input.split(email)[1] === '' ){
							finderCount += 1;
						}
					});

					if( !finderCount ){
						this.setMessage('invalid E-mail address');
					}
				}
				break;

			default:
				throw new Error(`Validator error: Unknown type of ${ type }`);
		}
	}
}

// Count uppercase
String.prototype.countUpperCase = function(){
	const regexp = /[A-Z]/g;
	const value = Object.values( this ).join('');

	if( !value.length ) return 0;

	const matches = value.matchAll( regexp );
	let counter = 0;

	while( !matches.next().done ) counter += 1;

	return counter;
}

// Count lowercase
String.prototype.countLowerCase = function(){
	const regexp = /[a-z]/g;
	const value = Object.values( this ).join('');
    
	if( !value.length ) return 0;

	const matches = value.matchAll( regexp );
	let counter = 0;

	while( !matches.next().done ) counter += 1;

	return counter;
}

// Count special characters
String.prototype.countSpecialChar = function(){
	const regexp = /\w/g;
	const value = Object.values( this ).join('')
	const specialChars = value.replaceAll( regexp, '' );
    
	if( !value.length || !specialChars ) return 0;

	return specialChars.length;
}

// Count numerical characters
String.prototype.countNumericalChar = function(){
	const regexp = /[0-9]/g;
	const value = Object.values( this ).join('');
    
    if( value.search(regexp) < 0 ) return 0;
	if( !value.length ) return 0;

	const matches = value.matchAll( regexp );
	let counter = 0;

	while( !matches.next().done ) counter += 1;

	return counter;
}