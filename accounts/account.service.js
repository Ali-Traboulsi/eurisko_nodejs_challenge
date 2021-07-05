/*
This file containes the core buisness logic required for signup and verficiation, authentication with JWT and refresh token, forgot password, and reset password functionalities.

It plays the role of a controller in an mvc structure where it provides the interaction between the model and the controller routes which uses the methods provided in this service file
 */

const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const Role = require('_helpers/role');
const sendEmail = require('_helpers/send_email');
const db = require('_helpers/db');
const dd = require('dump-die');

// authenticate
const authenticate = async ({ email, password, ipAddress }) => {
    const account = await db.Account.findOne({ email });

    if (account.isEnabled === false){
        throw 'User is disabled. You are no longer able to login until Admin enables you again!'
    }

    if (!account || !bcrypt.compareSync(password, account.passwordHash)) {
        throw 'Email or password is incorrect';
    }

    // if the account is verfied
    /* ------------------------- */
    // generate a jwt tokem
    const jwtToken = generateJwtToken(account);

    // generate a refresh token
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save the refreshToken
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    }
}

const refreshToken = async ({ token, ipAddress }) => {
    const refreshToken = await getRefreshToken(token);

    // if (!refreshToken.account.isEnabled) return 'User is disabled. You are no longer able to login until Admin enables you again!';

    const { account } = refreshToken;

    // replace old refresh token with new one and save to db
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;

    await refreshToken.save();
    await newRefreshToken.save();

    // generate a new jwt

    const jwtToken = generateJwtToken(account);

    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token,
    };
}

// revoke token
const revokeToken = async ({ token, ipAddress }) => {
    const refreshToken = await getRefreshToken(token);

    // if (!refreshToken.account.isEnabled) return 'User is disabled. You are no longer able to login until Admin enables you again!';

    // revoke and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

// register an account in the db model account
const register = async (params, origin) => {
    // first step is to validate for an already registered user
    if (await db.Account.findOne({ email: params.email })) {
        return sendAlreadyRegisteredEmail(params.email, origin);
    }

    // create an account model object
    const account = new db.Account(params);

    // first registered user is an admin
    const isFirstRegistered = (await db.Account.countDocuments({})) === 0;
    account.role = isFirstRegistered ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();

    // hash the password
    account.passwordHash = hash(params.password);

    // save the account
    await account.save();

    // send a verification email upon completion
    await sendVerificationEmail(account, origin);
}


// verify email after sending the message anc clicking on the click by updating account properties in the db
const verifyEmail = async (token) => {
    const account = await db.Account.findOne({ verificationToken: token });

    if (!account.isEnabled) throw 'User is disabled. You are no longer able to login until Admin enables you again!';

    if (!account) throw 'Verification Failed';

    account.verified = Date.now();
    account.verificationToken = undefined;
    account.isVerified = true;
    await account.save();
}


/*
next step in resetting the password involves, sending a forgot password email to the registered account, validating the reset token, and resetting the password by updating the password property inside the db and save it
 */

// forgot password
const forgotPassword = async ({ email }, origin) => {
    const account = db.Account.findOne({ email });

    if (!account.isEnabled) return 'User is disabled. You are no longer able to login until Admin enables you again!';

    if (!account) return;

    account.resetToken = {
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
    }

    // save to db
    await account.save();

    // send forgot password email
    await sendPasswordResetEmail(account, origin);
}

// validate the reset token
const validateResetToken = async ({ token }) => {
    const account = await db.Account.findOne({
        'resetToken.token' : token,
        'resetToken.expires': {$gt: Date.now()}
    });

    if (!account.isEnabled) return 'User is disabled. You are no longer able to login until Admin enables you again!';

    if (!account) throw 'Invalid Token'
}

const resetPassword = async (token, password) => {
    const account = await db.Account.findOne({
        'resetToken.token': token,
        'resetToken.expires': { $gt: Date.now() }
    });

    if (!account) throw 'Invalid Token';

    account.passwordHash = hash(password);
    account.passwordReset = Date.now();
    account.ResetToken = undefined;

    await account.save();
};


// get all accounts
const getAll = async (req, res, next) => {
    const accounts = await db.Account.find();
    return accounts.map(x => basicDetails(x))

}


// get a single account
const getById = async (id) => {
    const account = await getAccount(id);

    if (!account.isEnabled) return 'User is disabled. You are no longer able to login until Admin enables you again!';

    return res.status(201).json({
        success: true,
        data: basicDetails(account)
    })
}


const create = async (params) => {
    // validate if account already registered
    if (await db.Account.findOne({email: params.email})) {
        throw `Email: ${params.email} is already registered`
    }

    const account = new db.Account(params);
    account.verified = Date.now();

    // hash the password
    account.password = hash(params.password);

    // save to db
    await account.save();

    return basicDetails(account)

}

const update = async (id, params) => {
    const account = await getAccount(id);

    if (!account.isEnabled) return 'User is disabled. You are no longer able to login until Admin enables you again!';

    // // validate if email was changed
    // if (params.email && account.email === params.email && await db.Account.findOne({email: params.email})) {
    //     throw `Email: ${params.email} is already taken`;
    // }

    if (params.email) throw 'You are not allowed to change your email'

    // hash the password if entered
    if (params.password) {
        params.passwordHash = hash(params.password);
    }

    // copy params to account details
    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();

    return basicDetails(account);
}


const _delete = async (id) => {
    const account = await getAccount(id);
    await account.remove();
}

const disableUser = async (id) => {
    const account = await getAccount(id);
    if (!account.isEnabled) {
      return res.json({message: 'User already disabled'})
    }
    account.isEnabled = false;
    return res.status(201).json({
        success: true,
        message: 'User Disabled Successfully!'
    });
}

const enableUser = async (id) => {
    const account = await getAccount(id);
    if (account.isEnabled) {
        return res.json({message: 'User already Enabled'})
    }
    account.isEnabled = true;
    return res.status(201).json({
        success: true,
        message: 'User Enabled Successfully!'
    });
}


const getAccount = async (id) => {
    if (!db.isValidId(id)) throw 'Invalid Id. Account Not Found!';
    const account = await db.Account.findById(id);
    if (!account) throw 'Account Not Found'
    return account;
}

const sendAlreadyRegisteredEmail = async (email, origin) => {
    let message;
    if (origin) {
        message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password"></a></p>`
    } else {
        message = `<p>If you don't know your password, you can reset it via the <code>/acount/forgot-password</code>api route</p>`
    }

    await sendEmail({
        to: email,
        subject: 'Sign-Up Verification API - Email Already Registered',
        html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered. </p>
               ${message}`
    });
}

const sendVerificationEmail = async (account, origin) => {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
        message = `<p>Please click on the link below to verify your email address</p>
<p><a href="${verifyUrl}">${verifyUrl}</a></p> `
    } else {
        message = `<p>Please use the below token to verify your email address with the the <code>/account/verify-email?token=${account.verificationToken}</code></p>`
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up verification API - Verify Email',
        html: `<h4>Verify Email</h4>
                <p>Thanks for Registering!</p>
                <p>${message}</p> `
    });
}

const hash = (password) => {
    return bcrypt.hashSync(password, 10);
}


// Send reset password email
const sendPasswordResetEmail = async (account, origin) => {
    let message;
    if (origin) {
        const resetUrl = `${origin}/account/reset-password?token=${account.resetToken.token}`;
        message = `<p>Please click on the link below to reset your password, the link is valid for 7 days:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p> `
    } else  {
        message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
    <p><code>${account.resetToken.token}</code></p> `;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-Up Verification API - Reset Password',
        html: `<h4>Password Reset Email</h4>
                ${message}`
    });
}

const getRefreshToken = async (token) => {
    const refreshToken = await db.RefreshToken.findOne({ token }).populate('account');
    if (!refreshToken || !refreshToken.isActive)  throw 'Invalid Token'
    return refreshToken;
}

const generateJwtToken = (account) => {
    return jwt.sign( {sub: account.id, id: account.id }, config.secret, { expiresIn: '15m'});
}

const generateRefreshToken = (account, ipAddress) => {
    return new db.RefreshToken({
        account: account.id,
        token: jwt.sign({id: account.id}, config.secretRefresh, {expiresIn: "7d"}),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress,
    })
}

const randomTokenString = () => {
    return crypto.randomBytes(40).toString('hex');
}

const basicDetails = (account) => {
    const {id, title, firstName, lastName, email, role, created, updated, isVerified} = account;
    return {
        id, title, firstName, lastName, email, role, created, updated, isVerified
    };
}

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    disableUser,
    enableUser
};
