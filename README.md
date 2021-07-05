# eurisko_nodejs_challenge

## First : Role-based Authentication


#### Authaurize.js

it contains a function that returns two functions:   

- the first is to authenticate the user based on options set as parameter object
and it will attach the user object (id, role) to the req object.

- The second function checks if the requested route is authaurized for the user-authenticated role. If not, it will return an error. If yes, it will authaurize the user.



> External Note:
> How JWT works
>  
> a JWT is an encoded string of characters which is safe to send between two computers if they both have HTTPS. The token represent a value generated using a payload (claims) and a secret key, and this value is accessible only by the computer that has access the the secret key. 
> for ex: the user wants to sign in. He will use his credentials such as an email and pass. a req is sent to the server where credentials are checked for validness. if true, a token is created usign the desired payload and a scret key. Tghe resulting encrypted token is sent back to the client that in turns saves the token to be used in other requests (authenticated Routes).
>


### Nodejs authentication using mongodb

- First step was to define helper functions thta include:
	+ a db file that connects to the mongodb database using mongoose
	+ a role file that specifies user roles in an object
	+ a send email file that defines a function that sends a verfication email to the user upon registration 
	
- Next step was to define the middleware functions that include:
	+ an authorize file that defines a functon that authenticates user based on their roles by validating an authentication token and authorizes the account based on his role. Upon successful authentication, it attaches the role property and ownsToken property to the req.user object to be accessed later in the controller
	+ a error handler function that depicts all the errors and returns a specific error based on switch cases
	+ a validate request files that defines a function that will validate the request against a validation schema that will be defined in the controller

- Third step was to define model schmas for mongodb collections


## Structure

The app is structured in way that prevents redundant code and enhances reusability and code integrity and readability. 

|----_helpers
|----_midleware
|----accounts
|----catUploads
|----controllers
|----itemUploads
|----models
|----services

#### _helpers: 
--------

- contain files that define fucntions for various purposes it's use 