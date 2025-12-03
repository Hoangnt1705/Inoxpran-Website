'use strict'

const { refreshToken } = require('firebase-admin/app');
const keyTokenModel = require('../models/keyToken.model');
const {Types} = require('mongoose');
class KeyTokenService {
    
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
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
            
            return tokens ? tokens.publicKey : null

        } catch (error) {
            return error;
        }
    }

    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({ user: userId }).lean();
    }

    static removeKeyById = async (id) => {
        return await keyTokenModel.deleteOne({ _id: id });
    }
};

      

module.exports = KeyTokenService;