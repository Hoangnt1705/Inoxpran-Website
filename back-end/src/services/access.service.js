'use strict'

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const { createTokenPair } = require('../auth/authUtils');
const KeyTokenService = require('./keyToken.service');
const { getInfoData } = require("../utils/index");
const { ConflictRequestError, BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    /*
        1 - check email in dbs
        2 - match password 
        3 - create AT vs RT and save
        4 - genrate tokens
        5 - get data return login
    */
    

    static login = async ({ email, pasword, refreshToken = null }) => {
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
        const tokens = await createTokenPair({ userId: foundShop._id, email }, publicKey, privateKey);
        
        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey
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