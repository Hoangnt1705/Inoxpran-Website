'use strict'

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const KeyTokenService = require('./keyToken.service');
const { getInfoData } = require("../utils/index");
const { ConflictRequestError, BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {


    static handlerRereshTokenV2 = async ({ keyStore, user, refreshToken }) => {
        const { userId, email } = user;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError(' Something warrning happend !! Pls relogin')
        }
        //
        if(keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop not registered1');
        
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError('Shop not registered2');
        
        // create 1 cap moi
        const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey);

        //update token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        });
        holderToken.save();
        return {
            user: { userId, email },
            tokens
        }
    }
    /*
    check this token used?
    */

    static handlerRereshToken = async (refreshToken) => {
        // check xem ttoken nay da dc su dung chua
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
                console.log('....<<<<<>>>>>>', foundToken);

        if (foundToken) {
            // decode xem thang nay la thang nao?
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey);
            console.log({ userId, email }, 'decode refreshToken');
            // xoa tat ca token trong keyStore 
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError(' Something warrning happend !! Pls relogin')
        }

        // NO, qua ngon
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if (!holderToken) throw new AuthFailureError('Shop not registered1');

        // verifyToken
        const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey);
        console.log('[2] --', {userId, email});
        
        // check UserId
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError('Shop not registered2');
        
        // create 1 cap moi
        const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey);

        //update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        });
        holderToken.save();
        return {
            user: { userId, email },
            tokens
        }
    }
    

    static logout = async ( keyStore ) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log(delKey);
        return delKey;
    }

    /*
        1 - check email in dbs
        2 - match password 
        3 - create AT vs RT and save
        4 - genrate tokens
        5 - get data return login
    */
    

    static login = async ({ email, password, refreshToken = null }) => {
        const foundShop = await findByEmail({ email })
        //1.
        if (!foundShop) throw new BadRequestError('Shop not Registered')
        //2.
        const match = bcrypt.compare(password, foundShop.password)
        if (!match) throw new AuthFailureError('Authentication error')
        //3.
         // created privateKey, publicKey
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')
        // 4 - genrate tokens
        const { _id: userId } = foundShop;
        const tokens = await createTokenPair({ userId, email }, publicKey, privateKey);
        
        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey, userId: foundShop._id
        })
        return {
            shop: getInfoData({fileds: ['_id', 'name', 'email'], object: foundShop}),
            tokens
        }
    }



    static signUp = async ({ name, email, password }) => {
        // try {
           //step1: check email exists??
            const holderShop = await shopModel.findOne({ email }).lean();

            if (holderShop) {
                throw new BadRequestError('Error: Shop already registered!')
            }
            
            const passwordHash = await bcrypt.hash(password, 10);

            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            });
            console.log(newShop, '>>>>>>>>>>>>>>>>>>>>>>');

            if (newShop) {
                // created privateKey, publicKey
                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')


                // Public key CryptoGraphy Standards !
                console.log({ privateKey, publicKey }, '>>>>>>>>>>>>>>>>>>>>>>>'); //save collection KeyStore
                console.log('object>?>>>>>>>', newShop._id);
                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if (!keyStore) {
                    return {
                        code: 'xxxx',
                        message: 'keyStore error'
                    }
                }
                
                //created token pair
                const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
                console.log(`Created Token Success::`, tokens);

                return {
                    code: 201,
                    medata: {
                        shop: getInfoData({fileds: ['_id', 'name', 'email'], object: newShop}),
                        tokens
                    }
                }
            }
            
            return {
                code: 200,
                metadata: null
            }
        // } catch (error) {
        //     return {
        //         code: 'xxx',
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }
}


module.exports =  AccessService;