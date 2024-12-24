const {DataTypes} = require('sequelize');
const sequelize = require('../connection');


const User = sequelize.define('User', {
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    verification_code	: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    user_role: {
        type: DataTypes.ENUM,
        values: ['user', 'admin'],
        defaultValue: 'user',
    },
    profile_pic: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    district: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contact_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    profile_type: {
        type: DataTypes.ENUM,
        values: ['farmer', 'seller', 'transport', 'storage'],
        allowNull: true,
        validate: {
            isIn: [['farmer', 'seller', 'transport', 'storage']],
        }
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

module.exports = User;