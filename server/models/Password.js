const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Password = sequelize.define('Password', {
    website: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    encryptedPassword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    iv: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authTag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Hex-encoded salt used for PBKDF2 key derivation',
    },
  });

  Password.associate = (models) => {
    Password.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
  };

  return Password;
};

