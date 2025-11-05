'use strict'

const { refreshToken } = require('firebase-admin/app');
const keyTokenModel = require('../models/keyToken.model');

class KeyTokenService {
    
    static createKeyToken = async ({ userId, publicKey, privateKey }) => {
        try {
            // const tokens = await keyTokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // })

            // return tokens ? tokens.publicKey : null

            const filter = { user: userId }, update = {
                publicKey, privateKey, refreshTokenUsed: [], refreshToken
            }, options = { upsert: true, new: true }
            
            
            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)
            
            return token ? tokens.publicKey : null

        } catch (error) {
            return error;
        }
    }
}

module.exports = KeyTokenService;