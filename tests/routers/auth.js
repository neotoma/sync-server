// Module //

it('throws error when app parameter not provided');
it('throws error when app parameter has no host property');
it('throws error when model parameter not provided');
it('throws error when model parameter has no modelName property');
it('throws error when model parameter has no modelType property');
it('throws error when model parameter has invalid modelType property');
it('throws error when document parameter not provided');
it('throws error when document parameter has no id property');
it('throws error when document parameter has no passportStrategy property');
it('throws error when document parameter has no clientId property');
it('throws error when document parameter has no clientSecret property');
it('throws error when clientId and clientSecret pair invalid');

it('installs passport strategy if not installed already');
it('throws error if passport strategy could not be installed');

// Auth route //

it('redirects to document authentication URL');
it('stores redirect URL in session if provided in query');
it('stores no redirect URL in session if not provided in query');
it('delete existing redirect URL in session if not provided in query');

// Auth callback route //

it('creates new session with user object');
it('returns 500 internal error status code if error encountered');

// -- No session with user previously
it('user object in session matches new userAuth if no userId match with existing userAuth');
it('user object in session matches existing userAuth if userId match with existing userAuth');
it('user object in session matches new user if userId match with existing user');
it('user object in session matches existing user if userId match with existing user');

// -- Session with user previously
it('user object in session matches previous session user if already authenticated');
it('user object in session matches new userAuth and existing session user if no userId match with existing userAuth and user already authenticated');
it('user object in session matches existing userAuth and existing session user if userId match with existing userAuth and user already authenticated');

it('redirects to redirect URL in session if available'); 
it('redirects to sessions endpoint if no redirect URL available in session');